import { cellNeighbors, type Maze } from "./maze";

export type Step =
  | { kind: "start"; cell: number; queue: number[] }
  | { kind: "visit"; cell: number; distance: number; queue: number[] }
  | { kind: "enqueue"; cell: number; from: number; distance: number; queue: number[] }
  | { kind: "found"; cell: number; distance: number; queue: number[] }
  | { kind: "trace"; cell: number }
  | { kind: "done"; pathLength: number };

export type SearchResult = {
  /** Cells from the start cell to the end cell. Empty when no path exists. */
  path: number[];
  /** Number of steps between the cells. -1 when no path exists. */
  distance: number;
  steps: Step[];
  /** Step index when the cell joined the queue. -1 when it did not. */
  enqueuedAt: Int32Array;
  /** Step index when the search visited the cell. -1 when it did not. */
  visitedAt: Int32Array;
  /** Step index when the path trace drew the cell. -1 when it did not. */
  tracedAt: Int32Array;
};

/**
 * Breadth-first search on an unweighted maze.
 * The function returns the shortest path and a full list of steps.
 * The caller plays the list. This function does not change the maze.
 */
export function solveBfs(maze: Maze, start: number, end: number): SearchResult {
  const count = maze.width * maze.height;
  if (!Number.isInteger(start) || !Number.isInteger(end) || start < 0 || end < 0 || start >= count || end >= count) {
    throw new Error("The start cell and the end cell must be inside the maze.");
  }

  const parent = new Int32Array(count);
  parent.fill(-1);
  const distance = new Int32Array(count);
  distance.fill(-1);
  const seen = new Uint8Array(count);
  const enqueuedAt = new Int32Array(count);
  const visitedAt = new Int32Array(count);
  const tracedAt = new Int32Array(count);
  enqueuedAt.fill(-1);
  visitedAt.fill(-1);
  tracedAt.fill(-1);

  const steps: Step[] = [];
  const queue: number[] = [];
  let head = 0;

  const snapshot = (): number[] => queue.slice(head);

  seen[start] = 1;
  distance[start] = 0;
  queue.push(start);
  enqueuedAt[start] = steps.length;
  steps.push({ kind: "start", cell: start, queue: snapshot() });

  let found = false;

  while (head < queue.length) {
    const cell = queue[head];
    head += 1;
    const dist = distance[cell];
    visitedAt[cell] = steps.length;
    steps.push({ kind: "visit", cell, distance: dist, queue: snapshot() });

    if (cell === end) {
      steps.push({ kind: "found", cell, distance: dist, queue: snapshot() });
      found = true;
      break;
    }

    for (const next of cellNeighbors(maze, cell)) {
      if (seen[next] === 1) continue;
      seen[next] = 1;
      parent[next] = cell;
      distance[next] = dist + 1;
      queue.push(next);
      enqueuedAt[next] = steps.length;
      steps.push({
        kind: "enqueue",
        cell: next,
        from: cell,
        distance: dist + 1,
        queue: snapshot(),
      });
    }
  }

  if (!found) {
    steps.push({ kind: "done", pathLength: 0 });
    return { path: [], distance: -1, steps, enqueuedAt, visitedAt, tracedAt };
  }

  const reversed: number[] = [];
  const guard = new Set<number>();
  let cursor = end;
  while (cursor !== -1 && !guard.has(cursor)) {
    guard.add(cursor);
    reversed.push(cursor);
    if (cursor === start) break;
    cursor = parent[cursor];
  }

  for (const cell of reversed) {
    tracedAt[cell] = steps.length;
    steps.push({ kind: "trace", cell });
  }

  const path = reversed.slice().reverse();
  steps.push({ kind: "done", pathLength: path.length });
  return {
    path,
    distance: distance[end],
    steps,
    enqueuedAt,
    visitedAt,
    tracedAt,
  };
}
