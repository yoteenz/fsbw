import type { WigUnitSlug } from '../care/productCatalog';
import type { DemonstrationUnitStrategy, ResolvedEducationUnitContext } from './types';
import { getSignatureUnitEducationProfile, isKnownSignatureUnitId } from './registry';
import {
  readContinuityUnitPreference,
  readFollowThisUnitPreference,
} from './educationUnitPreference';

export type ResolveEducationUnitContextInput = {
  /** Explicit unit selected for this lesson session. */
  selectedUnitId?: WigUnitSlug | null;
  /** Qualifying owned Frontal Slayer unit slugs from orders / profiles. */
  ownedUnitIds?: WigUnitSlug[];
  /** Curriculum-preferred demonstration units (pedagogy overrides continuity). */
  preferredDemonstrationUnitIds?: WigUnitSlug[];
  demonstrationUnitStrategy?: DemonstrationUnitStrategy;
  demonstrationUnitReason?: string;
  /** Stored hero / continuity unit from prior classes. */
  continuityUnitId?: WigUnitSlug | null;
  /** Force general education mode (no unit personalization). */
  generalMode?: boolean;
};

function uniqueOwned(ids: WigUnitSlug[]): WigUnitSlug[] {
  return [...new Set(ids.filter(isKnownSignatureUnitId))];
}

function resolveLearnerUnit(input: ResolveEducationUnitContextInput): {
  unitId: WigUnitSlug | null;
  source: ResolvedEducationUnitContext['contextSource'];
} {
  if (input.generalMode) {
    return { unitId: null, source: 'general' };
  }

  if (input.selectedUnitId && isKnownSignatureUnitId(input.selectedUnitId)) {
    return { unitId: input.selectedUnitId, source: 'selected' };
  }

  const follow = readFollowThisUnitPreference();
  if (follow) {
    return { unitId: follow, source: 'follow-preference' };
  }

  const owned = uniqueOwned(input.ownedUnitIds ?? []);
  if (owned.length === 1) {
    return { unitId: owned[0], source: 'owned' };
  }

  return { unitId: null, source: 'general' };
}

function resolveDemonstrationUnit(
  input: ResolveEducationUnitContextInput,
  learnerUnitId: WigUnitSlug | null,
  continuityUnitId: WigUnitSlug | null
): { unitId: WigUnitSlug | null; reason?: string } {
  const strategy = input.demonstrationUnitStrategy ?? 'learner-selected';
  const preferred = (input.preferredDemonstrationUnitIds ?? []).filter(isKnownSignatureUnitId);

  if (strategy === 'curriculum-selected' && preferred.length > 0) {
    const pick = preferred.find((id) => getSignatureUnitEducationProfile(id)?.active !== false);
    if (pick) {
      return {
        unitId: pick,
        reason:
          input.demonstrationUnitReason ??
          (learnerUnitId && pick !== learnerUnitId
            ? 'This class uses a curriculum-selected unit to teach the objective clearly.'
            : undefined),
      };
    }
  }

  if (strategy === 'continuity' && continuityUnitId) {
    return { unitId: continuityUnitId };
  }

  if (strategy === 'any-compatible' && preferred.length > 0) {
    return { unitId: preferred[0] };
  }

  if (learnerUnitId) {
    return { unitId: learnerUnitId };
  }

  if (preferred.length > 0) {
    return {
      unitId: preferred[0],
      reason: input.demonstrationUnitReason,
    };
  }

  return { unitId: null };
}

/** Central resolver for educational unit context — registry-driven, no switch statements. */
export function resolveEducationUnitContext(
  input: ResolveEducationUnitContextInput = {}
): ResolvedEducationUnitContext {
  const ownedUnitIds = uniqueOwned(input.ownedUnitIds ?? []);
  const { unitId: learnerUnitId, source } = resolveLearnerUnit(input);

  const continuityUnitId =
    input.continuityUnitId ??
    readContinuityUnitPreference() ??
    (input.demonstrationUnitStrategy === 'continuity' ? learnerUnitId : null);

  const demo = resolveDemonstrationUnit(input, learnerUnitId, continuityUnitId);

  const generalMode = input.generalMode === true || (!learnerUnitId && !demo.unitId);

  return {
    learnerUnitId,
    demonstrationUnitId: demo.unitId,
    continuityUnitId,
    contextSource: generalMode && source !== 'selected' && source !== 'follow-preference'
      ? 'general'
      : source,
    generalMode,
    demonstrationUnitReason:
      demo.unitId && learnerUnitId && demo.unitId !== learnerUnitId
        ? demo.reason ?? input.demonstrationUnitReason
        : input.demonstrationUnitReason,
    ownedUnitIds,
    multipleOwnedUnits: ownedUnitIds.length > 1,
  };
}
