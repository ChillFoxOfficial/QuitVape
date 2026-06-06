export function renderAdminPanel(adminData) {
  const users = adminData?.users || [];
  const avaliacoes = adminData?.avaliacoes || [];
  const scores = adminData?.scores || [];
  const loading = adminData?.loading;
  const error = adminData?.error;

  return `
    <div class="space-y-6">
      <div class="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-6">
        <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-4">
          <div>
            <h2 class="text-2xl font-bold text-gray-800 dark:text-slate-100">Admin</h2>
            <p class="text-gray-600 dark:text-slate-300">Gestão de utilizadores, avaliações e leaderboard.</p>
          </div>
          <button id="refreshAdminBtn" class="bg-slate-700 hover:bg-slate-800 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-all">
            Atualizar
          </button>
        </div>
        ${loading ? '<p class="text-gray-500 dark:text-slate-300">A carregar dados...</p>' : ''}
        ${error ? `<p class="text-red-600 bg-red-50 border border-red-200 rounded-lg p-3 text-sm">${escapeHtml(error)}</p>` : ''}
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        ${renderUsersCard(users)}
        ${renderScoresCard(scores)}
        ${renderAvaliacoesCard(avaliacoes)}
      </div>
    </div>
  `;
}

function renderUsersCard(users) {
  return `
    <section class="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-5">
      <div class="flex items-center justify-between mb-4">
        <h3 class="text-lg font-semibold text-gray-800 dark:text-slate-100">Utilizadores</h3>
        <span class="text-xs text-gray-500 dark:text-slate-400">${users.length} registos</span>
      </div>
      <div class="space-y-3 max-h-[420px] overflow-y-auto pr-1">
        ${users.length ? users.map(user => `
          <div class="border border-gray-100 dark:border-slate-700 rounded-lg p-3">
            <p class="font-semibold text-gray-800 dark:text-slate-100">${escapeHtml(user.name || 'Sem nome')}</p>
            <p class="text-xs text-gray-500 dark:text-slate-400 break-all">${escapeHtml(user.email || 'Sem email')}</p>
            <p class="text-xs text-gray-400 mt-1">Criado em ${formatDate(user.created_at)}</p>
          </div>
        `).join('') : '<p class="text-gray-500 dark:text-slate-300">Sem utilizadores.</p>'}
      </div>
    </section>
  `;
}

function renderScoresCard(scores) {
  return `
    <section class="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-5">
      <div class="flex items-center justify-between mb-4">
        <h3 class="text-lg font-semibold text-gray-800 dark:text-slate-100">Leaderboard</h3>
        <span class="text-xs text-gray-500 dark:text-slate-400">${scores.length} pontuações</span>
      </div>
      <div class="space-y-3 max-h-[420px] overflow-y-auto pr-1">
        ${scores.length ? scores.map(score => `
          <div class="border border-gray-100 dark:border-slate-700 rounded-lg p-3">
            <div class="flex items-start justify-between gap-3">
              <div>
                <p class="font-semibold text-gray-800 dark:text-slate-100">${escapeHtml(score.player_name || 'Jogador')}</p>
                <p class="text-xs text-gray-500 dark:text-slate-400 break-all">${escapeHtml(score.user_email || 'Sem email')}</p>
                <p class="text-xs text-gray-400 mt-1">${formatDate(score.created_at)}</p>
              </div>
              <div class="text-right">
                <p class="text-lg font-bold text-green-600">${score.score}</p>
                <button class="adminDeleteScoreBtn text-xs text-red-600 hover:text-red-700 font-semibold" data-id="${score.id}">
                  Apagar
                </button>
              </div>
            </div>
          </div>
        `).join('') : '<p class="text-gray-500 dark:text-slate-300">Sem pontuações.</p>'}
      </div>
    </section>
  `;
}

function renderAvaliacoesCard(avaliacoes) {
  return `
    <section class="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-5">
      <div class="flex items-center justify-between mb-4">
        <h3 class="text-lg font-semibold text-gray-800 dark:text-slate-100">Avaliações</h3>
        <span class="text-xs text-gray-500 dark:text-slate-400">${avaliacoes.length} avaliações</span>
      </div>
      <div class="space-y-3 max-h-[420px] overflow-y-auto pr-1">
        ${avaliacoes.length ? avaliacoes.map(av => `
          <div class="border border-gray-100 dark:border-slate-700 rounded-lg p-3">
            <div class="flex items-start justify-between gap-3">
              <div>
                <p class="font-semibold text-gray-800 dark:text-slate-100">${escapeHtml(av.autor_nome || 'Utilizador')} -> ${escapeHtml(av.alvo_nome || 'Utilizador')}</p>
                <p class="text-xs text-gray-500 dark:text-slate-400">${av.nota}/5 - ${formatDate(av.created_at)}</p>
                ${av.comentario ? `<p class="text-sm text-gray-600 dark:text-slate-300 mt-2">${escapeHtml(av.comentario)}</p>` : ''}
              </div>
              <button class="adminDeleteAvaliacaoBtn text-xs text-red-600 hover:text-red-700 font-semibold" data-id="${av.id}">
                Apagar
              </button>
            </div>
          </div>
        `).join('') : '<p class="text-gray-500 dark:text-slate-300">Sem avaliações.</p>'}
      </div>
    </section>
  `;
}

function formatDate(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleDateString('pt-PT');
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = String(text ?? '');
  return div.innerHTML;
}
