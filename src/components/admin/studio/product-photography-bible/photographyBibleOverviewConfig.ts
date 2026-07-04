import type { PhotographyBibleTabId } from '../../../../utils/adminStudioProductPhotographyBibleDemo';

export const CREATIVE_DNA_HERO = {
  title: 'Creative DNA v1.0',
  status: 'Approved / Locked',
  description:
    'The approved visual genome that governs Frontal Slayer product photography, mannequin presentation, lighting, composition, logo placement, exports, and future product asset manufacturing.',
  subtitle: 'Approved visual genome for Frontal Slayer product photography.',
} as const;

/** Rich manufacturing pipeline — Creative DNA defines rules, Asset Factory manufactures, Smart Assets deliver by context. */
export const PHOTOGRAPHY_BIBLE_PIPELINE_CHAIN = [
  'PHOTOGRAPHY BIBLE',
  'CREATIVE DNA v1.0',
  'ASSET FACTORY',
  'MASTER HERO PORTRAIT',
  'TRANSPARENT MASTER',
  'DERIVATIVE ENGINE',
  'SMART ASSETS',
  'WEBSITE / EMAIL / APP / SOCIAL / ADS',
] as const;

export const PHOTOGRAPHY_BIBLE_PIPELINE_CAPTION =
  'Creative DNA defines the rules · Asset Factory manufactures the assets · Smart Assets deliver the correct image by context.';

export type CreativeDnaQuickCard = {
  id: string;
  label: string;
  tabId: PhotographyBibleTabId;
  status: string;
  version: string;
  lastApproved: string;
};

export const CREATIVE_DNA_QUICK_CARDS: readonly CreativeDnaQuickCard[] = [
  { id: 'prompt-dna', label: 'Prompt DNA', tabId: 'creative-dna', status: 'Approved', version: 'v2.0', lastApproved: '2026-07-04' },
  { id: 'display-bust', label: 'Display Bust', tabId: 'display-mannequin', status: 'Locked', version: 'v1.0', lastApproved: '2026-07-04' },
  { id: 'editorial-ref', label: 'Editorial Reference', tabId: 'creative-dna', status: 'Approved', version: 'v1.0', lastApproved: '2026-07-04' },
  { id: 'camera-system', label: 'Camera System', tabId: 'camera-system', status: 'Locked', version: 'v1.0', lastApproved: '2026-07-04' },
  { id: 'lighting-system', label: 'Lighting System', tabId: 'lighting', status: 'Locked', version: 'v1.0', lastApproved: '2026-07-04' },
  { id: 'composition-rules', label: 'Composition Rules', tabId: 'composition', status: 'Locked', version: 'v1.0', lastApproved: '2026-07-04' },
  { id: 'color-science', label: 'Color Science', tabId: 'color-science', status: 'Locked', version: 'v1.0', lastApproved: '2026-07-04' },
  { id: 'export-rules', label: 'Export Rules', tabId: 'exports', status: 'Locked', version: 'v1.0', lastApproved: '2026-07-04' },
] as const;

export type CreativeDnaDetailItem = {
  id: string;
  label: string;
  tabId: PhotographyBibleTabId;
  hint: string;
};

export const CREATIVE_DNA_DETAIL_ITEMS: readonly CreativeDnaDetailItem[] = [
  { id: 'approved-prompt', label: 'Approved Prompt', tabId: 'creative-dna', hint: 'Master photography system v2.0' },
  { id: 'display-bust', label: 'Official Display Bust', tabId: 'display-mannequin', hint: 'Official FS Bust v1.0' },
  { id: 'editorial-prompt', label: 'Editorial Reference Prompt', tabId: 'creative-dna', hint: 'Lighting & composition quality lock' },
  { id: 'benchmark', label: 'Approved Soft Wave Benchmark', tabId: 'creative-dna', hint: 'Unit 003 master hero reference' },
  { id: 'camera-rules', label: 'Camera Rules', tabId: 'camera-system', hint: 'Eye level · front facing · 1:1' },
  { id: 'lighting-rules', label: 'Lighting Rules', tabId: 'lighting', hint: 'Soft diffused editorial studio' },
  { id: 'composition-rules', label: 'Composition Rules', tabId: 'composition', hint: 'Centered · white space · bottom crop' },
  { id: 'color-science', label: 'Color Science', tabId: 'color-science', hint: 'Neutral editorial grade' },
  { id: 'export-rules', label: 'Export Rules', tabId: 'exports', hint: '4096 master + derivatives' },
  { id: 'version-history', label: 'Version History', tabId: 'version-history', hint: 'Append-only lineage' },
] as const;

/** Overview locked spec cards — real values, not repetitive LOCKED-only labels. */
export const PHOTOGRAPHY_BIBLE_OVERVIEW_LOCKED_SPECS = [
  { id: 'aspectRatio', label: 'Aspect Ratio', value: '1:1' },
  { id: 'resolution', label: 'Resolution', value: '4096×4096' },
  { id: 'background', label: 'Background', value: 'Pure White Studio' },
  { id: 'camera', label: 'Camera', value: 'Eye Level / Front Facing' },
  { id: 'crop', label: 'Crop', value: 'Editorial Bottom Crop' },
  { id: 'lighting', label: 'Lighting', value: 'Soft Diffused Editorial' },
  { id: 'displayBust', label: 'Display Bust', value: 'Official FS Bust v1.0' },
  { id: 'logo', label: 'Logo', value: 'Centered Chest Placement' },
  { id: 'color', label: 'Color', value: 'Neutral Editorial Grade' },
] as const;
