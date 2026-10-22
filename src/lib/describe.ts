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

export function queueAtStep(steps: readonly Step[], stepIndex: number): readonly number[] {
  for (let i = stepIndex; i >= 0; i -= 1) {
    const step = steps[i];
    if (
      step.kind === "start" ||
      step.kind === "visit" ||
      step.kind === "enqueue" ||
      step.kind === "found"
    ) {
      return step.queue;
    }
  }
  return [];
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

const QUEUE_PREVIEW = 10;

export function formatQueue(queue: readonly number[], width: number): string {
  if (queue.length === 0) return "The queue is empty.";
  const shown = queue.slice(0, QUEUE_PREVIEW).map((cell) => formatCell(cell, width));
  const hidden = queue.length - shown.length;
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
