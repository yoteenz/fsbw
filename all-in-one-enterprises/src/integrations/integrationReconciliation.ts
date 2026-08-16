import type { IntegrationReconciliationIssue, ReconciliationIssueType } from './integrationTypes';

export interface ReconciliationInput {
  providerId: string;
  connectionId: string;
  entityType: string;
  entityId: string;
  internalAmountMinor?: number;
  externalAmountMinor?: number;
  internalStatus?: string;
  externalStatus?: string;
  internalExternalId?: string;
  externalExternalId?: string;
}

export function detectReconciliationIssues(input: ReconciliationInput): IntegrationReconciliationIssue[] {
  const issues: IntegrationReconciliationIssue[] = [];
  const base = {
    providerId: input.providerId,
    connectionId: input.connectionId,
    entityType: input.entityType,
    entityId: input.entityId,
    status: 'open' as const,
    createdAt: new Date().toISOString(),
  };

  if (
    input.internalAmountMinor !== undefined
    && input.externalAmountMinor !== undefined
    && input.internalAmountMinor !== input.externalAmountMinor
  ) {
    issues.push({
      ...base,
      id: crypto.randomUUID(),
      issueType: 'AMOUNT_MISMATCH',
      severity: 'critical',
      expectedValue: String(input.internalAmountMinor),
      externalValue: String(input.externalAmountMinor),
    });
  }

  if (input.internalStatus && input.externalStatus && input.internalStatus !== input.externalStatus) {
    issues.push({
      ...base,
      id: crypto.randomUUID(),
      issueType: 'STATUS_MISMATCH',
      severity: 'high',
      expectedValue: input.internalStatus,
      externalValue: input.externalStatus,
    });
  }

  if (input.internalExternalId && !input.externalExternalId) {
    issues.push({
      ...base,
      id: crypto.randomUUID(),
      issueType: 'MISSING_EXTERNAL_RECORD',
      severity: 'medium',
      expectedValue: input.internalExternalId,
      externalValue: '(missing)',
    });
  }

  if (input.externalExternalId && !input.internalExternalId) {
    issues.push({
      ...base,
      id: crypto.randomUUID(),
      issueType: 'MISSING_INTERNAL_RECORD',
      severity: 'medium',
      expectedValue: '(missing)',
      externalValue: input.externalExternalId,
    });
  }

  return issues;
}

export function reconciliationTypeLabel(type: ReconciliationIssueType): string {
  return type.replace(/_/g, ' ').toLowerCase();
}
