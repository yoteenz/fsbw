import { SUPREME_CONSTITUTION_VERSION } from '../supreme-articles';

export const IMMUTABLE_AUDIT_VERSION = 'immutable-constitutional-audit.v1' as const;

export type ConstitutionalAuditDecision = 'allowed' | 'denied';

export type ConstitutionalAuditRecord = {
  auditVersion: typeof IMMUTABLE_AUDIT_VERSION;
  constitutionVersion: typeof SUPREME_CONSTITUTION_VERSION;
  recordId: string;
  recordedAt: string;
  contextKind: string;
  decision: ConstitutionalAuditDecision;
  articlesEvaluated: string[];
  violations: string[];
  actorRole?: string;
  subjectId?: string;
  metadata?: Record<string, string | number | boolean>;
};

const auditLog: ConstitutionalAuditRecord[] = [];

function nextRecordId(): string {
  return `const-audit-${Date.now()}-${auditLog.length}`;
}

/**
 * Article VIII — append-only immutable constitutional audit trail.
 */
export function recordConstitutionalAudit(
  partial: Omit<ConstitutionalAuditRecord, 'auditVersion' | 'constitutionVersion' | 'recordId' | 'recordedAt'>
): ConstitutionalAuditRecord {
  const record: ConstitutionalAuditRecord = {
    auditVersion: IMMUTABLE_AUDIT_VERSION,
    constitutionVersion: SUPREME_CONSTITUTION_VERSION,
    recordId: nextRecordId(),
    recordedAt: new Date().toISOString(),
    ...partial,
  };
  auditLog.push(record);
  return record;
}

export function listConstitutionalAuditRecords(limit = 100): ConstitutionalAuditRecord[] {
  return auditLog.slice(-limit);
}

export function getConstitutionalAuditCount(): number {
  return auditLog.length;
}

export function queryAuditBySubject(subjectId: string): ConstitutionalAuditRecord[] {
  return auditLog.filter((r) => r.subjectId === subjectId);
}

export function clearConstitutionalAuditForTests(): void {
  auditLog.length = 0;
}
