import type { LoungeContentPack } from '../loungeTvContentPack';
import type { LoungeContentUnlock } from '../../../utils/slayTicketHistoryDisplay';

export type ExploreSectionId =
  | 'brand-films'
  | 'behind-brand'
  | 'trend-reports'
  | 'the-archive'
  | 'slay-cam'
  | 'product-reveals';

/** Explore category hub destinations — none shipped yet; headers stay non-navigable until wired. */
export type ExploreHubId = ExploreSectionId;

export const EXPLORE_HUB_DESTINATIONS: Partial<Record<ExploreSectionId, ExploreHubId>> = {};

export type ExploreSectionCommonProps = {
  onSelect: (pack: LoungeContentPack) => void;
  onToggleSave?: (pack: LoungeContentPack) => void;
  isUnlocked: (contentId: string) => boolean;
  unlocks?: LoungeContentUnlock[];
  onNavigateSection?: (sectionId: ExploreSectionId) => void;
  onOpenSlayForecast?: (editionId?: string) => void;
};

export type ExploreFeaturedStoryModel = {
  pack: LoungeContentPack;
  eyebrow: string;
  headline: string;
  subheadline?: string;
  description?: string;
  runtimeLabel?: string;
};

export type ExplorePlaceholderTile = {
  id: string;
  title: string;
  subtitle?: string;
  imageSrc: string;
  runtimeLabel?: string;
  categoryLabel?: string;
  comingSoon?: boolean;
  premiere?: boolean;
};

export type ExploreBrandFilmSlot =
  | { kind: 'pack'; pack: LoungeContentPack }
  | ({ kind: 'placeholder' } & ExplorePlaceholderTile);

export type ExploreBackstageTile =
  | { kind: 'pack'; pack: LoungeContentPack; tileTitle?: string }
  | ({ kind: 'placeholder' } & ExplorePlaceholderTile);

export type ExploreTrendTopicTile =
  | { kind: 'pack'; pack: LoungeContentPack; variant?: 'lead' | 'column' }
  | ({ kind: 'placeholder' } & ExplorePlaceholderTile & { variant?: 'column' });

export type ExploreSlayCamStoryTile =
  | { kind: 'pack'; pack: LoungeContentPack; note?: string }
  | ({ kind: 'placeholder' } & ExplorePlaceholderTile);

export type ExploreProductRevealSlot =
  | { kind: 'pack'; pack: LoungeContentPack; unitName: string }
  | ({ kind: 'placeholder'; unitId: string; unitName: string } & ExplorePlaceholderTile);
