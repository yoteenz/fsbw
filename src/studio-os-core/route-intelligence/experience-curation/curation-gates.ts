import type {
  ExperiencePageOverrideRecordV2,
  ExperiencePageRecord,
  MaterialScreenRecord,
  ProjectCurationState,
  ProjectExperienceCurationBundle,
} from '../types';

export type CurationGateResult = {
  canTransitionToCurated: boolean;
  canLockForCapture: boolean;
  blockers: string[];
  warnings: string[];
};

export function evaluateCurationGates(
  pages: ExperiencePageRecord[],
  _materialScreens: MaterialScreenRecord[],
  bundle: Pick<
    ProjectExperienceCurationBundle,
    'overrideConflicts' | 'reviewQueue' | 'internalLeakAudit'
  >,
  curation: ProjectCurationState,
): CurationGateResult {
  const blockers: string[] = [];
  const warnings: string[] = [];

  if (bundle.overrideConflicts.length) {
    blockers.push('OVERRIDE_CONFLICT');
  }

  const criticalReview = bundle.reviewQueue.filter((q) => q.severity === 'CRITICAL');
  if (criticalReview.length) {
    blockers.push('UNRESOLVED_HIGH_RISK_CURATION');
  }

  const highLeaks = bundle.internalLeakAudit.filter((l) => l.confidence === 'HIGH');
  if (highLeaks.length) {
    blockers.push('POSSIBLE_INTERNAL_LEAK');
  }

  for (const p of pages.filter((pg) => pg.founderPrimary)) {
    if (!p.representativeRoute) blockers.push(`MISSING_REPRESENTATIVE:${p.experiencePageId}`);
    if (p.implementationStatus === 'IMPLEMENTATION_MISSING') {
      blockers.push(`TRUE_IMPLEMENTATION_MISSING:${p.experiencePageId}`);
    }
  }

  const missingAuth = pages.filter((p) => p.founderPrimary && p.captureEligible && !p.authContext);
  if (missingAuth.length) warnings.push('AUTH_CONTEXT_MISSING');

  const missingRef = pages.filter((p) => p.founderPrimary && p.referenceStatus === 'REFERENCE_MISSING');
  if (missingRef.length) warnings.push('REFERENCE_MISSING');

  const canTransitionToCurated = blockers.length === 0;
  const canLockForCapture =
    canTransitionToCurated &&
    (curation.universeStatus === 'CURATED' || curation.universeStatus === 'REVIEWING') &&
    !curation.lockedForCapture;

  if (curation.universeStatus === 'STALE') {
    blockers.push('CURATION_STALE');
  }

  return { canTransitionToCurated, canLockForCapture, blockers, warnings };
}

export function bumpCurationVersion(current: string): string {
  const match = current.match(/^(.*:curation-v)(\d+)$/);
  if (!match) return `${current}-v2`;
  const n = parseInt(match[2]!, 10) + 1;
  return `${match[1]}${n}`;
}

export function hasBlockingLockConflict(conflicts: ExperiencePageOverrideRecordV2[]): boolean {
  return conflicts.some((c) => c.status === 'OVERRIDE_CONFLICT' && c.active);
}
