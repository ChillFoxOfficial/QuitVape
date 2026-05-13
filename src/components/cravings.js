import { supabase } from '../lib/supabase.js';

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

      <div id="cravingSuccess" class="hidden mt-4 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg" data-success>
        <p>Desejo registado com sucesso!</p>
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
        successDiv.style.display = 'block';
        setTimeout(() => {
          successDiv.style.display = 'none';
        }, 2000);
      }

      await fetchRecentCravings(appState, userId);

      setTimeout(() => {
        const gameSection = document.getElementById('whackAVapeSection');
        if (gameSection) {
          gameSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
        if (window.startWhackAVapeGame) {
          window.startWhackAVapeGame();
        }
      }, 2500);
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
