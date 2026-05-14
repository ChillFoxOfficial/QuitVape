import { supabase } from '../lib/supabase.js';

export function renderWhackAVape() {
  return `
    <section id="whackAVapeSection" class="bg-white dark:bg-slate-900 rounded-2xl shadow-lg p-5 mb-8">
      <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div>
          <h2 class="text-2xl font-bold text-gray-800 dark:text-slate-100">Whack-a-Vape</h2>
          <p class="text-gray-600 dark:text-slate-300">Clique no emoji de vape antes que o tempo acabe.</p>
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
          Registar pontua&ccedil;&atilde;o
        </button>
      </div>

      ${renderLeaderboard(loadLeaderboard())}
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

function loadLeaderboard() {
  try {
    const saved = localStorage.getItem('whackAVapeLeaderboard');
    return saved ? JSON.parse(saved) : [];
  } catch (error) {
    return [];
  }
}

function saveLeaderboard(entries) {
  localStorage.setItem('whackAVapeLeaderboard', JSON.stringify(entries));
}

function addLocalScoreToLeaderboard(score) {
  const name = window.whackAVapeUserName || 'Jogador';
  const newEntry = { name, score, date: new Date().toLocaleDateString() };
  const entries = loadLeaderboard();
  entries.push(newEntry);
  entries.sort((a, b) => b.score - a.score);
  const topEntries = entries.slice(0, 5);
  saveLeaderboard(topEntries);
  return topEntries;
}

function formatScoreDate(value) {
  if (!value) return '';

  return new Date(value).toLocaleDateString('pt-PT');
}

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

async function loadRemoteLeaderboard() {
  if (!supabase) return null;

  const { data, error } = await supabase
    .from('whack_a_vape_scores')
    .select('player_name, score, updated_at')
    .order('score', { ascending: false })
    .order('updated_at', { ascending: true })
    .limit(5);

  if (error) {
    console.error('Error fetching Whack-a-Vape leaderboard:', error);
    return null;
  }

  return (data || []).map(entry => ({
    name: entry.player_name || 'Jogador',
    score: entry.score || 0,
    date: formatScoreDate(entry.updated_at),
  }));
}

async function saveRemoteScore(score) {
  if (!supabase || !window.whackAVapeUserId) {
    return addLocalScoreToLeaderboard(score);
  }

  const userId = window.whackAVapeUserId;
  const playerName = window.whackAVapeUserName || 'Jogador';

  const { data: existingEntry, error: fetchError } = await supabase
    .from('whack_a_vape_scores')
    .select('score')
    .eq('user_id', userId)
    .maybeSingle();

  if (fetchError) {
    console.error('Error fetching Whack-a-Vape score:', fetchError);
    return addLocalScoreToLeaderboard(score);
  }

  if (existingEntry && score <= existingEntry.score) {
    return loadRemoteLeaderboard();
  }

  const payload = {
    user_id: userId,
    player_name: playerName,
    score,
    updated_at: new Date().toISOString(),
  };

  const query = existingEntry
    ? supabase.from('whack_a_vape_scores').update(payload).eq('user_id', userId)
    : supabase.from('whack_a_vape_scores').insert([payload]);

  const { error } = await query;

  if (error) {
    console.error('Error saving Whack-a-Vape score:', error);
    return addLocalScoreToLeaderboard(score);
  }

  return loadRemoteLeaderboard();
}

function refreshLeaderboard(entries = loadLeaderboard()) {
  const leaderboardList = document.getElementById('leaderboardList');
  const leaderboardCount = document.getElementById('leaderboardCount');
  if (!leaderboardList) return;

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

export function initWhackAVape() {
  let gameState = {
    isRunning: false,
    timeLeft: 60,
    score: 0,
    highScore: parseInt(localStorage.getItem('whackAVapeHighScore') || '0'),
    currentVapeCell: null,
    timerInterval: null,
    lastFinishedScore: null,
    scoreRegistered: false,
  };

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

  loadRemoteLeaderboard().then(entries => {
    if (entries) {
      refreshLeaderboard(entries);
    }
  });

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
    const vapeInterval = setInterval(() => {
      if (gameState.isRunning) {
        showVape();
      }
    }, 2000);

    gameState.timerInterval = setInterval(() => {
      gameState.timeLeft--;
      updateUI();

      if (gameState.timeLeft <= 0) {
        endGame(vapeInterval);
      }
    }, 1000);
  }

  function endGame(vapeInterval) {
    gameState.isRunning = false;
    clearInterval(gameState.timerInterval);
    clearInterval(vapeInterval);

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
      saveScoreBtn.textContent = 'Registar pontua\u00e7\u00e3o';
      saveScoreBtn.classList.remove('hidden');
    }

    gameMessage.classList.remove('hidden');
    startBtn.disabled = false;
    startBtn.textContent = 'Jogar Novamente';
  }

  startBtn.addEventListener('click', startGame);

  saveScoreBtn?.addEventListener('click', async () => {
    if (gameState.lastFinishedScore === null || gameState.scoreRegistered) return;

    saveScoreBtn.disabled = true;
    saveScoreBtn.textContent = 'A registar...';

    const entries = await saveRemoteScore(gameState.lastFinishedScore);
    if (entries) {
      refreshLeaderboard(entries);
    }

    gameState.scoreRegistered = true;
    saveScoreBtn.textContent = 'Pontua\u00e7\u00e3o registada';
  });

  resetBtn.addEventListener('click', () => {
    gameState.isRunning = false;
    if (gameState.timerInterval) clearInterval(gameState.timerInterval);
    gameState.timeLeft = 60;
    gameState.score = 0;
    gameState.currentVapeCell = null;
    gameState.lastFinishedScore = null;
    gameState.scoreRegistered = false;
    gameMessage.classList.add('hidden');
    saveScoreBtn?.classList.add('hidden');
    cells.forEach(cell => {
      cell.querySelector('.vapeEmoji').classList.add('hidden');
    });
    updateUI();
    startBtn.disabled = false;
    startBtn.textContent = 'Iniciar Jogo';
  });

  cells.forEach(cell => {
    cell.addEventListener('click', () => {
      if (!gameState.isRunning) return;

      const cellIndex = parseInt(cell.dataset.cell, 10);
      if (cellIndex === gameState.currentVapeCell) {
        gameState.score++;
        scoreDisplay.textContent = gameState.score;
        cell.querySelector('.vapeEmoji').classList.add('hidden');
        gameState.currentVapeCell = null;
        showVape();
      }
    });
  });

  window.startWhackAVapeGame = startGame;
}
