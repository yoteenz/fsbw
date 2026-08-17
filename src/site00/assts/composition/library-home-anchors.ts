/**
 * ASSTS Library Home — reference-locked composition anchors.
 * Reference canvas: 390×844 (canonical mobile handoff).
 * Live layout maps anchor spacing via clamp() against --assts-lib-ref-* tokens.
 */

export const ASSTS_LIBRARY_HOME_REFERENCE = {
  width: 390,
  height: 844,
} as const;

export type AsstsLibraryHomeAnchorId =
  | 'library.header'
  | 'library.hero'
  | 'library.stats'
  | 'library.globalStatus'
  | 'library.needsReview'
  | 'library.needsReview.heading'
  | 'library.needsReview.primaryCard'
  | 'library.needsReview.seeAll'
  | 'library.recentBatches'
  | 'library.recentBatches.heading'
  | 'library.recentBatches.list'
  | 'library.browseLibrary'
  | 'library.browseLibrary.environment'
  | 'library.browseLibrary.objects'
  | 'library.browseLibrary.uiGraphics'
  | 'library.browseLibrary.brandSystems'
  | 'library.browseLibrary.projectAssets'
  | 'library.bottomNav';

export type AsstsLibraryHomeAnchor = {
  id: AsstsLibraryHomeAnchorId;
  label: string;
  /** Normalized Y start on reference canvas (0–1) — documentation / studio parity */
  refY: number;
};

/** Semantic anchors for Library Home — geometry reference is the attached mobile mock. */
export const ASSTS_LIBRARY_HOME_ANCHORS: AsstsLibraryHomeAnchor[] = [
  { id: 'library.header', label: 'Header identity block', refY: 0.04 },
  { id: 'library.hero', label: 'Architectural hero axis (environment)', refY: 0.12 },
  { id: 'library.stats', label: 'Primary statistics row', refY: 0.19 },
  { id: 'library.globalStatus', label: 'Global review status strip', refY: 0.26 },
  { id: 'library.needsReview', label: 'Needs Your Review section', refY: 0.3 },
  { id: 'library.needsReview.heading', label: 'Needs review heading', refY: 0.3 },
  { id: 'library.needsReview.seeAll', label: 'Needs review See All', refY: 0.3 },
  { id: 'library.needsReview.primaryCard', label: 'Priority review card', refY: 0.34 },
  { id: 'library.recentBatches', label: 'Recent Batches section', refY: 0.48 },
  { id: 'library.recentBatches.heading', label: 'Recent batches heading', refY: 0.48 },
  { id: 'library.recentBatches.list', label: 'Recent batches list', refY: 0.52 },
  { id: 'library.browseLibrary', label: 'Browse Library section', refY: 0.62 },
  { id: 'library.browseLibrary.environment', label: '01 Environments', refY: 0.66 },
  { id: 'library.browseLibrary.objects', label: '02 Objects', refY: 0.72 },
  { id: 'library.browseLibrary.uiGraphics', label: '03 UI / Graphics', refY: 0.78 },
  { id: 'library.browseLibrary.brandSystems', label: '04 Brand Systems', refY: 0.84 },
  { id: 'library.browseLibrary.projectAssets', label: '05 Project Assets', refY: 0.9 },
  { id: 'library.bottomNav', label: 'Bottom navigation', refY: 0.94 },
];

export function libraryHomeAnchorAttr(id: AsstsLibraryHomeAnchorId): { 'data-anchor': string } {
  return { 'data-anchor': id };
}
