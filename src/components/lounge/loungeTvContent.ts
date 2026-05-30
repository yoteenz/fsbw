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

export const LOUNGE_TV_PLACEHOLDER_VIDEO_SRC =
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4';

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
    description: 'Trim and shape your lace front for a clean hairline before install.',
  },
  'tinting-lace': {
    durationLabel: '4:48',
    description: 'Custom tint lace to match your skin tone for an undetectable blend.',
  },
  'bleaching-knots': {
    durationLabel: '6:05',
    description: 'Lighten knots safely so part lines and edges disappear on camera.',
  },
  'plucking-lace': {
    durationLabel: '7:20',
    description: 'Pluck density along the hairline for a natural, less wiggy finish.',
  },
  'melting-lace': {
    durationLabel: '4:32',
    description: 'Melt lace into the skin using the right adhesive and pressure technique.',
  },
  'extending-install': {
    durationLabel: '8:15',
    description: 'Extend wear time with reinforcement zones and tension-free stitching.',
  },
  'cleaning-lace': {
    durationLabel: '3:54',
    description: 'Remove buildup and reset lace without damaging fibers or tint.',
  },
};

function withWatchLearnVideoMeta(tiles: LoungeTvVideoTile[]): LoungeTvVideoTile[] {
  return tiles.map((tile) => {
    const copy = WATCH_LEARN_VIDEO_COPY[tile.id] ?? {
      durationLabel: '4:32',
      description: 'Watch and learn with step-by-step guidance from the Frontal Slayer team.',
    };
    return {
      ...tile,
      videoSrc: LOUNGE_TV_PLACEHOLDER_VIDEO_SRC,
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
