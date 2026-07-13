import type { MunicipalDecisionKind } from './contract';

export const MUNICIPAL_LEDGER_VERSION = 'municipal-ledger.v1' as const;

export type MunicipalLedgerEntry = {
  entryId: string;
  recordedAt: string;
  organizationId: string;
  sceneId: string | null;
  departmentId: string | null;
  permitId: string | null;
  decisionKind: MunicipalDecisionKind;
  actorId: string;
  summary: string;
  metadata: Record<string, unknown>;
  ledgerVersion: typeof MUNICIPAL_LEDGER_VERSION;
};

export type MunicipalLedger = {
  ledgerVersion: typeof MUNICIPAL_LEDGER_VERSION;
  entries: MunicipalLedgerEntry[];
};

export function createMunicipalLedgerEntry(input: {
  entryId: string;
  organizationId: string;
  decisionKind: MunicipalDecisionKind;
  actorId: string;
  summary: string;
  sceneId?: string | null;
  departmentId?: string | null;
  permitId?: string | null;
  metadata?: Record<string, unknown>;
  recordedAt?: string;
}): MunicipalLedgerEntry {
  return {
    entryId: input.entryId,
    recordedAt: input.recordedAt ?? new Date().toISOString(),
    organizationId: input.organizationId,
    sceneId: input.sceneId ?? null,
    departmentId: input.departmentId ?? null,
    permitId: input.permitId ?? null,
    decisionKind: input.decisionKind,
    actorId: input.actorId,
    summary: input.summary,
    metadata: input.metadata ?? {},
    ledgerVersion: MUNICIPAL_LEDGER_VERSION,
  };
}

export function appendLedgerEntry(ledger: MunicipalLedger, entry: MunicipalLedgerEntry): MunicipalLedger {
  return {
    ...ledger,
    entries: [...ledger.entries, entry],
  };
}

export function createEmptyMunicipalLedger(): MunicipalLedger {
  return { ledgerVersion: MUNICIPAL_LEDGER_VERSION, entries: [] };
}
