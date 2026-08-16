import type { DemoStore } from '../demo/demoTypes';
import type { SecurityControl, SecurityControlStatus } from './securityTypes';
import { isDebugEnvironment } from './environmentConfig';

function control(
  partial: Omit<SecurityControl, 'status'> & { status?: SecurityControlStatus },
  computed: SecurityControlStatus,
): SecurityControl {
  return { ...partial, status: partial.status ?? computed };
}

/** Canonical security control registry — status computed from debug architecture evidence. */
export function buildSecurityControlRegistry(store?: DemoStore): SecurityControl[] {
  const debug = !store || isDebugEnvironment(store.securitySettings);

  return [
    control({
      id: 'auth-isolation',
      category: 'IDENTITY',
      name: 'Isolated All In One authentication',
      description: 'Separate Supabase project and storage key from Frontal Slayer',
      risk: 'Cross-product session or identity bleed',
      implementation: 'aio-auth-token storage key; AIOAuthProvider',
      verificationMethod: 'FS isolation regression test',
      owner: 'Platform',
    }, debug ? 'PARTIAL' : 'PLANNED'),
    control({
      id: 'password-storage',
      category: 'IDENTITY',
      name: 'Password never stored in application code',
      description: 'Provider-side password hashing only',
      risk: 'Credential disclosure',
      implementation: 'Supabase Auth boundary',
      verificationMethod: 'Code review — no password fields in demo store',
      owner: 'Platform',
    }, 'IMPLEMENTED'),
    control({
      id: 'mfa-foundation',
      category: 'IDENTITY',
      name: 'MFA policy architecture',
      description: 'Configurable MFA enforcement by role tier',
      risk: 'Account takeover for privileged users',
      implementation: 'securitySettings.mfaPolicy',
      verificationMethod: 'Security settings UI + Sprint 20 provider wiring',
      owner: 'Platform',
    }, 'PARTIAL'),
    control({
      id: 'session-revocation',
      category: 'SESSION',
      name: 'Session revocation support',
      description: 'Revoke current/other sessions with audit',
      risk: 'Stolen session persistence',
      implementation: 'securitySessions model + securityActions',
      verificationMethod: 'Session QA journey',
      owner: 'Platform',
    }, 'PARTIAL'),
    control({
      id: 'object-authorization',
      category: 'AUTHORIZATION',
      name: 'Object-level authorization',
      description: 'Default deny with resource scope checks',
      risk: 'IDOR / BOLA',
      implementation: 'authorizationGuard.ts',
      verificationMethod: 'security.test.ts IDOR matrix',
      owner: 'Platform',
    }, 'PARTIAL'),
    control({
      id: 'rls-strategy',
      category: 'DATABASE',
      name: 'Row Level Security strategy',
      description: 'Postgres RLS for customer-accessible data',
      risk: 'Database-level data leak',
      implementation: 'Documented in SECURITY_FOUNDATION.md; migrations Sprint 20',
      verificationMethod: 'Migration review + policy tests',
      owner: 'Platform',
    }, 'PLANNED'),
    control({
      id: 'private-storage',
      category: 'STORAGE',
      name: 'Private document storage',
      description: 'No public buckets for customer documents',
      risk: 'Unauthorized document access',
      implementation: 'vaultStorage demo + signed download grants',
      verificationMethod: 'Document download QA journey',
      owner: 'Platform',
    }, 'PARTIAL'),
    control({
      id: 'upload-validation',
      category: 'STORAGE',
      name: 'Upload validation and quarantine',
      description: 'Size, MIME, magic-byte, extension checks',
      risk: 'Malware or executable upload',
      implementation: 'fileSecurity.ts',
      verificationMethod: 'File security tests',
      owner: 'Platform',
    }, 'IMPLEMENTED'),
    control({
      id: 'integration-secrets',
      category: 'INTEGRATIONS',
      name: 'Integration secrets server-only',
      description: 'Credential references only in client',
      risk: 'Provider credential exposure',
      implementation: 'integrationRedaction + Sprint 18 architecture',
      verificationMethod: 'Integration security tests',
      owner: 'Integrations',
    }, 'IMPLEMENTED'),
    control({
      id: 'audit-append',
      category: 'AUDIT',
      name: 'Security audit event log',
      description: 'Distinct audit trail for security-sensitive actions',
      risk: 'Undetected privileged abuse',
      implementation: 'securityAuditEvents + Security Audit UI',
      verificationMethod: 'Audit search UI + tests',
      owner: 'Security',
    }, 'PARTIAL'),
    control({
      id: 'csv-injection',
      category: 'API',
      name: 'CSV formula injection protection',
      description: 'Neutralize spreadsheet formulas on export',
      risk: 'Formula injection via exported data',
      implementation: 'securityRedaction.neutralizeCsvCell + managementExport',
      verificationMethod: 'CSV export test',
      owner: 'Reporting',
    }, 'IMPLEMENTED'),
    control({
      id: 'production-gate',
      category: 'OPERATIONS',
      name: 'Production launch gate',
      description: 'Deterministic canLaunchProduction() with blockers',
      risk: 'Premature production deployment',
      implementation: 'productionGate.ts',
      verificationMethod: 'Production readiness UI',
      owner: 'Security',
    }, 'IMPLEMENTED'),
    control({
      id: 'backup-production',
      category: 'BACKUP',
      name: 'Production backup configured',
      description: 'Automated encrypted backups with restore testing',
      risk: 'Unrecoverable data loss',
      implementation: 'Documented — provider configuration Sprint 20+',
      verificationMethod: 'Backup status in Security Center',
      owner: 'Infrastructure',
    }, 'PLANNED'),
    control({
      id: 'demo-reset-guard',
      category: 'OPERATIONS',
      name: 'Demo reset production guard',
      description: 'Reset refuses when environment simulates production',
      risk: 'Accidental production data wipe',
      implementation: 'resetDemoStore environment assertion',
      verificationMethod: 'Demo reset protection QA',
      owner: 'Platform',
    }, 'IMPLEMENTED'),
    control({
      id: 'fs-isolation',
      category: 'OPERATIONS',
      name: 'Frontal Slayer product isolation',
      description: 'No FS Supabase/auth/storage/payment imports in AIO domain',
      risk: 'Cross-product data exposure',
      implementation: 'fsIsolation.ts regression checks',
      verificationMethod: 'security.test.ts',
      owner: 'Platform',
    }, 'IMPLEMENTED'),
  ];
}

export function summarizeControlPosture(controls: SecurityControl[]): {
  implemented: number;
  partial: number;
  actionRequired: number;
  notVerified: number;
} {
  let implemented = 0;
  let partial = 0;
  let actionRequired = 0;
  let notVerified = 0;
  for (const c of controls) {
    if (c.status === 'IMPLEMENTED') implemented += 1;
    else if (c.status === 'PARTIAL') partial += 1;
    else if (c.status === 'PLANNED' || c.status === 'BLOCKED') actionRequired += 1;
    else notVerified += 1;
  }
  return { implemented, partial, actionRequired, notVerified };
}
