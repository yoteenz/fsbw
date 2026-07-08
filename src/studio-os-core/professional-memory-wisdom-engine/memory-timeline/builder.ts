import type {
  ProfessionalMemoryRecord,
  ProfessionalMemorySignal,
  ProfessionalTimeline,
  TimelineEntry,
  TimelineEntryKind,
} from '../types';

function clamp(value: number, min = 0, max = 100): number {
  return Math.min(max, Math.max(min, Math.round(value)));
}

function dominantSignals(memories: ProfessionalMemoryRecord[]): ProfessionalMemorySignal[] {
  const counts = new Map<ProfessionalMemorySignal, number>();
  for (const memory of memories) {
    for (const signal of memory.signals) {
      counts.set(signal, (counts.get(signal) ?? 0) + 1);
    }
  }
  return Array.from(counts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([signal]) => signal);
}

function inferTimelineKind(memory: ProfessionalMemoryRecord): TimelineEntryKind {
  if (memory.signals.includes('promotion')) return 'promotion';
  if (memory.signals.includes('business')) return 'business';
  if (memory.signals.includes('mentorship')) return 'mentorship';
  if (memory.signals.includes('award')) return 'award';
  if (memory.signals.includes('competition')) return 'competition';
  if (memory.signals.includes('community-contribution')) return 'community-event';
  if (memory.signals.includes('industry-contribution')) return 'industry-contribution';
  if (memory.signals.includes('project')) return 'project';
  return 'career-milestone';
}

export function memoryToTimelineEntry(memory: ProfessionalMemoryRecord): TimelineEntry {
  return {
    id: `timeline-${memory.id}`,
    memoryId: memory.id,
    kind: inferTimelineKind(memory),
    title: memory.title,
    occurredAt: memory.occurredAt,
    profession: memory.profession,
    worldId: memory.worldId,
    importance: memory.importance,
    summary: memory.summary,
  };
}

export function buildProfessionalTimeline(input: {
  learnerId: string;
  profession: string;
  worldId?: string;
  memories: ProfessionalMemoryRecord[];
  now?: Date;
}): ProfessionalTimeline {
  const now = input.now ?? new Date();
  const scoped = input.memories
    .filter((memory) => memory.learnerId === input.learnerId)
    .filter((memory) => input.profession === 'all' || memory.profession === input.profession)
    .filter((memory) => !input.worldId || memory.worldId === input.worldId)
    .sort((a, b) => Date.parse(a.occurredAt) - Date.parse(b.occurredAt));

  const wisdomScore = clamp(
    scoped.reduce((sum, memory) => sum + memory.importance + memory.masteryDelta, 0) /
      Math.max(scoped.length * 1.2, 1)
  );

  return {
    learnerId: input.learnerId,
    profession: input.profession,
    worldId: input.worldId,
    generatedAt: now.toISOString(),
    entries: scoped.map(memoryToTimelineEntry),
    memories: scoped,
    milestoneCount: scoped.filter((memory) =>
      memory.signals.some((signal) =>
        ['career-milestone', 'promotion', 'certification', 'award'].includes(signal)
      )
    ).length,
    wisdomScore,
    dominantSignals: dominantSignals(scoped),
  };
}

export function filterTimelineByKind(
  timeline: ProfessionalTimeline,
  kind: TimelineEntryKind
): TimelineEntry[] {
  return timeline.entries.filter((entry) => entry.kind === kind);
}

export function filterTimelineByYear(timeline: ProfessionalTimeline, year: number): TimelineEntry[] {
  return timeline.entries.filter((entry) => new Date(entry.occurredAt).getFullYear() === year);
}
