import { getOrganizationAmbientAwarenessProfile } from '../ambient-awareness/store';
import { getOrganizationAutonomousPreparationProfile } from '../autonomous-preparation/store';
import { getOrganizationDiscoveryBlueprint } from '../business-discovery-blueprint/store';
import { getOrganizationHealthIndexProfile } from '../company-health-index/store';
import { readCommandDockStore } from '../command-dock/store';
import { getOrganizationExecutiveCouncilProfile } from '../executive-council/org-store';
import { getOrganizationKnowledgeConfidenceProfile } from '../knowledge-confidence/store';
import { getOrganizationLegacyVaultProfile } from '../legacy-vault/store';
import { getOrganizationMemoryProfile } from '../memory-engine/store';
import { getOrganizationGenomeProfile } from '../organization-genome/store';
import { getOrganizationPulseProfile } from '../organization-pulse/store';
import { getOrganizationPredictiveProfile } from '../predictive-organization/store';
import { getOrganizationPresenceProfile } from '../presence-engine/store';
import { getOrganizationProfessionBrainProfile } from '../profession-brain/store';
import { getOrganizationRelationshipMemoryProfile } from '../relationship-memory/store';
import { CONNECTED_SYSTEM_LABELS, CONNECTED_SYSTEMS } from './constants';
import type { ConnectedSystemId, ConnectedSystemSnapshot } from './types';

type SystemProbe = {
  connected: boolean;
  vitalityPct: number;
  contextShared: string;
};

function probeBlueprint(orgId: string): SystemProbe {
  const b = getOrganizationDiscoveryBlueprint(orgId);
  return {
    connected: Boolean(b),
    vitalityPct: b?.overallProgressPct ?? 0,
    contextShared: b ? `Blueprint ${b.overallProgressPct}% — organizational birth certificate active.` : 'Awaiting Blueprint.',
  };
}

function probeProfessionBrain(orgId: string): SystemProbe {
  const p = getOrganizationProfessionBrainProfile(orgId);
  const maturity = p?.brains.reduce((s, b) => s + b.maturityPct, 0) ?? 0;
  const avg = p?.brains.length ? Math.round(maturity / p.brains.length) : 0;
  return {
    connected: Boolean(p?.brains.length),
    vitalityPct: avg,
    contextShared: p ? `${p.brains.length} Profession Brain(s) · avg maturity ${avg}%.` : 'Brains seeding.',
  };
}

function probeGenome(orgId: string): SystemProbe {
  const g = getOrganizationGenomeProfile(orgId);
  return {
    connected: Boolean(g),
    vitalityPct: g?.genomeCompletenessPct ?? 0,
    contextShared: g ? `Genome ${g.genomeCompletenessPct}% · ${g.identityCore.mission.slice(0, 50)}…` : 'Genome building.',
  };
}

function probeMemory(orgId: string): SystemProbe {
  const m = getOrganizationMemoryProfile(orgId);
  return {
    connected: Boolean(m),
    vitalityPct: m?.memoryDepthScore ?? 0,
    contextShared: m ? `Memory depth ${m.memoryDepthScore}% · ${m.records.length} records.` : 'Memory accumulating.',
  };
}

function probePresence(orgId: string): SystemProbe {
  const p = getOrganizationPresenceProfile(orgId);
  return {
    connected: Boolean(p),
    vitalityPct: p?.presenceScore ?? 0,
    contextShared: p ? `Presence ${p.presenceScore}% · ${p.activeAtmosphere} atmosphere.` : 'Presence establishing.',
  };
}

function probeAmbient(orgId: string): SystemProbe {
  const a = getOrganizationAmbientAwarenessProfile(orgId);
  return {
    connected: Boolean(a),
    vitalityPct: a?.awarenessScore ?? 0,
    contextShared: a ? `Awareness ${a.awarenessScore}% · ${a.intelligentContext.founderFocus}.` : 'Ambient layers calibrating.',
  };
}

function probeRelationship(orgId: string): SystemProbe {
  const r = getOrganizationRelationshipMemoryProfile(orgId);
  return {
    connected: Boolean(r),
    vitalityPct: r?.familiarityScore ?? 0,
    contextShared: r ? `Familiarity ${r.familiarityScore}% · ${r.preferencesLearned} preferences learned.` : 'Relationships learning.',
  };
}

