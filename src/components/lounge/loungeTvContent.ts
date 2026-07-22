import {
  contentPacksForExploreSection,
  contentPacksForLearningPath,
  getContentPackById,
  LOUNGE_TV_CONTENT_PACKS,
  type LoungeContentPack,
} from './loungeTvContentPack';
import {
  LOUNGE_TV_CONTENT_VIDEO_SRC,
  LOUNGE_TV_PLUCKING_LACE_TILE_ID,
} from './loungeTvAssets';

export type LoungeTvMainTab = 'featured' | 'learn' | 'explore' | 'live' | 'library';

export type LoungeTvSidebarItem = {
  id: string;
  label: string;
};

export type LoungeTvContentFormat = 'video' | 'blog';

export type LoungeTvAccessType = 'permanent' | 'rental';

/** Legacy tile shape — maps from {@link LoungeContentPack} for ticket/unlock flows. */
export type LoungeTvVideoTile = {
  id: string;
  title: string;
  isNew?: boolean;
  thumbSrc?: string;
  videoSrc?: string;
  durationLabel?: string;
  description?: string;
  body?: string;
  format?: LoungeTvContentFormat;
  attachmentSrc?: string;
  attachmentType?: 'image' | 'video';
  ticketCost?: number;
  accessType?: LoungeTvAccessType;
  isFreePreview?: boolean;
  isPremium?: boolean;
  /** Full content pack when resolved from catalog. */
  contentPack?: LoungeContentPack;
};

export const LOUNGE_TV_MAIN_TABS: { id: LoungeTvMainTab; label: string }[] = [
  { id: 'featured', label: 'FEATURED' },
  { id: 'learn', label: 'LEARN' },
  { id: 'explore', label: 'EXPLORE' },
  { id: 'live', label: 'LIVE' },
  { id: 'library', label: 'LIBRARY' },
];

export const LOUNGE_TV_SIDEBAR: Record<LoungeTvMainTab, LoungeTvSidebarItem[]> = {
  featured: [],
  learn: [
    { id: 'lace-mastery', label: 'LACE MASTERY' },
    { id: 'install-pro', label: 'INSTALL LIKE A PRO' },
    { id: 'hair-care', label: 'HAIR CARE' },
    { id: 'styling-academy', label: 'STYLING ACADEMY' },
    { id: 'color-lab', label: 'COLOR LAB' },
    { id: 'baw-academy', label: 'BUILD-A-WIG ACADEMY' },
    { id: 'beginner-essentials', label: 'BEGINNER ESSENTIALS' },
    { id: 'advanced-techniques', label: 'ADVANCED TECHNIQUES' },
  ],
  explore: [
    { id: 'brand-films', label: 'BRAND FILMS' },
    { id: 'behind-brand', label: 'BEHIND FRONTAL SLAYER' },
    { id: 'trend-reports', label: 'TREND REPORTS' },
    { id: 'slay-cam', label: 'SLAY CAM STORIES' },
    { id: 'transformation-diaries', label: 'TRANSFORMATION DIARIES' },
    { id: 'product-reveals', label: 'PRODUCT REVEALS' },
    { id: 'founder-stories', label: 'FOUNDER STORIES' },
    { id: 'texture-spotlights', label: 'TEXTURE SPOTLIGHTS' },
    { id: 'customer-favorites', label: 'CUSTOMER FAVORITES' },
    { id: 'luxury-hair-science', label: 'LUXURY HAIR SCIENCE' },
    { id: 'psa-sessions', label: 'PSA SESSIONS' },
  ],
  live: [
    { id: 'upcoming-classes', label: 'UPCOMING CLASSES' },
    { id: 'psa-live-qa', label: 'PSA LIVE Q&A' },
    { id: 'product-premieres', label: 'PRODUCT PREMIERES' },
    { id: 'founder-sessions', label: 'FOUNDER SESSIONS' },
    { id: 'holiday-events', label: 'HOLIDAY EVENTS' },
    { id: 'launch-events', label: 'LAUNCH EVENTS' },
    { id: 'member-workshops', label: 'MEMBER WORKSHOPS' },
    { id: 'live-shopping', label: 'LIVE SHOPPING' },
    { id: 'early-access', label: 'EARLY ACCESS EVENTS' },
  ],
  library: [
    { id: 'continue', label: 'CONTINUE WATCHING' },
    { id: 'saved', label: 'SAVED' },
    { id: 'unlocked', label: 'UNLOCKED' },
    { id: 'purchased', label: 'PURCHASED' },
    { id: 'downloads', label: 'DOWNLOADS' },
    { id: 'completed', label: 'COMPLETED COURSES' },
    { id: 'certificates', label: 'CERTIFICATES' },
    { id: 'history', label: 'WATCH HISTORY' },
  ],
};

/** Stock clip for non–plucking-lace tiles (remote fallback). */
export const LOUNGE_TV_PLACEHOLDER_VIDEO_SRC =
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4';

/** Default Slay Ticket access per tile id (admin config can override). */
export const LOUNGE_TV_DEFAULT_TICKET_ACCESS: Record<
  string,
  Pick<LoungeTvVideoTile, 'ticketCost' | 'accessType' | 'isFreePreview' | 'isPremium'>
> = {
  'cutting-lace': { ticketCost: 0, isFreePreview: true, accessType: 'permanent' },
  'tinting-lace': { ticketCost: 1, accessType: 'permanent' },
  'bleaching-knots': { ticketCost: 1, accessType: 'permanent' },
  'plucking-lace': { ticketCost: 2, accessType: 'permanent' },
  'melting-lace': { ticketCost: 1, accessType: 'permanent' },
  'extending-install': { ticketCost: 2, accessType: 'permanent' },
  'cleaning-lace': { ticketCost: 0, isFreePreview: true, accessType: 'permanent' },
};

