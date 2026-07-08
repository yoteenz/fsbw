import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ensureHeadquartersPrinciplesStore,
  getHeadquartersPrinciplesStats,
  listPlatformMaturityRegistry,
  listPlatformReadinessReports,
  buildDailyBriefing,
  listHeadquartersZones,
  listCanonicalTerminology,
  constitutionalExpansionSummary,
  HEADQUARTERS_PRINCIPLES_UPDATED_EVENT,
} from '../studio-os-core/headquarters-principles';

export function useHeadquartersPrinciplesState() {
  const [tick, setTick] = useState(0);

  const refresh = useCallback(() => {
    ensureHeadquartersPrinciplesStore();
    setTick((n) => n + 1);
  }, []);

  useEffect(() => {
    ensureHeadquartersPrinciplesStore();
  }, []);

  useEffect(() => {
    const onUpdate = () => refresh();
    window.addEventListener(HEADQUARTERS_PRINCIPLES_UPDATED_EVENT, onUpdate);
    return () => window.removeEventListener(HEADQUARTERS_PRINCIPLES_UPDATED_EVENT, onUpdate);
  }, [refresh]);

  const stats = useMemo(() => getHeadquartersPrinciplesStats(), [tick]);
  const subsystems = useMemo(() => listPlatformMaturityRegistry(), [tick]);
  const readinessReports = useMemo(() => listPlatformReadinessReports(), [tick]);
  const dailyBriefing = useMemo(() => buildDailyBriefing(), [tick]);
  const zones = useMemo(() => listHeadquartersZones(), [tick]);
  const terminology = useMemo(() => listCanonicalTerminology(), [tick]);
  const expansion = useMemo(
    () => constitutionalExpansionSummary(subsystems),
    [subsystems]
  );

  return {
    stats,
    subsystems,
    readinessReports,
    dailyBriefing,
    zones,
    terminology,
    expansion,
    refresh,
    tick,
  };
}
