import { useCallback, useMemo, useRef, useState } from 'react';
import type { LoungeContentPack } from '../loungeTvContentPack';
import { engagementItemKey, engagementKeyForPack } from '../../../utils/loungeEngagementTypes';
import { useLoungeEngagementSummaries } from '../../../hooks/useLoungeEngagementSummaries';
import { useLoungeHelpfulToggle } from '../../../hooks/useLoungeHelpfulToggle';
import { useSlayTipReadViewTracking } from '../../../hooks/useSlayTipReadViewTracking';
import { trackLoungeEngagementEvent } from '../../../utils/loungeEngagementAnalytics';
import { isPackSaved, togglePackSaved, LOUNGE_TV_LIBRARY_UPDATED_EVENT } from '../../../utils/loungeTvLibrary';
import { isAdminEmail } from '../../../utils/adminAuth';
import { LoungeEngagementBar } from '../engagement/LoungeEngagementBar';
import { LoungeDiscussionPanel } from '../engagement/LoungeDiscussionPanel';
import { useEffect } from 'react';

function estimateReadDurationSec(readTimeLabel?: string): number {
  if (readTimeLabel?.trim()) {
    const match = readTimeLabel.match(/(\d+)/);
    if (match) return Math.max(45, Number(match[1]) * 60);
  }
  return 90;
}

type PsaAnswerEngagementHostProps = {
  pack: LoungeContentPack;
  contentTitle: string;
  readTimeLabel?: string;
  onRequireSignIn: () => void;
  isSignedIn?: boolean;
  userEmail?: string | null;
  engagementToast?: (message: string) => void;
};

export function PsaAnswerEngagementHost({
  pack,
  contentTitle,
  readTimeLabel,
  onRequireSignIn,
  isSignedIn = false,
  userEmail = null,
  engagementToast,
}: PsaAnswerEngagementHostProps) {
  const key = useMemo(() => engagementKeyForPack(pack.id), [pack.id]);
  const items = useMemo(() => [key], [key]);
  const { map, patchSummary } = useLoungeEngagementSummaries(items);
  const summary = map.get(engagementItemKey(key));
  const [discussionOpen, setDiscussionOpen] = useState(false);
  const [, setSaveRevision] = useState(0);
  const readDurationSec = useMemo(() => estimateReadDurationSec(readTimeLabel), [readTimeLabel]);

  useEffect(() => {
    const onLibraryUpdated = () => setSaveRevision((n) => n + 1);
    window.addEventListener(LOUNGE_TV_LIBRARY_UPDATED_EVENT, onLibraryUpdated);
    return () => window.removeEventListener(LOUNGE_TV_LIBRARY_UPDATED_EVENT, onLibraryUpdated);
  }, []);

  const onPatch = useCallback(
    (patch: Parameters<typeof patchSummary>[1]) => patchSummary(key, patch),
    [key, patchSummary],
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
    enabled: true,
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
    togglePackSaved(pack.id);
    trackLoungeEngagementEvent('lounge_content_saved', {
      contentType: key.contentType,
      contentId: key.contentId,
      contentTitle,
    });
  }, [contentTitle, key.contentId, key.contentType, pack.id]);

  return (
    <>
      {!discussionOpen ? (
        <div className="lounge-tv-psa-answer-editorial__engagement-wrap">
          <p className="lounge-tv-psa-answer-editorial__helpful-prompt">WAS THIS ANSWER HELPFUL?</p>
          <LoungeEngagementBar
            variant="editorial"
            helpfulLabel="HELPFUL"
            contentTitle={contentTitle}
            summary={mergedSummary}
            saved={isPackSaved(pack.id)}
            helpfulActive={helpfulActive}
            helpfulPending={pending}
            onHelpfulToggle={() => void toggle()}
            onCommentsOpen={() => setDiscussionOpen(true)}
            onSaveToggle={handleSave}
          />
        </div>
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
