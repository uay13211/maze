import type { SearchResult, Step } from "./bfs";

export function formatCell(cell: number, width: number): string {
  const x = cell % width;
  const y = Math.floor(cell / width);
  return `(${x}, ${y})`;
}

export function formatCount(value: number): string {
  return value.toLocaleString("en-US");
}

export function describeStep(step: Step, width: number): string {
  switch (step.kind) {
    case "start":
      return `Start at cell ${formatCell(step.cell, width)}. Add it to the queue.`;
    case "visit":
      return `Visit cell ${formatCell(step.cell, width)}. Distance from start: ${step.distance}.`;
    case "enqueue":
      return `Add cell ${formatCell(step.cell, width)} to the queue. It comes from cell ${formatCell(step.from, width)}.`;
    case "found":
      return `Found the end cell ${formatCell(step.cell, width)}. Distance: ${step.distance}.`;
    case "trace":
      return `Trace back: cell ${formatCell(step.cell, width)} is on the shortest path.`;
    case "done":
      return `Done. The shortest path has ${step.pathLength} cells.`;
  }
}

export const QUEUE_PREVIEW = 10;

/**
 * The queue at one step, in enqueue order.
 * The cell list is capped. `total` is the full queue length.
 * The scan stops at the first cell that joins after this step.
 */
export function queueSnapshot(
  result: SearchResult,
  stepIndex: number,
  limit = QUEUE_PREVIEW,
): { cells: number[]; total: number } {
  const cells: number[] = [];
  let total = 0;
  const order = result.enqueuedOrder;
  for (let i = 0; i < order.length; i += 1) {
    const cell = order[i];
    const enqueued = result.enqueuedAt[cell];
    if (enqueued === -1 || enqueued > stepIndex) break;
    const visited = result.visitedAt[cell];
    if (visited !== -1 && visited <= stepIndex) continue;
    total += 1;
    if (cells.length < limit) cells.push(cell);
  }
  return { cells, total };
}

export function distanceAtStep(steps: readonly Step[], stepIndex: number): number | null {
  for (let i = stepIndex; i >= 0; i -= 1) {
    const step = steps[i];
    if (step.kind === "start") return 0;
    if (step.kind === "visit" || step.kind === "enqueue" || step.kind === "found") {
      return step.distance;
    }
  }
  return null;
}

export function formatQueue(cells: readonly number[], total: number, width: number): string {
  if (total <= 0 || cells.length === 0) return "The queue is empty.";
  const shown = cells.map((cell) => formatCell(cell, width));
  const hidden = total - cells.length;
  if (hidden > 0) return `${shown.join(", ")}, and ${hidden} more.`;
  return `${shown.join(", ")}.`;
}

export function countVisited(result: SearchResult, stepIndex: number): number {
  let count = 0;
  for (let i = 0; i < result.visitedAt.length; i += 1) {
    const at = result.visitedAt[i];
    if (at !== -1 && at <= stepIndex) count += 1;
  }
  return count;
}
