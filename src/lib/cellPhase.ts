import type { SearchResult } from "./bfs";

export type CellPhase = "empty" | "queued" | "visited" | "current" | "path";

/** The paint state of one cell at one playback step. */
export function cellPhase(
  index: number,
  stepIndex: number,
  result: SearchResult | null,
): CellPhase {
  if (!result || stepIndex < 0) return "empty";
  const step = result.steps[stepIndex];
  if (!step) return "empty";
  if (result.tracedAt[index] !== -1 && result.tracedAt[index] <= stepIndex) return "path";
  if (step.kind !== "done" && step.kind !== "trace" && step.cell === index) return "current";
  if (result.visitedAt[index] !== -1 && result.visitedAt[index] <= stepIndex) return "visited";
  if (result.enqueuedAt[index] !== -1 && result.enqueuedAt[index] <= stepIndex) return "queued";
  return "empty";
}
