import { useMemo } from 'react';
import type { LoungeContentUnlock } from '../../../utils/slayTicketHistoryDisplay';
import { LoungeTvBackButton } from '../LoungeTvUiPrimitives';
import type { PsaAnswerPresentationEntry } from './psaAnswersPresentation';
import { resolvePsaAnswerEditorial } from '../../../content/education/psa-answers/psaAnswerCatalog';
import { getContentPackById } from '../loungeTvContentPack';
import type { PSATodayEpisode } from '../psa-today/types';
import {
  PsaAnswerArticleRenderer,
  PsaAnswerMasthead,
  PsaAnswerRelatedFooter,
} from './PsaAnswerEditorialArticle';
import { PsaAnswerEngagementHost } from './PsaAnswerEngagementHost';
import {
  psaAnswerReadTimeLabel,
  resolvePsaAnswerModules,
} from './psaAnswerEditorialResolve';

type PsaAnswerViewerProps = {
  entry: PsaAnswerPresentationEntry;
  onBack: () => void;
  onViewRelatedAnswer: (entry: PsaAnswerPresentationEntry) => void;
  onViewRelatedPsa: (episode: PSATodayEpisode) => void;
  onViewDeeperSeason?: (seasonId: string) => void;
  onViewDeeperMastery?: (masteryId: string) => void;
  unlocks?: LoungeContentUnlock[];
  isUnlocked: (contentId: string) => boolean;
  onEngagementRequireSignIn?: () => void;
  isSignedInForEngagement?: boolean;
  engagementUserEmail?: string | null;
  engagementToast?: (message: string) => void;
};

export function PsaAnswerViewer({
  entry,
  onBack,
  onViewRelatedAnswer,
  onViewRelatedPsa,
  onViewDeeperSeason,
  onViewDeeperMastery,
  unlocks,
  isUnlocked,
  onEngagementRequireSignIn,
  isSignedInForEngagement = false,
  engagementUserEmail = null,
  engagementToast,
}: PsaAnswerViewerProps) {
  const pack = getContentPackById(entry.packId);
  const content = useMemo(() => resolvePsaAnswerEditorial(entry), [entry]);
  const modules = useMemo(() => resolvePsaAnswerModules(content), [content]);
  const readTime = psaAnswerReadTimeLabel(entry, content);
  const requireSignIn = onEngagementRequireSignIn ?? (() => {});

  if (!pack) return null;

  return (
    <div className="lounge-tv-psa-answer-viewer">
      <div className="lounge-tv-psa-answer-viewer__scroll lounge-tv-psa-answer-editorial">
        <LoungeTvBackButton onClick={onBack} />

        <PsaAnswerMasthead entry={entry} content={content} unlocks={unlocks} isUnlocked={isUnlocked} />

        <PsaAnswerArticleRenderer content={content} modules={modules} />

        <div className="lounge-tv-psa-answer-editorial__end-marker" aria-hidden />

        <PsaAnswerRelatedFooter
          entry={entry}
          content={content}
          onViewRelatedAnswer={onViewRelatedAnswer}
          onViewRelatedPsa={onViewRelatedPsa}
          onViewDeeperSeason={onViewDeeperSeason}
          onViewDeeperMastery={onViewDeeperMastery}
        />

        <PsaAnswerEngagementHost
          pack={pack}
          contentTitle={entry.displayQuestion}
          readTimeLabel={readTime}
          onRequireSignIn={requireSignIn}
          isSignedIn={isSignedInForEngagement}
          userEmail={engagementUserEmail}
          engagementToast={engagementToast}
        />
      </div>
    </div>
  );
}