function probeCouncil(orgId: string): SystemProbe {
  const c = getOrganizationExecutiveCouncilProfile(orgId);
  return {
    connected: Boolean(c),
    vitalityPct: c ? Math.min(95, 70 + (c.pendingDecisions > 0 ? 15 : 0)) : 0,
    contextShared: c ? `${c.pendingDecisions} council decision(s) pending · collaborative intelligence active.` : 'Council standby.',
  };
}

function probePulse(orgId: string): SystemProbe {
  const p = getOrganizationPulseProfile(orgId);
  return {
    connected: Boolean(p),
    vitalityPct: p?.overallPulseScore ?? 0,
    contextShared: p ? `Pulse ${p.overallPulseScore}% · organizational rhythm tracked.` : 'Pulse baseline.',
  };
}

function probeHealth(orgId: string): SystemProbe {
  const h = getOrganizationHealthIndexProfile(orgId);
  return {
    connected: Boolean(h),
    vitalityPct: h?.executiveHealthScore ?? 0,
    contextShared: h ? `Health ${h.executiveHealthScore}% · ${h.weakAreas.length} weak area(s) monitored.` : 'Health index calibrating.',
  };
}

function probePredictive(orgId: string): SystemProbe {
  const p = getOrganizationPredictiveProfile(orgId);
  return {
    connected: Boolean(p),
    vitalityPct: p?.predictiveScore ?? 0,
    contextShared: p ? `Predictive ${p.predictiveScore}% · ${p.predictionsActive} prediction(s) active.` : 'Predictions building.',
  };
}

function probePreparation(orgId: string): SystemProbe {
  const a = getOrganizationAutonomousPreparationProfile(orgId);
  return {
    connected: Boolean(a),
    vitalityPct: a?.preparationScore ?? 0,
    contextShared: a ? `${a.awaitingApprovalCount} preparation(s) awaiting approval.` : 'Preparation queue empty.',
  };
}

function probeConfidence(orgId: string): SystemProbe {
  const k = getOrganizationKnowledgeConfidenceProfile(orgId);
  return {
    connected: Boolean(k),
    vitalityPct: k?.overallConfidenceScore ?? 0,
    contextShared: k ? `Knowledge confidence ${k.overallConfidenceScore}%.` : 'Confidence calibrating.',
  };
}

function probeCommandDock(_orgId: string): SystemProbe {
  const dock = readCommandDockStore();
  return {
    connected: true,
    vitalityPct: dock.recentCommands.length > 0 ? 85 : 72,
    contextShared: `${dock.recentCommands.length} recent command(s) · primary executive console.`,
  };
}

function probeLegacy(orgId: string): SystemProbe {
  const l = getOrganizationLegacyVaultProfile(orgId);
  return {
    connected: Boolean(l),
    vitalityPct: l?.legacyDepthScore ?? 0,
    contextShared: l ? `Legacy depth ${l.legacyDepthScore}% · ${l.totalArchiveEntries} archive entries.` : 'Legacy vault seeding.',
  };
}

const PROBES: Record<ConnectedSystemId, (orgId: string) => SystemProbe> = {
  'business-discovery-blueprint': probeBlueprint,
  'profession-brain': probeProfessionBrain,
  'organization-genome': probeGenome,
  'memory-engine': probeMemory,
  'presence-engine': probePresence,
  'ambient-awareness': probeAmbient,
  'relationship-memory': probeRelationship,
  'executive-council': probeCouncil,
  'organization-pulse': probePulse,
  'company-health-index': probeHealth,
  'predictive-organization': probePredictive,
  'autonomous-preparation': probePreparation,
  'knowledge-confidence': probeConfidence,
  'command-dock': probeCommandDock,
  'legacy-vault': probeLegacy,
};

export function buildConnectedSystemSnapshots(organizationId: string): ConnectedSystemSnapshot[] {
  const now = new Date().toISOString();
  return CONNECTED_SYSTEMS.map((systemId) => {
    const probe = PROBES[systemId](organizationId);
    return {
      systemId,
      label: CONNECTED_SYSTEM_LABELS[systemId],
      connected: probe.connected,
      contextShared: probe.contextShared,
      vitalityPct: probe.vitalityPct,
      lastSyncedAt: now,
    };
  });
}

export function countConnectedSystems(snapshots: ConnectedSystemSnapshot[]): number {
  return snapshots.filter((s) => s.connected).length;
}

export function summarizeConnectedSystems(snapshots: ConnectedSystemSnapshot[]): string {
  const connected = countConnectedSystems(snapshots);
  return `${connected}/${snapshots.length} systems sharing context continuously — unified organizational intelligence.`;
}
