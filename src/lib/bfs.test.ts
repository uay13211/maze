import { describe, expect, it } from "vitest";
import { solveBfs, type SearchResult, type Step } from "./bfs";
import { WALL_ALL, WALL_E, WALL_N, WALL_S, WALL_W, generateMaze, type Maze } from "./maze";

function openPassage(walls: Uint8Array, width: number, a: number, b: number) {
  if (b === a + 1) {
    walls[a] &= ~WALL_E;
    walls[b] &= ~WALL_W;
    return;
  }
  if (b === a + width) {
    walls[a] &= ~WALL_S;
    walls[b] &= ~WALL_N;
    return;
  }
  throw new Error("The cells are not orthogonal neighbours.");
}

function grid(width: number, height: number, passages: Array<[number, number]>, seed = 1): Maze {
  const walls = new Uint8Array(width * height);
  walls.fill(WALL_ALL);
  for (const [a, b] of passages) openPassage(walls, width, a, b);
  return { width, height, walls, seed };
}

function referenceDistance(maze: Maze, start: number, end: number): number {
  const count = maze.width * maze.height;
  const distance = new Int32Array(count);
  distance.fill(-1);
  const queue = [start];
  distance[start] = 0;
  for (let head = 0; head < queue.length; head += 1) {
    const cell = queue[head];
    if (cell === end) return distance[cell];
    const x = cell % maze.width;
    const y = Math.floor(cell / maze.width);
    const walls = maze.walls[cell];
    const next: number[] = [];
    if (y > 0 && (walls & WALL_N) === 0) next.push(cell - maze.width);
    if (x + 1 < maze.width && (walls & WALL_E) === 0) next.push(cell + 1);
    if (y + 1 < maze.height && (walls & WALL_S) === 0) next.push(cell + maze.width);
    if (x > 0 && (walls & WALL_W) === 0) next.push(cell - 1);
    for (const candidate of next) {
      if (distance[candidate] !== -1) continue;
      distance[candidate] = distance[cell] + 1;
      queue.push(candidate);
    }
  }
  return -1;
}

function expectAdjacent(maze: Maze, a: number, b: number) {
  const ax = a % maze.width;
  const ay = Math.floor(a / maze.width);
  const bx = b % maze.width;
  const by = Math.floor(b / maze.width);
  const walls = maze.walls[a];
  if (bx === ax + 1 && by === ay) {
    expect(walls & WALL_E).toBe(0);
    return;
  }
  if (bx === ax - 1 && by === ay) {
    expect(walls & WALL_W).toBe(0);
    return;
  }
  if (by === ay + 1 && bx === ax) {
    expect(walls & WALL_S).toBe(0);
    return;
  }
  if (by === ay - 1 && bx === ax) {
    expect(walls & WALL_N).toBe(0);
    return;
  }
  throw new Error(`Cells ${a} and ${b} are not neighbours.`);
}

function expectStepList(result: SearchResult, start: number, end: number) {
  const { steps } = result;
  expect(steps[0]?.kind).toBe("start");
  expect(steps[0]).toMatchObject({ cell: start });
  expect(steps[steps.length - 1]).toEqual({ kind: "done", pathLength: result.path.length });

  const foundAt = steps.findIndex((step) => step.kind === "found");
  const traceAt = steps.findIndex((step) => step.kind === "trace");
  if (result.path.length === 0) {
    expect(foundAt).toBe(-1);
    expect(traceAt).toBe(-1);
  } else {
    expect(foundAt).toBeGreaterThan(0);
    expect(traceAt).toBeGreaterThan(foundAt);
    expect(steps.slice(traceAt, -1).every((step) => step.kind === "trace")).toBe(true);
    const traced = steps
      .filter((step): step is Extract<Step, { kind: "trace" }> => step.kind === "trace")
      .map((step) => step.cell);
    expect(traced.slice().reverse()).toEqual(result.path);
    expect(result.path[0]).toBe(start);
    expect(result.path[result.path.length - 1]).toBe(end);
  }

  const visits = new Map<number, number>();
  for (const step of steps) {
    if (step.kind === "visit") {
      visits.set(step.cell, (visits.get(step.cell) ?? 0) + 1);
    }
  }
  for (const count of visits.values()) expect(count).toBe(1);

  for (let index = 0; index < result.enqueuedAt.length; index += 1) {
    const enqueued = result.enqueuedAt[index];
    const visited = result.visitedAt[index];
    const traced = result.tracedAt[index];
    if (enqueued !== -1) {
      const step = steps[enqueued];
      expect(step?.kind === "start" || step?.kind === "enqueue").toBe(true);
      if (step && step.kind !== "done" && step.kind !== "trace") {
        expect(step.cell).toBe(index);
      }
    }
    if (visited !== -1) {
      expect(steps[visited]).toMatchObject({ kind: "visit", cell: index });
      expect(enqueued).toBeGreaterThanOrEqual(0);
      expect(enqueued).toBeLessThan(visited);
    }
    if (traced !== -1) {
      expect(steps[traced]).toMatchObject({ kind: "trace", cell: index });
    }
  }

  const queues = steps.filter(
    (step): step is Extract<Step, { queue: number[] }> =>
      step.kind === "start" || step.kind === "visit" || step.kind === "enqueue" || step.kind === "found",
  );
  if (queues.length > 1) expect(queues[0]?.queue).not.toBe(queues[1]?.queue);
}

