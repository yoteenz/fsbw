import { useCallback, useMemo, useState } from 'react';
import type { LoungeContentPack } from '../loungeTvContentPack';
import { engagementKeyForPack } from '../../../utils/loungeEngagementTypes';
import { engagementItemKey } from '../../../utils/loungeEngagementTypes';
import { useLoungeEngagementSummaries } from '../../../hooks/useLoungeEngagementSummaries';
import { useLoungeHelpfulToggle } from '../../../hooks/useLoungeHelpfulToggle';
import { isPackSaved, togglePackSaved } from '../../../utils/loungeTvLibrary';
import { trackLoungeEngagementEvent } from '../../../utils/loungeEngagementAnalytics';
import { LoungeEngagementBar } from './LoungeEngagementBar';
import { LoungeEngagementMetaRow } from './LoungeEngagementMetaRow';
import { LoungeDiscussionPanel } from './LoungeDiscussionPanel';
import { isAdminEmail } from '../../../utils/adminAuth';

type LoungeTvPackEngagementHostProps = {
  pack: LoungeContentPack;
  variant: 'bar' | 'meta';
  onRequireSignIn: () => void;
  isSignedIn?: boolean;
  userEmail?: string | null;
  engagementToast?: (message: string) => void;
};

export function LoungeTvPackEngagementHost({
  pack,
  variant,
  onRequireSignIn,
  isSignedIn = false,
  userEmail = null,
  engagementToast,
}: LoungeTvPackEngagementHostProps) {
  const key = useMemo(() => engagementKeyForPack(pack.id), [pack.id]);
  const items = useMemo(() => [key], [key]);
  const { map, patchSummary } = useLoungeEngagementSummaries(items);
  const summary = map.get(engagementItemKey(key));
  const [discussionOpen, setDiscussionOpen] = useState(false);
  const [saved, setSaved] = useState(() => isPackSaved(pack.id));

  const onPatch = useCallback(
    (patch: Parameters<typeof patchSummary>[1]) => patchSummary(key, patch),
    [key, patchSummary]
  );

  const { helpfulActive, helpfulCount, pending, toggle } = useLoungeHelpfulToggle({
    key,
    summary,
    contentTitle: pack.title,
    onRequireAuth: onRequireSignIn,
    onPatch,
    onError: (msg) => engagementToast?.(msg),
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

  const openDiscussion = useCallback(() => {
    setDiscussionOpen(true);
  }, []);

  const handleSave = useCallback(() => {
    togglePackSaved(pack.id);
    setSaved(isPackSaved(pack.id));
    trackLoungeEngagementEvent('lounge_content_saved', {
      contentType: key.contentType,
      contentId: key.contentId,
      contentTitle: pack.title,
    });
  }, [key.contentId, key.contentType, pack.id, pack.title]);

  return (
    <>
      {variant === 'bar' ? (
        <LoungeEngagementBar
          contentTitle={pack.title}
          summary={mergedSummary}
          saved={saved}
          helpfulActive={helpfulActive}
          helpfulPending={pending}
          onHelpfulToggle={() => void toggle()}
          onCommentsOpen={openDiscussion}
          onSaveToggle={handleSave}
        />
      ) : (
        <LoungeEngagementMetaRow
          contentTitle={pack.title}
          summary={mergedSummary}
          helpfulActive={helpfulActive}
          helpfulPending={pending}
          onHelpfulClick={() => void toggle()}
          onCommentsClick={openDiscussion}
        />
      )}

      <LoungeDiscussionPanel
        open={discussionOpen}
        onClose={() => setDiscussionOpen(false)}
        contentKey={key}
        contentTitle={pack.title}
        onRequireAuth={onRequireSignIn}
        isAdmin={Boolean(isSignedIn && userEmail && isAdminEmail(userEmail))}
        onCommentCountChange={(count) => onPatch({ commentCount: count })}
      />
    </>
  );
}
