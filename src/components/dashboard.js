import { renderRecommendations } from './recommendations.js';
import { renderAvaliacoesSection } from './avaliacoes.js';
import { renderCravingsTab } from './cravings.js';
import { renderWhackAVape } from './whackAVape.js';
import { renderAdminPanel } from './adminPanel.js';

const motivationalMessages = [
  { days: 1, message: "Parabéns! O primeiro dia é sempre o mais difícil. Continua!", type: "milestone" },
  { days: 3, message: "3 dias sem vaping! Os teus pulmões já começam a sentir a diferença.", type: "achievement" },
  { days: 7, message: "Uma semana completa! Estás a fazer um trabalho incrível.", type: "milestone" },
  { days: 14, message: "2 semanas! A tua energia e capacidade respiratória estão a melhorar.", type: "achievement" },
  { days: 30, message: "Um mês inteiro! És uma inspiração. O pior já passou.", type: "milestone" },
  { days: 60, message: "2 meses! Os benefícios para a saúde são cada vez mais evidentes.", type: "achievement" },
  { days: 90, message: "3 meses! Oficialmente fora da zona de risco. Parabéns!", type: "milestone" },
  { days: 180, message: "6 meses! Transformaste a tua vida completamente.", type: "achievement" },
  { days: 365, message: "1 ano completo! És um verdadeiro campeão da saúde!", type: "milestone" },
];

const healthBenefits = [
  { days: 1, benefit: "Níveis de oxigénio no sangue voltam ao normal" },
  { days: 3, benefit: "Capacidade de sentir sabores e cheiros melhora" },
  { days: 7, benefit: "Respiração torna-se mais fácil" },
  { days: 30, benefit: "Circulação sanguínea melhora significativamente" },
  { days: 90, benefit: "Função pulmonar aumenta até 30%" },
  { days: 365, benefit: "Risco de doenças cardíacas reduz drasticamente" },
];

