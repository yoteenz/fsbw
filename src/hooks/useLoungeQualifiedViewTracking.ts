import { useCallback, useEffect, useRef } from 'react';
import type { LoungeEngagementContentKey } from '../utils/loungeEngagementTypes';
import { qualifiedViewThresholdSec } from '../utils/loungeEngagementTypes';
import { postQualifiedEngagementView } from '../utils/loungeEngagementApi';
import { trackLoungeEngagementEvent } from '../utils/loungeEngagementAnalytics';

type PlaybackSample = {
  currentTimeSec: number;
  playing: boolean;
  durationSec: number;
};

/**
 * Records engagement qualified views after meaningful playback.
 * Separate from PSA access watch consumption — pass only when NOT metering access watches,
 * or always for generic content packs.
 */
export function useLoungeQualifiedViewTracking(
  key: LoungeEngagementContentKey | null,
  options?: {
    enabled?: boolean;
    contentTitle?: string;
    /** When true, skip recording (e.g. during PSA Camera B access metering-only phase). */
    suppress?: boolean;
  }
) {
  const recordedRef = useRef(false);
  const maxWatchedRef = useRef(0);
  const enabled = options?.enabled !== false && key != null && !options?.suppress;

  useEffect(() => {
    recordedRef.current = false;
    maxWatchedRef.current = 0;
  }, [key?.contentType, key?.contentId, enabled]);

  const onSample = useCallback(
    (sample: PlaybackSample) => {
      if (!enabled || !key || recordedRef.current) return;
      if (!Number.isFinite(sample.currentTimeSec)) return;

      maxWatchedRef.current = Math.max(maxWatchedRef.current, sample.currentTimeSec);
      const durationSec =
        Number.isFinite(sample.durationSec) && sample.durationSec > 0 ? sample.durationSec : 0;
      const threshold = qualifiedViewThresholdSec(durationSec);

      if (maxWatchedRef.current < threshold) return;

      recordedRef.current = true;
      void postQualifiedEngagementView({
        contentType: key.contentType,
        contentId: key.contentId,
        watchSeconds: Math.floor(maxWatchedRef.current),
        durationSeconds: Math.floor(durationSec),
      }).then((result) => {
        if (result.recorded) {
          trackLoungeEngagementEvent('lounge_content_view_qualified', {
            contentType: key.contentType,
            contentId: key.contentId,
            contentTitle: options?.contentTitle,
          });
        }
      });
    },
    [enabled, key, options?.contentTitle]
  );

  return { onSample };
}