export function applyDefaultLoungeTvTicketAccess(tile: LoungeTvVideoTile): LoungeTvVideoTile {
  const defaults = LOUNGE_TV_DEFAULT_TICKET_ACCESS[tile.id];
  if (!defaults) return tile;
  return {
    ...tile,
    ticketCost: tile.ticketCost ?? defaults.ticketCost ?? 0,
    accessType: tile.accessType ?? defaults.accessType ?? 'permanent',
    isFreePreview: tile.isFreePreview ?? defaults.isFreePreview ?? false,
    isPremium: tile.isPremium ?? defaults.isPremium ?? false,
  };
}

export function contentPackToTile(pack: LoungeContentPack): LoungeTvVideoTile {
  const body =
    pack.article?.intro?.trim() ||
    pack.subtitle?.trim() ||
    '';
  const tile: LoungeTvVideoTile = {
    id: pack.id,
    title: pack.title.toUpperCase(),
    isNew: pack.isNew,
    thumbSrc: pack.thumbnail,
    videoSrc: pack.fullVideo || pack.previewVideo,
    durationLabel: pack.runtime,
    description: (pack.subtitle ?? body).toUpperCase(),
    body: body.toUpperCase(),
    ticketCost: pack.ticketCost,
    accessType: pack.accessType,
    isFreePreview: pack.isFreePreview,
    isPremium: pack.isPremium,
    contentPack: pack,
  };
  if (pack.contentFormat === 'read' || (!pack.fullVideo && !pack.previewVideo && pack.article)) {
    tile.format = 'blog';
  } else {
    tile.format = 'video';
  }
  return applyDefaultLoungeTvTicketAccess(tile);
}

export function getAllContentPacks(): LoungeContentPack[] {
  return LOUNGE_TV_CONTENT_PACKS;
}

export function resolveContentPack(id: string): LoungeContentPack | undefined {
  return getContentPackById(id);
}

export const WATCH_LEARN_VIDEO_COPY: Record<string, { durationLabel: string; description: string }> = {
  'cutting-lace': {
    durationLabel: '8:00',
    description: 'TRIM AND SHAPE YOUR LACE FRONT FOR A CLEAN HAIRLINE BEFORE INSTALL.',
  },
  'tinting-lace': {
    durationLabel: '4:48',
    description: 'CUSTOM TINT LACE TO MATCH YOUR SKIN TONE FOR AN UNDETECTABLE BLEND.',
  },
  'bleaching-knots': {
    durationLabel: '6:05',
    description: 'LIGHTEN KNOTS SAFELY SO PART LINES AND EDGES DISAPPEAR ON CAMERA.',
  },
  'plucking-lace': {
    durationLabel: '7:20',
    description: 'PLUCK DENSITY ALONG THE HAIRLINE FOR A NATURAL, LESS WIGGY FINISH.',
  },
  'melting-lace': {
    durationLabel: '4:32',
    description: 'MELT LACE INTO THE SKIN USING THE RIGHT ADHESIVE AND PRESSURE TECHNIQUE.',
  },
  'extending-install': {
    durationLabel: '8:15',
    description: 'EXTEND WEAR TIME WITH REINFORCEMENT ZONES AND TENSION-FREE STITCHING.',
  },
  'cleaning-lace': {
    durationLabel: '3:54',
    description: 'REMOVE BUILDUP AND RESET LACE WITHOUT DAMAGING FIBERS OR TINT.',
  },
};

export function getWatchLearnVideoCopy(
  tileId: string
): { durationLabel: string; description: string } | undefined {
  return WATCH_LEARN_VIDEO_COPY[tileId];
}

export function resolveWatchLearnDescription(
  tile: Pick<LoungeTvVideoTile, 'id' | 'body' | 'description'>
): string {
  return (
    tile.body?.trim() ||
    tile.description?.trim() ||
    getWatchLearnVideoCopy(tile.id)?.description ||
    ''
  ).toUpperCase();
}

function packsToTiles(packs: LoungeContentPack[]): LoungeTvVideoTile[] {
  return packs.map(contentPackToTile);
}

export function getLoungeTvTilesStatic(mainTab: LoungeTvMainTab, sidebarId: string): LoungeTvVideoTile[] | null {
  if (mainTab === 'featured') return packsToTiles(LOUNGE_TV_CONTENT_PACKS);
  if (mainTab === 'learn' && sidebarId) {
    return packsToTiles(contentPacksForLearningPath(sidebarId));
  }
  if (mainTab === 'explore' && sidebarId) {
    return packsToTiles(contentPacksForExploreSection(sidebarId));
  }
  if (mainTab === 'live') return [];
  if (mainTab === 'library') return packsToTiles(LOUNGE_TV_CONTENT_PACKS);
  return [];
}

/** Migrate legacy admin / storage tab ids to the new navigation. */
export const LOUNGE_TV_LEGACY_TAB_MAP: Record<string, LoungeTvMainTab> = {
  brand: 'featured',
  'slay-tips': 'learn',
  'watch-learn': 'learn',
  academy: 'live',
};

export function normalizeLoungeTvMainTab(tab: string): LoungeTvMainTab {
  if (tab === 'featured' || tab === 'learn' || tab === 'explore' || tab === 'live' || tab === 'library') {
    return tab;
  }
  return LOUNGE_TV_LEGACY_TAB_MAP[tab] ?? 'featured';
}

export { LOUNGE_TV_CONTENT_VIDEO_SRC, LOUNGE_TV_PLUCKING_LACE_TILE_ID };
