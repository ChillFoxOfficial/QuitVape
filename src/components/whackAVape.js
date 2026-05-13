export function renderWhackAVape() {
  return `
    <section id="whackAVapeSection" class="bg-white dark:bg-slate-900 rounded-2xl shadow-lg p-5 mb-8">
      <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div>
          <h2 class="text-2xl font-bold text-gray-800 dark:text-slate-100">Whack-a-Vape</h2>
          <p class="text-gray-600 dark:text-slate-300">Clique no emoji de vape antes que o tempo acabe.</p>
        </div>
        <div class="flex flex-col sm:flex-row gap-3">
          <button
            id="startGameBtn"
            class="bg-green-600 hover:bg-green-700 text-white font-bold px-3 py-2 rounded-full text-sm transition-all"
          >
            Iniciar Jogo
          </button>
          <button
            id="resetGameBtn"
            class="bg-gray-600 hover:bg-gray-700 text-white font-bold px-3 py-2 rounded-full text-sm transition-all"
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
        <div id="gameBoard" class="grid grid-cols-3 gap-2 aspect-square bg-gradient-to-br from-gray-100 to-gray-50 dark:from-slate-800 dark:to-slate-700 p-3 rounded-lg border-2 border-gray-300 dark:border-slate-700">
          ${Array(9).fill(0).map((_, i) => `
            <button
              class="gameCell bg-white dark:bg-slate-800 hover:bg-gray-50 dark:hover:bg-slate-700 border-2 border-gray-300 dark:border-slate-700 rounded-lg transition-all duration-75 flex items-center justify-center text-3xl md:text-4xl cursor-pointer active:scale-95 min-h-[66px]"
              data-cell="${i}"
            >
              <span class="vapeEmoji hidden">💨</span>
            </button>
          `).join('')}
        </div>
      </div>

      <div id="gameMessage" class="hidden text-center p-4 bg-green-50 dark:bg-emerald-900 border border-green-200 dark:border-emerald-700 rounded-lg mb-4">
        <p id="messageText" class="text-xl font-bold text-green-700 dark:text-emerald-100"></p>
        <p id="messageFinal" class="text-gray-600 dark:text-emerald-200 mt-2"></p>
      </div>
    </section>
  `;
}

export function initWhackAVape() {
  let gameState = {
    isRunning: false,
    timeLeft: 60,
    score: 0,
    highScore: parseInt(localStorage.getItem('whackAVapeHighScore') || '0'),
    currentVapeCell: null,
    timerInterval: null,
  };

  const startBtn = document.getElementById('startGameBtn');
  const resetBtn = document.getElementById('resetGameBtn');
  const gameBoard = document.getElementById('gameBoard');
  const gameMessage = document.getElementById('gameMessage');
  const messageText = document.getElementById('messageText');
  const messageFinal = document.getElementById('messageFinal');
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
    gameMessage.classList.add('hidden');
    startBtn.disabled = true;
    resetBtn.disabled = false;
    updateUI();

    showVape();
    const vapeInterval = setInterval(() => {
      if (gameState.isRunning) {
        showVape();
      }
    }, 500);

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

    gameMessage.classList.remove('hidden');
    startBtn.disabled = false;
    startBtn.textContent = 'Jogar Novamente';
  }

  startBtn.addEventListener('click', startGame);

  resetBtn.addEventListener('click', () => {
    gameState.isRunning = false;
    if (gameState.timerInterval) clearInterval(gameState.timerInterval);
    gameState.timeLeft = 60;
    gameState.score = 0;
    gameState.currentVapeCell = null;
    gameMessage.classList.add('hidden');
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