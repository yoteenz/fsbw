import { createHash } from 'crypto';
import type { ImmuneRepairRiskClass } from './types.js';

const DESTRUCTIVE_PATTERNS = [
  /\bdrop\s+table\b/i,
  /\bdrop\s+column\b/i,
  /\btruncate\s+table\b/i,
  /\bdelete\s+from\b/i,
  /\balter\s+table\b[^;]*\bdrop\b/i,
  /\bdisable\s+row\s+level\s+security\b/i,
  /\brevoke\b/i,
  /\bgrant\s+all\b/i,
];

const RLS_WEAKENING_PATTERNS = [
  /\bdisable\s+row\s+level\s+security\b/i,
  /\bdrop\s+policy\b/i,
  /\balter\s+table\b[^;]*\bno\s+force\s+row\s+level\s+security\b/i,
];

export function computeMigrationChecksum(sql: string): string {
  return createHash('sha256').update(sql.trim()).digest('hex');
}

export function detectDestructiveSql(sql: string): boolean {
  return DESTRUCTIVE_PATTERNS.some((re) => re.test(sql));
}

export function detectRlsWeakeningSql(sql: string): boolean {
  return RLS_WEAKENING_PATTERNS.some((re) => re.test(sql));
}

export function classifyMigrationRisk(sql: string): ImmuneRepairRiskClass {
  if (detectDestructiveSql(sql) || detectRlsWeakeningSql(sql)) return 'C';
  if (/\bcreate\s+table\s+if\s+not\s+exists\b/i.test(sql)) return 'A';
  if (/\bcreate\s+index\s+if\s+not\s+exists\b/i.test(sql)) return 'A';
  if (/\balter\s+table\b[^;]*\badd\s+column\b/i.test(sql) && /\bnot\s+null\b/i.test(sql)) return 'B';
  if (/\bcreate\s+table\b/i.test(sql)) return 'A';
  return 'C';
}

export type MigrationSafetyReport = {
  destructiveOperationDetected: boolean;
  rlsWeakeningDetected: boolean;
  riskClass: ImmuneRepairRiskClass;
  checksum: string;
  rollbackStrategy: string;
  compensatingAction: string;
  dataImpact: string;
  lockImpact: 'none' | 'low' | 'medium' | 'high';
};

export function analyzeMigrationSafety(sql: string): MigrationSafetyReport {
  const destructive = detectDestructiveSql(sql);
  const rlsWeakening = detectRlsWeakeningSql(sql);
  const riskClass = classifyMigrationRisk(sql);
  const isCreateTable = /\bcreate\s+table\b/i.test(sql);
  return {
    destructiveOperationDetected: destructive,
    rlsWeakeningDetected: rlsWeakening,
    riskClass: destructive || rlsWeakening ? 'C' : riskClass,
    checksum: computeMigrationChecksum(sql),
    rollbackStrategy: isCreateTable
      ? 'Drop table only if zero rows and repair not yet active — founder approval required after data flows'
      : 'Compensating migration or manual rollback per runbook',
    compensatingAction: isCreateTable ? 'DROP TABLE IF EXISTS (founder-approved only)' : 'Declared runbook migration',
    dataImpact: destructive ? 'Potential data loss' : 'Additive — no existing data rewrite',
    lockImpact: isCreateTable ? 'low' : 'medium',
  };
}
