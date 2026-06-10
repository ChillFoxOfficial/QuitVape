import './index.css';
import { isSupabaseConfigured, supabase, supabaseConfigError } from './lib/supabase.js';
import { renderLoginPage } from './components/loginPage.js';
import { renderDashboard } from './components/dashboard.js';
import { attachCravingsHandlers, fetchRecentCravings } from './components/cravings.js';
import { renderWhackAVape, initWhackAVape } from './components/whackAVape.js';

const appState = {
  user: null,
  userData: null,
  authMode: 'login',
  loading: true,
  avaliacoes: [],
  mediaNotas: 0,
  totalAvaliacoes: 0,
  recentCravings: [],
  isAdmin: false,
  adminData: {
    users: [],
    avaliacoes: [],
    scores: [],
    loading: false,
    error: '',
  },
  activeTab: 'dashboard',
};

const themeStorageKey = 'quitvapeTheme';
const authRedirectUrl = import.meta.env.VITE_AUTH_REDIRECT_URL || 'https://quit-vape-seven.vercel.app/';
const adminEmails = ['admin@quitvape.pt'];

function isAdminEmail(email) {
  return adminEmails.includes((email || '').toLowerCase());
}

function getAuthRedirectUrl() {
  return authRedirectUrl;
}

function getAuthErrorMessage(error, fallbackMessage) {
  const message = error?.message || fallbackMessage;

  if (message.includes('Invalid login credentials')) {
    return 'Email ou password incorretos';
  }

  if (message.includes('Error sending confirmation email') || message === '{}') {
    return 'Não foi possível enviar o email. Tenta novamente mais tarde.';
  }

  return message;
}

function setTheme(theme) {
  document.documentElement.classList.toggle('dark', theme === 'dark');
  localStorage.setItem(themeStorageKey, theme);
  const themeBtn = document.getElementById('themeToggleBtn');
  if (themeBtn) {
    themeBtn.textContent = theme === 'dark' ? 'Modo Claro' : 'Modo Escuro';
  }
}

function forceLightTheme() {
  document.documentElement.classList.remove('dark');
}

function applyAuthenticatedTheme() {
  const savedTheme = localStorage.getItem(themeStorageKey);
  setTheme(savedTheme === 'dark' ? 'dark' : 'light');
}

async function initApp() {
  if (!isSupabaseConfigured) {
    appState.loading = false;
    render();
    return;
  }

  const hashParams = new URLSearchParams(window.location.hash.substring(1));
  const isRecovery = hashParams.get('type') === 'recovery';
  const isSignup = hashParams.get('type') === 'signup';

  if (isRecovery || isSignup) {
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
      appState.user = session.user;
      appState.authMode = isRecovery ? 'reset' : 'login';
      appState.loading = false;
      render();
      return;
    }
  }

  const { data: { session } } = await supabase.auth.getSession();
  appState.user = session?.user || null;
  appState.isAdmin = isAdminEmail(appState.user?.email);

  if (appState.user) {
    await fetchUserData(appState.user.id);
    await fetchAvaliacoes(appState.user.id);
    await fetchRecentCravings(appState, appState.user.id);
  } else {
    appState.loading = false;
  }

  render();

  supabase.auth.onAuthStateChange(async (event, session) => {
    if (event === 'PASSWORD_RECOVERY') {
      appState.user = session?.user || null;
      appState.authMode = 'reset';
      appState.loading = false;
      render();
      return;
    }

    appState.user = session?.user || null;
    appState.isAdmin = isAdminEmail(appState.user?.email);
    if (appState.user) {
      const currentUserId = appState.user.id; // capturar antes das operações async
      await fetchUserData(appState.user.id);
      await fetchAvaliacoes(appState.user.id);
      await fetchRecentCravings(appState, appState.user.id);
      // Só renderizar se o utilizador não mudou durante os fetches
      // (ex: logout clicado enquanto TOKEN_REFRESHED estava a correr)
      if (appState.user?.id === currentUserId) {
        render();
      }
    } else {
      appState.userData = null;
      appState.avaliacoes = [];
      appState.mediaNotas = 0;
      appState.totalAvaliacoes = 0;
      appState.recentCravings = [];
      appState.isAdmin = false;
      appState.adminData = { users: [], avaliacoes: [], scores: [], loading: false, error: '' };
      appState.activeTab = 'dashboard';
      appState.loading = false;
      render();
    }
  });
}

