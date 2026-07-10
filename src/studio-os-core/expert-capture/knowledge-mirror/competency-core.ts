import type { CompetencyLevel, KnowledgeProgram, WorkerCompetency } from './types';
import { getPacketDefinitionsForProfile } from './packet-definitions';
import { applyPacketDefinitionAuthorizations } from './training-packets';

function newId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function levelFromPacketStatus(packetStatus: string, entryCount: number): CompetencyLevel {
  if (entryCount === 0) return 'not_introduced';
  if (packetStatus === 'active' || packetStatus === 'passed') return 'competent';
  if (packetStatus === 'owner_approved' || packetStatus === 'ready_for_scenario_testing') return 'scenario_tested';
  if (packetStatus === 'expert_approved') return 'learning';
  if (packetStatus === 'needs_refresh') return 'needs_refresh';
  return 'introduced';
}

export function rebuildCompetencies(program: KnowledgeProgram): KnowledgeProgram {
  const defs = getPacketDefinitionsForProfile(program.profileId);
  const now = new Date().toISOString();
  const competencies: WorkerCompetency[] = [];

  for (const def of defs) {
    const packet = program.packets.find((p) => p.slug === def.slug);
    const entries = program.entries.filter((e) => def.knowledgeAreas.includes(e.knowledgeArea));
    competencies.push({
      id: newId('comp'),
      area: def.knowledgeAreas[0],
      profileId: program.profileId,
      level: levelFromPacketStatus(packet?.status ?? 'draft', entries.length),
      evidenceEntryIds: entries.map((e) => e.id),
      packetIds: packet ? [packet.id] : [],
      lastChangedAt: now,
      changeReason: packet
        ? `Training packet "${packet.title}" status: ${packet.status}`
        : `${entries.length} knowledge entries captured`,
    });
  }

  return { ...program, competencies, updatedAt: now };
}

export function rebuildAuthorizationsFromPackets(program: KnowledgeProgram): KnowledgeProgram {
  let next = program;
  for (const def of getPacketDefinitionsForProfile(program.profileId)) {
    const packet = program.packets.find((p) => p.slug === def.slug);
    const passed = packet?.status === 'active' || packet?.status === 'passed';
    next = applyPacketDefinitionAuthorizations(next, def, Boolean(passed));
  }
  return next;
}

export function ownerApproveEntryForTraining(program: KnowledgeProgram, entryId: string): KnowledgeProgram {
  const now = new Date().toISOString();
  const entries = program.entries.map((e) =>
    e.id === entryId
      ? {
          ...e,
          lifecycleStatus: 'approved_for_training' as const,
          visibility: 'approved_training' as const,
          trainingStatus: 'pending_packet' as const,
          source: { ...e.source, ownerApprovedAt: now },
          updatedAt: now,
        }
      : e
  );
  return { ...program, entries, updatedAt: now };
}

export function ownerApprovePacketForTraining(program: KnowledgeProgram, packetId: string): KnowledgeProgram {
  const now = new Date().toISOString();
  const packets = program.packets.map((p) =>
    p.id === packetId ? { ...p, status: 'ready_for_scenario_testing' as const, ownerApprovedAt: now, updatedAt: now } : p
  );
  const entryIds = packets.find((p) => p.id === packetId)?.entryIds ?? [];
  const entries = program.entries.map((e) =>
    entryIds.includes(e.id)
      ? { ...e, lifecycleStatus: 'approved_for_training' as const, trainingStatus: 'in_packet' as const, updatedAt: now }
      : e
  );
  let next: KnowledgeProgram = { ...program, packets, entries, updatedAt: now };
  next = rebuildCompetencies(next);
  next = rebuildAuthorizationsFromPackets(next);
  return next;
}

export function passScenarioTestForPacket(program: KnowledgeProgram, packetId: string): KnowledgeProgram {
  const now = new Date().toISOString();
  const packets = program.packets.map((p) =>
    p.id === packetId ? { ...p, status: 'active' as const, updatedAt: now } : p
  );
  const entryIds = packets.find((p) => p.id === packetId)?.entryIds ?? [];
  const entries = program.entries.map((e) =>
    entryIds.includes(e.id)
      ? {
          ...e,
          lifecycleStatus: 'active_knowledge' as const,
          scenarioTestStatus: 'passed' as const,
          trainingStatus: 'active_training' as const,
          updatedAt: now,
        }
      : e
  );
  let next: KnowledgeProgram = {
    ...program,
    packets,
    entries,
    scenarioTests: [
      ...program.scenarioTests,
      { id: newId('st'), packetId, status: 'passed', conductedAt: now, notes: 'Owner sandbox validation' },
    ],
    updatedAt: now,
  };
  next = rebuildCompetencies(next);
  next = rebuildAuthorizationsFromPackets(next);
  return next;
}

export function restrictAuthorization(program: KnowledgeProgram, capability: string, reason: string): KnowledgeProgram {
  const now = new Date().toISOString();
  return {
    ...program,
    authorizations: program.authorizations.map((a) =>
      a.capability === capability ? { ...a, granted: false, restrictedReason: reason, updatedAt: now } : a
    ),
    updatedAt: now,
  };
}
