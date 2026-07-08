import type { MemoryEventPayload, ProfessionalMemoryRecord } from '../types';
import { LAUNCH_PROFESSIONAL_MEMORIES } from './catalog';
import { createMemoryFromEvent, normalizeProfessionalMemory, upsertMemory } from './schemas';
import { findMemoryEventRegistration } from './catalog';

export function registerMemoryFromCareerWorldEvent(
  learnerId: string,
  memories: ProfessionalMemoryRecord[],
  payload: MemoryEventPayload
): ProfessionalMemoryRecord[] {
  if (!findMemoryEventRegistration(payload.eventType)) {
    return memories;
  }
  const memory = createMemoryFromEvent(learnerId, payload);
  return upsertMemory(memories, memory);
}

export function mergeWithLaunchMemories(memories: ProfessionalMemoryRecord[]): ProfessionalMemoryRecord[] {
  const byId = new Map<string, ProfessionalMemoryRecord>();
  for (const seed of LAUNCH_PROFESSIONAL_MEMORIES) byId.set(seed.id, seed);
  for (const memory of memories) byId.set(memory.id, normalizeProfessionalMemory(memory));
  return Array.from(byId.values());
}

export { normalizeProfessionalMemory, createMemoryFromEvent, upsertMemory } from './schemas';
