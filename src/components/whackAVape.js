import { supabase } from '../lib/supabase.js';
const gameState = {
  isRunning: false,
  timeLeft: 60,
  score: 0,
  highScore: parseInt(localStorage.getItem('whackAVapeHighScore') || '0'),
  currentVapeCell: null,
  timerInterval: null,
  vapeInterval: null,
  lastFinishedScore: null,
  scoreRegistered: false,
};

export function renderWhackAVape() {
  return `
    <section id="whackAVapeSection" class="bg-white dark:bg-slate-900 rounded-2xl shadow-lg p-5 mb-8">
      <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div>
          <h2 class="text-2xl font-bold text-gray-800 dark:text-slate-100">Whack-a-Vape</h2>
          <p class="text-gray-600 dark:text-slate-300">Jogo desenhado para desviar o foco durante picos de vontade de fumar. Clica no fumo antes que o tempo acabe.</p>
        </div>
        <div class="flex flex-col sm:flex-row gap-2">
          <button
            id="startGameBtn"
            class="bg-green-600 hover:bg-green-700 text-white font-bold px-2 py-1 rounded-full text-xs transition-all"
          >
            Iniciar
          </button>
          <button
            id="resetGameBtn"
            class="bg-gray-600 hover:bg-gray-700 text-white font-bold px-2 py-1 rounded-full text-xs transition-all"
          >
            Reiniciar
          </button>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        <div class="bg-gray-50 dark:bg-slate-800 p-4 rounded-lg shadow-sm">
          <p class="text-sm text-gray-600 dark:text-slate-300 font-semibold">Tempo Restante</p>
          <p id="timerDisplay" class="text-4xl font-bold text-green-600">60</p>
        </div>
        <div class="bg-gray-50 dark:bg-slate-800 p-4 rounded-lg shadow-sm">
          <p class="text-sm text-gray-600 dark:text-slate-300 font-semibold">Pontos</p>
          <p id="scoreDisplay" class="text-4xl font-bold text-blue-600">0</p>
        </div>
        <div class="bg-gray-50 dark:bg-slate-800 p-4 rounded-lg shadow-sm">
          <p class="text-sm text-gray-600 dark:text-slate-300 font-semibold">Melhor Pontuação</p>
          <p id="highScoreDisplay" class="text-4xl font-bold text-purple-600">0</p>
        </div>
      </div>

      <div id="gameProgress" class="w-full bg-gray-200 rounded-full h-2 mb-6">
        <div id="progressBar" class="bg-green-500 h-2 rounded-full transition-all duration-300" style="width: 100%"></div>
      </div>

      <div id="gameContainer" class="mb-6">
        <div id="gameBoard" class="grid grid-cols-3 gap-1 aspect-square bg-gradient-to-br from-gray-100 to-gray-50 dark:from-slate-800 dark:to-slate-700 p-2 rounded-lg border-2 border-gray-300 dark:border-slate-700">
          ${Array(9).fill(0).map((_, i) => `
            <button
              class="gameCell bg-white dark:bg-slate-800 hover:bg-gray-50 dark:hover:bg-slate-700 border-2 border-gray-300 dark:border-slate-700 rounded-lg transition-all duration-75 flex items-center justify-center text-2xl md:text-3xl cursor-pointer active:scale-95 min-h-[56px]"
              data-cell="${i}"
            >
              <span class="vapeEmoji hidden text-5xl md:text-6xl">💨</span>
            </button>
          `).join('')}
        </div>
      </div>

      <div id="gameMessage" class="hidden text-center p-4 bg-green-50 dark:bg-emerald-900 border border-green-200 dark:border-emerald-700 rounded-lg mb-4">
        <p id="messageText" class="text-xl font-bold text-green-700 dark:text-emerald-100"></p>
        <p id="messageFinal" class="text-gray-600 dark:text-emerald-200 mt-2"></p>
        <button
          id="saveScoreBtn"
          class="hidden mt-4 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-bold px-4 py-2 rounded-full text-sm transition-all"
        >
          Registar pontuação
        </button>
      </div>

      ${renderLeaderboard([])}
    </section>
  `;
}

