import type { MemoryClass } from './types-core';

export type MemorySignificanceInput = {
  significance: number;
  emotionalIntensity: number;
  recencyWeight: number;
  identityRelevance: number;
  repetition?: number;
};

export function scoreMemoryRetention(input: MemorySignificanceInput): number {
  const rep = input.repetition ?? 1;
  return (
    input.significance * 0.35 +
    input.emotionalIntensity * 0.25 +
    input.recencyWeight * 0.2 +
    input.identityRelevance * 0.15 +
    Math.min(rep, 5) * 0.05
  );
}

export function classifyMemoryStability(memoryClass: MemoryClass, retentionScore: number): 'HIGH' | 'MEDIUM' | 'LOW' {
  if (memoryClass === 'CORE_MEMORY' || memoryClass === 'PRIVATE_MEMORY') return 'HIGH';
  if (retentionScore >= 0.65) return 'MEDIUM';
  return 'LOW';
}
