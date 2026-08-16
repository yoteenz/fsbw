/**
 * Sprint 23 Part XVII — RLS readiness gate.
 * Demo: contract tests pass. Live Supabase: requires staging test run.
 */

import { effectiveDataMode, isSupabaseConfigured } from '../config/env';
import type { RlsReadiness } from './types';
import { isProductionDeployment, isStagingDeployment } from './environmentModel';

export interface RlsGateResult {
  status: RlsReadiness;
  blockers: string[];
  notes?: string;
}

export function evaluateRlsReadiness(): RlsGateResult {
  const mode = effectiveDataMode();
  const blockers: string[] = [];

  if (mode === 'demo') {
    return {
      status: 'RLS_NOT_TESTED',
      blockers: [],
      notes: 'Demo authorizationGuard tests pass; live RLS requires dedicated Supabase + staging Customer A/B suite',
    };
  }

  if (!isSupabaseConfigured()) {
    return {
      status: 'RLS_BLOCKED',
      blockers: ['Supabase not configured — cannot evaluate RLS'],
    };
  }

  if (isStagingDeployment() || isProductionDeployment()) {
    return {
      status: 'RLS_NOT_TESTED',
      blockers: [],
      notes: 'Run scripts/rls-staging-test.sh after migrations applied to staging project',
    };
  }

  return { status: 'RLS_NOT_TESTED', blockers, notes: 'Local supabase mode — run RLS matrix' };
}

/** Staging test checklist (manual/automated when project exists) */
export const RLS_STAGING_TEST_MATRIX = [
  'Customer A cannot read Customer B rows',
  'Organization A staff cannot access Organization B customer data',
  'Customer cannot access staff-only tables',
  'Dispatcher cannot export financial data',
  'Finance cannot manage integration credentials',
  'Admin role change reflected in authorization',
  'Security role audit access only',
] as const;
