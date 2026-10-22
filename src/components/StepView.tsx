import { For, Show, createMemo } from "solid-js";
import type { Accessor } from "solid-js";
import type { SearchResult } from "../lib/bfs";
import {
  countVisited,
  describeStep,
  distanceAtStep,
  formatCount,
  formatQueue,
  queueAtStep,
} from "../lib/describe";
import type { Maze } from "../lib/maze";
import "./StepView.css";

const LOG_LIMIT = 12;

export function StepView(props: {
  maze: Accessor<Maze>;
  search: Accessor<SearchResult | null>;
  stepIndex: Accessor<number>;
}) {
  const view = createMemo(() => {
    const result = props.search();
    const width = props.maze().width;
    if (!result || result.steps.length === 0) {
      return {
        current: 0,
        total: 0,
        description: "Press Play to start the search.",
        queue: "The queue is empty.",
        visited: 0,
        queued: 0,
        distance: 0,
        log: [] as { key: string; text: string }[],
        progress: 0,
      };
    }

    const index = Math.min(Math.max(props.stepIndex(), 0), result.steps.length - 1);
    const step = result.steps[index];
    const queue = queueAtStep(result.steps, index);
    const distance = distanceAtStep(result.steps, index) ?? 0;
    const logStart = Math.max(0, index - (LOG_LIMIT - 1));
    const log: { key: string; text: string }[] = [];
    for (let i = index; i >= logStart; i -= 1) {
      const entry = result.steps[i];
      log.push({ key: String(i), text: describeStep(entry, width) });
    }

    return {
      current: index + 1,
      total: result.steps.length,
      description: describeStep(step, width),
      queue: formatQueue(queue, width),
      visited: countVisited(result, index),
      queued: queue.length,
      distance,
      log,
      progress: (index + 1) / result.steps.length,
    };
  });

  return (
    <section class="step-view" aria-label="Search steps">
      <h2>Search steps</h2>
      <p class="progress-label" data-testid="step-progress" data-total={view().total}>
        Step {formatCount(view().current)} of {formatCount(view().total)}
      </p>
      <div
        class="progress"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={Math.max(view().total, 1)}
        aria-valuenow={view().current}
        aria-label="Search progress"
      >
        <div style={{ width: `${view().progress * 100}%` }} />
      </div>
      <p class="description" data-testid="step-description" aria-live="polite">
        {view().description}
      </p>
      <h3>Queue</h3>
      <p data-testid="queue">{view().queue}</p>
      <ul class="counts">
        <li data-testid="visited-count">Visited cells: {formatCount(view().visited)}</li>
        <li data-testid="queued-count">Queued cells: {formatCount(view().queued)}</li>
        <li data-testid="distance">Distance from start: {formatCount(view().distance)}</li>
      </ul>
      <h3>Recent steps</h3>
      <Show
        when={view().log.length > 0}
        fallback={<p data-testid="step-log-empty">No steps yet.</p>}
      >
        <ul class="log">
          <For each={view().log}>{(entry) => <li>{entry.text}</li>}</For>
        </ul>
      </Show>
    </section>
  );
}
