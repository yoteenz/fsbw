import type { FsmsSparkleSpec } from '../tokens/types';

function hashSeed(input: string): number {
  let h = 2166136261;
  for (let i = 0; i < input.length; i += 1) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function mulberry32(seed: number): () => number {
  return () => {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export type SparkleEngineOptions = {
  seed?: string;
  count?: number;
  density?: number;
  width?: number;
  height?: number;
  phaseOffsetMs?: number;
};

/** Deterministic micro-glint field — never glitter, never repetitive at scale. */
export function generateSparkleField(options: SparkleEngineOptions = {}): FsmsSparkleSpec[] {
  const {
    seed = 'fsms',
    count = 12,
    density = 0.35,
    width = 100,
    height = 100,
    phaseOffsetMs = 0,
  } = options;

  const rng = mulberry32(hashSeed(seed));
  const total = Math.max(3, Math.round(count * density));
  const sparkles: FsmsSparkleSpec[] = [];

  for (let i = 0; i < total; i += 1) {
    const x = rng() * width;
    const y = rng() * height;
    const size = 0.6 + rng() * 1.4;
    const delayMs = phaseOffsetMs + Math.round(rng() * 420);
    const durationMs = 280 + Math.round(rng() * 520);
    const opacity = 0.18 + rng() * 0.42;

    sparkles.push({
      id: `${seed}-${i}`,
      x,
      y,
      size,
      delayMs,
      durationMs,
      opacity,
    });
  }

  return sparkles;
}
