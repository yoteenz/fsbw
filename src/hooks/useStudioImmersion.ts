import { useCallback, useEffect, useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { FOUNDER_DISPLAY_NAME } from '../studio-os-core/command-dock/constants';
import { useOrganizationContextOptional } from '../studio-os-core/organization-context';
import {
  buildChiefConciergeBrief,
  getActiveScreenMoment,
  getPresenceActivity,
  getPresenceActivities,
  resolveStudioRoomVariant,
} from '../studio-os-core/studio-immersion/engine';

export function useStudioImmersion() {
  const { pathname } = useLocation();
  const org = useOrganizationContextOptional();
  const [tick, setTick] = useState(0);
  const [presencePaused, setPresencePaused] = useState(false);

  useEffect(() => {
    if (presencePaused) return;
    const id = window.setInterval(() => setTick((t) => t + 1), 7000);
    return () => window.clearInterval(id);
  }, [presencePaused]);

  const togglePresencePause = useCallback(() => setPresencePaused((p) => !p), []);

  const orgBriefContext = useMemo(
    () =>
      org
        ? {
            moduleTenantId: org.moduleTenantId,
            organizationName: org.organizationName,
            founderName: FOUNDER_DISPLAY_NAME,
          }
        : undefined,
    [org]
  );

  const roomVariant = useMemo(() => resolveStudioRoomVariant(pathname), [pathname]);
  const chiefBrief = useMemo(
    () => buildChiefConciergeBrief(pathname, orgBriefContext),
    [pathname, orgBriefContext]
  );
  const screenMoment = useMemo(() => getActiveScreenMoment(pathname), [pathname]);
  const primaryPresence = useMemo(() => getPresenceActivity(tick), [tick]);
  const presenceFeed = useMemo(() => getPresenceActivities(4, tick), [tick]);

  return {
    pathname,
    roomVariant,
    chiefBrief,
    screenMoment,
    primaryPresence,
    presenceFeed,
    tick,
    presencePaused,
    togglePresencePause,
  };
}
