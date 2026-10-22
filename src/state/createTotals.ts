import { createMemo } from "solid-js";
import type { Accessor } from "solid-js";
import type { SearchResult } from "../lib/bfs";
import { EMPTY_TOTALS, totalsAt, type StepTotals } from "../lib/totals";

/** Keep visited, queue, and path counts from the previous step. */
export function createStepTotals(
  search: Accessor<SearchResult | null>,
  stepIndex: Accessor<number>,
): Accessor<StepTotals> {
  let previous = EMPTY_TOTALS;
  return createMemo(() => {
    previous = totalsAt(search(), stepIndex(), previous);
    return previous;
  });
}
