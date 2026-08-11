import { useEffect, useRef } from 'react';
import type { LoungeEngagementContentKey } from '../utils/loungeEngagementTypes';
import { qualifiedViewThresholdSec } from '../utils/loungeEngagementTypes';
import { postQualifiedEngagementView } from '../utils/loungeEngagementApi';
import { trackLoungeEngagementEvent } from '../utils/loungeEngagementAnalytics';

/**
 * Qualified view for read-format Slay Tips — accumulates active dwell seconds
 * (tab visible) until threshold; one POST per viewer session per mount.
 * Server dedupes within 7-day window (see lounge_record_qualified_view RPC).
 */
export function useSlayTipReadViewTracking(
  key: LoungeEngagementContentKey | null,
  options?: {
    enabled?: boolean;
    contentTitle?: string;
    /** Estimated read duration in seconds — drives threshold (min 15–30s). */
    durationSec?: number;
    onRecorded?: () => void;
  }
) {
  const recordedRef = useRef(false);
  const accumulatedRef = useRef(0);
  const onRecordedRef = useRef(options?.onRecorded);
  onRecordedRef.current = options?.onRecorded;
  const enabled = Boolean(key) && options?.enabled !== false;
  const durationSec = options?.durationSec ?? 60;
  const contentTitle = options?.contentTitle;

  useEffect(() => {
    recordedRef.current = false;
    accumulatedRef.current = 0;
    if (!enabled || !key) return;

    const threshold = qualifiedViewThresholdSec(durationSec);

    const tick = () => {
      if (document.hidden || recordedRef.current) return;
      accumulatedRef.current += 1;
      if (accumulatedRef.current < threshold) return;

      recordedRef.current = true;
      void postQualifiedEngagementView({
        contentType: key.contentType,
        contentId: key.contentId,
        watchSeconds: accumulatedRef.current,
        durationSeconds: durationSec,
      }).then((result) => {
        if (result.recorded) {
          trackLoungeEngagementEvent('lounge_content_view_qualified', {
            contentType: key.contentType,
            contentId: key.contentId,
            contentTitle,
          });
          onRecordedRef.current?.();
        }
      });
    };

    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, [enabled, key, contentTitle, durationSec]);
}
