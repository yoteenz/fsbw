import type { KnowledgeProgram, OwnerReviewDecision } from './types';
import { ownerApproveEntryForTraining, ownerApprovePacketForTraining } from './competency-core';
import { rebuildTrainingPackets } from './training-packets';

function newId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function ownerDecisionOnEntry(
  program: KnowledgeProgram,
  entryId: string,
  decision: OwnerReviewDecision,
  notes = ''
): KnowledgeProgram {
  const now = new Date().toISOString();

  if (decision === 'approve_for_training') {
    let next = ownerApproveEntryForTraining(program, entryId);
    next = rebuildTrainingPackets(next);
    next = {
      ...next,
      ownerReviews: [
        ...next.ownerReviews,
        { id: newId('or'), entryIds: [entryId], packetId: null, decision, notes, reviewedAt: now, createdAt: now },
      ],
    };
    return next;
  }

  const entries = program.entries.map((e) => {
    if (e.id !== entryId) return e;
    switch (decision) {
      case 'return_for_clarification':
        return { ...e, lifecycleStatus: 'needs_clarification' as const, ownerNotes: notes, updatedAt: now };
      case 'reject':
        return { ...e, lifecycleStatus: 'rejected' as const, visibility: 'archived' as const, ownerNotes: notes, updatedAt: now };
      case 'restrict_use':
        return { ...e, lifecycleStatus: 'restricted' as const, visibility: 'restricted_internal' as const, ownerNotes: notes, updatedAt: now };
      case 'request_scenario_test':
        return { ...e, scenarioTestStatus: 'required' as const, ownerNotes: notes, updatedAt: now };
      case 'hold':
        return { ...e, ownerNotes: notes, updatedAt: now };
      default:
        return e;
    }
  });

  return {
    ...program,
    entries,
    ownerReviews: [
      ...program.ownerReviews,
      { id: newId('or'), entryIds: [entryId], packetId: null, decision, notes, reviewedAt: now, createdAt: now },
    ],
    updatedAt: now,
  };
}

export function ownerDecisionOnPacket(
  program: KnowledgeProgram,
  packetId: string,
  decision: OwnerReviewDecision,
  notes = ''
): KnowledgeProgram {
  const now = new Date().toISOString();

  if (decision === 'approve_for_training') {
    return ownerApprovePacketForTraining(program, packetId);
  }

  if (decision === 'request_scenario_test') {
    const packets = program.packets.map((p) =>
      p.id === packetId ? { ...p, status: 'ready_for_scenario_testing' as const, updatedAt: now } : p
    );
    return {
      ...program,
      packets,
      ownerReviews: [
        ...program.ownerReviews,
        { id: newId('or'), entryIds: [], packetId, decision, notes, reviewedAt: now, createdAt: now },
      ],
      updatedAt: now,
    };
  }

  if (decision === 'reject') {
    const packets = program.packets.map((p) =>
      p.id === packetId ? { ...p, status: 'retired' as const, updatedAt: now } : p
    );
    return { ...program, packets, updatedAt: now };
  }

  return {
    ...program,
    ownerReviews: [
      ...program.ownerReviews,
      { id: newId('or'), entryIds: [], packetId, decision, notes, reviewedAt: now, createdAt: now },
    ],
    updatedAt: now,
  };
}

export function markNotificationsRead(program: KnowledgeProgram): KnowledgeProgram {
  return {
    ...program,
    notifications: program.notifications.map((n) => ({ ...n, read: true })),
    updatedAt: new Date().toISOString(),
  };
}
