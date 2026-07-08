import {
  ORB_MEMORY_IMPORTANCE_THRESHOLD,
  ORB_MEMORY_RECALL_COOLDOWN_MS,
} from '../constants';
import type {
  OrbMemoryRecall,
  OrbMemoryRecallContext,
  ProfessionalMemoryRecord,
  ProfessionalMemoryStore,
} from '../types';

function uid(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
}

function isSameMonthDay(a: Date, b: Date): boolean {
  return a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

function yearsSince(dateIso: string, now: Date): number {
  const date = new Date(dateIso);
  let years = now.getFullYear() - date.getFullYear();
  if (
    now.getMonth() < date.getMonth() ||
    (now.getMonth() === date.getMonth() && now.getDate() < date.getDate())
  ) {
    years -= 1;
  }
  return Math.max(0, years);
}

function inferRecallContext(memory: ProfessionalMemoryRecord, now: Date): OrbMemoryRecallContext {
  const occurred = new Date(memory.occurredAt);
  if (isSameMonthDay(occurred, now) && yearsSince(memory.occurredAt, now) >= 1) {
    return 'anniversary';
  }
  if (memory.signals.includes('promotion')) return 'promotion-anniversary';
  if (memory.signals.includes('certification')) return 'certification-anniversary';
  if (memory.relatedBrainConceptIds.length > 0) return 'industry-relevance';
  if (memory.importance >= 90) return 'milestone';
  return 'personal-growth';
}

function buildRecallLine(memory: ProfessionalMemoryRecord, context: OrbMemoryRecallContext, now: Date): string {
  const years = yearsSince(memory.occurredAt, now);
  switch (context) {
    case 'anniversary':
      return `${years} year${years === 1 ? '' : 's'} ago today you ${memory.title.toLowerCase()}.`;
    case 'promotion-anniversary':
      return `It's been ${years} year${years === 1 ? '' : 's'} since ${memory.title.toLowerCase()} — a good moment to reflect on how you've grown since.`;
    case 'certification-anniversary':
      return `Your ${memory.title.toLowerCase()} is part of your credential story — still shaping how clients trust you.`;
    case 'industry-relevance':
      return `A recent industry update connects to ${memory.title.toLowerCase()} — your past work still matters here.`;
    case 'milestone':
      return `${memory.title} remains one of your defining professional moments.`;
    default:
      return memory.reflectionSummary;
  }
}

export function buildOrbMemoryRecalls(
  store: ProfessionalMemoryStore,
  now = new Date()
): OrbMemoryRecall[] {
  const recentlySurfaced = new Set(store.orbSurfacedMemoryIds);
  const cooldownActive =
    store.lastOrbRecallAt &&
    now.getTime() - Date.parse(store.lastOrbRecallAt) < ORB_MEMORY_RECALL_COOLDOWN_MS;

  if (cooldownActive) return [];

  return store.memories
    .filter((memory) => memory.visibleToOrb)
    .filter((memory) => memory.importance >= ORB_MEMORY_IMPORTANCE_THRESHOLD)
    .filter((memory) => !recentlySurfaced.has(memory.id))
    .sort((a, b) => b.importance - a.importance)
    .slice(0, 3)
    .map((memory) => {
      const context = inferRecallContext(memory, now);
      return {
        id: uid('orb-memory-recall'),
        memoryId: memory.id,
        line: buildRecallLine(memory, context, now),
        context,
        tone: memory.emotionalTone === 'humbled' ? 'guidance' : 'mentor',
        optional: true,
        priority: memory.importance >= 90 ? 'high' : memory.importance >= 80 ? 'medium' : 'low',
      };
    });
}

export function markOrbMemoriesSurfaced(
  store: ProfessionalMemoryStore,
  memoryIds: string[],
  now = new Date()
): ProfessionalMemoryStore {
  return {
    ...store,
    orbSurfacedMemoryIds: [...new Set([...store.orbSurfacedMemoryIds, ...memoryIds])].slice(-24),
    lastOrbRecallAt: now.toISOString(),
  };
}
