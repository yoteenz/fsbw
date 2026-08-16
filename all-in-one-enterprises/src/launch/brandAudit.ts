/**
 * Sprint 24 — brand and legacy dependency audit.
 */

import { FRONTAL_SLAYER_SUPABASE_PROJECT_ID } from '../data/constants';

const FORBIDDEN_CUSTOMER_STRINGS = [
  'Perfect Choice',
  'Perfect Choice Permitting',
  'frontalslayer.com',
  'Frontal Slayer',
];

export interface BrandAuditResult {
  ok: boolean;
  violations: string[];
  fsProjectBlocked: boolean;
}

export function runBrandAudit(sources: { label: string; content: string }[]): BrandAuditResult {
  const violations: string[] = [];
  for (const { label, content } of sources) {
    for (const forbidden of FORBIDDEN_CUSTOMER_STRINGS) {
      if (content.includes(forbidden)) {
        violations.push(`${label}: contains "${forbidden}"`);
      }
    }
    if (content.includes(FRONTAL_SLAYER_SUPABASE_PROJECT_ID)) {
      violations.push(`${label}: references forbidden FS Supabase project`);
    }
  }
  return { ok: violations.length === 0, violations, fsProjectBlocked: true };
}

export const CANONICAL_BRAND = 'All In One Enterprises Inc.';
