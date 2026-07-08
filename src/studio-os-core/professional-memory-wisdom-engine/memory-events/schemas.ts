import type {
  MemoryCategory,
  MemoryEventPayload,
  ProfessionalMemoryRecord,
  ProfessionalMemorySignal,
} from '../types';

type LegacyMemoryFields = {
  memoryClass?: MemoryCategory;
  relatedConceptIds?: string[];
  relatedSimulationIds?: string[];
};

export function normalizeProfessionalMemory(
  memory: ProfessionalMemoryRecord & LegacyMemoryFields
): ProfessionalMemoryRecord {
  const category = memory.category ?? memory.memoryClass ?? 'career-memory';
  const relatedBrainConceptIds =
    memory.relatedBrainConceptIds ?? memory.relatedConceptIds ?? [];
  const simulationId = memory.simulationId ?? memory.relatedSimulationIds?.[0];
  const reflectionSummary =
    memory.reflectionSummary ?? memory.wisdomExtracted ?? memory.summary;
  const importance = memory.importance ?? memory.impactScore ?? 50;

  return {
    ...memory,
    category,
    sceneLabel: memory.sceneLabel ?? memory.sceneId,
    simulationId,
    importance,
    participants: memory.participants ?? [],
    relatedSkillIds: memory.relatedSkillIds ?? [],
    relatedBrainConceptIds,
    relatedCertificationIds: memory.relatedCertificationIds ?? [],
    reflectionSummary,
    summary: memory.summary ?? reflectionSummary,
    wisdomExtracted: memory.wisdomExtracted ?? reflectionSummary,
    relatedCareerGoalIds: memory.relatedCareerGoalIds ?? [],
    relatedBusinessIds: memory.relatedBusinessIds ?? [],
    relatedMentorshipIds: memory.relatedMentorshipIds ?? [],
    impactScore: memory.impactScore ?? importance,
    masteryDelta: memory.masteryDelta ?? 0,
    visibleToOrb: memory.visibleToOrb ?? importance >= 60,
  };
}

export function createMemoryFromEvent(
  learnerId: string,
  payload: MemoryEventPayload
): ProfessionalMemoryRecord {
  const now = new Date().toISOString();
  return normalizeProfessionalMemory({
    id: `memory-${payload.worldId}-${payload.eventType}-${Date.now()}`,
    learnerId,
    worldId: payload.worldId,
    profession: payload.profession,
    category: payload.category ?? inferCategory(payload.eventType),
    title: payload.title,
    occurredAt: payload.occurredAt ?? now,
    sceneId: payload.sceneId,
    simulationId: payload.simulationId,
    careerLevel: payload.careerLevel,
    importance: payload.importance ?? 65,
    participants: payload.participants ?? [],
    relatedSkillIds: payload.relatedSkillIds ?? [],
    relatedBrainConceptIds: payload.relatedBrainConceptIds ?? [],
    relatedCertificationIds: payload.relatedCertificationIds ?? [],
    reflectionSummary: payload.reflectionSummary ?? payload.summary ?? payload.title,
    signals: payload.signals ?? inferSignals(payload.eventType),
    summary: payload.summary ?? payload.title,
    wisdomExtracted: payload.reflectionSummary ?? payload.summary ?? payload.title,
    emotionalTone: 'curious',
    relatedCareerGoalIds: [],
    relatedBusinessIds: [],
    relatedMentorshipIds: [],
    impactScore: payload.importance ?? 65,
    masteryDelta: 5,
    visibleToOrb: true,
  });
}

function inferCategory(eventType: string): MemoryCategory {
  if (/client|consult|service/.test(eventType)) return 'client-memory';
  if (/simulation|sim-/.test(eventType)) return 'simulation-memory';
  if (/mentor|apprentice|teach/.test(eventType)) return 'teaching-memory';
  if (/business|salon|firm|studio|company/.test(eventType)) return 'business-memory';
  if (/lead|team|staff/.test(eventType)) return 'leadership-memory';
  if (/community|contribution/.test(eventType)) return 'community-memory';
  if (/award|competition|industry/.test(eventType)) return 'historical-memory';
  if (/innov|create|invent/.test(eventType)) return 'innovation-memory';
  return 'career-memory';
}

function inferSignals(eventType: string): ProfessionalMemorySignal[] {
  const signals: ProfessionalMemorySignal[] = ['achievement'];
  if (/mistake|fail|correction/.test(eventType)) signals.push('mistake');
  if (/promotion|level-up/.test(eventType)) signals.push('promotion');
  if (/certification|cert/.test(eventType)) signals.push('certification');
  if (/mentor|apprentice/.test(eventType)) signals.push('mentorship');
  if (/business|opened|launch/.test(eventType)) signals.push('business');
  if (/competition|award/.test(eventType)) signals.push('award', 'competition');
  if (/community/.test(eventType)) signals.push('community-contribution');
  if (/industry|contribution/.test(eventType)) signals.push('industry-contribution');
  return signals;
}

export function upsertMemory(
  memories: ProfessionalMemoryRecord[],
  memory: ProfessionalMemoryRecord
): ProfessionalMemoryRecord[] {
  const normalized = normalizeProfessionalMemory(memory);
  return [...memories.filter((item) => item.id !== normalized.id), normalized];
}
