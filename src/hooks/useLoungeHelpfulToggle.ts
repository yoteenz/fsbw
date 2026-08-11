import { useCallback, useRef, useState } from 'react';
import type { LoungeEngagementContentKey, LoungeEngagementSummary } from '../utils/loungeEngagementTypes';
import { engagementItemKey } from '../utils/loungeEngagementTypes';
import { toggleEngagementHelpful } from '../utils/loungeEngagementApi';
import { trackLoungeEngagementEvent } from '../utils/loungeEngagementAnalytics';

export function useLoungeHelpfulToggle(args: {
  key: LoungeEngagementContentKey;
  summary?: LoungeEngagementSummary;
  contentTitle?: string;
  onRequireAuth: () => void;
  onPatch: (patch: Partial<LoungeEngagementSummary>) => void;
  onError?: (message: string) => void;
}) {
  const [pending, setPending] = useState(false);
  const lockRef = useRef(false);

  const helpfulActive = Boolean(args.summary?.viewerHelpful);
  const helpfulCount = args.summary?.helpfulCount ?? 0;

  const toggle = useCallback(async () => {
    if (lockRef.current || pending) return;

    lockRef.current = true;
    setPending(true);

    const prevActive = helpfulActive;
    const prevCount = helpfulCount;
    const nextActive = !prevActive;
    const nextCount = Math.max(0, prevCount + (nextActive ? 1 : -1));

    args.onPatch({
      viewerHelpful: nextActive,
      helpfulCount: nextCount,
    });

    try {
      const result = await toggleEngagementHelpful(args.key.contentType, args.key.contentId);
      if (!result) {
        args.onPatch({ viewerHelpful: prevActive, helpfulCount: prevCount });
        args.onRequireAuth();
        return;
      }

      args.onPatch({
        viewerHelpful: result.helpful,
        helpfulCount: result.helpfulCount,
      });

      trackLoungeEngagementEvent(
        result.helpful ? 'lounge_content_helpful_added' : 'lounge_content_helpful_removed',
        {
          contentType: args.key.contentType,
          contentId: args.key.contentId,
          contentTitle: args.contentTitle,
        }
      );
    } catch {
      args.onPatch({ viewerHelpful: prevActive, helpfulCount: prevCount });
      args.onError?.('Could not update Helpful. Try again.');
    } finally {
      lockRef.current = false;
      setPending(false);
    }
  }, [args, helpfulActive, helpfulCount, pending]);

  return {
    helpfulActive,
    helpfulCount,
    pending,
    toggle,
    itemKey: engagementItemKey(args.key),
  };
}
