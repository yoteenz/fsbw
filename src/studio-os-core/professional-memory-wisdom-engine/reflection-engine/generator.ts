import { MEMORY_REFLECTION_MODES } from '../constants';
import { filterTimelineByKind, filterTimelineByYear } from '../memory-timeline/builder';
import type {
  MemoryReflectionMode,
  MemoryReflectionModeId,
  MemoryReflectionSpec,
  ProfessionalTimeline,
} from '../types';

function uid(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
}

export function getReflectionMode(modeId: MemoryReflectionModeId): MemoryReflectionMode {
  return MEMORY_REFLECTION_MODES.find((mode) => mode.id === modeId)!;
}

export function generateReflectionSpec(
  timeline: ProfessionalTimeline,
  modeId: MemoryReflectionModeId,
  now = new Date()
): MemoryReflectionSpec {
  const mode = getReflectionMode(modeId);
  const year = now.getFullYear();
  let scoped = timeline.memories;

  switch (modeId) {
    case 'year-in-review':
      scoped = timeline.memories.filter(
        (memory) => new Date(memory.occurredAt).getFullYear() === year
      );
      break;
    case 'business-timeline':
      scoped = timeline.memories.filter((memory) =>
        ['business-memory', 'leadership-memory'].includes(memory.category)
      );
      break;
    case 'mentorship-journey':
      scoped = timeline.memories.filter((memory) =>
        ['teaching-memory', 'leadership-memory'].includes(memory.category)
      );
      break;
    case 'skill-growth':
      scoped = timeline.memories.filter((memory) => memory.relatedSkillIds.length > 0);
      break;
    case 'knowledge-evolution':
      scoped = timeline.memories.filter((memory) => memory.relatedBrainConceptIds.length > 0);
      break;
    default:
      break;
  }

  const highlights = scoped
    .sort((a, b) => b.importance - a.importance)
    .slice(0, 5)
    .map((memory) => memory.reflectionSummary);

  const entries =
    modeId === 'year-in-review'
      ? filterTimelineByYear(timeline, year)
      : modeId === 'business-timeline'
        ? filterTimelineByKind(timeline, 'business')
        : timeline.entries;

  return {
    id: uid('reflection'),
    modeId,
    learnerId: timeline.learnerId,
    profession: timeline.profession,
    headline: `${mode.label} — ${timeline.profession}`,
    mentorIntro: `This reflection draws on ${entries.length} timeline moments across your professional memory.`,
    memoryIds: scoped.map((memory) => memory.id),
    highlights,
    estimatedMinutes:
      modeId === 'year-in-review' ? 12 : modeId === 'mastery-replay' ? 20 : 8,
  };
}

export function listReflectionModes(): MemoryReflectionMode[] {
  return MEMORY_REFLECTION_MODES;
}
