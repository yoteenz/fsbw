import type { ResidentLifeEventEnvelope } from '../event-envelope';
import { addMemoryRecord } from '../life-os-services';

export function maybeCreateMemoryFromEvent(event: ResidentLifeEventEnvelope): void {
  const significance = Number(event.payload.significance ?? 0);
  if (significance < 0.65) return;
  const residentId = event.residentIds[0];
  if (!residentId) return;
  const memoryClass: import('../types-core').MemoryClass =
    significance >= 0.9 ? 'CORE_MEMORY' : significance >= 0.75 ? 'RELATIONAL_MEMORY' : 'EPISODIC_MEMORY';
  addMemoryRecord({
    residentId,
    memoryClass,
    summary: String(event.payload.summary ?? event.eventType),
    significance,
    emotionalIntensity: Number(event.payload.emotionalIntensity ?? 0.5),
    recencyWeight: 0.8,
    identityRelevance: memoryClass === 'CORE_MEMORY' ? 0.95 : 0.4,
    resolutionState: 'OPEN',
    formedAt: event.timestamp,
    sourceEventId: event.eventId,
    visibility: event.visibility,
  });
}
