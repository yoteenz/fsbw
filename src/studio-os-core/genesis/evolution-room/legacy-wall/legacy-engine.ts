import { readEvolutionRoomStore, mutateEvolutionRoomStore } from '../persistence';
import type { ErLegacyCategory } from '../constants';
import type { ErLegacyTimelineEntry } from '../types';

function id(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

const SEED_LEGACY: Omit<ErLegacyTimelineEntry, 'entryId'>[] = [
  {
    date: '2026-06-01T00:00:00.000Z',
    title: 'Live Validation System™ Phase 2',
    category: 'platform-evolution',
    narrative: 'Continuous invisible validation architecture shipped — founder diary, escape velocity, Genesis learning loop.',
  },
  {
    date: '2026-06-15T00:00:00.000Z',
    title: 'Founder Acceptance Testing™ Framework',
    category: 'launch',
    narrative: 'Reusable validation registry, metric engine, and graduation pipeline established for Launch Stack.',
  },
  {
    date: '2026-07-01T00:00:00.000Z',
    title: 'Evolution Room™ Architecture Approved',
    category: 'genesis-evolution',
    narrative: 'Monthly executive strategy room canon drafted — ceremonial review replaces dashboard retrospectives.',
  },
];

export function seedLegacyWall(): void {
  const store = readEvolutionRoomStore();
  if (store.legacyWall.length > 0) return;
  mutateEvolutionRoomStore((s) => ({
    ...s,
    legacyWall: SEED_LEGACY.map((entry) => ({ ...entry, entryId: id('legacy') })),
  }));
}

export function listLegacyTimeline(): ErLegacyTimelineEntry[] {
  seedLegacyWall();
  return readEvolutionRoomStore().legacyWall.sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );
}

export function preserveLegacyEntry(input: {
  title: string;
  category: ErLegacyCategory;
  narrative: string;
  sessionId?: string;
}): ErLegacyTimelineEntry {
  const entry: ErLegacyTimelineEntry = {
    entryId: id('legacy'),
    date: new Date().toISOString(),
    title: input.title,
    category: input.category,
    narrative: input.narrative,
    preservedBy: 'founder',
    sessionId: input.sessionId,
  };
  mutateEvolutionRoomStore((s) => ({
    ...s,
    legacyWall: [entry, ...s.legacyWall],
  }));
  return entry;
}