describe("solveBfs", () => {
  it("records the corridor from the start cell to the end cell", () => {
    const maze = grid(3, 1, [
      [0, 1],
      [1, 2],
    ]);
    const result = solveBfs(maze, 0, 2);
    expect(result.path).toEqual([0, 1, 2]);
    expect(result.distance).toBe(2);
    expect(result.steps.map((step) => step.kind)).toEqual([
      "start",
      "visit",
      "enqueue",
      "visit",
      "enqueue",
      "visit",
      "found",
      "trace",
      "trace",
      "trace",
      "done",
    ]);
    expect(result.steps[0]).toEqual({ kind: "start", cell: 0, queue: [0] });
    expect(result.steps[1]).toEqual({ kind: "visit", cell: 0, distance: 0, queue: [] });
    expect(result.steps[2]).toEqual({
      kind: "enqueue",
      cell: 1,
      from: 0,
      distance: 1,
      queue: [1],
    });
    expect(result.steps[6]).toEqual({ kind: "found", cell: 2, distance: 2, queue: [] });
    expect(result.steps[10]).toEqual({ kind: "done", pathLength: 3 });
    expectStepList(result, 0, 2);
  });

  it("returns one cell when the start cell is the end cell", () => {
    const maze = grid(2, 2, [
      [0, 1],
      [0, 2],
      [1, 3],
    ]);
    const result = solveBfs(maze, 1, 1);
    expect(result.path).toEqual([1]);
    expect(result.distance).toBe(0);
    expect(result.steps.map((step) => step.kind)).toEqual(["start", "visit", "found", "trace", "done"]);
    expectStepList(result, 1, 1);
  });

  it("chooses the short route when a longer route also exists", () => {
    const maze = grid(4, 2, [
      [0, 1],
      [1, 2],
      [2, 3],
      [0, 4],
      [4, 5],
      [5, 6],
      [6, 7],
      [3, 7],
    ]);
    const result = solveBfs(maze, 0, 3);
    expect(result.path).toEqual([0, 1, 2, 3]);
    expect(result.distance).toBe(3);
    expect(result.distance).toBe(referenceDistance(maze, 0, 3));
    expectStepList(result, 0, 3);
  });

  it("matches an independent search on generated mazes", () => {
    const samples: Array<[number, number, number]> = [
      [1, 1, 1],
      [2, 2, 8],
      [1, 9, 3],
      [8, 3, 11],
      [12, 12, 99],
      [30, 30, 2026],
    ];
    for (const [width, height, seed] of samples) {
      const maze = generateMaze(width, height, seed);
      const before = Array.from(maze.walls);
      const start = 0;
      const end = width * height - 1;
      const result = solveBfs(maze, start, end);
      expect(Array.from(maze.walls)).toEqual(before);
      expect(result.distance).toBe(referenceDistance(maze, start, end));
      expect(result.distance).toBe(result.path.length - 1);
      for (let i = 1; i < result.path.length; i += 1) {
        expectAdjacent(maze, result.path[i - 1], result.path[i]);
      }
      expectStepList(result, start, end);
    }
  });

  it("returns an empty path when the cells are not connected", () => {
    const maze = grid(2, 1, []);
    const result = solveBfs(maze, 0, 1);
    expect(result.path).toEqual([]);
    expect(result.distance).toBe(-1);
    expect(result.steps.map((step) => step.kind)).toEqual(["start", "visit", "done"]);
    expectStepList(result, 0, 1);
  });

  it("rejects a cell outside the maze", () => {
    const maze = grid(2, 2, [[0, 1]]);
    expect(() => solveBfs(maze, -1, 1)).toThrow();
    expect(() => solveBfs(maze, 0, 4)).toThrow();
  });
});
