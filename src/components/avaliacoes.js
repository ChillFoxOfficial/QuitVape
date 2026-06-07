export function renderAvaliacoesSection(avaliacoes, mediaNotas, totalAvaliacoes, currentUserId, currentUserEmail) {
  const media = mediaNotas ? mediaNotas.toFixed(1) : '0.0';
  const jaAvaliou = avaliacoes.some(av => av.id_autor === currentUserId);

  return `
    <div class="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-6 mb-8">
      <div class="flex items-center justify-between mb-6">
        <h3 class="text-xl font-semibold text-gray-800 dark:text-slate-100 flex items-center">
          <svg class="h-5 w-5 mr-2 text-yellow-500" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"></path>
          </svg>
          Avaliações do Website
        </h3>
        <button
          id="openAvaliacaoBtn"
          class="${jaAvaliou
            ? 'bg-gray-300 text-gray-500 px-4 py-2 rounded-lg text-sm font-semibold cursor-not-allowed'
            : 'bg-gradient-to-r from-green-600 to-blue-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:from-green-700 hover:to-blue-700 transition-all'}"
          ${jaAvaliou ? 'disabled title="Já submeteste uma avaliação"' : ''}
        >
          ${jaAvaliou ? '✓ Já avaliaste' : 'Avaliar Website'}
        </button>
      </div>

      <div class="flex items-center gap-4 mb-6 p-4 bg-gray-50 dark:bg-slate-700 rounded-xl">
        <div class="text-center">
          <p class="text-4xl font-bold text-gray-800 dark:text-slate-100">${media}</p>
          <div class="flex items-center justify-center mt-1">
            ${renderStars(parseFloat(media))}
          </div>
          <p class="text-xs text-gray-500 dark:text-slate-400 mt-1">${totalAvaliacoes} ${totalAvaliacoes === 1 ? 'avaliação' : 'avaliações'}</p>
        </div>
      </div>

      ${avaliacoes.length > 0 ? `
        <div class="space-y-4">
          ${avaliacoes.map(av => renderAvaliacaoCard(av, currentUserId)).join('')}
        </div>
      ` : `
        <p class="text-gray-500 dark:text-slate-400 text-center py-6">Ainda não existem avaliações. Sê o primeiro a avaliar o website!</p>
      `}
    </div>

    ${renderAvaliacaoModal(currentUserEmail)}
  `;
}

function renderAvaliacaoCard(av, currentUserId) {
  const isAuthor = av.id_autor === currentUserId;
  const timeAgo = getTimeAgo(new Date(av.created_at));

  return `
    <div class="border border-gray-100 dark:border-slate-600 rounded-xl p-4 hover:bg-gray-50 dark:hover:bg-slate-700 transition-all">
      <div class="flex items-start justify-between mb-2">
        <div>
          <div class="flex items-center gap-2 mb-1">
            <span class="font-semibold text-gray-800 dark:text-slate-100">${escapeHtml(av.autor_nome || 'Utilizador')}</span>
            ${isAuthor ? '<span class="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">Tu</span>' : ''}
          </div>
          <div class="flex items-center gap-1">
            ${renderStars(av.nota)}
          </div>
        </div>
        <div class="flex items-center gap-2">
          <span class="text-xs text-gray-400 dark:text-slate-400">${timeAgo}</span>
          ${isAuthor ? `
            <button class="deleteAvaliacaoBtn text-gray-400 hover:text-red-500 transition-colors" data-id="${av.id}" title="Eliminar a minha avaliação">
              <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
              </svg>
            </button>
          ` : ''}
        </div>
      </div>
      ${av.comentario ? `<p class="text-gray-600 dark:text-slate-300 text-sm mt-2 leading-relaxed">${escapeHtml(av.comentario)}</p>` : ''}
    </div>
  `;
}

function renderStars(nota) {
  let stars = '';
  for (let i = 1; i <= 5; i++) {
    if (i <= Math.floor(nota)) {
      stars += '<svg class="h-4 w-4 text-yellow-400" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"></path></svg>';
    } else if (i - 0.5 <= nota) {
      stars += '<svg class="h-4 w-4 text-yellow-400" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" opacity="0.4"></path><path d="M12 5.5l1.76 3.56 3.94.57-2.85 2.78.67 3.93L12 14.27V5.5z" fill="currentColor"></path></svg>';
    } else {
      stars += '<svg class="h-4 w-4 text-gray-300" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"></path></svg>';
    }
  }
  return stars;
}

function renderAvaliacaoModal(currentUserEmail) {
  return `
    <div id="avaliacaoModal" style="display: none;" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div class="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8">
        <div class="flex justify-between items-center mb-6">
          <h2 class="text-2xl font-bold text-gray-800">Avaliar o Website</h2>
          <button id="closeAvaliacaoModal" class="text-gray-500 hover:text-gray-700 text-2xl">&times;</button>
        </div>

        <form id="avaliacaoForm" class="space-y-5">

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              O teu email de registo
              <span class="text-gray-400 font-normal">(confirmar identidade)</span>
            </label>
            <input
              type="email"
              name="meu_email"
              value="${currentUserEmail ? escapeHtml(currentUserEmail) : ''}"
              class="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
              placeholder="email com que criaste a conta"
              required
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Nota</label>
            <div class="flex items-center gap-1" id="starRating">
              ${[1,2,3,4,5].map(i => `
                <button type="button" class="starBtn p-1 transition-transform hover:scale-110" data-value="${i}">
                  <svg class="h-8 w-8 text-gray-300 transition-colors" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"></path>
                  </svg>
                </button>
              `).join('')}
              <input type="hidden" name="nota" value="0" />
            </div>
            <p id="notaLabel" class="text-sm text-gray-500 mt-1">Seleciona uma nota</p>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Comentário</label>
            <textarea
              name="comentario"
              rows="3"
              class="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all resize-none"
              placeholder="Escreve a tua opinião sobre o website (opcional)"
            ></textarea>
          </div>

          <div id="avaliacaoError" style="display: none;" class="bg-red-50 border border-red-200 rounded-lg p-3">
            <p class="text-red-600 text-sm"></p>
          </div>

          <button
            type="submit"
            class="w-full bg-gradient-to-r from-green-600 to-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:from-green-700 hover:to-blue-700 focus:ring-4 focus:ring-green-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Submeter Avaliação
          </button>
        </form>
      </div>
    </div>
  `;
}

function getTimeAgo(date) {
  const seconds = Math.floor((new Date() - date) / 1000);
  if (seconds < 60) return 'agora';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}min`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d`;
  const months = Math.floor(days / 30);
  return `${months}m`;
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}