import { supabase } from '../lib/supabase.js';

const cravingFeedback = {
  1: {
    title: 'Apenas um pensamento passageiro. Est&aacute;s no bom caminho!',
    advice: 'Mant&eacute;m o foco. Estes pequenos desejos s&atilde;o normais e desaparecem em poucos minutos.',
    toneClass: 'bg-green-50 border-green-200 text-green-800',
  },
  2: {
    title: 'Um pequeno desejo, mas tu &eacute;s mais forte.',
    advice: 'Bebe um copo de &aacute;gua ou levanta-te para esticar as pernas. Vai passar r&aacute;pido!',
    toneClass: 'bg-emerald-50 border-emerald-200 text-emerald-800',
  },
  3: {
    title: 'O desejo est&aacute; a tentar chamar a tua aten&ccedil;&atilde;o, mas tu tens o controlo.',
    advice: 'Respira fundo 3 vezes. Tenta mudar de ambiente ou fazer uma pausa naquilo que te est&aacute; a causar stress.',
    toneClass: 'bg-blue-50 border-blue-200 text-blue-800',
  },
  4: {
    title: 'Aten&ccedil;&atilde;o! Este &eacute; um momento de aperto, mas n&atilde;o deites tudo a perder.',
    advice: 'Distra&iacute; a mente agora. Vai jogar uma partida r&aacute;pida de Whack-a-Vape na aba Jogo.',
    toneClass: 'bg-orange-50 border-orange-200 text-orange-800',
    showGameAction: true,
  },
  5: {
    title: 'Alerta SOS! Sabemos que est&aacute; a ser muito dif&iacute;cil agora, mas aguenta firme.',
    advice: 'N&atilde;o cedas! Vai jogar Whack-a-Vape imediatamente at&eacute; a vontade acalmar, ou vai &agrave; aba Apoio ler os motivos pelos quais come&ccedil;aste esta jornada. Cada minuto que resistes &eacute; uma vit&oacute;ria enorme.',
    toneClass: 'bg-red-50 border-red-200 text-red-800',
    showGameAction: true,
    showSupportAction: true,
  },
};

export function renderCravingsTab(appState) {
  const recentCravings = appState.recentCravings || [];

  return `
    <div class="bg-white rounded-lg shadow-md p-6 mb-6">
      <h2 class="text-2xl font-bold text-gray-800 mb-6">Registar Desejo</h2>

      <form id="cravingsForm" class="space-y-4">
        <div>
          <label class="block text-sm font-semibold text-gray-700 mb-2">Intensidade do Desejo (1-5)</label>
          <div class="flex gap-2">
            ${[1, 2, 3, 4, 5].map(i => `
              <button
                type="button"
                class="cravingIntensityBtn w-12 h-12 rounded-lg border-2 border-gray-300 font-bold transition-all hover:border-green-500"
                data-intensity="${i}"
              >
                ${i}
              </button>
            `).join('')}
          </div>
          <input type="hidden" name="intensity" value="3">
        </div>

        <div>
          <label class="block text-sm font-semibold text-gray-700 mb-2">Gatilho (opcional)</label>
          <textarea
            name="trigger"
            placeholder="O que te levou a este desejo? (ex: stresse, aborrecimento, cansaço...)"
            class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-200"
            rows="3"
          ></textarea>
        </div>

        <button
          type="submit"
          class="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 rounded-lg transition-all"
        >
          Registar Desejo
        </button>
      </form>

      <div id="cravingError" class="hidden mt-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg" data-error>
        <p></p>
      </div>

      <div id="cravingSuccess" class="hidden mt-4 border px-4 py-3 rounded-lg" data-success>
        <p class="font-bold">Desejo registado com sucesso!</p>
      </div>
    </div>

    <div class="bg-white rounded-lg shadow-md p-6 mb-6">
      <h3 class="text-xl font-bold text-gray-800 mb-4">Histórico de Desejos</h3>
      ${recentCravings.length > 0 ? `
        <div class="space-y-3 max-h-64 overflow-y-auto">
          ${recentCravings.map(craving => `
            <div class="border-l-4 border-green-500 bg-gray-50 p-4 rounded">
              <div class="flex items-center justify-between mb-2">
                <span class="inline-block bg-green-100 text-green-800 px-3 py-1 rounded-full font-semibold">
                  Intensidade: ${craving.intensity}/5
                </span>
                <span class="text-sm text-gray-500">${new Date(craving.created_at).toLocaleDateString('pt-PT')}</span>
              </div>
              ${craving.notes ? `<p class="text-gray-700">${craving.notes}</p>` : ''}
            </div>
          `).join('')}
        </div>
      ` : `
        <p class="text-gray-500 text-center py-8">Nenhum desejo registado ainda. Ótimo sinal!</p>
      `}
    </div>
  `;
}

function renderCravingsHistory(cravings) {
  return cravings.length > 0 ? `
    <div class="space-y-3 max-h-64 overflow-y-auto">
      ${cravings.map(craving => `
        <div class="border-l-4 border-green-500 bg-gray-50 p-4 rounded">
          <div class="flex items-center justify-between mb-2">
            <span class="inline-block bg-green-100 text-green-800 px-3 py-1 rounded-full font-semibold">
              Intensidade: ${craving.intensity}/5
            </span>
            <span class="text-sm text-gray-500">${new Date(craving.created_at).toLocaleDateString('pt-PT')}</span>
          </div>
          ${craving.notes ? `<p class="text-gray-700">${escapeHtml(craving.notes)}</p>` : ''}
        </div>
      `).join('')}
    </div>
  ` : `
    <p class="text-gray-500 text-center py-8">Nenhum desejo registado ainda. Ã“timo sinal!</p>
  `;
}

