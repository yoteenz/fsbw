import type { AuditLogEntry } from './types';

const STORAGE_PREFIX = 'studioExpertVaultAudit_v1_';

function auditKey(organizationId: string, profileId: string): string {
  return `${STORAGE_PREFIX}${organizationId}::${profileId}`;
}

export function loadAuditLog(organizationId: string, profileId: string): AuditLogEntry[] {
  if (typeof localStorage === 'undefined') return [];
  try {
    const raw = localStorage.getItem(auditKey(organizationId, profileId));
    if (!raw) return [];
    return JSON.parse(raw) as AuditLogEntry[];
  } catch {
    return [];
  }
}

export function appendAuditEntry(
  organizationId: string,
  profileId: string,
  entry: Omit<AuditLogEntry, 'id' | 'timestamp' | 'organizationId' | 'profileId'>
): AuditLogEntry[] {
  const full: AuditLogEntry = {
    ...entry,
    id: `audit-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    timestamp: new Date().toISOString(),
    organizationId,
    profileId,
  };
  const next = [...loadAuditLog(organizationId, profileId), full].slice(-500);
  if (typeof localStorage !== 'undefined') {
    localStorage.setItem(auditKey(organizationId, profileId), JSON.stringify(next));
  }
  return next;
}

export function seedTrustAuditIfEmpty(
  organizationId: string,
  profileId: string,
  expertName: string,
  workerName: string
): AuditLogEntry[] {
  const existing = loadAuditLog(organizationId, profileId);
  if (existing.length) return existing;
  appendAuditEntry(organizationId, profileId, {
    user: expertName,
    worker: workerName,
    purpose: 'Trust Framework initialization',
    action: 'Vault created with organization isolation enforced',
    resourceType: 'knowledge_vault',
    resourceId: null,
  });
  return loadAuditLog(organizationId, profileId);
}
