export type LoungeTvMainTab = 'brand' | 'slay-tips' | 'watch-learn' | 'academy';

export type LoungeTvSidebarItem = {
  id: string;
  label: string;
};

export type LoungeTvContentFormat = 'video' | 'blog';

export type LoungeTvVideoTile = {
  id: string;
  title: string;
  isNew?: boolean;
  /** Optional thumb; falls back to dark placeholder */
  thumbSrc?: string;
  /** Watch + Learn expanded player */
  videoSrc?: string;
  durationLabel?: string;
  description?: string;
  /** Blog tabs: full post body (defaults to description). */
  body?: string;
  format?: LoungeTvContentFormat;
  /** Blog tabs: attachment below body (not the Watch + Learn player). */
  attachmentSrc?: string;
  attachmentType?: 'image' | 'video';
};

import { LOUNGE_TV_CONTENT_VIDEO_SRC, LOUNGE_TV_PLUCKING_LACE_TILE_ID } from './loungeTvAssets';

/** Stock clip for non–plucking-lace Watch + Learn tiles (remote fallback). */
export const LOUNGE_TV_PLACEHOLDER_VIDEO_SRC =
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4';

function watchLearnVideoSrcForTile(tileId: string): string | undefined {
  if (tileId === LOUNGE_TV_PLUCKING_LACE_TILE_ID) return LOUNGE_TV_CONTENT_VIDEO_SRC;
  return LOUNGE_TV_PLACEHOLDER_VIDEO_SRC;
}

export const LOUNGE_TV_MAIN_TABS: { id: LoungeTvMainTab; label: string }[] = [
  { id: 'brand', label: 'BRAND' },
  { id: 'slay-tips', label: 'SLAY TIPS' },
  { id: 'watch-learn', label: 'WATCH + LEARN' },
  { id: 'academy', label: 'ACADEMY' },
];

export const LOUNGE_TV_SIDEBAR: Record<LoungeTvMainTab, LoungeTvSidebarItem[]> = {
  brand: [
    { id: 'new-drops', label: 'NEW DROPS' },
    { id: 'campaigns', label: 'CAMPAIGNS' },
  ],
  'slay-tips': [
    { id: 'care', label: 'CARE' },
    { id: 'lace', label: 'LACE' },
    { id: 'install', label: 'INSTALL' },
    { id: 'styling', label: 'STYLING' },
    { id: 'storage', label: 'STORAGE' },
  ],
  'watch-learn': [
    { id: 'lace', label: 'LACE' },
    { id: 'install', label: 'INSTALL' },
    { id: 'styling', label: 'STYLING' },
  ],
  academy: [
    { id: 'classes', label: 'CLASSES' },
    { id: 'events', label: 'EVENTS' },
  ],
};

const LACE_TILES: LoungeTvVideoTile[] = [
  { id: 'cutting-lace', title: 'CUTTING YOUR LACE', isNew: true, thumbSrc: '/assets/NOIR/wave-thumb.png' },
  { id: 'tinting-lace', title: 'TINTING YOUR LACE', thumbSrc: '/assets/NOIR/curl-thumb.png' },
  { id: 'bleaching-knots', title: 'BLEACHING YOUR KNOTS', thumbSrc: '/assets/NOIR/noir-thumb.png' },
  { id: 'plucking-lace', title: 'PLUCKING YOUR LACE', thumbSrc: '/assets/NOIR/blanco-thumb.png' },
  { id: 'melting-lace', title: 'MELTING YOUR LACE', thumbSrc: '/assets/NOIR/wave-thumb.png' },
  { id: 'extending-install', title: 'EXTENDING YOUR INSTALL', thumbSrc: '/assets/NOIR/curl-thumb.png' },
  { id: 'cleaning-lace', title: 'CLEANING YOUR LACE', thumbSrc: '/assets/NOIR/noir-thumb.png' },
];

const BRAND_NEW_DROPS: LoungeTvVideoTile[] = [
  { id: 'cutting-lace', title: 'CUTTING YOUR LACE', isNew: true, thumbSrc: '/assets/NOIR/wave-thumb.png' },
  { id: 'tinting-lace', title: 'TINTING YOUR LACE', thumbSrc: '/assets/NOIR/curl-thumb.png' },
  { id: 'bleaching-knots', title: 'BLEACHING YOUR KNOTS', thumbSrc: '/assets/NOIR/noir-thumb.png' },
  { id: 'plucking-lace', title: 'PLUCKING YOUR LACE', thumbSrc: '/assets/NOIR/blanco-thumb.png' },
];

