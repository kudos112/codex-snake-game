export const DEFAULT_CONFIG = {
  width: 20,
  height: 20,
  tickMs: 140
};

export const DIRECTION_VECTORS = {
  up: { x: 0, y: -1 },
  down: { x: 0, y: 1 },
  left: { x: -1, y: 0 },
  right: { x: 1, y: 0 }
};

export function createInitialSnake(config) {
  const centerX = Math.floor(config.width / 2);
  const centerY = Math.floor(config.height / 2);
  return [
    { x: centerX, y: centerY },
    { x: centerX - 1, y: centerY },
    { x: centerX - 2, y: centerY }
  ];
}

export function createInitialState(config = DEFAULT_CONFIG, rng = Math.random) {
  const snake = createInitialSnake(config);
  return {
    config,
    snake,
    direction: "right",
    nextDirection: "right",
    food: spawnFood(config, snake, rng),
    score: 0,
    gameOver: false,
    paused: false
  };
}

export function isOppositeDirection(a, b) {
  return (
    (a === "up" && b === "down") ||
    (a === "down" && b === "up") ||
    (a === "left" && b === "right") ||
    (a === "right" && b === "left")
  );
}

export function updateDirection(state, requestedDirection) {
  if (!DIRECTION_VECTORS[requestedDirection]) {
    return state;
  }

  if (
    requestedDirection === state.direction ||
    isOppositeDirection(state.direction, requestedDirection)
  ) {
    return state;
  }

  return { ...state, nextDirection: requestedDirection };
}

export function togglePause(state) {
  if (state.gameOver) {
    return state;
  }
  return { ...state, paused: !state.paused };
}

export function advanceGame(state, rng = Math.random) {
  if (state.gameOver || state.paused) {
    return state;
  }

  const direction = state.nextDirection;
  const vector = DIRECTION_VECTORS[direction];
  const currentHead = state.snake[0];
  const nextHead = {
    x: currentHead.x + vector.x,
    y: currentHead.y + vector.y
  };

  if (isWallCollision(nextHead, state.config)) {
    return {
      ...state,
      direction,
      gameOver: true
    };
  }

  const willEat = sameCell(nextHead, state.food);
  const bodyToCheck = willEat ? state.snake : state.snake.slice(0, -1);
  if (hasSelfCollision(nextHead, bodyToCheck)) {
    return {
      ...state,
      direction,
      gameOver: true
    };
  }

  const movedSnake = [nextHead, ...state.snake];
  const nextSnake = willEat ? movedSnake : movedSnake.slice(0, -1);
  const nextFood = willEat ? spawnFood(state.config, nextSnake, rng) : state.food;
  const hasWon = willEat && nextFood === null;

  return {
    ...state,
    snake: nextSnake,
    direction,
    nextDirection: direction,
    food: nextFood,
    score: state.score + (willEat ? 1 : 0),
    gameOver: hasWon
  };
}

export function spawnFood(config, snake, rng = Math.random) {
  const openCells = [];
  for (let y = 0; y < config.height; y += 1) {
    for (let x = 0; x < config.width; x += 1) {
      if (!snake.some((segment) => segment.x === x && segment.y === y)) {
        openCells.push({ x, y });
      }
    }
  }

  if (openCells.length === 0) {
    return null;
  }

  const randomIndex = Math.floor(rng() * openCells.length);
  return openCells[randomIndex];
}

export function isWallCollision(head, config) {
  return (
    head.x < 0 ||
    head.y < 0 ||
    head.x >= config.width ||
    head.y >= config.height
  );
}

export function hasSelfCollision(head, snake) {
  return snake.some((segment) => segment.x === head.x && segment.y === head.y);
}

function sameCell(a, b) {
  return Boolean(b) && a.x === b.x && a.y === b.y;
}
