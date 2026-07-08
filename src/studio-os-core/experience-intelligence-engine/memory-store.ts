import { readStudioOsJson, writeStudioOsJson } from '../../utils/studioOsBrowserStorage';
import type { ApprovedExperiencePattern, ExperienceMemoryStore } from './types';

const STORAGE_KEY = 'studioWorldExperienceMemory_v1';
const EMPTY: ExperienceMemoryStore = { version: 1, patterns: [] };

function readMemory(): ExperienceMemoryStore {
  const raw = readStudioOsJson(STORAGE_KEY, () => EMPTY);
  if (!raw || typeof raw !== 'object' || !Array.isArray((raw as ExperienceMemoryStore).patterns)) {
    return EMPTY;
  }
  return raw as ExperienceMemoryStore;
}

export function listApprovedExperiencePatterns(): ApprovedExperiencePattern[] {
  return readMemory().patterns;
}

export function recordApprovedExperiencePattern(
  input: Omit<ApprovedExperiencePattern, 'id' | 'approvedAt'>
): ApprovedExperiencePattern {
  const pattern: ApprovedExperiencePattern = {
    id: `ep-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    approvedAt: new Date().toISOString(),
    ...input,
  };
  const store = readMemory();
  writeMemory({
    version: 1,
    patterns: [pattern, ...store.patterns].slice(0, 200),
  });
  return pattern;
}

export function experienceMemoryBoost(route?: string, departmentId?: string): number {
  const patterns = readMemory().patterns;
  if (patterns.length === 0) return 0;
  let hits = 0;
  for (const p of patterns) {
    if (route && p.route === route) hits += 2;
    if (departmentId && p.departmentId === departmentId) hits += 1;
  }
  return Math.min(12, hits * 2);
}

function writeMemory(store: ExperienceMemoryStore): void {
  writeStudioOsJson(STORAGE_KEY, store);
}
