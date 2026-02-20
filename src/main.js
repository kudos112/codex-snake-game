import {
  DEFAULT_CONFIG,
  advanceGame,
  createInitialState,
  togglePause,
  updateDirection
} from "./game-logic.js";

const boardEl = document.querySelector("#board");
const scoreEl = document.querySelector("#score");
const statusEl = document.querySelector("#status");
const pauseBtn = document.querySelector("#pauseBtn");
const controlButtons = document.querySelectorAll("[data-action]");

let state = createInitialState(DEFAULT_CONFIG);
let intervalId = null;

setupBoard();
render();
startLoop();

document.addEventListener("keydown", onKeyDown);
controlButtons.forEach((button) => {
  button.addEventListener("click", () => handleAction(button.dataset.action));
});

function setupBoard() {
  boardEl.style.setProperty("--grid-width", String(DEFAULT_CONFIG.width));
  boardEl.style.setProperty("--grid-height", String(DEFAULT_CONFIG.height));
}

function startLoop() {
  stopLoop();
  intervalId = setInterval(() => {
    state = advanceGame(state);
    render();
    if (state.gameOver) {
      stopLoop();
    }
  }, state.config.tickMs);
}

function stopLoop() {
  if (intervalId) {
    clearInterval(intervalId);
    intervalId = null;
  }
}

function onKeyDown(event) {
  const key = event.key.toLowerCase();
  const keyMap = {
    arrowup: "up",
    w: "up",
    arrowdown: "down",
    s: "down",
    arrowleft: "left",
    a: "left",
    arrowright: "right",
    d: "right"
  };

  if (key === " ") {
    handleAction("pause");
    return;
  }

  if (key === "r") {
    handleAction("restart");
    return;
  }

  const direction = keyMap[key];
  if (direction) {
    event.preventDefault();
    state = updateDirection(state, direction);
  }
}

function handleAction(action) {
  if (action === "restart") {
    state = createInitialState(DEFAULT_CONFIG);
    render();
    startLoop();
    return;
  }

  if (action === "pause") {
    state = togglePause(state);
    render();
    if (state.paused) {
      stopLoop();
    } else if (!state.gameOver) {
      startLoop();
    }
    return;
  }

  if (action === "up" || action === "down" || action === "left" || action === "right") {
    state = updateDirection(state, action);
  }
}

function render() {
  const cellCount = state.config.width * state.config.height;
  const cells = new Array(cellCount).fill("cell");
  const snakeSet = new Set(state.snake.map(toKey));
  const foodKey = state.food ? toKey(state.food) : null;
  const headKey = toKey(state.snake[0]);

  for (let y = 0; y < state.config.height; y += 1) {
    for (let x = 0; x < state.config.width; x += 1) {
      const index = y * state.config.width + x;
      const key = `${x},${y}`;

      if (key === foodKey) {
        cells[index] = "cell food";
      } else if (snakeSet.has(key)) {
        cells[index] = key === headKey ? "cell snake head" : "cell snake";
      }
    }
  }

  boardEl.innerHTML = cells.map((className) => `<div class="${className}"></div>`).join("");
  scoreEl.textContent = String(state.score);
  pauseBtn.textContent = state.paused ? "Resume" : "Pause";

  if (state.gameOver) {
    statusEl.textContent = "Game over. Press R or Restart.";
  } else if (state.paused) {
    statusEl.textContent = "Paused.";
  } else {
    statusEl.textContent = "Use arrow keys or WASD to move.";
  }
}

function toKey(segment) {
  return `${segment.x},${segment.y}`;
}
