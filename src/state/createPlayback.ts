import { createSignal, onCleanup } from "solid-js";

export type PlaybackStatus = "idle" | "running" | "done";

/** Delay between steps. One step per tick keeps the step view in sync with the grid. */
export const PLAYBACK_MS = 16;

/**
 * Move a step index on a timer.
 * `reset` and `onCleanup` both stop the timer, so a new round cannot keep the old timer.
 */
export function createPlayback(stepCount: () => number) {
  const [stepIndex, setStepIndex] = createSignal(0);
  const [status, setStatus] = createSignal<PlaybackStatus>("idle");
  let timer: ReturnType<typeof setInterval> | undefined;

  const clearTimer = () => {
    if (timer !== undefined) {
      clearInterval(timer);
      timer = undefined;
    }
  };

  const play = () => {
    if (status() === "running") return;
    const total = stepCount();
    if (total <= 0) return;
    if (stepIndex() >= total - 1) setStepIndex(0);
    if (total === 1) {
      setStepIndex(0);
      setStatus("done");
      return;
    }
    setStatus("running");
    clearTimer();
    timer = setInterval(() => {
      const last = stepCount() - 1;
      const next = stepIndex() + 1;
      if (next >= last) {
        setStepIndex(last);
        clearTimer();
        setStatus("done");
        return;
      }
      setStepIndex(next);
    }, PLAYBACK_MS);
  };

  const reset = () => {
    clearTimer();
    setStepIndex(0);
    setStatus("idle");
  };

  onCleanup(clearTimer);

  return { stepIndex, status, play, reset };
}