function renderLeaderboard(entries) {
  const rows = entries.length
    ? entries.map((entry, index) => `
        <div class="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-slate-800">
          <div>
            <p class="font-semibold text-gray-800 dark:text-slate-100">${index + 1}. ${escapeHtml(entry.name)}</p>
            <p class="text-xs text-gray-500 dark:text-slate-400">${escapeHtml(entry.date)}</p>
          </div>
          <span class="text-lg font-bold text-green-600 dark:text-emerald-300">${entry.score}</span>
        </div>
      `).join('')
    : `<p class="text-gray-600 dark:text-slate-300">Sem pontuações ainda. Joga para entrar na leaderboard!</p>`;

  return `
    <div id="leaderboardSection" class="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-5">
      <div class="flex items-center justify-between mb-4">
        <div>
          <h3 class="text-lg font-semibold text-gray-800 dark:text-slate-100">Leaderboard</h3>
          <p class="text-sm text-gray-500 dark:text-slate-400">Top 5 melhores pontuações</p>
        </div>
        <span id="leaderboardCount" class="text-xs text-gray-500 dark:text-slate-400">${entries.length} registos</span>
      </div>
      <div id="leaderboardList" class="space-y-2">
        ${rows}
      </div>
    </div>
  `;
}

export async function loadLeaderboard() {
  if (!supabase) return [];

  const { data, error } = await supabase
    .from('whack_scores')
    .select('id, player_name, score, created_at')
    .order('score', { ascending: false })
    .order('created_at', { ascending: true })
    .limit(5);

  if (error) {
    console.error('Error loading leaderboard:', error);
    return [];
  }

  return (data || []).map(entry => ({
    id: entry.id,
    name: entry.player_name || 'Jogador',
    score: entry.score || 0,
    date: new Date(entry.created_at).toLocaleDateString('pt-PT'),
  }));
}

export async function loadRemoteLeaderboard() {
  return loadLeaderboard();
}

function saveLocalLeaderboard(entries) {
  localStorage.setItem('whackAVapeLeaderboard', JSON.stringify(entries));
}

function addLocalScoreToLeaderboard(score) {
  const name = window.whackAVapeUserName || 'Jogador';
  let localEntries = [];
  try {
    localEntries = JSON.parse(localStorage.getItem('whackAVapeLeaderboard') || '[]');
  } catch (e) {
    localEntries = [];
  }

  localEntries.push({
    name,
    score,
    date: new Date().toLocaleDateString('pt-PT'),
  });

  localEntries.sort((a, b) => b.score - a.score);
  const topFive = localEntries.slice(0, 5);
  saveLocalLeaderboard(topFive);
  return topFive;
}

export async function saveRemoteScore(score) {
  if (!supabase || !window.whackAVapeUserId) {
    return addLocalScoreToLeaderboard(score);
  }

  const userId = window.whackAVapeUserId;
  const playerName = window.whackAVapeUserName || 'Jogador';

  const { error } = await supabase
    .from('whack_scores')
    .insert([{ user_id: userId, player_name: playerName, score }]);

  if (error) {
    console.error('Error saving Whack-a-Vape score:', error);
    return addLocalScoreToLeaderboard(score);
  }

  return loadLeaderboard();
}

export async function refreshLeaderboard(providedEntries = null) {
  const leaderboardList = document.getElementById('leaderboardList');
  const leaderboardCount = document.getElementById('leaderboardCount');
  if (!leaderboardList) return;

  let entries = providedEntries;
  if (!entries) {
    leaderboardList.innerHTML = '<p class="text-gray-600 dark:text-slate-300">A carregar leaderboard...</p>';
    entries = await loadLeaderboard();
  }

  if (leaderboardCount) {
    leaderboardCount.textContent = `${entries.length} registos`;
  }

  leaderboardList.innerHTML = entries.length
    ? entries.map((entry, index) => `
        <div class="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-slate-800">
          <div>
            <p class="font-semibold text-gray-800 dark:text-slate-100">${index + 1}. ${escapeHtml(entry.name)}</p>
            <p class="text-xs text-gray-500 dark:text-slate-400">${escapeHtml(entry.date)}</p>
          </div>
          <span class="text-lg font-bold text-green-600 dark:text-emerald-300">${entry.score}</span>
        </div>
      `).join('')
    : `<p class="text-gray-600 dark:text-slate-300">Sem pontuações ainda. Joga para entrar na leaderboard!</p>`;
}

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

