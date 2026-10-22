import { describe, expect, it } from "vitest";
import { solveBfs } from "./bfs";
import { cellPhase } from "./cellPhase";
import { WALL_ALL, WALL_E, WALL_N, WALL_S, WALL_W, type Maze } from "./maze";

function corridor(): Maze {
  const walls = new Uint8Array(3);
  walls.fill(WALL_ALL);
  walls[0] = WALL_N | WALL_S | WALL_W;
  walls[1] = WALL_N | WALL_S;
  walls[2] = WALL_N | WALL_S | WALL_E;
  return { width: 3, height: 1, walls, seed: 1 };
}

describe("cellPhase", () => {
  const result = solveBfs(corridor(), 0, 2);

  it("marks the start cell as the current cell on the first step", () => {
    expect(cellPhase(0, 0, result)).toBe("current");
    expect(cellPhase(1, 0, result)).toBe("empty");
    expect(cellPhase(2, 0, result)).toBe("empty");
  });

  it("marks a visited cell after the search moves on", () => {
    const enqueue = result.steps.findIndex((step) => step.kind === "enqueue");
    expect(cellPhase(0, enqueue, result)).toBe("visited");
    expect(cellPhase(1, enqueue, result)).toBe("current");
  });

  it("marks the shortest path on the last step", () => {
    const last = result.steps.length - 1;
    expect(cellPhase(0, last, result)).toBe("path");
    expect(cellPhase(1, last, result)).toBe("path");
    expect(cellPhase(2, last, result)).toBe("path");
  });

  it("returns empty when no search exists", () => {
    expect(cellPhase(0, 0, null)).toBe("empty");
  });
});
