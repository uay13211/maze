import { describe, expect, it } from "vitest";
import { solveBfs } from "./bfs";
import { WALL_ALL, WALL_E, WALL_N, WALL_S, WALL_W, type Maze } from "./maze";
import { paintMaze } from "./paint";

function corridor(): Maze {
  const walls = new Uint8Array(3);
  walls.fill(WALL_ALL);
  walls[0] = WALL_N | WALL_S | WALL_W;
  walls[1] = WALL_N | WALL_S;
  walls[2] = WALL_N | WALL_S | WALL_E;
  return { width: 3, height: 1, walls, seed: 1 };
}

function rgb(pixels: Uint8ClampedArray, stride: number, x: number, y: number) {
  const offset = (y * stride + x) * 4;
  return [pixels[offset], pixels[offset + 1], pixels[offset + 2]];
}

describe("paintMaze", () => {
  const cell = 4;
  const maze = corridor();
  const stride = maze.width * cell;

  it("draws walls, the start cell, and the end cell before the search", () => {
    const pixels = new Uint8ClampedArray(stride * cell * 4);
    paintMaze(pixels, maze, null, 0, cell);
    expect(rgb(pixels, stride, 2, 0)).toEqual([36, 30, 24]);
    expect(rgb(pixels, stride, 0, 2)).toEqual([36, 30, 24]);
    expect(rgb(pixels, stride, 1, 1)).toEqual([27, 122, 56]);
    expect(rgb(pixels, stride, cell * 2 + 1, 1)).toEqual([198, 40, 40]);
    expect(rgb(pixels, stride, cell + 2, 2)).toEqual([255, 255, 255]);
  });

  it("draws the shortest path at the last step", () => {
    const result = solveBfs(maze, 0, 2);
    const pixels = new Uint8ClampedArray(stride * cell * 4);
    paintMaze(pixels, maze, result, result.steps.length - 1, cell);
    expect(rgb(pixels, stride, cell + 2, 2)).toEqual([21, 101, 192]);
    expect(rgb(pixels, stride, 1, 1)).toEqual([27, 122, 56]);
  });

  it("rejects a buffer of the wrong size", () => {
    expect(() => paintMaze(new Uint8ClampedArray(4), maze, null, 0, cell)).toThrow();
  });
});