async function fetchUserData(userId) {
  try {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    if (error && error.code !== 'PGRST116') {
      console.error('Error fetching user data:', error);
    } else if (data) {
      appState.userData = data;
      const currentEmail = appState.user?.email?.toLowerCase() || '';
      if (currentEmail && data.email !== currentEmail) {
        const { error: emailUpdateError } = await supabase
          .from('user_profiles')
          .update({ email: currentEmail })
          .eq('user_id', userId);

        if (emailUpdateError) {
          console.error('Error updating profile email:', emailUpdateError);
        } else {
          appState.userData = { ...data, email: currentEmail };
        }
      }
    } else {
      const user = supabase.auth.getUser ? (await supabase.auth.getUser()).data.user : null;
      const defaultEmail = user?.email?.toLowerCase() || '';
      const defaultName = user?.user_metadata?.name || '';
      const { error: insertError, data: insertedData } = await supabase.from('user_profiles').insert([{
        user_id: userId,
        email: defaultEmail,
        name: defaultName,
        quit_date: new Date().toISOString().split('T')[0],
        weekly_cost: 0,
        vapes_per_week: 0,
        e_liquid_ml_per_week: 0,
        nicotine_mg_per_ml: null,
        setup_completed: false,
      }]).select().maybeSingle();

      if (insertError) {
        console.error('Error creating default user profile:', insertError);
      } else if (insertedData) {
        appState.userData = insertedData;
      }
    }
  } catch (error) {
    console.error('Error:', error);
  } finally {
    appState.loading = false;
  }
}

async function fetchAvaliacoes(userId) {
  try {
    const { data, error } = await supabase
      .from('avaliacoes')
      .select('id, id_autor, id_alvo, nota, comentario, created_at')
      .eq('id_alvo', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching avaliacoes:', error);
      return;
    }

    // Buscar nomes dos autores separadamente
    const autorIds = [...new Set((data || []).map(av => av.id_autor))];
    let autorNomes = {};

    if (autorIds.length > 0) {
      const { data: profiles } = await supabase
        .from('user_profiles')
        .select('user_id, name')
        .in('user_id', autorIds);

      (profiles || []).forEach(p => { autorNomes[p.user_id] = p.name; });
    }

    appState.avaliacoes = (data || []).map(av => ({
      ...av,
      autor_nome: autorNomes[av.id_autor] || 'Utilizador',
    }));

    if (appState.avaliacoes.length > 0) {
      const sum = appState.avaliacoes.reduce((acc, av) => acc + av.nota, 0);
      appState.mediaNotas = sum / appState.avaliacoes.length;
      appState.totalAvaliacoes = appState.avaliacoes.length;
    } else {
      appState.mediaNotas = 0;
      appState.totalAvaliacoes = 0;
    }
  } catch (error) {
    console.error('Error:', error);
  }
}

function render() {
  const app = document.getElementById('app');
  if (!app) return;

  if (!isSupabaseConfigured) {
    app.innerHTML = renderSupabaseSetupMessage();
    return;
  }

  if (appState.loading) {
    forceLightTheme();
    app.innerHTML = `
      <div class="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    `;
    return;
  }

  if (!appState.user || appState.authMode === 'forgot' || appState.authMode === 'reset') {
    forceLightTheme();
    app.innerHTML = renderLoginPage(appState);
    attachLoginHandlers();
    return;
  }

  applyAuthenticatedTheme();
  app.innerHTML = `
    <div class="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 dark:from-slate-950 dark:to-slate-900">
      <nav class="fixed top-0 left-0 right-0 bg-white dark:bg-slate-900 shadow-md z-50">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2 flex items-center justify-between gap-2">
          <div class="flex items-center gap-2">
            <h1 class="text-lg font-bold text-green-600 dark:text-green-300">QuitVape</h1>
            <button id="themeToggleBtn" class="bg-slate-900 text-white hover:bg-slate-800 dark:bg-slate-200 dark:text-slate-900 px-2 py-1 rounded-full text-xs transition-all">
              Modo Escuro
            </button>
          </div>
          <button id="logoutBtn" class="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded-full text-xs transition-all">
            Sair
          </button>
        </div>
      </nav>
      <div class="pt-20 px-4 pb-6">
        ${renderDashboard(appState)}
      </div>
    </div>
  `;

  window.whackAVapeUserName = appState.userData?.name || 'Jogador';
  window.whackAVapeUserId = appState.user?.id || null;
  attachDashboardHandlers(appState);
  initWhackAVape();
}

