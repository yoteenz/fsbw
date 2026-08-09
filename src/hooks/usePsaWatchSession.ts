import { useCallback, useEffect, useRef, useState } from 'react';
import type { PSAEpisodeEntitlement, PSATodayEpisode, PSAWatchSession } from '../components/lounge/psa-today/types';
import {
  closePsaWatchSessionApi,
  startPsaWatchSessionApi,
  syncPsaWatchSessionApi,
} from '../components/lounge/psa-today/psaTodayEntitlementApi';
import {
  createWatchMeterState,
  shouldConsumeWatch,
  tickWatchMeter,
  type WatchMeterTickInput,
} from '../components/lounge/psa-today/psaWatchMetering';
import { qualificationThresholdSeconds, resolvePsaWatchPolicy } from '../components/lounge/psa-today/psaWatchPolicy';
import { trackPsaTodayEvent } from '../components/lounge/psa-today/psaTodayAnalytics';

export type WatchPlaybackSample = {
  currentTimeSec: number;
  playing: boolean;
  seeking: boolean;
  buffering: boolean;
};

type UsePsaWatchSessionArgs = {
  episode: PSATodayEpisode;
  entitlement: PSAEpisodeEntitlement | null;
  enabled: boolean;
  lessonDurationSeconds: number;
  onEntitlementUpdate?: (ent: PSAEpisodeEntitlement) => void;
};

export function usePsaWatchSession({
  episode,
  entitlement,
  enabled,
  lessonDurationSeconds,
  onEntitlementUpdate,
}: UsePsaWatchSessionArgs) {
  const policy = resolvePsaWatchPolicy(episode);
  const thresholdSec = qualificationThresholdSeconds(lessonDurationSeconds, policy.qualificationPercent);
  const meterRef = useRef(createWatchMeterState(entitlement?.pendingWatchSeconds ?? 0));
  const [session, setSession] = useState<PSAWatchSession | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const consumeInFlightRef = useRef(false);
  const syncInFlightRef = useRef(false);
  const lastSyncRef = useRef(0);

  const startSession = useCallback(async () => {
    if (!entitlement || !enabled) return null;
    const started = await startPsaWatchSessionApi({
      episodeId: episode.id,
      entitlementId: entitlement.id,
      qualificationThresholdSeconds: thresholdSec,
    });
    if (started) {
      meterRef.current = createWatchMeterState(entitlement.pendingWatchSeconds ?? 0);
      setSession(started);
      trackPsaTodayEvent('psa_watch_session_started', {
        episodeId: episode.id,
        entitlementId: entitlement.id,
        sessionId: started.sessionId,
        thresholdSeconds: thresholdSec,
      });
    }
    return started;
  }, [enabled, entitlement, episode.id, thresholdSec]);

  useEffect(() => {
    if (!enabled || !entitlement) return;
    void startSession();
    return () => {
      if (session?.sessionId) void closePsaWatchSessionApi(session.sessionId);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- start once per paid lesson mount
  }, [enabled, entitlement?.id]);

  const handleSample = useCallback(
    (sample: WatchPlaybackSample) => {
      if (!enabled || !session || !entitlement) return;

      const tabVisible = typeof document === 'undefined' ? true : document.visibilityState === 'visible';
      const input: WatchMeterTickInput = {
        currentTimeSec: sample.currentTimeSec,
        playing: sample.playing,
        seeking: sample.seeking,
        buffering: sample.buffering,
        tabVisible,
      };

      meterRef.current = tickWatchMeter(meterRef.current, input, thresholdSec);

      const accumulated = meterRef.current.accumulatedSec;
      const pending = entitlement.pendingWatchSeconds ?? 0;
      const qualified = session.qualified || meterRef.current.qualified;

      if (
        shouldConsumeWatch(pending, accumulated, thresholdSec, qualified) &&
        !consumeInFlightRef.current
      ) {
        consumeInFlightRef.current = true;
        void syncPsaWatchSessionApi({
          sessionId: session.sessionId,
          actualWatchedSeconds: accumulated,
          consumeIfQualified: true,
        }).then((result) => {
          consumeInFlightRef.current = false;
          if (!result) return;
          setSession(result.session);
          onEntitlementUpdate?.(result.entitlement);
          if (result.watchConsumed) {
            trackPsaTodayEvent('psa_watch_consumed', {
              episodeId: episode.id,
              entitlementId: result.entitlement.id,
              sessionId: session.sessionId,
              watchesRemaining: result.entitlement.watchesRemaining,
              actualWatchedSeconds: accumulated,
              thresholdSeconds: thresholdSec,
            });
            if (result.entitlement.watchesRemaining > 0) {
              setToast(`1 WATCH USED · ${result.entitlement.watchesRemaining} REMAINING`);
              window.setTimeout(() => setToast(null), 3200);
            } else {
              trackPsaTodayEvent('psa_watch_limit_reached', {
                episodeId: episode.id,
                entitlementId: result.entitlement.id,
              });
            }
          }
        });
        return;
      }

      const now = Date.now();
      if (now - lastSyncRef.current < 8000) return;
      if (syncInFlightRef.current || qualified) return;
      lastSyncRef.current = now;
      syncInFlightRef.current = true;
      void syncPsaWatchSessionApi({
        sessionId: session.sessionId,
        actualWatchedSeconds: accumulated,
        consumeIfQualified: false,
      }).then((result) => {
        syncInFlightRef.current = false;
        if (!result) return;
        setSession(result.session);
        onEntitlementUpdate?.(result.entitlement);
        trackPsaTodayEvent('psa_watch_threshold_progress', {
          episodeId: episode.id,
          entitlementId: result.entitlement.id,
          sessionId: session.sessionId,
          actualWatchedSeconds: accumulated,
          thresholdSeconds: thresholdSec,
        });
      });
    },
    [enabled, session, entitlement, thresholdSec, episode.id, onEntitlementUpdate]
  );

  useEffect(() => {
    if (!session?.sessionId) return;
    return () => {
      void closePsaWatchSessionApi(session.sessionId).then(() => {
        trackPsaTodayEvent('psa_watch_session_ended', {
          episodeId: episode.id,
          sessionId: session.sessionId,
        });
      });
    };
  }, [session?.sessionId, episode.id]);

  return {
    session,
    thresholdSec,
    toast,
    handleSample,
    actualWatchedSeconds: meterRef.current.accumulatedSec,
    startSession,
  };
}
