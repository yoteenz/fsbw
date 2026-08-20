/**
 * Repository audit — existing Nia imagery before generation.
 * Honest findings: no approved portrait/reference images on disk at audit time.
 */

import type { IdentityAuditFinding } from './types';

export const NIA_IDENTITY_REPO_AUDIT = {
  auditedAt: '2026-08-20',
  repository: 'Frontal Slayer + Studio World (fsbw)',
  site00Scope: 'OUT OF SCOPE — not modified',
  summary:
    'Text canon locked in brand-bible and frontal-slayer-canon.ts. No approved Nia portrait, profile, or reference-pack image assets found in repo or public/.',
  approvedImageryFound: false,
  findings: [
    {
      category: 'canonical_portrait',
      path: 'public/',
      status: 'missing',
      notes: 'No Nia portrait files under public/assets or public/studio-os',
    },
    {
      category: 'facial_reference',
      path: 'src/studio-os-core/virtual-production/canon/frontal-slayer-canon.ts',
      status: 'text_only',
      notes: 'FS_CHARACTER_NIA.referenceUrls = {} — explicit SETUP REQUIRED',
    },
    {
      category: 'campaign_image',
      path: 'studio_vp_generation_assets (production)',
      status: 'missing',
      notes: 'Campaign 001 precision motion jobs queued, not executed — no canon Nia frames promoted',
    },
    {
      category: 'approved_generation',
      path: 'brand-bible/production/film-trilogy-visual-story-bible.md',
      status: 'text_only',
      notes: 'Locked Nia look + personality — wardrobe/hair/accessories text canon only',
    },
    {
      category: 'approved_generation',
      path: 'brand-bible/production/film-trilogy-master-cinematography-bible.md',
      status: 'text_only',
      notes: 'Performance + camera grammar for Nia — no image URLs',
    },
    {
      category: 'full_body',
      path: 'Asset Director / Asset Factory demo payloads',
      status: 'missing',
      notes: 'No Nia-specific approved full-body reference in VP canon seed',
    },
    {
      category: 'profile',
      path: 'Reference Pack V1 slots',
      status: 'missing',
      notes: 'All 13 slots MISSING — by design until operator-approved assets uploaded',
    },
  ] satisfies IdentityAuditFinding[],
  reusePolicy:
    'Do not regenerate approved references. Do not silently promote historical generations. Every reused asset requires intentional operator review.',
  recommendedNextStep:
    'Operator uploads or generates identity-preserving candidates from a single PRIMARY IDENTITY ANCHOR — then QC + approve all 13 slots before LOCK.',
};

export function getIdentityAuditFindings(): IdentityAuditFinding[] {
  return NIA_IDENTITY_REPO_AUDIT.findings;
}