function renderSupabaseSetupMessage() {
  return `
    <div class="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center px-4">
      <div class="max-w-lg w-full bg-white rounded-2xl shadow-xl p-8">
        <div class="flex items-center mb-5">
          <div class="h-12 w-12 text-green-600 mr-3 flex items-center justify-center">
            <svg class="w-full h-full" fill="currentColor" viewBox="0 0 24 24">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
            </svg>
          </div>
          <div>
            <h1 class="text-3xl font-bold text-gray-800">QuitVape</h1>
            <p class="text-sm text-gray-500">Supabase setup required</p>
          </div>
        </div>

        <div class="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-5">
          <p class="text-amber-800 text-sm">${supabaseConfigError}</p>
        </div>

        <p class="text-gray-700 mb-4">
          Create a <code class="bg-gray-100 px-1.5 py-0.5 rounded text-sm">.env</code> file in the project root with your Supabase project values:
        </p>

        <pre class="bg-gray-900 text-green-100 rounded-lg p-4 text-sm overflow-x-auto mb-5"><code>VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key</code></pre>

        <p class="text-sm text-gray-600">
          After saving the file, stop and restart <code class="bg-gray-100 px-1.5 py-0.5 rounded">npm run dev</code>.
        </p>
      </div>
    </div>
  `;
}

function attachLoginHandlers() {
  const toggleBtns = document.querySelectorAll('.toggleAuth');
  const form = document.getElementById('authForm');
  const forgotForm = document.getElementById('forgotForm');
  const resetForm = document.getElementById('resetPasswordForm');

  toggleBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      appState.authMode = e.target.dataset.mode;
      render();
    });
  });

  if (form) form.addEventListener('submit', handleLogin);
  if (forgotForm) forgotForm.addEventListener('submit', handleForgotPassword);
  if (resetForm) resetForm.addEventListener('submit', handleResetPassword);
}

async function handleLogin(e) {
  e.preventDefault();
  const form = e.target;
  const isLogin = appState.authMode === 'login';
  const email = form.email.value.toLowerCase().trim();
  const password = form.password.value;
  const confirmPassword = form.confirmPassword?.value || '';
  const name = form.name?.value?.trim() || '';

  const submitBtn = form.querySelector('button[type="submit"]');
  const errorDiv = form.querySelector('[data-error]');
  const successDiv = form.querySelector('[data-success]');

  submitBtn.disabled = true;
  if (errorDiv) errorDiv.style.display = 'none';
  if (successDiv) successDiv.style.display = 'none';

  try {
    if (!email.includes('@')) throw new Error('Por favor, insira um email válido');
    if (password.length < 6) throw new Error('A password deve ter pelo menos 6 caracteres');
    if (!isLogin && isAdminEmail(email)) throw new Error('Esta conta admin deve ser criada manualmente no Supabase.');
    if (!isLogin && name.length < 2) throw new Error('Por favor, insira o seu nome');
    if (!isLogin && password !== confirmPassword) throw new Error('As palavras-passe não coincidem');

    if (isLogin) {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
    } else {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: getAuthRedirectUrl(),
          data: { name },
        },
      });
      if (error) throw error;

      if (successDiv) {
        successDiv.querySelector('p').textContent = 'Consulta a tua caixa de entrada e a pasta de spam.';
        successDiv.style.display = 'block';
      }
      appState.authMode = 'login';
    }
  } catch (error) {
    if (errorDiv) {
      const displayMessage = getAuthErrorMessage(error, 'Ocorreu um erro desconhecido.');

      errorDiv.querySelector('p').textContent = displayMessage;
      errorDiv.style.display = 'block';
    }
  } finally {
    submitBtn.disabled = false;
  }
}