export function renderDashboard(appState) {
  const isAdmin = Boolean(appState.isAdmin);

  if (!appState.userData || (!appState.userData.setup_completed && !isAdmin)) {
    return renderSetupView(appState);
  }

  const stats = calculateStats(appState.userData);
  const currentMessage = findMotivationalMessage(stats.daysFree);
  const avaliacoes = appState.avaliacoes || [];
  const mediaNotas = appState.mediaNotas || 0;
  const totalAvaliacoes = appState.totalAvaliacoes || 0;
  const weeklySavings = stats.daysFree > 0 ? stats.moneySaved / stats.daysFree * 7 : 0;
  const dailyLiquidAvoided = stats.daysFree > 0 ? stats.liquidAvoided / stats.daysFree : 0;
  const hasNicotineData = stats.nicotineMgPerMl > 0;
  const accountCreatedAt = formatAccountCreatedAt(appState.userData.created_at);
  const activeTab = appState.activeTab || 'dashboard';

  return `
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-gray-800 mb-2">
          Olá, ${appState.userData.name || 'Campeão'}! 👋
        </h1>
        <p class="text-gray-600">Aqui está o teu progresso na jornada livre de vaping</p>
      </div>

      <div class="mb-6 border-b border-gray-200">
        <div class="flex gap-2 overflow-x-auto">
          <button id="tabDashboard" class="${getTabButtonClass(activeTab, 'dashboard')}" data-tab="dashboard">Dashboard</button>
          <button id="tabCravings" class="${getTabButtonClass(activeTab, 'cravings')}" data-tab="cravings">Desejos</button>
          <button id="tabGame" class="${getTabButtonClass(activeTab, 'game')}" data-tab="game">Jogo</button>
          ${isAdmin ? `<button id="tabAdmin" class="${getTabButtonClass(activeTab, 'admin')}" data-tab="admin">Admin</button>` : ''}
          <button id="tabAbout" class="${getTabButtonClass(activeTab, 'about')}" data-tab="about">Sobre</button>
          <button id="tabSupport" class="${getTabButtonClass(activeTab, 'support')}" data-tab="support">Apoio</button>
        </div>
      </div>

      <div id="dashboardTab" class="${getTabContentClass(activeTab, 'dashboard')}">
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          ${renderStatsCard('Dias Livres', stats.daysFree.toString(), 'dias consecutivos', 'from-green-500 to-emerald-500', `+${stats.daysFree}`)}
          ${renderStatsCard('Dinheiro Poupado', `€${stats.moneySaved.toFixed(2)}`, 'total poupado', 'from-blue-500 to-cyan-500', `+€${weeklySavings.toFixed(2)}/semana`)}
          ${renderStatsCard('E-Liquido Evitado', `${stats.liquidAvoided.toFixed(1)} ml`, 'ml evitados', 'from-pink-500 to-rose-500', `~${dailyLiquidAvoided.toFixed(1)} ml/dia`)}
          ${hasNicotineData ? renderStatsCard('Nicotina Evitada', `${stats.nicotineAvoided.toFixed(1)} mg`, 'mg evitados', 'from-amber-500 to-orange-500', `${stats.nicotineMgPerMl.toFixed(1)} mg/ml`) : ''}
        </div>

        ${currentMessage ? `
          <div class="bg-gradient-to-r ${getMotivationalColor(currentMessage.type)} rounded-2xl p-6 text-white mb-8 shadow-xl">
            <div class="flex items-center mb-3">
              <svg class="h-6 w-6 mr-3" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"></path>
              </svg>
              <h3 class="text-lg font-semibold">
                ${currentMessage.type === 'milestone' ? 'Marco Alcançado!' : 'Grande Conquista!'}
              </h3>
            </div>
            <p class="text-lg">${currentMessage.message}</p>
          </div>
        ` : ''}

        <div class="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <h3 class="text-xl font-semibold text-gray-800 mb-6 flex items-center">
            <svg class="h-5 w-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
            </svg>
            Benefícios para a Saúde
          </h3>

          <div class="space-y-4">
            ${healthBenefits.map((item) => `
              <div class="flex items-center p-4 rounded-lg ${stats.daysFree >= item.days ? 'bg-green-50' : 'bg-gray-50'} hover:bg-gray-100 transition-all">
                <div class="w-4 h-4 rounded-full mr-4 ${stats.daysFree >= item.days ? 'bg-green-500' : 'bg-gray-300'}"></div>
                <div class="flex-1">
                  <span class="font-medium ${stats.daysFree >= item.days ? 'text-green-700' : 'text-gray-600'}">
                    Dia ${item.days}: ${item.benefit}
                  </span>
                  ${stats.daysFree >= item.days ? '<span class="ml-2 text-green-600 text-sm">✓ Alcançado</span>' : ''}
                </div>
              </div>
            `).join('')}
          </div>
        </div>

        ${renderRecommendations()}

        ${renderAvaliacoesSection(avaliacoes, mediaNotas, totalAvaliacoes, appState.user?.id)}

        ${accountCreatedAt ? `
          <p class="text-center text-xs text-gray-500 dark:text-slate-400 mt-8">
            Conta criada em ${accountCreatedAt}
          </p>
        ` : ''}
      </div>

      <div id="cravingsTab" class="${getTabContentClass(activeTab, 'cravings')}">
        ${renderCravingsTab(appState)}
      </div>

      <div id="gameTab" class="${getTabContentClass(activeTab, 'game')}">
        ${renderWhackAVape()}
      </div>

      ${isAdmin ? `
        <div id="adminTab" class="${getTabContentClass(activeTab, 'admin')}">
          ${renderAdminPanel(appState.adminData)}
        </div>
      ` : ''}

      <div id="aboutTab" class="${getTabContentClass(activeTab, 'about')}">
        <div class="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-6 mb-8">
          <div class="flex items-center justify-center mb-6">
            <div class="h-12 w-12 text-green-600 mr-3 flex items-center justify-center">
              <svg class="w-full h-full" fill="currentColor" viewBox="0 0 24 24">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
              </svg>
            </div>
            <div>
              <h3 class="text-2xl font-bold text-gray-800 dark:text-slate-100">QuitVape</h3>
              <p class="text-sm text-gray-600 dark:text-slate-300">A nossa missão</p>
            </div>
          </div>
          <p class="text-gray-700 dark:text-slate-200 leading-7">A QuitVape é uma empresa que se baseia num projeto criado para ajudar as pessoas a pararem de fumar, com foco especial em quem quer deixar o vape ou vaping. O nosso objetivo é oferecer ferramentas, motivação e apoio para que cada utilizador tenha sucesso na sua jornada para uma vida mais saudável.</p>
          <p class="mt-4 text-gray-600 dark:text-slate-400">Nascemos da crença de que pequenas mudanças diárias fazem uma grande diferença na saúde e no bem-estar. Estamos aqui para te acompanhar em cada passo dessa transformação.</p>
        </div>
      </div>

      <div id="supportTab" class="${getTabContentClass(activeTab, 'support')}">
        <div class="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-6 mb-8">
          <h2 class="text-2xl font-bold text-gray-800 dark:text-slate-100 mb-2">Apoio ao Cliente</h2>
          <p class="text-gray-600 dark:text-slate-300 mb-6">Como podemos ajudar?</p>
          
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div class="bg-gray-50 dark:bg-slate-700 p-5 rounded-lg">
              <h3 class="font-semibold text-gray-800 dark:text-slate-100 mb-2 flex items-center">
                <svg class="h-5 w-5 mr-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
                </svg>
                Email
              </h3>
              <p class="text-gray-700 dark:text-slate-200 break-all">suporte@quitvape.pt</p>
            </div>
            
            <div class="bg-gray-50 dark:bg-slate-700 p-5 rounded-lg">
              <h3 class="font-semibold text-gray-800 dark:text-slate-100 mb-2 flex items-center">
                <svg class="h-5 w-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path>
                </svg>
                Telefone
              </h3>
              <p class="text-gray-700 dark:text-slate-200">+351 968 968 968</p>
            </div>
          </div>

          <div class="bg-blue-50 dark:bg-blue-900 p-5 rounded-lg mb-8">
            <h3 class="font-semibold text-blue-900 dark:text-blue-100 mb-2">Horário de Atendimento</h3>
            <p class="text-blue-800 dark:text-blue-200">Segunda a Sexta: 9:00 - 18:00</p>
            <p class="text-blue-800 dark:text-blue-200">Sábado e Domingo: Fechado</p>
          </div>
        </div>

        <div class="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-6">
          <h2 class="text-2xl font-bold text-gray-800 dark:text-slate-100 mb-6">Perguntas Frequentes</h2>
          
          <div class="space-y-4">
            <div class="bg-gray-50 dark:bg-slate-700 p-5 rounded-lg">
              <h3 class="font-semibold text-gray-800 dark:text-slate-100 mb-2">Como funciona a aplicação?</h3>
              <p class="text-gray-700 dark:text-slate-300">A QuitVape ajuda-te a rastrear o teu progresso na jornada sem vaping, mostrando estatísticas, economia e benefícios para a saúde.</p>
            </div>
            
            <div class="bg-gray-50 dark:bg-slate-700 p-5 rounded-lg">
              <h3 class="font-semibold text-gray-800 dark:text-slate-100 mb-2">Como defino a minha data de paragem?</h3>
              <p class="text-gray-700 dark:text-slate-300">Clica em "Atualizar Dados" no dashboard e introduz a data em que paraste de fazer vaping.</p>
            </div>
            
            <div class="bg-gray-50 dark:bg-slate-700 p-5 rounded-lg">
              <h3 class="font-semibold text-gray-800 dark:text-slate-100 mb-2">Posso alterar o meu perfil?</h3>
              <p class="text-gray-700 dark:text-slate-300">Sim, podes atualizar qualquer informação clicando em "Atualizar Dados".</p>
            </div>
          </div>
        </div>
      </div>

      <div class="text-center mt-8">
        <button id="setupBtn" class="bg-gray-600 hover:bg-gray-700 text-white px-6 py-2 rounded-lg transition-all">
          Atualizar Dados
        </button>
      </div>

      ${renderSetupModal(appState)}
    </div>
  `;
}

