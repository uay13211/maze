import { describe, expect, it } from "vitest";
import { paceFor } from "./pace";

describe("paceFor", () => {
  it("uses a readable default that is slower than 16 ms on a small maze", () => {
    const slow = paceFor(900, "slow");
    expect(slow).toEqual({ intervalMs: 120, stepsPerTick: 1 });
    expect(slow.intervalMs).toBeGreaterThan(16);
  });

  it("moves more than one step per tick on a large maze", () => {
    const slow = paceFor(90_000, "slow");
    const fast = paceFor(90_000, "fast");
    expect(slow.stepsPerTick).toBeGreaterThan(1);
    expect(fast.stepsPerTick).toBeGreaterThan(slow.stepsPerTick);
    expect(fast.intervalMs).toBeLessThanOrEqual(slow.intervalMs);
  });

  it("keeps medium between slow and fast on a small maze", () => {
    const slow = paceFor(900, "slow");
    const medium = paceFor(900, "medium");
    const fast = paceFor(900, "fast");
    expect(medium.intervalMs).toBeLessThan(slow.intervalMs);
    expect(fast.stepsPerTick).toBeGreaterThan(medium.stepsPerTick);
  });
});