async function handleForgotPassword(e) {
  e.preventDefault();
  const form = e.target;
  const email = form.email.value.toLowerCase().trim();
  const submitBtn = form.querySelector('button[type="submit"]');
  const errorDiv = form.querySelector('[data-error]');
  const successDiv = form.querySelector('[data-success]');

  submitBtn.disabled = true;
  if (errorDiv) errorDiv.style.display = 'none';
  if (successDiv) successDiv.style.display = 'none';

  try {
    if (!email.includes('@')) throw new Error('Por favor, insira um email valido');
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: getAuthRedirectUrl(),
    });
    if (error) throw error;
    if (successDiv) {
      successDiv.querySelector('p').textContent = 'Consulta a tua caixa de entrada e a pasta de spam.';
      successDiv.style.display = 'block';
    }
  } catch (error) {
    if (errorDiv) {
      errorDiv.querySelector('p').textContent = getAuthErrorMessage(error, 'Falha ao pedir recuperação de palavra-passe.');
      errorDiv.style.display = 'block';
    }
  } finally {
    submitBtn.disabled = false;
  }
}

async function handleResetPassword(e) {
  e.preventDefault();
  const form = e.target;
  const newPassword = form.newPassword.value;
  const confirmPassword = form.confirmPassword.value;
  const submitBtn = form.querySelector('button[type="submit"]');
  const errorDiv = form.querySelector('[data-error]');

  submitBtn.disabled = true;
  try {
    if (newPassword.length < 6) throw new Error('A palavra-passe deve ter pelo menos 6 caracteres');
    if (newPassword !== confirmPassword) throw new Error('As palavras-passe nao coincidem');
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) throw error;
    appState.authMode = 'login';
    render();
  } catch (error) {
    if (errorDiv) {
      errorDiv.querySelector('p').textContent = error.message;
      errorDiv.style.display = 'block';
    }
  } finally {
    submitBtn.disabled = false;
  }
}

function attachDashboardHandlers(appState) {
  const logoutBtn = document.getElementById('logoutBtn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', async () => {
      logoutBtn.disabled = true;
      try {
        const { error } = await supabase.auth.signOut();
        if (error) throw error;
        // Sucesso: onAuthStateChange (SIGNED_OUT) trata do reset e do render()
      } catch (error) {
        console.error('Logout error:', error);
        // Fallback para falhas de rede: limpar estado manualmente
        appState.user = null;
        appState.userData = null;
        appState.avaliacoes = [];
        appState.mediaNotas = 0;
        appState.totalAvaliacoes = 0;
        appState.recentCravings = [];
        appState.isAdmin = false;
        appState.adminData = { users: [], avaliacoes: [], scores: [], loading: false, error: '' };
        appState.activeTab = 'dashboard';
        appState.loading = false;
        render();
      }
      // Sem finally: em caso de sucesso o DOM é substituído pelo onAuthStateChange;
      // o estado do disabled não importa pois o botão deixa de existir.
    });
  }

  const tabBtns = document.querySelectorAll('.tabBtn');
  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const tabName = btn.dataset.tab;
      appState.activeTab = tabName;
      tabBtns.forEach(b => {
        b.classList.remove('border-green-600', 'text-green-600');
        b.classList.add('border-transparent', 'text-gray-600');
      });
      btn.classList.add('border-green-600', 'text-green-600');
      document.querySelectorAll('.tabContent').forEach(tab => tab.classList.add('hidden'));
      document.getElementById(`${tabName}Tab`).classList.remove('hidden');
      if (tabName === 'cravings') attachCravingsHandlers(appState, appState.user.id);
      if (tabName === 'admin') fetchAdminData(true);
    });
  });

  const themeBtn = document.getElementById('themeToggleBtn');
  if (themeBtn) {
    themeBtn.textContent = document.documentElement.classList.contains('dark') ? 'Modo Claro' : 'Modo Escuro';
    themeBtn.addEventListener('click', () => {
      const nextTheme = document.documentElement.classList.contains('dark') ? 'light' : 'dark';
      setTheme(nextTheme);
    });
  }

  const setupBtn = document.getElementById('setupBtn');
  if (setupBtn) {
    setupBtn.addEventListener('click', () => {
      const modal = document.getElementById('setupModal');
      if (modal) modal.style.display = 'flex';
    });
  }

  const closeModalBtn = document.getElementById('closeModal');
  if (closeModalBtn) {
    closeModalBtn.addEventListener('click', () => {
      const modal = document.getElementById('setupModal');
      if (modal) modal.style.display = 'none';
    });
  }

  const setupForm = document.getElementById('setupForm');
  if (setupForm) setupForm.addEventListener('submit', handleSetupSubmit);

  const openAvaliacaoBtn = document.getElementById('openAvaliacaoBtn');
  if (openAvaliacaoBtn) {
    openAvaliacaoBtn.addEventListener('click', () => {
      document.getElementById('avaliacaoModal').style.display = 'flex';
    });
  }

  const closeAvaliacaoModal = document.getElementById('closeAvaliacaoModal');
  if (closeAvaliacaoModal) {
    closeAvaliacaoModal.addEventListener('click', () => {
      document.getElementById('avaliacaoModal').style.display = 'none';
    });
  }

  const starBtns = document.querySelectorAll('.starBtn');
  const notaInput = document.querySelector('input[name="nota"]');
  starBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const val = btn.dataset.value;
      if (notaInput) notaInput.value = val;
      starBtns.forEach(s => s.querySelector('svg').style.color = s.dataset.value <= val ? '#facc15' : '#d1d5db');
    });
  });

  const avaliacaoForm = document.getElementById('avaliacaoForm');
  if (avaliacaoForm) avaliacaoForm.addEventListener('submit', handleAvaliacaoSubmit);

  const refreshAdminBtn = document.getElementById('refreshAdminBtn');
  if (refreshAdminBtn) refreshAdminBtn.addEventListener('click', () => fetchAdminData(true));

  document.querySelectorAll('.adminDeleteScoreBtn').forEach(btn => {
    btn.addEventListener('click', () => handleAdminDeleteScore(btn.dataset.id));
  });

  document.querySelectorAll('.adminDeleteAvaliacaoBtn').forEach(btn => {
    btn.addEventListener('click', () => handleAdminDeleteAvaliacao(btn.dataset.id));
  });

  document.querySelectorAll('.adminDeleteUserBtn').forEach(btn => {
    btn.addEventListener('click', () => handleAdminDeleteUser(btn.dataset.id));
  });
}

