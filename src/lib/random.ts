/** mulberry32. The same seed returns the same sequence. */
export function mulberry32(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function randomInt(rng: () => number, maxExclusive: number): number {
  if (!Number.isInteger(maxExclusive) || maxExclusive <= 0) {
    throw new Error("maxExclusive must be a whole number greater than 0.");
  }
  return Math.floor(rng() * maxExclusive);
}

export function shuffle<T>(items: readonly T[], rng: () => number): T[] {
  const copy = items.slice();
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = randomInt(rng, i + 1);
    const current = copy[i];
    copy[i] = copy[j];
    copy[j] = current;
  }
  return copy;
}

/** A new unsigned 32-bit seed. The result is different from `previous` when you pass one. */
export function freshSeed(previous?: number): number {
  let seed = Math.floor(Math.random() * 0x1_0000_0000) >>> 0;
  if (previous !== undefined && seed === previous) {
    seed = (seed + 1) >>> 0;
  }
  return seed;
}
