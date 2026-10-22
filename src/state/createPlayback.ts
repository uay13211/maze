import { createEffect, createSignal, onCleanup } from "solid-js";
import type { Pace } from "./pace";

export type PlaybackStatus = "idle" | "running" | "paused" | "done";

/**
 * Move a step index on a timer.
 * Reset, pause, and unmount all stop the timer.
 * A second Play while the timer is running does nothing.
 * Step moves one step, and only while playback is paused.
 */
export function createPlayback(stepCount: () => number, pace: () => Pace) {
  const [stepIndex, setStepIndex] = createSignal(0);
  const [status, setStatus] = createSignal<PlaybackStatus>("idle");
  let timer: ReturnType<typeof setInterval> | undefined;

  const clearTimer = () => {
    if (timer !== undefined) {
      clearInterval(timer);
      timer = undefined;
    }
  };

  const advance = (count: number) => {
    const last = stepCount() - 1;
    if (last < 0) return;
    const next = Math.min(stepIndex() + Math.max(1, count), last);
    setStepIndex(next);
    if (next >= last) {
      clearTimer();
      setStatus("done");
    }
  };

  createEffect(() => {
    const currentPace = pace();
    const currentStatus = status();
    clearTimer();
    if (currentStatus !== "running") return;
    timer = setInterval(() => {
      advance(currentPace.stepsPerTick);
    }, currentPace.intervalMs);
    onCleanup(clearTimer);
  });

  const play = () => {
    if (status() === "running" || status() === "paused") return;
    const total = stepCount();
    if (total <= 0) return;
    if (stepIndex() >= total - 1) setStepIndex(0);
    if (total === 1) {
      setStepIndex(0);
      setStatus("done");
      return;
    }
    setStatus("running");
  };

  const pause = () => {
    if (status() !== "running") return;
    clearTimer();
    setStatus("paused");
  };

  const resume = () => {
    if (status() !== "paused") return;
    const total = stepCount();
    if (total <= 1 || stepIndex() >= total - 1) {
      setStatus("done");
      return;
    }
    setStatus("running");
  };

  const step = () => {
    if (status() !== "paused") return;
    advance(1);
  };

  const reset = () => {
    clearTimer();
    setStepIndex(0);
    setStatus("idle");
  };

  onCleanup(clearTimer);

  return { stepIndex, status, play, pause, resume, step, reset };
}
