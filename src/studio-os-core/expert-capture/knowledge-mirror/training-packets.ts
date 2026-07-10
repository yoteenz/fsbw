import type { KnowledgeEntry, KnowledgeProgram, KnowledgeVersion, TrainingPacket } from './types';
import { getPacketDefinitionsForProfile, type PacketDefinition } from './packet-definitions';
import { createVersionRecord } from './sync-from-session';

function newId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function rebuildTrainingPackets(program: KnowledgeProgram): KnowledgeProgram {
  const defs = getPacketDefinitionsForProfile(program.profileId);
  const now = new Date().toISOString();
  let packets = [...program.packets];
  const notifications = [...program.notifications];

  for (const def of defs) {
    const eligible = program.entries.filter(
      (e) =>
        def.knowledgeAreas.includes(e.knowledgeArea) &&
        (e.lifecycleStatus === 'expert_reviewed' ||
          e.lifecycleStatus === 'owner_visible' ||
          e.lifecycleStatus === 'approved_for_training' ||
          e.lifecycleStatus === 'active_knowledge')
    );
    if (!eligible.length) continue;

    const existing = packets.find((p) => p.slug === def.slug);
    const expertApproved = eligible.filter((e) => e.lifecycleStatus !== 'interpreted');
    const ownerApproved = eligible.filter((e) => e.lifecycleStatus === 'approved_for_training' || e.lifecycleStatus === 'active_knowledge');

    let status: TrainingPacket['status'] = 'draft';
    if (ownerApproved.length) status = 'owner_approved';
    else if (expertApproved.length) status = 'expert_approved';

    const packet: TrainingPacket = {
      id: existing?.id ?? newId('pkt'),
      slug: def.slug,
      title: def.title,
      knowledgeArea: def.knowledgeAreas[0],
      profileId: program.profileId,
      companyId: program.companyId,
      status,
      entryIds: eligible.map((e) => e.id),
      approvedStatements: eligible.map((e) => e.statement),
      workflowSteps: eligible.filter((e) => e.structuredType.includes('workflow')).map((e) => e.statement),
      exceptions: eligible.filter((e) => e.entryType === 'exception').map((e) => e.statement),
      requiredInputs: [],
      prohibitedAssumptions: ['Never assume regulatory requirements without expert-approved rules'],
      humanReviewBoundaries: def.authorizationsRestricted.map((r) => r.replace(/_/g, ' ')),
      examples: [],
      unansweredQuestions: [],
      confidenceLevel: Math.min(0.95, 0.5 + eligible.length * 0.05),
      effectiveDate: now,
      trainerIdentity: program.expertName,
      ownerApprovedAt: ownerApproved.length ? now : existing?.ownerApprovedAt ?? null,
      expertApprovedAt: expertApproved.length ? now : null,
      scenarioTestRequired: def.scenarioTestRequired,
      createdAt: existing?.createdAt ?? now,
      updatedAt: now,
    };

    if (!existing && expertApproved.length) {
      notifications.push({
        id: newId('notify'),
        type: 'packet_ready',
        title: `${def.title} ready for review`,
        summary: `${eligible.length} approved statement(s) are available. Owner may review before worker training.`,
        relatedEntryIds: eligible.map((e) => e.id),
        relatedPacketId: packet.id,
        read: false,
        createdAt: now,
      });
    }

    if (existing) {
      packets = packets.map((p) => (p.id === existing.id ? packet : p));
    } else {
      packets.push(packet);
    }
  }

  return { ...program, packets, notifications, updatedAt: now };
}

