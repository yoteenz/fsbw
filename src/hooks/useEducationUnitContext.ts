import { useCallback, useMemo, useState } from 'react';
import type { PSATodayEpisode } from '../components/lounge/psa-today/types';
import type { WigUnitSlug } from '../content/education/care/productCatalog';
import {
  resolveEducationUnitContext,
  writeFollowThisUnitPreference,
  type ResolvedEducationUnitContext,
} from '../content/education/signature-units';

export type UseEducationUnitContextOptions = {
  ownedUnitIds?: WigUnitSlug[];
  selectedUnitId?: WigUnitSlug | null;
  generalMode?: boolean;
};

export function useEducationUnitContext(
  episode: PSATodayEpisode,
  options: UseEducationUnitContextOptions = {}
): {
  context: ResolvedEducationUnitContext;
  selectFollowUnit: (unitId: WigUnitSlug | null) => void;
  setGeneralMode: (enabled: boolean) => void;
  generalMode: boolean;
} {
  const [selectedUnitId, setSelectedUnitId] = useState<WigUnitSlug | null>(
    options.selectedUnitId ?? null
  );
  const [generalMode, setGeneralMode] = useState(options.generalMode ?? false);

  const context = useMemo(
    () =>
      resolveEducationUnitContext({
        selectedUnitId,
        ownedUnitIds: options.ownedUnitIds,
        generalMode,
        continuityUnitId: undefined,
        preferredDemonstrationUnitIds: episode.unitEducation?.preferredDemonstrationUnitIds,
        demonstrationUnitStrategy: episode.unitEducation?.demonstrationUnitStrategy,
        demonstrationUnitReason: episode.unitEducation?.demonstrationUnitReason,
      }),
    [
      selectedUnitId,
      options.ownedUnitIds,
      generalMode,
      episode.unitEducation?.preferredDemonstrationUnitIds,
      episode.unitEducation?.demonstrationUnitStrategy,
      episode.unitEducation?.demonstrationUnitReason,
    ]
  );

  const selectFollowUnit = useCallback((unitId: WigUnitSlug | null) => {
    setSelectedUnitId(unitId);
    setGeneralMode(false);
    if (episode.unitEducation?.supportsFollowThisUnit) {
      writeFollowThisUnitPreference(unitId);
    }
  }, [episode.unitEducation?.supportsFollowThisUnit]);

  return { context, selectFollowUnit, setGeneralMode, generalMode };
}
