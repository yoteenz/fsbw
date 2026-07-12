import { IMMUNE_SCHEMA_CONTRACT_VERSION } from './constants.js';
import { findMigrationForTable } from './migration-manifest.js';
import { analyzeMigrationSafety } from './migration-safety.js';
import {
  IMMUNE_SCHEMA_CONTRACT_TABLES,
  getSchemaTableContract,
  verifyTableContractAgainstProbe,
  type SchemaTableContract,
} from './schema-contract.js';
import type { ImmuneDriftFinding, ImmuneDriftReport, ImmuneSchemaProbeResult } from './types.js';

export function isMissingTableError(message: string): boolean {
  const m = message.toLowerCase();
  return (
    m.includes('could not find the table') ||
    m.includes('schema cache') ||
    m.includes('relation') && m.includes('does not exist') ||
    m.includes('pgrst205') ||
    m.includes('42p01')
  );
}

export function inferMissingTableFromError(
  message: string,
  hintedTable?: string
): { qualifiedName: string; confidence: number } | null {
  if (!isMissingTableError(message)) return null;
  const match =
    message.match(/public\.([a-z0-9_]+)/i) ||
    message.match(/'([^']+)'/i) ||
    (hintedTable ? [null, hintedTable] : null);
  const raw = match?.[1] ?? hintedTable;
  if (!raw) return null;
  const name = raw.includes('.') ? raw : `public.${raw}`;
  return { qualifiedName: name, confidence: hintedTable ? 1 : 0.92 };
}

export function detectDriftForTableContract(
  contract: SchemaTableContract,
  probe: ImmuneSchemaProbeResult | null,
  environment: string
): ImmuneDriftFinding[] {
  const findings: ImmuneDriftFinding[] = [];
  if (!probe || !probe.tableExists) {
    const migration = findMigrationForTable(contract.qualifiedName);
    findings.push({
      driftType: 'missing-table',
      expectedResource: contract.qualifiedName,
      observedResourceState: 'missing',
      diagnosisConfidence: 1,
      proposedMigrationId: migration?.migrationId ?? null,
      proposedMigrationChecksum: null,
      repairRiskClass: migration?.riskClass ?? 'C',
      symptom: `Required table ${contract.qualifiedName} is absent from live environment (${environment})`,
    });
    return findings;
  }

  const verification = verifyTableContractAgainstProbe(contract, probe);
  for (const failure of verification.failures) {
    if (failure.startsWith('missing column')) {
      findings.push({
        driftType: 'missing-column',
        expectedResource: `${contract.qualifiedName}.${failure.replace('missing column ', '')}`,
        observedResourceState: 'absent',
        diagnosisConfidence: 0.98,
        proposedMigrationId: findMigrationForTable(contract.qualifiedName)?.migrationId ?? null,
        proposedMigrationChecksum: null,
        repairRiskClass: 'C',
        symptom: failure,
      });
    } else if (failure.startsWith('incompatible type')) {
      findings.push({
        driftType: 'incompatible-column-type',
        expectedResource: contract.qualifiedName,
        observedResourceState: failure,
        diagnosisConfidence: 0.95,
        proposedMigrationId: null,
        proposedMigrationChecksum: null,
        repairRiskClass: 'C',
        symptom: failure,
      });
    } else if (failure.startsWith('missing index')) {
      findings.push({
        driftType: 'missing-index',
        expectedResource: failure.replace('missing index ', ''),
        observedResourceState: 'absent',
        diagnosisConfidence: 0.95,
        proposedMigrationId: findMigrationForTable(contract.qualifiedName)?.migrationId ?? null,
        proposedMigrationChecksum: null,
        repairRiskClass: 'A',
        symptom: failure,
      });
    } else if (failure.startsWith('RLS')) {
      findings.push({
        driftType: 'missing-rls',
        expectedResource: contract.qualifiedName,
        observedResourceState: 'disabled or unknown',
        diagnosisConfidence: 0.9,
        proposedMigrationId: findMigrationForTable(contract.qualifiedName)?.migrationId ?? null,
        proposedMigrationChecksum: null,
        repairRiskClass: 'A',
        symptom: failure,
      });
    }
  }
  return findings;
}

export function buildDriftReport(input: {
  environment: string;
  probes: Record<string, ImmuneSchemaProbeResult | null>;
}): ImmuneDriftReport {
  const findings: ImmuneDriftFinding[] = [];
  for (const contract of IMMUNE_SCHEMA_CONTRACT_TABLES) {
    findings.push(...detectDriftForTableContract(contract, input.probes[contract.qualifiedName] ?? null, input.environment));
  }
  return {
    ok: findings.length === 0,
    environment: input.environment,
    checkedAt: new Date().toISOString(),
    findings,
    contractVersion: IMMUNE_SCHEMA_CONTRACT_VERSION,
  };
}

export function attachMigrationChecksumToFinding(
  finding: ImmuneDriftFinding,
  migrationSql: string | null
): ImmuneDriftFinding {
  if (!migrationSql || !finding.proposedMigrationId) return finding;
  const safety = analyzeMigrationSafety(migrationSql);
  return {
    ...finding,
    proposedMigrationChecksum: safety.checksum,
    repairRiskClass: safety.riskClass,
  };
}

export function getSchemaTableContractByQualifiedName(name: string) {
  return getSchemaTableContract(name);
}
