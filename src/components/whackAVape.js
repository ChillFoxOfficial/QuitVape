export function renderWhackAVape() {
  return `
    <div id="whackAVapeGame" class="max-w-2xl mx-auto">
      <div class="bg-gradient-to-r from-green-600 to-green-700 p-6 mb-6 rounded-lg">
        <h2 class="text-2xl font-bold text-white">Derrota o Desejo!</h2>
        <p class="text-green-100">Jogo "Whack-a-Vape" - Distração Rápida</p>
      </div>

      <div class="p-6 bg-white rounded-lg shadow-xl">
        <div class="text-center mb-6">
          <div id="gameStats" class="flex justify-around items-center mb-4">
            <div class="bg-gray-50 p-4 rounded-lg flex-1 mx-2">
              <p class="text-sm text-gray-600 font-semibold">Tempo Restante</p>
              <p id="timerDisplay" class="text-4xl font-bold text-green-600">60</p>
            </div>
            <div class="bg-gray-50 p-4 rounded-lg flex-1 mx-2">
              <p class="text-sm text-gray-600 font-semibold">Pontos</p>
              <p id="scoreDisplay" class="text-4xl font-bold text-blue-600">0</p>
            </div>
            <div class="bg-gray-50 p-4 rounded-lg flex-1 mx-2">
              <p class="text-sm text-gray-600 font-semibold">Melhor Pontuação</p>
              <p id="highScoreDisplay" class="text-4xl font-bold text-purple-600">0</p>
            </div>
          </div>

          <div id="gameProgress" class="w-full bg-gray-200 rounded-full h-2 mb-4">
            <div id="progressBar" class="bg-green-500 h-2 rounded-full transition-all duration-300" style="width: 100%"></div>
          </div>
        </div>

        <div id="gameContainer" class="mb-6">
          <div id="gameBoard" class="grid grid-cols-3 gap-3 aspect-square bg-gradient-to-br from-gray-100 to-gray-50 p-4 rounded-lg border-2 border-gray-300">
            ${Array(9).fill(0).map((_, i) => `
              <button
                class="gameCell bg-white hover:bg-gray-50 border-2 border-gray-300 rounded-lg transition-all duration-75 flex items-center justify-center text-4xl cursor-pointer active:scale-95"
                data-cell="${i}"
              >
                <span class="vapeEmoji hidden">💨</span>
              </button>
            `).join('')}
          </div>
        </div>

        <div id="gameMessage" class="hidden text-center p-4 bg-green-50 border border-green-200 rounded-lg mb-4">
          <p id="messageText" class="text-xl font-bold text-green-700"></p>
          <p id="messageFinal" class="text-gray-600 mt-2"></p>
        </div>

        <div class="flex gap-4">
          <button
            id="startGameBtn"
            class="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-lg transition-all"
          >
            Iniciar Jogo
          </button>
          <button
            id="resetGameBtn"
            class="flex-1 bg-gray-600 hover:bg-gray-700 text-white font-bold py-3 rounded-lg transition-all"
          >
            Reiniciar
          </button>
        </div>
      </div>
    </div>
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

  highScoreDisplay.textContent = gameState.highScore;

  function showVape() {
    if (!gameState.isRunning) return;

    if (gameState.currentVapeCell !== null) {
      const previousCell = gameBoard.querySelector(`[data-cell="${gameState.currentVapeCell}"]`);
      if (previousCell) {
        previousCell.querySelector('.vapeEmoji').classList.add('hidden');
      }
    }

    const randomCell = Math.floor(Math.random() * 9);
    gameState.currentVapeCell = randomCell;
    const cell = gameBoard.querySelector(`[data-cell="${randomCell}"]`);
    cell.querySelector('.vapeEmoji').classList.remove('hidden');
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

      const cellIndex = parseInt(cell.dataset.cell);
      if (cellIndex === gameState.currentVapeCell) {
        gameState.score++;
        scoreDisplay.textContent = gameState.score;
        cell.querySelector('.vapeEmoji').classList.add('hidden');
        gameState.currentVapeCell = null;
        showVape();
      }
    });
  });
}