export function initWhackAVape() {

  const startBtn = document.getElementById('startGameBtn');
  const resetBtn = document.getElementById('resetGameBtn');
  const gameBoard = document.getElementById('gameBoard');
  const gameMessage = document.getElementById('gameMessage');
  const messageText = document.getElementById('messageText');
  const messageFinal = document.getElementById('messageFinal');
  const saveScoreBtn = document.getElementById('saveScoreBtn');
  const timerDisplay = document.getElementById('timerDisplay');
  const scoreDisplay = document.getElementById('scoreDisplay');
  const highScoreDisplay = document.getElementById('highScoreDisplay');
  const progressBar = document.getElementById('progressBar');
  const cells = document.querySelectorAll('.gameCell');

  if (!startBtn || !resetBtn || !gameBoard || !timerDisplay || !scoreDisplay || !highScoreDisplay || !progressBar) {
    return;
  }

  resetBtn.disabled = true;
  highScoreDisplay.textContent = gameState.highScore;
  
  refreshLeaderboard();

  window._whackShowVape = showVape;
  function showVape() {
    if (!gameState.isRunning) return;

    if (gameState.currentVapeCell !== null) {
      const previousCell = gameBoard.querySelector(`[data-cell="${gameState.currentVapeCell}"]`);
      if (previousCell) {
        const previousEmoji = previousCell.querySelector('.vapeEmoji');
        if (previousEmoji) {
          previousEmoji.classList.add('hidden');
        }
      }
    }

    const randomCell = Math.floor(Math.random() * 9);
    gameState.currentVapeCell = randomCell;
    const cell = gameBoard.querySelector(`[data-cell="${randomCell}"]`);
    const emoji = cell?.querySelector('.vapeEmoji');
    if (emoji) {
      emoji.classList.remove('hidden');
    }
  }

  function updateUI() {
    timerDisplay.textContent = gameState.timeLeft;
    scoreDisplay.textContent = gameState.score;
    const progressPercent = (gameState.timeLeft / 60) * 100;
    progressBar.style.width = progressPercent + '%';
  }

  function startGame() {
    gameState.isRunning = true;
    gameState.timeLeft = 60;
    gameState.score = 0;
    gameState.currentVapeCell = null;
    gameState.lastFinishedScore = null;
    gameState.scoreRegistered = false;
    gameMessage.classList.add('hidden');
    saveScoreBtn?.classList.add('hidden');
    startBtn.disabled = true;
    resetBtn.disabled = false;
    updateUI();

    showVape();
    gameState.vapeInterval = setInterval(() => {
      if (gameState.isRunning) {
        showVape();
      }
    }, 2000);

    gameState.timerInterval = setInterval(() => {
      gameState.timeLeft--;
      updateUI();

      if (gameState.timeLeft <= 0) {
        endGame();
      }
    }, 1000);
  }

  function endGame() {
    gameState.isRunning = false;
    clearInterval(gameState.timerInterval);
    clearInterval(gameState.vapeInterval);

    cells.forEach(cell => {
      cell.querySelector('.vapeEmoji').classList.add('hidden');
    });

    if (gameState.score > gameState.highScore) {
      gameState.highScore = gameState.score;
      localStorage.setItem('whackAVapeHighScore', gameState.highScore);
      highScoreDisplay.textContent = gameState.highScore;
      messageText.textContent = '🎉 Novo Recorde!';
      messageFinal.textContent = `Pontuação: ${gameState.score}`;
    } else {
      messageText.textContent = '✅ Sucesso! Desejo Derrotado';
      messageFinal.textContent = `Pontuação: ${gameState.score} | Melhor: ${gameState.highScore}`;
    }

    gameState.lastFinishedScore = gameState.score;
    gameState.scoreRegistered = false;
    if (saveScoreBtn) {
      saveScoreBtn.disabled = false;
      saveScoreBtn.textContent = 'Registar pontuação';
      saveScoreBtn.classList.remove('hidden');
    }

    gameMessage.classList.remove('hidden');
    startBtn.disabled = false;
    startBtn.textContent = 'Jogar Novamente';
  }

  // Expor funções no window para o event delegation do main.js
  window.startWhackAVapeGame = startGame;
  window.resetWhackAVapeGame = resetGame;
  window.saveWhackAVapeScore = saveScore;
  window.whackAVapeCellClick = cellClick;

  // Listeners nas células (são muitas e estáticas dentro do jogo — delegation via window)
  cells.forEach(cell => {
    cell.addEventListener('click', () => cellClick(parseInt(cell.dataset.cell, 10)));
  });
}

