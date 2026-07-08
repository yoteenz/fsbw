import { readStudioOsJson, writeStudioOsJson } from '../../utils/studioOsBrowserStorage';
import type { ApprovedArchitecturalPattern, ArchitectureMemoryStore } from './types';

const STORAGE_KEY = 'studioWorldArchitectureMemory_v1';

const EMPTY: ArchitectureMemoryStore = { version: 1, patterns: [] };

function readMemory(): ArchitectureMemoryStore {
  const raw = readStudioOsJson(STORAGE_KEY, () => EMPTY);
  if (!raw || typeof raw !== 'object' || !Array.isArray((raw as ArchitectureMemoryStore).patterns)) {
    return EMPTY;
  }
  return raw as ArchitectureMemoryStore;
}

function writeMemory(store: ArchitectureMemoryStore): void {
  writeStudioOsJson(STORAGE_KEY, store);
}

export function listApprovedArchitecturalPatterns(): ApprovedArchitecturalPattern[] {
  return readMemory().patterns;
}

export function recordApprovedArchitecturalPattern(
  input: Omit<ApprovedArchitecturalPattern, 'id' | 'approvedAt'>
): ApprovedArchitecturalPattern {
  const pattern: ApprovedArchitecturalPattern = {
    id: `ap-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    approvedAt: new Date().toISOString(),
    ...input,
  };
  const store = readMemory();
  const exists = store.patterns.some(
    (p) => p.patternType === pattern.patternType && p.label === pattern.label && p.route === pattern.route
  );
  if (!exists) {
    writeMemory({ version: 1, patterns: [pattern, ...store.patterns].slice(0, 200) });
  }
  return pattern;
}

/** Boost scores when approved patterns match a route or department */
export function memoryConsistencyBoost(route?: string, departmentId?: string): number {
  const patterns = readMemory().patterns;
  if (patterns.length === 0) return 0;
  let hits = 0;
  for (const p of patterns) {
    if (route && p.route === route) hits += 2;
    if (departmentId && p.departmentId === departmentId) hits += 1;
  }
  return Math.min(15, hits * 3);
}