function renderSetupView(appState) {
  return `
    <div class="max-w-2xl mx-auto">
      <div class="bg-white rounded-2xl shadow-xl p-8 text-center">
        <h2 class="text-3xl font-bold text-gray-800 mb-4">Bem-vindo ao QuitVape!</h2>
        <p class="text-gray-600 mb-8">Precisamos de algumas informações para começarmos a acompanhar o teu progresso.</p>
        <button id="setupBtn" class="bg-gradient-to-r from-green-600 to-blue-600 text-white py-3 px-8 rounded-lg font-semibold hover:from-green-700 hover:to-blue-700 transition-all">
          Começar Agora
        </button>
      </div>
      ${renderSetupModal(appState)}
    </div>
  `;
}

function renderSetupModal(appState) {
  const defaultQuitDate = appState.userData?.quit_date || new Date().toISOString().split('T')[0];
  const defaultName = appState.userData?.name || '';
  const defaultWeeklyCost = appState.userData?.weekly_cost || 0;
  const defaultLiquidMlPerWeek = appState.userData?.e_liquid_ml_per_week ?? appState.userData?.vapes_per_week ?? 0;
  const defaultNicotineMgPerMl = appState.userData?.nicotine_mg_per_ml ?? '';

  return `
    <div id="setupModal" style="display: none;" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div class="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8">
        <div class="flex justify-between items-center mb-6">
          <h2 class="text-2xl font-bold text-gray-800">Configurar Perfil</h2>
          <button id="closeModal" class="text-gray-500 hover:text-gray-700 text-2xl">&times;</button>
        </div>

        <form id="setupForm" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Nome</label>
            <input type="text" name="name" value="${defaultName}" class="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500" required />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Data que Paraste de Fazer Vaping</label>
            <input type="date" name="quit_date" value="${defaultQuitDate}" class="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500" required />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Custo Semanal (€)</label>
            <input type="number" name="weekly_cost" value="${defaultWeeklyCost}" step="0.01" class="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500" required />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">ml de E-Liquido por Semana</label>
            <input type="number" name="e_liquid_ml_per_week" value="${defaultLiquidMlPerWeek}" min="0.1" step="0.1" class="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500" required />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Nicotina do Vape (mg/ml)</label>
            <input type="number" name="nicotine_mg_per_ml" value="${defaultNicotineMgPerMl}" min="0" step="0.1" class="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500" />
          </div>

          <button type="submit" class="w-full bg-gradient-to-r from-green-600 to-blue-600 text-white py-2 rounded-lg font-semibold hover:from-green-700 hover:to-blue-700 transition-all">
            Guardar
          </button>
        </form>
      </div>
    </div>
  `;
}

