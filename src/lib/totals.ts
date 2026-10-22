import type { SearchResult, Step } from "./bfs";

export type StepTotals = {
  result: SearchResult | null;
  stepIndex: number;
  visited: number;
  queued: number;
  path: number;
  distance: number;
};

export const EMPTY_TOTALS: StepTotals = {
  result: null,
  stepIndex: -1,
  visited: 0,
  queued: 0,
  path: 0,
  distance: 0,
};

function applyStep(step: Step, visited: number, enqueued: number, path: number, distance: number) {
  switch (step.kind) {
    case "start":
      return { visited, enqueued: enqueued + 1, path, distance: 0 };
    case "enqueue":
      return { visited, enqueued: enqueued + 1, path, distance: step.distance };
    case "visit":
      return { visited: visited + 1, enqueued, path, distance: step.distance };
    case "found":
      return { visited, enqueued, path, distance: step.distance };
    case "trace":
      return { visited, enqueued, path: path + 1, distance };
    case "done":
      return { visited, enqueued, path, distance };
  }
}

/**
 * Counts at one playback step.
 * A forward move updates the previous counts. A new search or a rewind counts from the start.
 */
export function totalsAt(
  result: SearchResult | null,
  stepIndex: number,
  previous: StepTotals,
): StepTotals {
  if (!result || result.steps.length === 0 || stepIndex < 0) return { ...EMPTY_TOTALS };
  const index = Math.min(stepIndex, result.steps.length - 1);
  const forward =
    previous.result === result && previous.stepIndex >= 0 && previous.stepIndex <= index;
  let visited = forward ? previous.visited : 0;
  let enqueued = forward ? previous.visited + previous.queued : 0;
  let path = forward ? previous.path : 0;
  let distance = forward ? previous.distance : 0;
  const start = forward ? previous.stepIndex + 1 : 0;
  for (let cursor = start; cursor <= index; cursor += 1) {
    const next = applyStep(result.steps[cursor], visited, enqueued, path, distance);
    visited = next.visited;
    enqueued = next.enqueued;
    path = next.path;
    distance = next.distance;
  }
  return {
    result,
    stepIndex: index,
    visited,
    queued: enqueued - visited,
    path,
    distance,
  };
}