const WATCH_LEARN_VIDEO_COPY: Record<string, { durationLabel: string; description: string }> = {
  'cutting-lace': {
    durationLabel: '5:12',
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

const SLAY_TIPS_BLOG_BODY: Record<string, string> = {
  'cutting-lace': 'TRIM AND SHAPE YOUR LACE FRONT FOR A CLEAN HAIRLINE BEFORE INSTALL.',
  'tinting-lace': 'CUSTOM TINT LACE TO MATCH YOUR SKIN TONE FOR AN UNDETECTABLE BLEND.',
  'bleaching-knots': 'LIGHTEN KNOTS SAFELY SO PART LINES AND EDGES DISAPPEAR ON CAMERA.',
  'plucking-lace': 'PLUCK DENSITY ALONG THE HAIRLINE FOR A NATURAL, LESS WIGGY FINISH.',
  'melting-lace': 'MELT LACE INTO THE SKIN USING THE RIGHT ADHESIVE AND PRESSURE TECHNIQUE.',
  'extending-install': 'EXTEND WEAR TIME WITH REINFORCEMENT ZONES AND TENSION-FREE STITCHING.',
  'cleaning-lace': 'REMOVE BUILDUP AND RESET LACE WITHOUT DAMAGING FIBERS OR TINT.',
};

function withSlayTipsBlogMeta(tiles: LoungeTvVideoTile[]): LoungeTvVideoTile[] {
  return tiles.map((tile) => {
    const body = (tile.body ?? tile.description ?? SLAY_TIPS_BLOG_BODY[tile.id] ?? '').trim();
    return {
      ...tile,
      format: 'blog',
      body: body || 'SLAY TIPS AND CARE NOTES FROM THE FRONTAL SLAYER TEAM.',
      description: body || tile.description,
    };
  });
}

function withWatchLearnVideoMeta(tiles: LoungeTvVideoTile[]): LoungeTvVideoTile[] {
  return tiles.map((tile) => {
    const copy = WATCH_LEARN_VIDEO_COPY[tile.id] ?? {
      durationLabel: '4:32',
      description: 'WATCH AND LEARN WITH STEP-BY-STEP GUIDANCE FROM THE FRONTAL SLAYER TEAM.',
    };
    const videoSrc = watchLearnVideoSrcForTile(tile.id);
    return {
      ...tile,
      format: 'video',
      videoSrc,
      description: copy.description,
      body: copy.description,
      ...(tile.id === LOUNGE_TV_PLUCKING_LACE_TILE_ID ? {} : { durationLabel: copy.durationLabel }),
    };
  });
}

export function getLoungeTvTilesStatic(mainTab: LoungeTvMainTab, sidebarId: string): LoungeTvVideoTile[] | null {
  if (mainTab === 'academy') return null;
  if (mainTab === 'brand' && sidebarId === 'new-drops') return BRAND_NEW_DROPS;
  if (mainTab === 'brand' && sidebarId === 'campaigns') return [];
  if (sidebarId === 'lace') {
    if (mainTab === 'watch-learn') return withWatchLearnVideoMeta(LACE_TILES);
    if (mainTab === 'slay-tips') return withSlayTipsBlogMeta(LACE_TILES);
    return LACE_TILES;
  }
  if (mainTab === 'slay-tips' || mainTab === 'watch-learn') {
    if (sidebarId === 'install') {
      const installTiles = [
        { id: 'extending-install', title: 'EXTENDING YOUR INSTALL', thumbSrc: '/assets/NOIR/curl-thumb.png' },
      ];
      if (mainTab === 'watch-learn') return withWatchLearnVideoMeta(installTiles);
      if (mainTab === 'slay-tips') return withSlayTipsBlogMeta(installTiles);
      return installTiles;
    }
    if (sidebarId === 'styling') {
      const stylingTiles = [
        { id: 'melting-lace', title: 'MELTING YOUR LACE', thumbSrc: '/assets/NOIR/wave-thumb.png' },
      ];
      if (mainTab === 'watch-learn') return withWatchLearnVideoMeta(stylingTiles);
      if (mainTab === 'slay-tips') return withSlayTipsBlogMeta(stylingTiles);
      return stylingTiles;
    }
    if (sidebarId === 'care' || sidebarId === 'storage') return [];
  }
  return [];
}