export function supersedeKnowledgeEntry(
  program: KnowledgeProgram,
  entryId: string,
  newStatement: string,
  reasonForChange: string,
  createdBy: string
): KnowledgeProgram {
  const now = new Date().toISOString();
  const old = program.entries.find((e) => e.id === entryId);
  if (!old) return program;

  const superseded: KnowledgeEntry = {
    ...old,
    lifecycleStatus: 'superseded',
    freshnessStatus: 'superseded',
    effectiveUntil: now,
    updatedAt: now,
  };

  const newEntry: KnowledgeEntry = {
    ...old,
    id: newId('ke'),
    version: old.version + 1,
    previousVersionId: old.id,
    statement: newStatement,
    lifecycleStatus: 'expert_reviewed',
    visibility: 'expert_only',
    freshnessStatus: 'current',
    effectiveFrom: now,
    effectiveUntil: null,
    createdAt: now,
    updatedAt: now,
    submittedForOwnerReviewAt: null,
  };

  const versionRecord: KnowledgeVersion = {
    ...createVersionRecord(newEntry, createdBy, reasonForChange, reasonForChange),
    supersedesVersionId: old.id,
  };

  const entries = program.entries.map((e) => (e.id === entryId ? superseded : e)).concat(newEntry);
  const packets = program.packets.map((p) =>
    p.entryIds.includes(entryId) ? { ...p, status: 'needs_refresh' as const, updatedAt: now } : p
  );

  return {
    ...program,
    entries,
    versions: [...program.versions, versionRecord],
    packets,
    updatedAt: now,
    notifications: [
      ...program.notifications,
      {
        id: newId('notify'),
        type: 'knowledge_corrected',
        title: 'Knowledge superseded',
        summary: reasonForChange,
        relatedEntryIds: [old.id, newEntry.id],
        relatedPacketId: null,
        read: false,
        createdAt: now,
      },
    ],
  };
}

export function markEntryOutdated(program: KnowledgeProgram, entryId: string, reason: string): KnowledgeProgram {
  const now = new Date().toISOString();
  const entries = program.entries.map((e) =>
    e.id === entryId ? { ...e, lifecycleStatus: 'outdated' as const, freshnessStatus: 'potentially_outdated' as const, updatedAt: now } : e
  );
  return {
    ...program,
    entries,
    updatedAt: now,
    notifications: [
      ...program.notifications,
      {
        id: newId('notify'),
        type: 'review_due',
        title: 'Knowledge marked outdated',
        summary: reason,
        relatedEntryIds: [entryId],
        relatedPacketId: null,
        read: false,
        createdAt: now,
      },
    ],
  };
}

export function detectConflicts(program: KnowledgeProgram): KnowledgeProgram {
  const active = program.entries.filter((e) => e.lifecycleStatus === 'active_knowledge' || e.lifecycleStatus === 'approved_for_training');
  const conflicts = [...program.conflicts];
  const now = new Date().toISOString();

  for (let i = 0; i < active.length; i++) {
    for (let j = i + 1; j < active.length; j++) {
      const a = active[i];
      const b = active[j];
      if (a.knowledgeArea !== b.knowledgeArea) continue;
      if (a.statement.toLowerCase().includes('never') && b.statement.toLowerCase().includes('always')) {
        const exists = conflicts.some((c) => (c.entryIdA === a.id && c.entryIdB === b.id) || (c.entryIdA === b.id && c.entryIdB === a.id));
        if (!exists) {
          conflicts.push({
            id: newId('conflict'),
            entryIdA: a.id,
            entryIdB: b.id,
            summary: `Potential conflict in ${a.knowledgeArea}: opposing guidance detected.`,
            detectedAt: now,
            resolved: false,
            resolution: null,
          });
        }
      }
    }
  }

  return { ...program, conflicts, updatedAt: now };
}

export function applyPacketDefinitionAuthorizations(program: KnowledgeProgram, def: PacketDefinition, passed: boolean): KnowledgeProgram {
  const now = new Date().toISOString();
  const authorizations = [...program.authorizations];

  for (const cap of def.authorizationsOnPass) {
    const existing = authorizations.find((a) => a.capability === cap);
    if (existing) {
      Object.assign(existing, { granted: passed, scenarioTestPassed: passed, updatedAt: now });
    } else {
      authorizations.push({
        id: newId('auth'),
        capability: cap,
        profileId: program.profileId,
        granted: passed,
        evidencePacketIds: [],
        scenarioTestPassed: passed,
        restrictedReason: null,
        updatedAt: now,
      });
    }
  }

  for (const cap of def.authorizationsRestricted) {
    if (!authorizations.find((a) => a.capability === cap)) {
      authorizations.push({
        id: newId('auth'),
        capability: cap,
        profileId: program.profileId,
        granted: false,
        evidencePacketIds: [],
        scenarioTestPassed: false,
        restrictedReason: 'Requires expert approval and scenario testing',
        updatedAt: now,
      });
    }
  }

  return { ...program, authorizations, updatedAt: now };
}