function renderStatsCard(title, value, subtitle, color, trend) {
  return `
    <div class="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all">
      <div class="flex items-start justify-between">
        <div>
          <p class="text-gray-600 text-sm font-medium mb-1">${title}</p>
          <h3 class="text-3xl font-bold text-gray-800 mb-2">${value}</h3>
          <p class="text-gray-500 text-xs">${subtitle}</p>
        </div>
        <div class="bg-gradient-to-br ${color} rounded-lg p-3 text-white">
          <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z"/></svg>
        </div>
      </div>
      <div class="text-green-600 text-sm font-semibold mt-3">${trend}</div>
    </div>
  `;
}

function getTabButtonClass(activeTab, tabName) {
  const base = 'tabBtn px-5 py-2 border-b-2 font-semibold hover:border-green-600';
  return activeTab === tabName
    ? `${base} border-green-600 text-green-600`
    : `${base} border-transparent text-gray-600`;
}

function getTabContentClass(activeTab, tabName) {
  return activeTab === tabName ? 'tabContent' : 'tabContent hidden';
}

function calculateStats(userData) {
  if (!userData) return { daysFree: 0, moneySaved: 0, liquidAvoided: 0, nicotineAvoided: 0, nicotineMgPerMl: 0 };

  const today = new Date();
  const quitDate = new Date(userData.quit_date);
  const weeklyCost = Number(userData.weekly_cost) || 0;
  const liquidMlPerWeek = Number(userData.e_liquid_ml_per_week ?? userData.vapes_per_week) || 0;
  const nicotineMgPerMl = Number(userData.nicotine_mg_per_ml) || 0;

  if (Number.isNaN(quitDate.getTime())) {
    return { daysFree: 0, moneySaved: 0, liquidAvoided: 0, nicotineAvoided: 0, nicotineMgPerMl: 0 };
  }

  const diffTime = today.getTime() - quitDate.getTime();
  const daysFree = Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));

  const weeksElapsed = daysFree / 7;
  const moneySaved = weeksElapsed * weeklyCost;
  const liquidAvoided = weeksElapsed * liquidMlPerWeek;
  const nicotineAvoided = liquidAvoided * nicotineMgPerMl;

  return { daysFree, moneySaved, liquidAvoided, nicotineAvoided, nicotineMgPerMl };
}

function formatAccountCreatedAt(createdAt) {
  if (!createdAt) return '';

  const date = new Date(createdAt);
  if (Number.isNaN(date.getTime())) return '';

  return date.toLocaleDateString('pt-PT', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

function findMotivationalMessage(daysFree) {
  return motivationalMessages
    .filter(msg => daysFree >= msg.days)
    .pop() || null;
}

function getMotivationalColor(type) {
  switch (type) {
    case 'milestone': return 'from-yellow-500 to-orange-500';
    case 'achievement': return 'from-green-500 to-blue-500';
    default: return 'from-blue-500 to-teal-500';
  }
}
