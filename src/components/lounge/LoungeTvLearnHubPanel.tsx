import type { LoungeContentPack } from './loungeTvContentPack';
import type { LoungeContentUnlock } from '../../utils/slayTicketHistoryDisplay';
import type { SlayTip } from '../../content/education/types';
import type { LearnHubId } from './education/learnHubTypes';
import { PSA_TODAY_LEARN_UMBRELLA } from '../../content/education/hierarchy/masteryTracks';
import {
  PSA_ANSWERS_SECTION_TAGLINE,
} from './education/psaAnswersPresentation';
import {
  PRODUCT_EDUCATION_SECTION_TAGLINE,
} from './education/productEducationPresentation';
import { SLAY_TIPS_DISCOVERY_TAGLINE } from './slay-tips/slayTipDiscoveryMeta';
import { getSlayTipsForLearnRail } from '../../content/education';
import { LearnHubShell } from './education/LearnHubShell';
import { PsaTodayLearnSection } from './education/PsaTodayLearnSection';
import { PsaAnswersLearnSection } from './education/PsaAnswersLearnSection';
import { ProductEducationLearnSection } from './education/ProductEducationLearnSection';
import { SlayTipRow } from './slay-tips/SlayTipRow';
import type { PsaAnswerPresentationEntry } from './education/psaAnswersPresentation';
import type { ProductBreakdownPresentationEntry } from './education/productBreakdownPresentation';
import { loungeTvGlassCqw } from './loungeTvResponsive';
import { LOUNGE_TV_FONT_DEMI, LOUNGE_TV_TEXT_WHITE } from './loungeTvTheme';
import { MASTERY_PANEL_TYPE_META_PLUS_1 } from './education/LearnMasterySelector';
import { listMasteryTrackPresentations } from '../../content/education/hierarchy/masteryTracks';

type LoungeTvLearnHubPanelProps = {
  hub: LearnHubId;
  onBack: () => void;
  onSelectMastery: (masteryId: string) => void;
  onSelectEpisode: (episodeId: string) => void;
  onSelectSlayTip: (tip: SlayTip) => void;
  onSelectPsaAnswer: (entry: PsaAnswerPresentationEntry) => void;
  onSelectPack: (pack: LoungeContentPack) => void;
  onOpenProductBreakdown?: (entry: ProductBreakdownPresentationEntry) => void;
  onToggleSave?: (pack: LoungeContentPack) => void;
  onOpenCareLibrary?: () => void;
  isUnlocked: (contentId: string) => boolean;
  unlocks?: LoungeContentUnlock[];
  onEngagementRequireSignIn?: () => void;
  onEngagementOpenSlayTipDiscussion?: (tip: SlayTip) => void;
  engagementToast?: (message: string) => void;
};

function PsaTodayHubMeta() {
  const tracks = listMasteryTrackPresentations();
  const totalEpisodes = tracks.reduce((sum, track) => sum + track.episodeCount, 0);
  return (
    <p
      style={{
        margin: `${loungeTvGlassCqw(0.55, 1.2, 2.4)} 0 0`,
        fontFamily: LOUNGE_TV_FONT_DEMI,
        fontSize: MASTERY_PANEL_TYPE_META_PLUS_1,
        color: LOUNGE_TV_TEXT_WHITE,
        letterSpacing: '0.04em',
      }}
    >
      {tracks.length} MASTERIES · {totalEpisodes} EPISODES · FULL CURRICULUM
    </p>
  );
}

export function LoungeTvLearnHubPanel({
  hub,
  onBack,
  onSelectMastery,
  onSelectEpisode,
  onSelectSlayTip,
  onSelectPsaAnswer,
  onSelectPack,
  onOpenProductBreakdown,
  onToggleSave,
  onOpenCareLibrary,
  isUnlocked,
  unlocks,
  onEngagementRequireSignIn,
  onEngagementOpenSlayTipDiscussion,
  engagementToast,
}: LoungeTvLearnHubPanelProps) {
  if (hub === 'psa-today') {
    return (
      <LearnHubShell
        title={PSA_TODAY_LEARN_UMBRELLA.title}
        tagline={PSA_TODAY_LEARN_UMBRELLA.tagline}
        onBack={onBack}
        railId="learn-hub-psa-today"
      >
        <PsaTodayHubMeta />
        <PsaTodayLearnSection
          surface="hub"
          onSelectMastery={onSelectMastery}
          onSelectEpisode={onSelectEpisode}
        />
      </LearnHubShell>
    );
  }

  if (hub === 'slay-tips') {
    return (
      <LearnHubShell
        title="SLAY TIPS"
        tagline={SLAY_TIPS_DISCOVERY_TAGLINE}
        onBack={onBack}
        railId="learn-hub-slay-tips"
      >
        <SlayTipRow
          title="SLAY TIPS"
          tips={getSlayTipsForLearnRail('slay-tips')}
          onSelect={onSelectSlayTip}
          unlocks={unlocks}
          isUnlocked={isUnlocked}
          railId="slay-tips"
          embeddedSection
          discoveryBoard
          surface="hub"
          onEngagementRequireSignIn={onEngagementRequireSignIn}
          onEngagementOpenSlayTipDiscussion={onEngagementOpenSlayTipDiscussion}
          engagementToast={engagementToast}
        />
      </LearnHubShell>
    );
  }

  if (hub === 'psa-answers') {
    return (
      <LearnHubShell
        title="PSA ANSWERS"
        tagline={PSA_ANSWERS_SECTION_TAGLINE}
        onBack={onBack}
        railId="learn-hub-psa-answers"
      >
        <PsaAnswersLearnSection
          surface="hub"
          onSelectEntry={onSelectPsaAnswer}
          isUnlocked={isUnlocked}
          unlocks={unlocks}
          onEngagementRequireSignIn={onEngagementRequireSignIn}
          engagementToast={engagementToast}
        />
      </LearnHubShell>
    );
  }

  return (
    <LearnHubShell
      title="PRODUCT EDUCATION"
      tagline={PRODUCT_EDUCATION_SECTION_TAGLINE}
      onBack={onBack}
      railId="learn-hub-product-breakdown"
    >
      <ProductEducationLearnSection
        surface="hub"
        onSelectPack={onSelectPack}
        onOpenProductBreakdown={onOpenProductBreakdown}
        onToggleSave={onToggleSave}
        onOpenCareLibrary={onOpenCareLibrary}
      />
    </LearnHubShell>
  );
}
