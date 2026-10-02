/** Mulberry32 — deterministic when seeded. */
export function createSeededRandom(seed: number): () => number {
  let t = seed >>> 0;
  return () => {
    t += 0x6d2b79f5;
    let r = Math.imul(t ^ (t >>> 15), 1 | t);
    r ^= r + Math.imul(r ^ (r >>> 7), 61 | r);
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

export function pickVariance(seed: number, options: readonly string[]): string {
  if (options.length === 0) return '';
  const rnd = createSeededRandom(seed);
  const idx = Math.floor(rnd() * options.length);
  return options[idx] ?? options[0]!;
}
