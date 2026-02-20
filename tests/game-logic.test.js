import test from "node:test";
import assert from "node:assert/strict";

import {
  advanceGame,
  createInitialState,
  spawnFood,
  updateDirection
} from "../src/game-logic.js";

const config = { width: 6, height: 6, tickMs: 100 };

test("moves one cell each tick in current direction", () => {
  let state = createInitialState(config, () => 0);
  const initialHead = state.snake[0];

  state = advanceGame(state, () => 0);

  assert.deepEqual(state.snake[0], { x: initialHead.x + 1, y: initialHead.y });
});

test("ignores reversing into opposite direction", () => {
  let state = createInitialState(config, () => 0);

  state = updateDirection(state, "left");
  state = advanceGame(state, () => 0);

  assert.equal(state.direction, "right");
});

test("grows and increments score when eating food", () => {
  let state = createInitialState(config, () => 0);
  const head = state.snake[0];
  state.food = { x: head.x + 1, y: head.y };

  const next = advanceGame(state, () => 0);

  assert.equal(next.score, 1);
  assert.equal(next.snake.length, state.snake.length + 1);
});

test("sets game over on wall collision", () => {
  let state = createInitialState({ width: 4, height: 4, tickMs: 100 }, () => 0);

  state = advanceGame(state, () => 0);
  state = advanceGame(state, () => 0);

  assert.equal(state.gameOver, true);
});

test("sets game over on self collision", () => {
  const state = {
    config: { width: 8, height: 8, tickMs: 100 },
    snake: [
      { x: 4, y: 4 },
      { x: 3, y: 4 },
      { x: 3, y: 3 },
      { x: 4, y: 3 },
      { x: 5, y: 3 },
      { x: 5, y: 4 }
    ],
    direction: "right",
    nextDirection: "up",
    food: { x: 0, y: 0 },
    score: 0,
    gameOver: false,
    paused: false
  };

  const next = advanceGame(state, () => 0);
  assert.equal(next.gameOver, true);
});

test("food never spawns on snake", () => {
  const snake = [
    { x: 0, y: 0 },
    { x: 1, y: 0 },
    { x: 2, y: 0 }
  ];
  const food = spawnFood(config, snake, () => 0);
  assert.notDeepEqual(food, snake[0]);
  assert.notDeepEqual(food, snake[1]);
  assert.notDeepEqual(food, snake[2]);
});
