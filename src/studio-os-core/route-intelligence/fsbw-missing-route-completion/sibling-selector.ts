import type {
  DesignFamilyRecord,
  DesignScreenRecord,
  FamilySiblingCandidate,
  MissingPageCandidateRecord,
  MissingDesignTargetType,
  SiblingConfidence,
  StudioWorldDesignRouteManifest,
} from '../types';
import { VOICE_LAB_TARGET_ID } from '../constants';
import { listCharacterLabCodeSiblings } from './character-lab-registry';

function shellIdFromFamily(family: DesignFamilyRecord): string | undefined {
  if (!family.shellAuthority) return undefined;
  return `${family.projectId}:shell:${family.shellAuthority}`;
}

function scoreSibling(
  candidate: MissingPageCandidateRecord,
  screen: DesignScreenRecord,
  family: DesignFamilyRecord,
  targetType: MissingDesignTargetType,
): { score: number; explanation: string } {
  let score = 0;
  const parts: string[] = [];

  if (family.memberDesignScreenIds.includes(screen.designScreenId)) {
    score += 40;
    parts.push('same design family');
  }
  if (screen.representativeRoute.split('/').length === candidate.representativeRoute.split('/').length) {
    score += 10;
    parts.push('same route depth');
  }
  if (family.representativeScreenId === screen.designScreenId) {
    score += 25;
    parts.push('family representative');
  }
  if (targetType === 'TAB_STATE' && /character|visual|wardrobe|lab|tab/i.test(screen.displayName + screen.representativeRoute)) {
    score += 20;
    parts.push('tab sibling pattern');
  }
  if (screen.implementationRouteIds.length > 0) {
    score += 15;
    parts.push('implemented');
  }

  return { score, explanation: parts.join(', ') || 'family member' };
}

function confidenceFromScore(score: number): SiblingConfidence {
  if (score >= 70) return 'HIGH';
  if (score >= 45) return 'MEDIUM';
  return 'LOW';
}

export function listFamilySiblingCandidates(
  candidate: MissingPageCandidateRecord,
  manifest: StudioWorldDesignRouteManifest,
  targetType: MissingDesignTargetType,
  family?: DesignFamilyRecord,
  existingSnapshots: import('../types').ComposerDraftSnapshotRecord[] = [],
): FamilySiblingCandidate[] {
  const families = manifest.designFamilies ?? [];
  const resolvedFamily =
    family ??
    candidate.designFamilyIds
      .map((id) => families.find((f) => f.designFamilyId === id))
      .find(Boolean) ??
    families.find((f) => f.projectId === candidate.projectId && f.memberDesignScreenIds.length > 1);

  const codeSiblings =
    candidate.candidateId === VOICE_LAB_TARGET_ID ||
    candidate.representativeRoute.includes('/character-lab/voice-lab')
      ? listCharacterLabCodeSiblings()
      : [];

  if (!resolvedFamily) return codeSiblings.sort((a, b) => b.score - a.score);

  const screens = (manifest.designScreens ?? []).filter(
    (s) =>
      s.projectId === candidate.projectId &&
      resolvedFamily.memberDesignScreenIds.includes(s.designScreenId) &&
      s.representativeRoute !== candidate.representativeRoute,
  );

  const registrySnapshots = existingSnapshots;

  const manifestCandidates = screens
    .map((screen) => {
      const { score, explanation } = scoreSibling(candidate, screen, resolvedFamily, targetType);
      const snap = registrySnapshots.find(
        (s) => s.isSourceSibling && s.route === screen.representativeRoute && s.status === 'CAPTURED',
      );
      return {
        siblingId: screen.designScreenId,
        designScreenId: screen.designScreenId,
        route: screen.representativeRoute,
        displayName: screen.displayName,
        familyId: resolvedFamily.designFamilyId,
        shellId: shellIdFromFamily(resolvedFamily),
        score,
        confidence: confidenceFromScore(score),
        similarityExplanation: explanation,
        hasSnapshot: !!snap,
        snapshotStale: false,
        captureRequired: !snap && score >= 45,
      } satisfies FamilySiblingCandidate;
    });

  const merged = [...codeSiblings, ...manifestCandidates];
  const byId = new Map<string, FamilySiblingCandidate>();
  for (const c of merged) {
    const existing = byId.get(c.siblingId);
    if (!existing || c.score > existing.score) byId.set(c.siblingId, c);
  }

  return [...byId.values()].sort((a, b) => b.score - a.score);
}

export function selectBestFamilySibling(
  candidate: MissingPageCandidateRecord,
  manifest: StudioWorldDesignRouteManifest,
  targetType: MissingDesignTargetType,
  founderOverrideSiblingId?: string,
  existingSnapshots: import('../types').ComposerDraftSnapshotRecord[] = [],
): { sibling?: FamilySiblingCandidate; candidates: FamilySiblingCandidate[] } {
  const candidates = listFamilySiblingCandidates(candidate, manifest, targetType, undefined, existingSnapshots);
  if (founderOverrideSiblingId) {
    const picked = candidates.find((c) => c.siblingId === founderOverrideSiblingId);
    return { sibling: picked, candidates };
  }
  return { sibling: candidates[0], candidates };
}
