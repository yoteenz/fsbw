export type LoungeTvMainTab = 'brand' | 'slay-tips' | 'watch-learn' | 'academy';

export type LoungeTvSidebarItem = {
  id: string;
  label: string;
};

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
};

import { LOUNGE_TV_CONTENT_VIDEO_SRC } from './loungeTvAssets';

/** Stock clip for non–plucking-lace Watch + Learn tiles (remote fallback). */
export const LOUNGE_TV_PLACEHOLDER_VIDEO_SRC =
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4';

function watchLearnVideoSrcForTile(tileId: string): string {
  return tileId === 'plucking-lace' ? LOUNGE_TV_CONTENT_VIDEO_SRC : LOUNGE_TV_PLACEHOLDER_VIDEO_SRC;
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

function withWatchLearnVideoMeta(tiles: LoungeTvVideoTile[]): LoungeTvVideoTile[] {
  return tiles.map((tile) => {
    const copy = WATCH_LEARN_VIDEO_COPY[tile.id] ?? {
      durationLabel: '4:32',
      description: 'WATCH AND LEARN WITH STEP-BY-STEP GUIDANCE FROM THE FRONTAL SLAYER TEAM.',
    };
    return {
      ...tile,
      videoSrc: watchLearnVideoSrcForTile(tile.id),
      durationLabel: copy.durationLabel,
      description: copy.description,
    };
  });
}

export function getLoungeTvTilesStatic(mainTab: LoungeTvMainTab, sidebarId: string): LoungeTvVideoTile[] | null {
  if (mainTab === 'academy') return null;
  if (mainTab === 'brand' && sidebarId === 'new-drops') return BRAND_NEW_DROPS;
  if (mainTab === 'brand' && sidebarId === 'campaigns') return [];
  if (sidebarId === 'lace') {
    return mainTab === 'watch-learn' ? withWatchLearnVideoMeta(LACE_TILES) : LACE_TILES;
  }
  if (mainTab === 'slay-tips' || mainTab === 'watch-learn') {
    if (sidebarId === 'install') {
      const installTiles = [
        { id: 'extending-install', title: 'EXTENDING YOUR INSTALL', thumbSrc: '/assets/NOIR/curl-thumb.png' },
      ];
      return mainTab === 'watch-learn' ? withWatchLearnVideoMeta(installTiles) : installTiles;
    }
    if (sidebarId === 'styling') {
      const stylingTiles = [
        { id: 'melting-lace', title: 'MELTING YOUR LACE', thumbSrc: '/assets/NOIR/wave-thumb.png' },
      ];
      return mainTab === 'watch-learn' ? withWatchLearnVideoMeta(stylingTiles) : stylingTiles;
    }
    if (sidebarId === 'care' || sidebarId === 'storage') return [];
  }
  return [];
}

export function loungeTvAcademyMessage(sidebarId: string): string {
  if (sidebarId === 'events') return 'EVENTS COMING SOON!';
  return 'CLASSES COMING SOON!';
}