function resetGame() {
  const gameBoard = document.getElementById('gameBoard');
  const gameMessage = document.getElementById('gameMessage');
  const saveScoreBtn = document.getElementById('saveScoreBtn');
  const startBtn = document.getElementById('startGameBtn');
  const cells = gameBoard ? gameBoard.querySelectorAll('.gameCell') : [];

  gameState.isRunning = false;
  if (gameState.timerInterval) clearInterval(gameState.timerInterval);
  if (gameState.vapeInterval) clearInterval(gameState.vapeInterval);
  gameState.timeLeft = 60;
  gameState.score = 0;
  gameState.currentVapeCell = null;
  gameState.lastFinishedScore = null;
  gameState.scoreRegistered = false;

  if (gameMessage) gameMessage.classList.add('hidden');
  if (saveScoreBtn) saveScoreBtn.classList.add('hidden');
  cells.forEach(cell => {
    const emoji = cell.querySelector('.vapeEmoji');
    if (emoji) emoji.classList.add('hidden');
  });

  const timerDisplay = document.getElementById('timerDisplay');
  const scoreDisplay = document.getElementById('scoreDisplay');
  const progressBar = document.getElementById('progressBar');
  if (timerDisplay) timerDisplay.textContent = gameState.timeLeft;
  if (scoreDisplay) scoreDisplay.textContent = gameState.score;
  if (progressBar) progressBar.style.width = '100%';
  if (startBtn) { startBtn.disabled = false; startBtn.textContent = 'Iniciar Jogo'; }
}

async function saveScore() {
  if (gameState.lastFinishedScore === null || gameState.scoreRegistered) return;

  const saveScoreBtn = document.getElementById('saveScoreBtn');
  const messageFinal = document.getElementById('messageFinal');

  if (saveScoreBtn) { saveScoreBtn.disabled = true; saveScoreBtn.textContent = 'A registar...'; }

  try {
    const entries = await saveRemoteScore(gameState.lastFinishedScore);
    if (!entries) throw new Error('Leaderboard indisponivel');

    refreshLeaderboard(entries);
    gameState.scoreRegistered = true;
    if (saveScoreBtn) saveScoreBtn.textContent = 'Pontuação registada ✓';
    if (messageFinal) messageFinal.textContent = `${messageFinal.textContent} | Pontuação registada`;
  } catch (error) {
    console.error('Error registering score:', error);
    if (saveScoreBtn) { saveScoreBtn.disabled = false; saveScoreBtn.textContent = 'Tentar novamente'; }
    if (messageFinal) messageFinal.textContent = `${messageFinal.textContent} | Não foi possível registar.`;
  }
}

function cellClick(cellIndex) {
  if (!gameState.isRunning) return;
  if (cellIndex === gameState.currentVapeCell) {
    const gameBoard = document.getElementById('gameBoard');
    const scoreDisplay = document.getElementById('scoreDisplay');
    gameState.score++;
    if (scoreDisplay) scoreDisplay.textContent = gameState.score;
    const cell = gameBoard?.querySelector(`[data-cell="${cellIndex}"]`);
    if (cell) cell.querySelector('.vapeEmoji')?.classList.add('hidden');
    gameState.currentVapeCell = null;
    // showVape needs to be called - expose it
    window._whackShowVape && window._whackShowVape();
  }
}