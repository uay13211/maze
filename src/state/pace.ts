export const SPEEDS = ["slow", "medium", "fast"] as const;

export type Speed = (typeof SPEEDS)[number];

export type Pace = {
  intervalMs: number;
  stepsPerTick: number;
};

export const DEFAULT_SPEED: Speed = "slow";

export function isSpeed(value: string): value is Speed {
  return (SPEEDS as readonly string[]).includes(value);
}

/**
 * Slow is the default.
 * On a 30 by 30 maze and a 50 by 50 maze it waits 120 ms and moves one step.
 * On a 100 by 100 maze it moves a short batch each tick.
 */
export function paceFor(cellCount: number, speed: Speed): Pace {
  if (speed === "slow") {
    if (cellCount <= 2_500) return { intervalMs: 120, stepsPerTick: 1 };
    return { intervalMs: 50, stepsPerTick: 20 };
  }
  if (speed === "medium") {
    if (cellCount <= 900) return { intervalMs: 40, stepsPerTick: 1 };
    if (cellCount <= 2_500) return { intervalMs: 32, stepsPerTick: 8 };
    return { intervalMs: 32, stepsPerTick: 80 };
  }
  if (cellCount <= 900) return { intervalMs: 16, stepsPerTick: 8 };
  if (cellCount <= 2_500) return { intervalMs: 16, stepsPerTick: 24 };
  return { intervalMs: 16, stepsPerTick: 200 };
}
