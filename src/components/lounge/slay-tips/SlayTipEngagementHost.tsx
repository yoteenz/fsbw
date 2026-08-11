import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { SlayTip } from '../../../content/education/types';
import { engagementItemKey, engagementKeyForSlayTip } from '../../../utils/loungeEngagementTypes';
import { useLoungeEngagementSummaries } from '../../../hooks/useLoungeEngagementSummaries';
import { useLoungeHelpfulToggle } from '../../../hooks/useLoungeHelpfulToggle';
import { useSlayTipReadViewTracking } from '../../../hooks/useSlayTipReadViewTracking';
import { trackLoungeEngagementEvent } from '../../../utils/loungeEngagementAnalytics';
import { LOUNGE_TV_LIBRARY_UPDATED_EVENT } from '../../../utils/loungeTvLibrary';
import { isAdminEmail } from '../../../utils/adminAuth';
import { LoungeEngagementBar } from '../engagement/LoungeEngagementBar';
import { LoungeDiscussionPanel } from '../engagement/LoungeDiscussionPanel';
import { isSlayTipSaved, toggleSlayTipSaved } from './slayTipDiscoveryMeta';
import { slayTipPublicTitle } from './slayTipContent';

function estimateSlayTipReadDurationSec(tip: SlayTip): number {
  if (tip.readTime?.trim()) {
    const match = tip.readTime.match(/(\d+)/);
    if (match) return Math.max(45, Number(match[1]) * 60);
  }
  const modules = tip.modules ?? [];
  const pages = tip.pages ?? [];
  const wordCount = (modules.length ? modules : pages)
    .flatMap((entry) => {
      if ('type' in entry) {
        const m = entry;
        if (m.type === 'quickRead' || m.type === 'takeaway' || m.type === 'callout') return [m.body];
        if (m.type === 'text') return [m.heading, m.body];
        if (m.type === 'slayerNote') return [m.body];
        if (m.type === 'lookCloser') return m.items.flatMap((i) => [i.label, i.caption]);
        if (m.type === 'diagnosticRow') return [m.seeing, m.notToDo, m.move];
        return [];
      }
      return [entry.heading, entry.body, entry.callout];
    })
    .filter(Boolean)
    .join(' ')
    .split(/\s+/)
    .filter(Boolean).length;
  return Math.max(45, Math.ceil(wordCount / 2.5));
}

type SlayTipEngagementHostProps = {
  tip: SlayTip;
  /** Track qualified views while viewer is open. */
  trackViews?: boolean;
  onRequireSignIn: () => void;
  isSignedIn?: boolean;
  userEmail?: string | null;
  engagementToast?: (message: string) => void;
};

export function SlayTipEngagementHost({
  tip,
  trackViews = true,
  onRequireSignIn,
  isSignedIn = false,
  userEmail = null,
  engagementToast,
}: SlayTipEngagementHostProps) {
  const key = useMemo(() => engagementKeyForSlayTip(tip), [tip]);
  const items = useMemo(() => [key], [key]);
  const { map, patchSummary } = useLoungeEngagementSummaries(items);
  const summary = map.get(engagementItemKey(key));
  const [discussionOpen, setDiscussionOpen] = useState(false);
  const [, setSaveRevision] = useState(0);
  const contentTitle = slayTipPublicTitle(tip);
  const readDurationSec = useMemo(() => estimateSlayTipReadDurationSec(tip), [tip]);

  useEffect(() => {
    const onLibraryUpdated = () => setSaveRevision((n) => n + 1);
    window.addEventListener(LOUNGE_TV_LIBRARY_UPDATED_EVENT, onLibraryUpdated);
    return () => window.removeEventListener(LOUNGE_TV_LIBRARY_UPDATED_EVENT, onLibraryUpdated);
  }, []);

  const onPatch = useCallback(
    (patch: Parameters<typeof patchSummary>[1]) => patchSummary(key, patch),
    [key, patchSummary]
  );

  const viewCountRef = useRef(summary?.qualifiedViewCount ?? 0);
  viewCountRef.current = summary?.qualifiedViewCount ?? 0;

  const { helpfulActive, helpfulCount, pending, toggle } = useLoungeHelpfulToggle({
    key,
    summary,
    contentTitle,
    onRequireAuth: onRequireSignIn,
    onPatch,
    onError: (msg) => engagementToast?.(msg),
  });

  useSlayTipReadViewTracking(key, {
    enabled: trackViews,
    contentTitle,
    durationSec: readDurationSec,
    onRecorded: () => {
      onPatch({ qualifiedViewCount: viewCountRef.current + 1 });
    },
  });

  const mergedSummary = summary
    ? { ...summary, helpfulCount, viewerHelpful: helpfulActive }
    : {
        contentType: key.contentType,
        contentId: key.contentId,
        qualifiedViewCount: 0,
        helpfulCount,
        commentCount: 0,
        viewerHelpful: helpfulActive,
      };

  const handleSave = useCallback(() => {
    toggleSlayTipSaved(tip);
    trackLoungeEngagementEvent('lounge_content_saved', {
      contentType: key.contentType,
      contentId: key.contentId,
      contentTitle,
    });
  }, [contentTitle, key.contentId, key.contentType, tip]);

  return (
    <>
      {!discussionOpen ? (
        <LoungeEngagementBar
          variant="editorial"
          helpfulLabel="LIKE"
          contentTitle={contentTitle}
          summary={mergedSummary}
          saved={isSlayTipSaved(tip)}
          helpfulActive={helpfulActive}
          helpfulPending={pending}
          onHelpfulToggle={() => void toggle()}
          onCommentsOpen={() => setDiscussionOpen(true)}
          onSaveToggle={handleSave}
        />
      ) : null}

      <LoungeDiscussionPanel
        open={discussionOpen}
        onClose={() => setDiscussionOpen(false)}
        contentKey={key}
        contentTitle={contentTitle}
        onRequireAuth={onRequireSignIn}
        isAdmin={Boolean(isSignedIn && userEmail && isAdminEmail(userEmail))}
        variant="slay-tip"
        onCommentCountChange={(count) => onPatch({ commentCount: count })}
      />
    </>
  );
}
