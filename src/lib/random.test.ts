import { describe, expect, it } from "vitest";
import { freshSeed, mulberry32, randomInt, shuffle } from "./random";

describe("mulberry32", () => {
  it("returns the same sequence for the same seed", () => {
    const first = mulberry32(42);
    const second = mulberry32(42);
    const fromFirst = [first(), first(), first(), first(), first()];
    const fromSecond = [second(), second(), second(), second(), second()];
    expect(fromFirst).toEqual(fromSecond);
  });

  it("returns numbers from 0 inclusive to 1 exclusive", () => {
    const rng = mulberry32(7);
    for (let i = 0; i < 20; i += 1) {
      const value = rng();
      expect(value).toBeGreaterThanOrEqual(0);
      expect(value).toBeLessThan(1);
    }
  });

  it("returns a different first value for a different seed", () => {
    expect(mulberry32(1)()).not.toBe(mulberry32(2)());
  });
});

describe("randomInt", () => {
  it("stays inside the requested range", () => {
    const rng = mulberry32(99);
    for (let i = 0; i < 50; i += 1) {
      const value = randomInt(rng, 4);
      expect(value).toBeGreaterThanOrEqual(0);
      expect(value).toBeLessThan(4);
      expect(Number.isInteger(value)).toBe(true);
    }
  });

  it("rejects a range that is not a positive whole number", () => {
    expect(() => randomInt(mulberry32(1), 0)).toThrow();
  });
});

describe("shuffle", () => {
  it("returns the same order for the same seed", () => {
    const items = [1, 2, 3, 4, 5, 6];
    expect(shuffle(items, mulberry32(5))).toEqual(shuffle(items, mulberry32(5)));
    expect(items).toEqual([1, 2, 3, 4, 5, 6]);
  });
});

describe("freshSeed", () => {
  it("does not repeat the previous seed", () => {
    for (let i = 0; i < 20; i += 1) {
      const previous = i * 17;
      expect(freshSeed(previous)).not.toBe(previous);
    }
  });
});