async function fetchAdminData(showLoading = false) {
  if (!appState.isAdmin) return;

  if (showLoading) {
    appState.adminData = { ...appState.adminData, loading: true, error: '' };
    render();
  }

  try {
    const [usersResult, avaliacoesResult, scoresResult] = await Promise.all([
      supabase.rpc('admin_list_users'),
      supabase.rpc('admin_list_avaliacoes'),
      supabase.rpc('admin_list_whack_scores'),
    ]);

    const firstError = usersResult.error || avaliacoesResult.error || scoresResult.error;
    if (firstError) throw firstError;

    appState.adminData = {
      users: usersResult.data || [],
      avaliacoes: avaliacoesResult.data || [],
      scores: scoresResult.data || [],
      loading: false,
      error: '',
    };
  } catch (error) {
    appState.adminData = {
      ...appState.adminData,
      loading: false,
      error: error.message || 'Falha ao carregar dados admin.',
    };
  }

  render();
}

async function handleAdminDeleteScore(scoreId) {
  if (!scoreId || !appState.isAdmin) return;
  if (!confirm('Apagar esta pontuação do leaderboard?')) return;

  const { error } = await supabase.rpc('admin_delete_whack_score', { target_id: scoreId });
  if (error) {
    alert(error.message);
    return;
  }

  await fetchAdminData(false);
}

async function handleAdminDeleteAvaliacao(avaliacaoId) {
  if (!avaliacaoId || !appState.isAdmin) return;
  if (!confirm('Apagar esta avaliação?')) return;

  const { error } = await supabase.rpc('admin_delete_avaliacao', { target_id: avaliacaoId });
  if (error) {
    alert(error.message);
    return;
  }

  await fetchAdminData(false);
}

async function handleAdminDeleteUser(userId) {
  if (!userId || !appState.isAdmin) return;
  if (!confirm('Apagar este utilizador? Esta ação é irreversível.')) return;

  const { error } = await supabase.rpc('admin_delete_user', { target_user_id: userId });
  if (error) {
    alert(error.message);
    return;
  }

  await fetchAdminData(false);
}

