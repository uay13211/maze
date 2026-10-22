import { describe, expect, it } from "vitest";
import { WALL_E, WALL_N, WALL_S, WALL_W, generateMaze, type Maze } from "./maze";

function passageCount(maze: Maze): number {
  let count = 0;
  for (let y = 0; y < maze.height; y += 1) {
    for (let x = 0; x < maze.width; x += 1) {
      const walls = maze.walls[y * maze.width + x];
      if (x + 1 < maze.width && (walls & WALL_E) === 0) count += 1;
      if (y + 1 < maze.height && (walls & WALL_S) === 0) count += 1;
    }
  }
  return count;
}

function reachableCount(maze: Maze): number {
  const seen = new Uint8Array(maze.width * maze.height);
  const stack = [0];
  seen[0] = 1;
  let count = 0;
  while (stack.length > 0) {
    const cell = stack.pop();
    if (cell === undefined) break;
    count += 1;
    const x = cell % maze.width;
    const y = Math.floor(cell / maze.width);
    const walls = maze.walls[cell];
    const steps: Array<[number, number, number]> = [
      [WALL_N, x, y - 1],
      [WALL_E, x + 1, y],
      [WALL_S, x, y + 1],
      [WALL_W, x - 1, y],
    ];
    for (const [bit, nx, ny] of steps) {
      if ((walls & bit) !== 0) continue;
      if (nx < 0 || ny < 0 || nx >= maze.width || ny >= maze.height) continue;
      const next = ny * maze.width + nx;
      if (seen[next] === 1) continue;
      seen[next] = 1;
      stack.push(next);
    }
  }
  return count;
}

function expectPerfectMaze(maze: Maze) {
  const cells = maze.width * maze.height;
  expect(passageCount(maze)).toBe(cells - 1);
  expect(reachableCount(maze)).toBe(cells);

  for (let y = 0; y < maze.height; y += 1) {
    for (let x = 0; x < maze.width; x += 1) {
      const cell = y * maze.width + x;
      const walls = maze.walls[cell];
      if (y === 0) expect(walls & WALL_N).not.toBe(0);
      if (x === maze.width - 1) expect(walls & WALL_E).not.toBe(0);
      if (y === maze.height - 1) expect(walls & WALL_S).not.toBe(0);
      if (x === 0) expect(walls & WALL_W).not.toBe(0);

      if (x + 1 < maze.width) {
        const eastOpen = (walls & WALL_E) === 0;
        const westOpen = (maze.walls[cell + 1] & WALL_W) === 0;
        expect(westOpen).toBe(eastOpen);
      }
      if (y + 1 < maze.height) {
        const southOpen = (walls & WALL_S) === 0;
        const northOpen = (maze.walls[cell + maze.width] & WALL_N) === 0;
        expect(northOpen).toBe(southOpen);
      }
    }
  }
}

describe("generateMaze", () => {
  it("builds a connected perfect maze for several sizes", () => {
    const cases: Array<[number, number, number]> = [
      [1, 1, 1],
      [2, 2, 2],
      [1, 12, 3],
      [12, 1, 4],
      [5, 7, 99],
      [30, 30, 123456],
      [100, 100, 7],
    ];
    for (const [width, height, seed] of cases) {
      expectPerfectMaze(generateMaze(width, height, seed));
    }
  });

  it("builds the same walls for the same seed", () => {
    const first = generateMaze(20, 15, 4242);
    const second = generateMaze(20, 15, 4242);
    expect(Array.from(first.walls)).toEqual(Array.from(second.walls));
    expect(first.seed).toBe(4242);
  });

  it("builds different walls for a different seed", () => {
    const first = generateMaze(20, 15, 4242);
    const second = generateMaze(20, 15, 4243);
    expect(Array.from(first.walls)).not.toEqual(Array.from(second.walls));
  });

  it("rejects a size that is not a positive whole number", () => {
    expect(() => generateMaze(0, 4, 1)).toThrow();
    expect(() => generateMaze(1.5, 4, 1)).toThrow();
  });
});
