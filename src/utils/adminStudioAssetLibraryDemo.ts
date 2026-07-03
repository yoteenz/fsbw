/** Asset Library — demo catalog (CMS-ready, no backend). */

export type AdminStudioAssetCategoryId =
  | 'environment-images'
  | 'background-videos'
  | 'music'
  | 'voice-profiles'
  | 'intro-animations'
  | 'outro-animations'
  | 'transitions'
  | 'graphics'
  | 'icons'
  | 'logos'
  | 'brand-elements';

export type AdminStudioAsset = {
  id: string;
  name: string;
  categoryId: AdminStudioAssetCategoryId;
  description: string;
  tags: string[];
  format: string;
  duration?: string;
  previewSrc?: string;
  accentHex: string;
};

export const ADMIN_STUDIO_ASSET_CATEGORIES: Array<{ id: AdminStudioAssetCategoryId; label: string }> = [
  { id: 'environment-images', label: 'ENVIRONMENT IMAGES' },
  { id: 'background-videos', label: 'BACKGROUND VIDEOS' },
  { id: 'music', label: 'MUSIC' },
  { id: 'voice-profiles', label: 'VOICE PROFILES' },
  { id: 'intro-animations', label: 'INTRO ANIMATIONS' },
  { id: 'outro-animations', label: 'OUTRO ANIMATIONS' },
  { id: 'transitions', label: 'TRANSITIONS' },
  { id: 'graphics', label: 'GRAPHICS' },
  { id: 'icons', label: 'ICONS' },
  { id: 'logos', label: 'LOGOS' },
  { id: 'brand-elements', label: 'BRAND ELEMENTS' },
];

const THUMBS = [
  '/assets/NOIR/wave-thumb.png',
  '/assets/NOIR/curl-thumb.png',
  '/assets/NOIR/noir-thumb.png',
  '/assets/NOIR/blanco-thumb.png',
];

