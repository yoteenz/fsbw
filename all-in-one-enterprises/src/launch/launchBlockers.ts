/**
 * Sprint 24 — authoritative launch blockers from actual Sprint 23 state.
 */

import { isSupabaseConfigured } from '../config/env';
import { canPrepareProduction } from '../infrastructure/productionGates';
import type { LaunchBlocker } from './types';

export function getLaunchBlockers(): LaunchBlocker[] {
  const prepare = canPrepareProduction();
  const blockers: LaunchBlocker[] = [];

  if (!isSupabaseConfigured()) {
    blockers.push({
      id: 'LB-001',
      category: 'TECHNICAL',
      severity: 'P0',
      description: 'Dedicated Supabase production/staging project not configured',
      ownerCategory: 'TECHNICAL',
      requiredAction: 'Owner provisions dedicated AIO Supabase projects and sets env vars',
      status: 'OPEN',
      evidence: 'PRODUCTION_READINESS_REPORT.md — NOT_CONFIGURED',
    });
  }

  blockers.push({
    id: 'LB-002',
    category: 'DOMAIN',
    severity: 'P0',
    description: 'Production domain not selected or verified',
    ownerCategory: 'BUSINESS',
    requiredAction: 'Select domain, configure DNS/TLS per DOMAIN_AND_DNS.md',
    status: 'OPEN',
  });

  blockers.push({
    id: 'LB-003',
    category: 'COMMUNICATIONS',
    severity: 'P1',
    description: 'Production transactional email not activated',
    ownerCategory: 'PROVIDER',
    requiredAction: 'Verify sender domain, approve templates, activate email',
    status: 'OPEN',
    affectedService: 'all',
  });

  blockers.push({
    id: 'LB-004',
    category: 'FINANCIAL',
    severity: 'P1',
    description: 'Production payment merchant not approved',
    ownerCategory: 'BUSINESS',
    requiredAction: 'Complete merchant approval, production credentials, webhook test',
    status: 'OPEN',
  });

  blockers.push({
    id: 'LB-005',
    category: 'LEGAL',
    severity: 'P1',
    description: 'Final legal/disclosure content requires business/legal approval',
    ownerCategory: 'LEGAL',
    requiredAction: 'Review privacy, terms, service disclosures with counsel',
    status: 'OPEN',
  });

  blockers.push({
    id: 'LB-006',
    category: 'STAFFING',
    severity: 'P1',
    description: 'Production staff accounts and training not completed',
    ownerCategory: 'OPERATIONS',
    requiredAction: 'Bootstrap owner, invite staff, complete training modules',
    status: 'OPEN',
  });

  blockers.push({
    id: 'LB-007',
    category: 'SUPPORT',
    severity: 'P2',
    description: 'Support contact channels not configured with real values',
    ownerCategory: 'BUSINESS',
    requiredAction: 'Configure phone/email/hours or hide until ready',
    status: 'OPEN',
  });

  blockers.push({
    id: 'LB-008',
    category: 'PROVIDER',
    severity: 'P1',
    description: 'Brokerage business authorization not verified',
    affectedService: 'brokerage',
    ownerCategory: 'LEGAL',
    requiredAction: 'Verify authority, bond, insurance, agreements before activation',
    status: 'OPEN',
  });

  blockers.push({
    id: 'LB-009',
    category: 'PROVIDER',
    severity: 'P1',
    description: 'Factoring partner agreement and credentials pending',
    affectedService: 'factoring',
    ownerCategory: 'BUSINESS',
    requiredAction: 'Execute partner agreement; configure referral workflow only',
    status: 'OPEN',
  });

  blockers.push({
    id: 'LB-010',
    category: 'PROVIDER',
    severity: 'P1',
    description: 'Insurance licensing/partner appointment not verified',
    affectedService: 'insurance',
    ownerCategory: 'LEGAL',
    requiredAction: 'Confirm referral/assistance model; no bind without licensing',
    status: 'OPEN',
  });

  for (const b of prepare.blockers.slice(0, 3)) {
    blockers.push({
      id: `LB-INFRA-${blockers.length + 1}`,
      category: 'TECHNICAL',
      severity: 'P0',
      description: b,
      ownerCategory: 'TECHNICAL',
      requiredAction: 'Resolve infrastructure blocker from Production Config Center',
      status: 'OPEN',
    });
  }

  return blockers;
}

export function getOpenP0Blockers(): LaunchBlocker[] {
  return getLaunchBlockers().filter((b) => b.status === 'OPEN' && b.severity === 'P0');
}

export function getOpenP1Blockers(): LaunchBlocker[] {
  return getLaunchBlockers().filter((b) => b.status === 'OPEN' && b.severity === 'P1');
}
