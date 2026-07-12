import { randomUUID } from 'crypto';
import type { ImmuneNervousSignal, ImmuneRecoveryIncident, ImmuneRecoveryResponse } from './types.js';

const incidents = new Map<string, ImmuneRecoveryIncident>();
const repairLocks = new Set<string>();

export function acquireRepairLock(resourceKey: string): boolean {
  if (repairLocks.has(resourceKey)) return false;
  repairLocks.add(resourceKey);
  return true;
}

export function releaseRepairLock(resourceKey: string): void {
  repairLocks.delete(resourceKey);
}

export function createIncident(
  partial: Omit<
    ImmuneRecoveryIncident,
    'incidentId' | 'nervousSignals' | 'finalStatus' | 'repairAuthorized' | 'destructiveOperationDetected' | 'rollbackAvailable' | 'escalationRequired' | 'founderActionRequired' | 'repairStartedAt' | 'repairCompletedAt' | 'verificationStartedAt' | 'verificationCompletedAt' | 'retryStartedAt' | 'retryCompletedAt'
  >
): ImmuneRecoveryIncident {
  const incident: ImmuneRecoveryIncident = {
    ...partial,
    incidentId: randomUUID(),
    nervousSignals: [],
    finalStatus: 'detected',
    repairAuthorized: false,
    destructiveOperationDetected: false,
    rollbackAvailable: false,
    escalationRequired: false,
    founderActionRequired: false,
    repairStartedAt: null,
    repairCompletedAt: null,
    verificationStartedAt: null,
    verificationCompletedAt: null,
    retryStartedAt: null,
    retryCompletedAt: null,
  };
  incidents.set(incident.incidentId, incident);
  return incident;
}

export function getIncident(incidentId: string): ImmuneRecoveryIncident | null {
  return incidents.get(incidentId) ?? null;
}

export function listIncidents(limit = 50): ImmuneRecoveryIncident[] {
  return [...incidents.values()]
    .sort((a, b) => b.detectedAt.localeCompare(a.detectedAt))
    .slice(0, limit);
}

export function updateIncident(
  incidentId: string,
  patch: Partial<ImmuneRecoveryIncident>
): ImmuneRecoveryIncident | null {
  const current = incidents.get(incidentId);
  if (!current) return null;
  const next = { ...current, ...patch };
  incidents.set(incidentId, next);
  return next;
}

export function emitNervousSignal(
  incidentId: string,
  signal: ImmuneNervousSignal,
  detail?: string
): ImmuneRecoveryIncident | null {
  const current = incidents.get(incidentId);
  if (!current) return null;
  const next: ImmuneRecoveryIncident = {
    ...current,
    nervousSignals: [...current.nervousSignals, { signal, at: new Date().toISOString(), detail }],
  };
  incidents.set(incidentId, next);
  return next;
}

export function redactIncidentForExport(incident: ImmuneRecoveryIncident): ImmuneRecoveryIncident {
  const evidence = { ...incident.technicalEvidence };
  for (const key of Object.keys(evidence)) {
    if (/secret|password|token|key|credential/i.test(key)) delete evidence[key];
  }
  return { ...incident, technicalEvidence: evidence };
}

export function buildRecoveryResponse(incident: ImmuneRecoveryIncident): ImmuneRecoveryResponse {
  if (incident.finalStatus === 'recovered') {
    return {
      status: 'recovered-automatically',
      affectedSystem: incident.affectedSubsystem,
      cause: incident.symptom,
      repair: incident.proposedMigrationId ? `Applied approved migration ${incident.proposedMigrationId}` : null,
      verification: 'Schema contract passed',
      originalOperation: 'Retried successfully',
      founderAction: 'None',
      incidentId: incident.incidentId,
      incident: redactIncidentForExport(incident),
    };
  }
  if (incident.escalationRequired || incident.founderActionRequired) {
    return {
      status: 'founder-attention-required',
      affectedSystem: incident.affectedSubsystem,
      cause: incident.symptom,
      repair: incident.repairAuthorized ? 'Attempted' : 'Denied',
      verification: incident.verificationCompletedAt ? 'Failed or incomplete' : 'Not started',
      originalOperation: incident.retryCompletedAt ? 'Retry failed' : 'Not retried',
      founderAction: incident.safeSummary,
      incidentId: incident.incidentId,
      incident: redactIncidentForExport(incident),
    };
  }
  return {
    status: incident.finalStatus === 'repairing' ? 'repair-in-progress' : 'no-action',
    affectedSystem: incident.affectedSubsystem,
    cause: incident.symptom,
    repair: null,
    verification: null,
    originalOperation: null,
    founderAction: incident.safeSummary,
    incidentId: incident.incidentId,
    incident: redactIncidentForExport(incident),
  };
}

export function resetIncidentStoreForTests(): void {
  incidents.clear();
  repairLocks.clear();
}

export function recognizeIncidentSignature(signature: string): string | null {
  if (signature === 'missing-schema-resource:public.studio_governed_generation_jobs') {
    return 'Canonical missing generation jobs table — apply 20260712180000_studio_governed_generation_jobs';
  }
  return null;
}
