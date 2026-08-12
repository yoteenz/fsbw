import { useCallback, useRef, useState } from 'react';
import type { LoungeEngagementContentKey, LoungeEngagementSummary } from '../utils/loungeEngagementTypes';
import { engagementItemKey } from '../utils/loungeEngagementTypes';
import { toggleEngagementHelpful } from '../utils/loungeEngagementApi';
import { trackLoungeEngagementEvent } from '../utils/loungeEngagementAnalytics';
import {
  clearLearnBrowseLocalHelpful,
  isLearnBrowseLocallyHelpful,
  toggleLearnBrowseLocalHelpful,
} from '../utils/learnBrowseLocalHelpful';

export function useLoungeHelpfulToggle(args: {
  key: LoungeEngagementContentKey;
  summary?: LoungeEngagementSummary;
  contentTitle?: string;
  onRequireAuth: () => void;
  onPatch: (patch: Partial<LoungeEngagementSummary>) => void;
  onError?: (message: string) => void;
  /** Learn browse cards — persist likes locally when signed out (no sign-in modal). */
  allowAnonymousLocal?: boolean;
}) {
  const [pending, setPending] = useState(false);
  const lockRef = useRef(false);

  const helpfulActive =
    typeof args.summary?.viewerHelpful === 'boolean'
      ? args.summary.viewerHelpful
      : args.allowAnonymousLocal
        ? isLearnBrowseLocallyHelpful(args.key)
        : false;
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
        if (args.allowAnonymousLocal) {
          const localActive = toggleLearnBrowseLocalHelpful(args.key);
          args.onPatch({
            viewerHelpful: localActive,
            helpfulCount: prevCount,
          });
          trackLoungeEngagementEvent(
            localActive ? 'lounge_content_helpful_added' : 'lounge_content_helpful_removed',
            {
              contentType: args.key.contentType,
              contentId: args.key.contentId,
              contentTitle: args.contentTitle,
            }
          );
          return;
        }
        args.onPatch({ viewerHelpful: prevActive, helpfulCount: prevCount });
        args.onRequireAuth();
        return;
      }

      args.onPatch({
        viewerHelpful: result.helpful,
        helpfulCount: result.helpfulCount,
      });

      clearLearnBrowseLocalHelpful(args.key);

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
