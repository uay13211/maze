import { describe, expect, it } from "vitest";
import { isSpeed, paceFor } from "./pace";

describe("paceFor", () => {
  it("uses a readable default that is slower than 16 ms on a small maze", () => {
    const slow = paceFor(900, "slow");
    expect(slow).toEqual({ intervalMs: 120, stepsPerTick: 1 });
    expect(slow.intervalMs).toBeGreaterThan(16);
  });

  it("keeps one step on a 50 by 50 maze and batches a 100 by 100 maze", () => {
    const mid = paceFor(2_500, "slow");
    const large = paceFor(10_000, "slow");
    const midFast = paceFor(2_500, "fast");
    const largeFast = paceFor(10_000, "fast");
    expect(mid).toEqual({ intervalMs: 120, stepsPerTick: 1 });
    expect(large.stepsPerTick).toBeGreaterThan(1);
    expect(midFast.stepsPerTick).toBeGreaterThan(paceFor(900, "fast").stepsPerTick);
    expect(largeFast.stepsPerTick).toBeGreaterThan(midFast.stepsPerTick);
    expect(largeFast.intervalMs).toBeLessThanOrEqual(large.intervalMs);
  });

  it("accepts only the three speed names", () => {
    expect(isSpeed("slow")).toBe(true);
    expect(isSpeed("medium")).toBe(true);
    expect(isSpeed("fast")).toBe(true);
    expect(isSpeed("turbo")).toBe(false);
  });

  it("keeps medium between slow and fast on a small maze", () => {
    const slow = paceFor(900, "slow");
    const medium = paceFor(900, "medium");
    const fast = paceFor(900, "fast");
    expect(medium.intervalMs).toBeLessThan(slow.intervalMs);
    expect(fast.stepsPerTick).toBeGreaterThan(medium.stepsPerTick);
  });
});
