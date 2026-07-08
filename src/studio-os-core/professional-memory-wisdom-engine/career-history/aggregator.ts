import type { ProfessionalCareerHistoryEntry, ProfessionalMemoryRecord, TimelineEntryKind } from '../types';

function uid(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
}

function kindFromMemory(memory: ProfessionalMemoryRecord): TimelineEntryKind {
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

export function careerHistoryFromMemories(memories: ProfessionalMemoryRecord[]): ProfessionalCareerHistoryEntry[] {
  return memories.map((memory) => ({
    id: uid('career-history'),
    learnerId: memory.learnerId,
    profession: memory.profession,
    worldId: memory.worldId,
    kind: kindFromMemory(memory),
    title: memory.title,
    occurredAt: memory.occurredAt,
    careerLevel: memory.careerLevel,
    businessId: memory.relatedBusinessIds[0],
    projectId: memory.relatedSkillIds[0],
    mentorshipId: memory.relatedMentorshipIds[0],
    summary: memory.summary,
  }));
}

export function upsertCareerHistoryEntry(
  entries: ProfessionalCareerHistoryEntry[],
  entry: ProfessionalCareerHistoryEntry
): ProfessionalCareerHistoryEntry[] {
  return [...entries.filter((item) => item.id !== entry.id), entry];
}

export function listCareerHistoryByKind(
  entries: ProfessionalCareerHistoryEntry[],
  kind: TimelineEntryKind
): ProfessionalCareerHistoryEntry[] {
  return entries.filter((entry) => entry.kind === kind);
}
