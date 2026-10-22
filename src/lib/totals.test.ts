import { describe, expect, it } from "vitest";
import { solveBfs } from "./bfs";
import { countVisited, queueSnapshot } from "./describe";
import { generateMaze } from "./maze";
import { EMPTY_TOTALS, totalsAt } from "./totals";

function pathCells(tracedAt: Int32Array, stepIndex: number): number {
  let count = 0;
  for (let index = 0; index < tracedAt.length; index += 1) {
    const at = tracedAt[index];
    if (at !== -1 && at <= stepIndex) count += 1;
  }
  return count;
}

describe("totalsAt", () => {
  it("matches a full recount while playback moves forward", () => {
    const maze = generateMaze(12, 12, 4);
    const result = solveBfs(maze, 0, maze.width * maze.height - 1);
    let previous = EMPTY_TOTALS;
    for (let step = 0; step < result.steps.length; step += 1) {
      previous = totalsAt(result, step, previous);
      const snapshot = queueSnapshot(result, step, result.enqueuedOrder.length);
      expect(previous.visited).toBe(countVisited(result, step));
      expect(previous.queued).toBe(snapshot.total);
      expect(previous.path).toBe(pathCells(result.tracedAt, step));
      expect(previous.queued).toBeGreaterThanOrEqual(0);
    }
    expect(previous.path).toBe(result.path.length);
  });

  it("recounts after a rewind", () => {
    const maze = generateMaze(8, 8, 2);
    const result = solveBfs(maze, 0, maze.width * maze.height - 1);
    const mid = totalsAt(result, 20, EMPTY_TOTALS);
    const start = totalsAt(result, 0, mid);
    expect(start.visited).toBe(0);
    expect(start.queued).toBe(queueSnapshot(result, 0).total);
    expect(start.path).toBe(0);
  });
});
