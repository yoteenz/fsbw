import { useCallback, useEffect, useMemo, useState } from 'react';
import type { CarePurchaseProfile, ResolvedPsaSeasonAccess } from '../content/education/types';
import type { ResolvedCareContentEntitlement, YourOwnedUnit } from '../content/education/care/ownedUnitModel';
import { fetchCareAccess, type CareAccessResponse } from '../components/lounge/care/careAccess';
import { syncCareGuidesToLibrary } from '../utils/careGuideLibrary';
import { trackCareEvent } from '../components/lounge/care/careAnalytics';

export function useCareAccess() {
  const [data, setData] = useState<CareAccessResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await fetchCareAccess();
      setData(result);
      if (result) {
        const guideIds = result.unlockedGuideIds ?? result.unlockedLessonIds ?? [];
        if (guideIds.length) {
          syncCareGuidesToLibrary(guideIds);
          trackCareEvent('care_guide_entitlement_resolved', {
            unitCount: result.purchaseProfiles?.length ?? 0,
            guideCount: guideIds.length,
          });
          for (const id of guideIds) {
            trackCareEvent('care_guide_added_to_library', { contentId: id, source: 'qualifying_product' });
          }
        }
      }
      return result;
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load Care access');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const unlockedGuideIds = data?.unlockedGuideIds ?? data?.unlockedLessonIds ?? [];
  const unlockedSet = useMemo(() => new Set(unlockedGuideIds), [unlockedGuideIds]);

  const purchaseProfiles: CarePurchaseProfile[] = data?.purchaseProfiles ?? [];
  const ownedUnits: YourOwnedUnit[] = data?.ownedUnits ?? [];
  const careGuideEntitlements: ResolvedCareContentEntitlement[] =
    data?.careGuideEntitlements ?? data?.careContentEntitlements ?? [];
  const careMasterySeasonAccess: ResolvedPsaSeasonAccess | undefined =
    data?.careMasterySeasonAccess;

  return {
    data,
    loading,
    error,
    refresh,
    unlockedSet,
    unlockedGuideIds,
    purchaseProfiles,
    ownedUnits,
    careGuideEntitlements,
    careMasterySeasonAccess,
    isUnlocked: (guideId: string) => unlockedSet.has(guideId),
  };
}
