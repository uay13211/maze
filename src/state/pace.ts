export const SPEEDS = ["slow", "medium", "fast"] as const;

export type Speed = (typeof SPEEDS)[number];

export type Pace = {
  intervalMs: number;
  stepsPerTick: number;
};

export const DEFAULT_SPEED: Speed = "slow";

/**
 * Slow is the default.
 * On a 30 by 30 maze it waits 120 ms and moves one step, so you can read the sentence.
 * On a larger maze it moves a short batch each tick, so the page stays responsive.
 */
export function paceFor(cellCount: number, speed: Speed): Pace {
  if (speed === "slow") {
    if (cellCount <= 900) return { intervalMs: 120, stepsPerTick: 1 };
    if (cellCount <= 10_000) return { intervalMs: 50, stepsPerTick: 20 };
    return { intervalMs: 32, stepsPerTick: 80 };
  }
  if (speed === "medium") {
    if (cellCount <= 900) return { intervalMs: 40, stepsPerTick: 1 };
    if (cellCount <= 10_000) return { intervalMs: 32, stepsPerTick: 80 };
    return { intervalMs: 32, stepsPerTick: 400 };
  }
  if (cellCount <= 900) return { intervalMs: 16, stepsPerTick: 8 };
  if (cellCount <= 10_000) return { intervalMs: 16, stepsPerTick: 200 };
  return { intervalMs: 16, stepsPerTick: 2000 };
}
