import type { DependencySystemRecord } from '../types';
import { listDependencySystemRegistry } from '../system-registry/registry';

/** System Events — aggregate event contracts across the dependency map */
export function listAllEventsEmitted(): { systemId: string; name: string; event: string }[] {
  const rows: { systemId: string; name: string; event: string }[] = [];
  for (const system of listDependencySystemRegistry()) {
    for (const event of system.eventsEmitted) {
      rows.push({ systemId: system.systemId, name: system.name, event });
    }
  }
  return rows;
}

export function listAllEventsConsumed(): { systemId: string; name: string; event: string }[] {
  const rows: { systemId: string; name: string; event: string }[] = [];
  for (const system of listDependencySystemRegistry()) {
    for (const event of system.eventsConsumed) {
      rows.push({ systemId: system.systemId, name: system.name, event });
    }
  }
  return rows;
}

export function getSystemEventContracts(systemId: string): {
  emitted: string[];
  consumed: string[];
} | undefined {
  const system = listDependencySystemRegistry().find((s) => s.systemId === systemId);
  if (!system) return undefined;
  return {
    emitted: system.eventsEmitted,
    consumed: system.eventsConsumed,
  };
}

export function findEventProducers(eventName: string): DependencySystemRecord[] {
  return listDependencySystemRegistry().filter((s) => s.eventsEmitted.includes(eventName));
}

export function findEventConsumers(eventName: string): DependencySystemRecord[] {
  return listDependencySystemRegistry().filter((s) => s.eventsConsumed.includes(eventName));
}

export function getEventCoverageSummary(): { event: string; producers: number; consumers: number }[] {
  const eventSet = new Set<string>();
  for (const system of listDependencySystemRegistry()) {
    for (const e of system.eventsEmitted) eventSet.add(e);
    for (const e of system.eventsConsumed) eventSet.add(e);
  }

  return [...eventSet]
    .map((event) => ({
      event,
      producers: findEventProducers(event).length,
      consumers: findEventConsumers(event).length,
    }))
    .sort((a, b) => a.event.localeCompare(b.event));
}
