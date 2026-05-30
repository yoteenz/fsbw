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
};

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

export function getLoungeTvTiles(mainTab: LoungeTvMainTab, sidebarId: string): LoungeTvVideoTile[] | null {
  if (mainTab === 'academy') return null;
  if (mainTab === 'brand' && sidebarId === 'new-drops') return BRAND_NEW_DROPS;
  if (mainTab === 'brand' && sidebarId === 'campaigns') return [];
  if (sidebarId === 'lace') return LACE_TILES;
  if (mainTab === 'slay-tips' || mainTab === 'watch-learn') {
    if (sidebarId === 'install') {
      return [{ id: 'extending-install', title: 'EXTENDING YOUR INSTALL', thumbSrc: '/assets/NOIR/curl-thumb.png' }];
    }
    if (sidebarId === 'styling') {
      return [{ id: 'melting-lace', title: 'MELTING YOUR LACE', thumbSrc: '/assets/NOIR/wave-thumb.png' }];
    }
    if (sidebarId === 'care' || sidebarId === 'storage') return [];
  }
  return [];
}

export function loungeTvAcademyMessage(sidebarId: string): string {
  if (sidebarId === 'events') return 'EVENTS COMING SOON!';
  return 'CLASSES COMING SOON!';
}
