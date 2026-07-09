import { useCallback, useEffect, useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';
import {
  ensureNarrativeIntelligenceSubsystem,
  getNarrativeIntelligenceReadyView,
  updateNarrativePlaygroundSelection,
  buildNarrativePlaygroundPreview,
  GENESIS_UPDATED_EVENT,
  type XniPlaygroundInput,
  type XniRoomPath,
} from '../studio-os-core/genesis';

export function useNarrativeIntelligenceState() {
  const location = useLocation();
  const [tick, setTick] = useState(0);
  const [playgroundOverride, setPlaygroundOverride] = useState<Partial<XniPlaygroundInput>>({});

  const refresh = useCallback(() => {
    ensureNarrativeIntelligenceSubsystem();
    setTick((n) => n + 1);
  }, []);

  useEffect(() => {
    ensureNarrativeIntelligenceSubsystem();
  }, []);

  useEffect(() => {
    const onUpdate = () => refresh();
    window.addEventListener(GENESIS_UPDATED_EVENT, onUpdate);
    return () => window.removeEventListener(GENESIS_UPDATED_EVENT, onUpdate);
  }, [refresh]);

  const view = useMemo(
    () =>
      getNarrativeIntelligenceReadyView({
        pathname: location.pathname,
        playground: playgroundOverride,
        brandId: playgroundOverride.brandId,
      }),
    [location.pathname, playgroundOverride, tick]
  );

  const setPlayground = useCallback(
    (partial: Partial<XniPlaygroundInput>) => {
      updateNarrativePlaygroundSelection(partial);
      setPlaygroundOverride((prev) => ({ ...prev, ...partial }));
      refresh();
    },
    [refresh]
  );

  const runPlaygroundPreview = useCallback(
    (input?: Partial<XniPlaygroundInput>) => {
      const merged = { ...view.playground, ...playgroundOverride, ...input };
      buildNarrativePlaygroundPreview(merged);
      refresh();
    },
    [view.playground, playgroundOverride, refresh]
  );

  const activeRoom = (location.pathname.split('/').pop() ?? 'narrative-intelligence') as XniRoomPath;

  return { view, activeRoom, setPlayground, runPlaygroundPreview, refresh };
}
