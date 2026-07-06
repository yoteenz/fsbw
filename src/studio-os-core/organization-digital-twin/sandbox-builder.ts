import { SANDBOX_REPLICA_COMPONENTS, SANDBOX_REPLICA_LABELS } from './constants';
import type { OrganizationDigitalTwinProfile, SandboxReplicaComponent } from './types';

const REPLICA_META: Record<
  (typeof SANDBOX_REPLICA_COMPONENTS)[number],
  { entityCount: number; fidelityBase: number; summary: string }
> = {
  'sandbox-headquarters': {
    entityCount: 1,
    fidelityBase: 96,
    summary: 'Complete sandbox HQ mirror — all modules isolated from production.',
  },
  'sandbox-profession-brains': {
    entityCount: 4,
    fidelityBase: 92,
    summary: 'All Profession Brains™ replicated for safe instruction testing.',
  },
  'sandbox-workflows': {
    entityCount: 12,
    fidelityBase: 90,
    summary: 'Workflow graphs cloned — test improvements without production impact.',
  },
  'sandbox-automations': {
    entityCount: 18,
    fidelityBase: 88,
    summary: 'Automation registry mirror — detect conflicts before deployment.',
  },
  'sandbox-marketplace': {
    entityCount: 6,
    fidelityBase: 85,
    summary: 'Marketplace listings and submissions in isolated sandbox.',
  },
  'sandbox-knowledge-graph': {
    entityCount: 240,
    fidelityBase: 91,
    summary: 'Knowledge Graph relationships replicated for integrity testing.',
  },
  'sandbox-integrations': {
    entityCount: 8,
    fidelityBase: 87,
    summary: 'OAuth, webhooks, and API connections mirrored — test disconnect scenarios.',
  },
  'sandbox-customers': {
    entityCount: 500,
    fidelityBase: 94,
    summary: 'Synthetic customer personas for journey and load testing.',
  },
  'sandbox-employees': {
    entityCount: 24,
    fidelityBase: 93,
    summary: 'Employee roles and permissions replicated for onboarding tests.',
  },
  'sandbox-analytics': {
    entityCount: 36,
    fidelityBase: 89,
    summary: 'Analytics dashboards fed by sandbox events only.',
  },
};

export function buildSandboxReplicas(
  _organizationId: string,
  twinFidelityScore: number,
  now: string
): SandboxReplicaComponent[] {
  return SANDBOX_REPLICA_COMPONENTS.map((componentId) => {
    const meta = REPLICA_META[componentId];
    const fidelityPct = Math.min(99, Math.round((meta.fidelityBase + twinFidelityScore) / 2));
    return {
      componentId,
      label: SANDBOX_REPLICA_LABELS[componentId],
      status: fidelityPct >= 90 ? 'active' : 'ready',
      fidelityPct,
      entityCount: meta.entityCount,
      lastSyncedAt: now,
      summary: meta.summary,
    };
  });
}

export function buildDockTwinLine(profile: OrganizationDigitalTwinProfile): string {
  const activeReplicas = profile.sandboxReplicas.filter((r) => r.status === 'active').length;
  return `Digital Twin™ ${profile.twinFidelityScore}% fidelity · ${activeReplicas}/10 sandbox replicas · ${profile.simulationHistory.length} simulations · practice before perform.`;
}

export function countSandboxEntities(replicas: SandboxReplicaComponent[]): number {
  return replicas.reduce((sum, r) => sum + r.entityCount, 0);
}
