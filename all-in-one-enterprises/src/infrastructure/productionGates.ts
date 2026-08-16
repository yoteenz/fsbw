/**
 * Sprint 23 — production preparation vs public launch gates.
 * canPrepareProduction() ≠ canLaunchPublicly()
 */

import { isSupabaseConfigured, validateAioEnvironment } from '../config/env';
import { isStandaloneExtractionComplete } from '../qa/extractionGate';
import { runFsIsolationSelfCheck } from '../security/fsIsolation';
import type { ProductionGateResult } from './types';
import {
  isProductionDeployment,
  isStagingDeployment,
  validateProductionBuildConfig,
} from './environmentModel';
import { evaluateRlsReadiness } from './rlsGate';
import { getInfrastructureMatrix } from './infrastructureStatus';

export function canPrepareProduction(): ProductionGateResult {
  const blockers: string[] = [];
  const warnings: string[] = [];

  const extraction = isStandaloneExtractionComplete();
  if (!extraction.complete) {
    blockers.push('Standalone extraction incomplete');
    extraction.checks.filter((c) => !c.met).forEach((c) => blockers.push(`Extraction: ${c.id}`));
  }

  const buildValidation = validateProductionBuildConfig();
  if (!buildValidation.ok) {
    buildValidation.errors.forEach((e) => blockers.push(e));
  }
  buildValidation.warnings.forEach((w) => warnings.push(w));

  const fsCheck = runFsIsolationSelfCheck();
  if (!fsCheck.ok) {
    blockers.push('Frontal Slayer isolation check failed');
    fsCheck.violations.forEach((i) => blockers.push(i));
  }

  if (!isSupabaseConfigured()) {
    blockers.push('Dedicated Supabase project not configured (URL + anon key required)');
  }

  if (isProductionDeployment() || isStagingDeployment()) {
    const envValidation = validateAioEnvironment();
    if (!envValidation.ok) {
      envValidation.errors.forEach((e) => blockers.push(e));
    }
  }

  const rls = evaluateRlsReadiness();
  if (rls.status === 'RLS_BLOCKED') {
    blockers.push('RLS readiness gate blocked');
    rls.blockers.forEach((b) => blockers.push(`RLS: ${b}`));
  } else if (rls.status === 'RLS_NOT_TESTED') {
    warnings.push('RLS suite not yet run against live staging database');
  }

  const matrix = getInfrastructureMatrix();
  for (const item of matrix) {
    if (item.blocking && item.status === 'NOT_CONFIGURED' && isProductionDeployment()) {
      if (['database', 'auth', 'storage', 'deployment-production'].includes(item.id)) {
        blockers.push(`${item.label}: NOT_CONFIGURED`);
      }
    }
  }

  const uniqueBlockers = [...new Set(blockers)];
  return {
    status: uniqueBlockers.length === 0 ? 'READY' : 'BLOCKED',
    blockers: uniqueBlockers,
    warnings: [...new Set(warnings)],
  };
}

export function canLaunchPublicly(): ProductionGateResult {
  const prepare = canPrepareProduction();
  const blockers = [...prepare.blockers];
  const warnings = [...prepare.warnings];

  blockers.push('PUBLIC LAUNCH requires Sprint 24 operational readiness (staff, legal, service activation)');
  blockers.push('Domain and TLS must be verified before public launch');
  blockers.push('Production email/SMS/payments require business activation');
  blockers.push('Service activation matrix must show customer CTAs enabled per service');

  const matrix = getInfrastructureMatrix();
  for (const item of matrix) {
    if (item.category === 'LAUNCH' && item.status !== 'READY' && item.status !== 'NOT_REQUIRED') {
      blockers.push(`Launch gate: ${item.label} — ${item.status}`);
    }
  }

  return {
    status: 'BLOCKED',
    blockers: [...new Set(blockers)],
    warnings,
  };
}
