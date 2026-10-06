/** Canonical encoding for staff-entered migration facts (no provider extraction). */

export const MANUAL_FACT_SOURCE_PREFIX = 'MANUAL_REVIEW';

export function formatManualFactSourceReference(input: {
  batchFileId?: string;
  enteredByUserId: string;
  enteredAt?: string;
}): string {
  const at = input.enteredAt ?? new Date().toISOString();
  const filePart = input.batchFileId ?? 'no-file';
  return `${MANUAL_FACT_SOURCE_PREFIX}|file=${filePart}|by=${input.enteredByUserId}|at=${at}`;
}

export function isManualFactSource(sourceReference: string | null | undefined): boolean {
  return Boolean(sourceReference?.startsWith(`${MANUAL_FACT_SOURCE_PREFIX}|`));
}

export function provenanceForFactSource(sourceReference: string | null | undefined): string {
  return isManualFactSource(sourceReference) ? 'MANUAL_REVIEW' : 'MIGRATION_APPROVED';
}