export const ADMIN_STUDIO_DEFAULT_ASSETS: AdminStudioAsset[] = [
  {
    id: 'env-marble-newsroom',
    name: 'MARBLE NEWSROOM DESK',
    categoryId: 'environment-images',
    description: 'SLAY REPORT BACKDROP — MARBLE + RED ACCENT LIGHTING',
    tags: ['NEWSROOM', 'MARBLE', 'SLAY REPORT'],
    format: 'WEBP · 3840×2160',
    previewSrc: THUMBS[0],
    accentHex: '#EB1C24',
  },
  {
    id: 'env-lab-workbench',
    name: 'SLAY LAB WORKBENCH',
    categoryId: 'environment-images',
    description: 'MACRO CAM + MANNEQUIN HERO STAGE',
    tags: ['LAB', 'MACRO', 'WORKBENCH'],
    format: 'WEBP · 3840×2160',
    previewSrc: THUMBS[1],
    accentHex: '#C41E3A',
  },
  {
    id: 'env-lounge-theater',
    name: 'LOUNGE THEATER SET',
    categoryId: 'environment-images',
    description: 'BLACK TV PANEL · CURTAINS · STREAMING ROW',
    tags: ['LOUNGE', 'THEATER', 'TV'],
    format: 'WEBP · 3840×2160',
    previewSrc: THUMBS[3],
    accentHex: '#0A0A0A',
  },
  {
    id: 'broll-marble-pan',
    name: 'MARBLE SLOW PAN',
    categoryId: 'background-videos',
    description: 'AMBIENT B-ROLL FOR INTROS AND LOWER THIRDS',
    tags: ['B-ROLL', 'MARBLE', 'AMBIENT'],
    format: 'MP4 · 4K',
    duration: '0:12',
    previewSrc: THUMBS[0],
    accentHex: '#9A9A9A',
  },
  {
    id: 'broll-red-wipe',
    name: 'RED WIPE TRANSITION PLATE',
    categoryId: 'background-videos',
    description: 'BRAND RED WIPE FOR EPISODE SEGMENTS',
    tags: ['WIPE', 'TRANSITION', 'RED'],
    format: 'MP4 · 1080P',
    duration: '0:02',
    accentHex: '#EB1C24',
  },
  {
    id: 'music-slay-report-intro',
    name: 'SLAY REPORT INTRO STING',
    categoryId: 'music',
    description: '8 BAR BED · FADE UNDER VO',
    tags: ['INTRO', 'NEWSROOM', 'STING'],
    format: 'WAV · 48KHZ',
    duration: '0:18',
    accentHex: '#EB1C24',
  },
  {
    id: 'music-lounge-power-on',
    name: 'LOUNGE TV POWER ON',
    categoryId: 'music',
    description: 'STATIC BED + POWER CHIME',
    tags: ['LOUNGE', 'TV', 'AMBIENT'],
    format: 'WAV · 48KHZ',
    duration: '0:06',
    accentHex: '#1A1A1A',
  },
  {
    id: 'voice-kateena-warm',
    name: 'KATEENA — WARM EDUCATOR',
    categoryId: 'voice-profiles',
    description: 'CONFIDENT · WARM · NO GATEKEEPING',
    tags: ['HOST', 'SLAY REPORT', 'VO'],
    format: 'VOICE PROFILE',
    accentHex: '#EB1C24',
  },
  {
    id: 'voice-psa-concierge',
    name: 'PSA — CONCIERGE HOLOGRAM',
    categoryId: 'voice-profiles',
    description: 'TRUST OVER SALES · HAIR BESTIE TONE',
    tags: ['PSA', 'CONCIERGE', 'HOLOGRAM'],
    format: 'VOICE PROFILE',
    accentHex: '#808080',
  },
  {
    id: 'intro-slay-report',
    name: 'SLAY REPORT OPEN',
    categoryId: 'intro-animations',
    description: 'LOWER THIRD SLATE + RED PULSE',
    tags: ['INTRO', 'SLAY REPORT'],
    format: 'LOTTIE + MP4',
    duration: '0:04',
    accentHex: '#EB1C24',
  },
  {
    id: 'intro-academy-slate',
    name: 'ACADEMY LESSON SLATE',
    categoryId: 'intro-animations',
    description: 'LESSON NUMBER + DIFFICULTY BADGE',
    tags: ['ACADEMY', 'LESSON'],
    format: 'LOTTIE',
    duration: '0:03',
    accentHex: '#EB1C24',
  },
  {
    id: 'outro-save-board',
    name: 'SAVE TO SLAY BOARD',
    categoryId: 'outro-animations',
    description: 'END CARD CTA ANIMATION',
    tags: ['CTA', 'LOUNGE', 'END CARD'],
    format: 'LOTTIE',
    duration: '0:05',
    accentHex: '#EB1C24',
  },
  {
    id: 'trans-quick-cut',
    name: 'QUICK CUT PACK',
    categoryId: 'transitions',
    description: 'MATCH CUT + MACRO PUSH FOR LAB',
    tags: ['LAB', 'CUT', 'MACRO'],
    format: 'PRESET PACK',
    accentHex: '#C41E3A',
  },
  {
    id: 'trans-hologram-fade',
    name: 'HOLOGRAM FADE',
    categoryId: 'transitions',
    description: 'PSA REPLY CARD TRANSITION',
    tags: ['PSA', 'HOLOGRAM'],
    format: 'PRESET',
    duration: '0:01',
    accentHex: '#EB1C24',
  },
  {
    id: 'gfx-lower-third-red',
    name: 'RED LOWER THIRD TEMPLATE',
    categoryId: 'graphics',
    description: 'HANDWRITTEN TITLE + EPISODE BADGE',
    tags: ['LOWER THIRD', 'TEMPLATE'],
    format: 'FIGMA + PNG',
    previewSrc: THUMBS[2],
    accentHex: '#EB1C24',
  },
  {
    id: 'gfx-both-badge',
    name: 'WATCH + READ BADGE',
    categoryId: 'graphics',
    description: 'BOTH FORMAT BADGE FOR CONTENT PACKS',
    tags: ['BADGE', 'BOTH', 'LOUNGE'],
    format: 'SVG + PNG',
    accentHex: '#EB1C24',
  },
  {
    id: 'icon-save',
    name: 'SAVE TO LIBRARY ICON',
    categoryId: 'icons',
    description: 'LOUNGE TV SAVE BOOKMARK',
    tags: ['ICON', 'LOUNGE', 'SAVE'],
    format: 'SVG',
    accentHex: '#FFFFFF',
  },
  {
    id: 'icon-slay-ticket',
    name: 'SLAY TICKET ICON',
    categoryId: 'icons',
    description: 'UNLOCK CHROME FOR PREMIUM EPISODES',
    tags: ['ICON', 'TICKET', 'PREMIUM'],
    format: 'SVG',
    accentHex: '#EB1C24',
  },
  {
    id: 'logo-frontal-slayer-lockup',
    name: 'FRONTAL SLAYER LOGO LOCKUP',
    categoryId: 'logos',
    description: 'PRIMARY HORIZONTAL LOCKUP — RED + BLACK',
    tags: ['LOGO', 'PRIMARY', 'BRAND'],
    format: 'SVG + PNG',
    accentHex: '#EB1C24',
  },
  {
    id: 'logo-lounge-tv',
    name: 'LOUNGE TV WORDMARK',
    categoryId: 'logos',
    description: 'STREAMING SUB-BRAND FOR MEMBERS LOUNGE',
    tags: ['LOGO', 'LOUNGE', 'TV'],
    format: 'SVG',
    accentHex: '#0A0A0A',
  },
  {
    id: 'brand-red-swatch',
    name: 'BRAND RED SWATCH CARD',
    categoryId: 'brand-elements',
    description: '#EB1C24 · PRIMARY ACCENT REFERENCE',
    tags: ['COLOR', 'BRAND', 'SWATCH'],
    format: 'ASE + PNG',
    accentHex: '#EB1C24',
  },
  {
    id: 'brand-marble-texture',
    name: 'MARBLE HALF TEXTURE',
    categoryId: 'brand-elements',
    description: 'ADMIN + SITE MARBLE BACKGROUND TILE',
    tags: ['TEXTURE', 'MARBLE', 'BACKGROUND'],
    format: 'PNG · TILE',
    previewSrc: '/assets/marble-half.png',
    accentHex: '#9A9A9A',
  },
];

export function getAdminStudioAssetById(id: string): AdminStudioAsset | undefined {
  return ADMIN_STUDIO_DEFAULT_ASSETS.find((a) => a.id === id);
}

export function getAdminStudioAssetCategoryLabel(id: AdminStudioAssetCategoryId): string {
  return ADMIN_STUDIO_ASSET_CATEGORIES.find((c) => c.id === id)?.label ?? id.toUpperCase();
}
