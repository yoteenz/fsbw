import { useMemo } from 'react';
import { resolveLivingHeadquarters, type LivingHeadquartersInput } from '../studio-os-core/living-headquarters';

/** Resolves Living Headquarters™ emotional environment for the current organization. */
export function useLivingHeadquartersState(input: LivingHeadquartersInput) {
  const organizationId = input.organizationId;

  return useMemo(
    () =>
      resolveLivingHeadquarters({
        ...input,
        organizationId,
      }),
    [
      organizationId,
      input.organizationFoundedAt,
      input.pagesPublished,
      input.knowledgeAssets,
      input.healthScore,
      input.milestoneRecords,
      input.supplementalWallEntries,
    ]
  );
}