async function handleSetupSubmit(e) {
  e.preventDefault();
  const form = e.target;
  const name = form.name.value.trim();
  const quit_date = form.quit_date.value;
  const weeklyCostValue = form.weekly_cost.value;
  const liquidMlValue = form.e_liquid_ml_per_week.value;
  const weekly_cost = parseFloat(weeklyCostValue);
  const e_liquid_ml_per_week = parseFloat(liquidMlValue);
  const nicotine_mg_per_ml = form.nicotine_mg_per_ml.value === '' ? null : parseFloat(form.nicotine_mg_per_ml.value);

  const submitBtn = form.querySelector('button[type="submit"]');
  submitBtn.disabled = true;

  try {
    if (!name || !quit_date || weeklyCostValue === '' || liquidMlValue === '') throw new Error('Preencha todos os campos obrigatórios');
    if (Number.isNaN(weekly_cost) || weekly_cost < 0) throw new Error('O custo semanal deve ser um número válido');
    if (Number.isNaN(e_liquid_ml_per_week) || e_liquid_ml_per_week <= 0) throw new Error('Os ml de E-Liquido por semana devem ser maiores que zero');
    if (nicotine_mg_per_ml !== null && (Number.isNaN(nicotine_mg_per_ml) || nicotine_mg_per_ml < 0)) throw new Error('A nicotina deve ser um número válido');

    const { data: authData } = await supabase.auth.getUser();
    const email = authData?.user?.email || null;
       
    const { error } = await supabase
      .from('user_profiles')
      .update({ 
        name, 
        email: appState.user.email?.toLowerCase() || '', 
        quit_date, 
        weekly_cost, 
        e_liquid_ml_per_week, 
        nicotine_mg_per_ml, 
        setup_completed: true 
      })
      .eq('user_id', appState.user.id);

    if (error) throw error;

// Atualização do estado local para evitar ecrã branco
    appState.userData = { 
      ...appState.userData, 
      name, 
      email: appState.user?.email?.toLowerCase() || email || '', 
      quit_date, 
      weekly_cost, 
      e_liquid_ml_per_week, 
      nicotine_mg_per_ml, 
      setup_completed: true 
    };

    document.getElementById('setupModal').style.display = 'none';
    render();
  } catch (error) {
    alert(error.message);
  } finally {
    submitBtn.disabled = false;
  }
}

async function handleAvaliacaoSubmit(e) {
  e.preventDefault();
  const form = e.target;
  const meuEmail = form.meu_email?.value?.toLowerCase()?.trim() || "";
  const nota = parseInt(form.nota.value);
  const comentario = form.comentario.value.trim();
  const errorDiv = document.getElementById('avaliacaoError');
  const submitBtn = form.querySelector('button[type="submit"]');

  if (errorDiv) { errorDiv.style.display = 'none'; }
  if (submitBtn) submitBtn.disabled = true;

  const showError = (msg) => {
    if (errorDiv) {
      errorDiv.querySelector('p').textContent = msg;
      errorDiv.style.display = 'block';
    } else {
      alert(msg);
    }
  };

  try {
    if (!meuEmail.includes('@')) throw new Error('Insere um email válido');

    const contaEmail = appState.user?.email?.toLowerCase() || '';
    if (meuEmail !== contaEmail) throw new Error('O email não corresponde à conta com que entraste');

    if (!nota || nota < 1 || nota > 5) throw new Error('Seleciona uma nota de 1 a 5 estrelas');

    const { error: insertError } = await supabase.from('avaliacoes').insert([{
      id_autor: appState.user.id,
      id_alvo: appState.user.id,
      nota,
      comentario,
    }]);

    if (insertError) {
      if (insertError.code === '23505') throw new Error('Já submeteste uma avaliação do website. Elimina a atual para submeter uma nova.');
      throw insertError;
    }

    document.getElementById('avaliacaoModal').style.display = 'none';
    await fetchAvaliacoes(appState.user.id);
    render();
  } catch (error) {
    showError(error.message);
  } finally {
    if (submitBtn) submitBtn.disabled = false;
  }
}

initApp();