function refreshCravingsHistory(cravings) {
  const historyCard = document.querySelector('#cravingsTab h3')?.parentElement;
  if (historyCard) {
    historyCard.innerHTML = `
      <h3 class="text-xl font-bold text-gray-800 mb-4">Hist&oacute;rico de Desejos</h3>
      ${renderCravingsHistory(cravings)}
    `;
  }
}

function getCravingFeedback(intensity) {
  return cravingFeedback[intensity] || cravingFeedback[3];
}

function openDashboardTab(tabName) {
  const tabBtn = document.querySelector(`.tabBtn[data-tab="${tabName}"]`);
  if (tabBtn) {
    tabBtn.click();
  }
}

function renderFeedbackMessage(intensity) {
  const feedback = getCravingFeedback(intensity);

  return `
    <p class="font-bold mb-1">${feedback.title}</p>
    <p class="text-sm leading-relaxed">${feedback.advice}</p>
    ${feedback.showGameAction || feedback.showSupportAction ? `
      <div class="flex flex-col sm:flex-row gap-2 mt-3">
        ${feedback.showGameAction ? '<button type="button" id="openWhackAVapeFromCraving" class="bg-green-600 hover:bg-green-700 text-white font-semibold px-3 py-2 rounded-lg text-sm">Ir para o jogo</button>' : ''}
        ${feedback.showSupportAction ? '<button type="button" id="openSupportFromCraving" class="bg-white hover:bg-gray-50 text-red-700 border border-red-200 font-semibold px-3 py-2 rounded-lg text-sm">Ir para apoio</button>' : ''}
      </div>
    ` : ''}
  `;
}

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

export async function attachCravingsHandlers(appState, userId) {
  const form = document.getElementById('cravingsForm');
  if (!form) return;

  const intensityBtns = document.querySelectorAll('.cravingIntensityBtn');
  const intensityInput = form.querySelector('input[name="intensity"]');

  intensityBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      intensityBtns.forEach(b => b.classList.remove('bg-green-500', 'text-white', 'border-green-500'));
      btn.classList.add('bg-green-500', 'text-white', 'border-green-500');
      intensityInput.value = btn.dataset.intensity;
    });
  });

  const defaultBtn = intensityBtns[2];
  if (defaultBtn) {
    defaultBtn.classList.add('bg-green-500', 'text-white', 'border-green-500');
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const intensity = parseInt(intensityInput.value);
    const trigger = form.querySelector('textarea[name="trigger"]').value.trim();

    const submitBtn = form.querySelector('button[type="submit"]');
    const errorDiv = document.getElementById('cravingError');
    const successDiv = document.getElementById('cravingSuccess');

    submitBtn.disabled = true;
    if (errorDiv) errorDiv.style.display = 'none';
    if (successDiv) successDiv.style.display = 'none';

    try {
      if (intensity < 1 || intensity > 5) {
        throw new Error('Por favor, seleciona uma intensidade válida');
      }

      const { error } = await supabase.from('cravings').insert([{
        user_id: userId,
        intensity,
        notes: trigger,
      }]);

      if (error) throw error;

      form.reset();
      intensityBtns.forEach(b => b.classList.remove('bg-green-500', 'text-white', 'border-green-500'));
      const resetBtn = intensityBtns[2];
      if (resetBtn) {
        resetBtn.classList.add('bg-green-500', 'text-white', 'border-green-500');
      }
      intensityInput.value = '3';

      if (successDiv) {
        const feedback = getCravingFeedback(intensity);
        successDiv.className = `mt-4 border px-4 py-3 rounded-lg ${feedback.toneClass}`;
        successDiv.innerHTML = renderFeedbackMessage(intensity);
        successDiv.style.display = 'block';

        document.getElementById('openWhackAVapeFromCraving')?.addEventListener('click', () => {
          openDashboardTab('game');
          if (window.startWhackAVapeGame) {
            window.startWhackAVapeGame();
          }
        });

        document.getElementById('openSupportFromCraving')?.addEventListener('click', () => {
          openDashboardTab('support');
        });
      }

      await fetchRecentCravings(appState, userId);
      refreshCravingsHistory(appState.recentCravings || []);

      if (intensity >= 4) {
        setTimeout(() => {
          openDashboardTab('game');
          if (window.startWhackAVapeGame) {
            window.startWhackAVapeGame();
          }
        }, 3500);
      }
    } catch (error) {
      if (errorDiv) {
        errorDiv.querySelector('p').textContent = error.message;
        errorDiv.style.display = 'block';
      }
    } finally {
      submitBtn.disabled = false;
    }
  });
}

export async function fetchRecentCravings(appState, userId) {
  try {
    const { data, error } = await supabase
      .from('cravings')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(10);

    if (error) {
      console.error('Error fetching cravings:', error);
      return;
    }

    appState.recentCravings = data || [];
  } catch (error) {
    console.error('Error:', error);
  }
}
