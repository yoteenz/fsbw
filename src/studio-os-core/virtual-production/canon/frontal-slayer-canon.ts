/**
 * Frontal Slayer canon — sourced from approved repo data only.
 * Sources: FRONTAL_SLAYER_WORKSPACE, SignatureCollectionRegistry, film-trilogy bibles, SET-001.
 */

import { SIGNATURE_COLLECTION_UNITS } from '../../../studio-os/product-photography/SignatureCollectionRegistry';
import { FRONTAL_SLAYER_WORKSPACE } from '../../../workspaces/frontal-slayer/config';

export const FS_ORG_ID = 'frontal-slayer';
export const FS_BRAND_KEY = 'frontal-slayer';

export const FS_BRAND_CANON = {
  orgId: FS_ORG_ID,
  brandKey: FS_BRAND_KEY,
  displayName: 'FRONTAL SLAYER',
  description: FRONTAL_SLAYER_WORKSPACE.brandVoice,
  visualRules: {
    primaryColor: '#EB1C24',
    secondaryColor: '#808080',
    accentBlack: '#000000',
    accentWhite: '#FFFFFF',
    labelFont: 'Futura PT',
    accentFont: 'Covered By Your Grace',
    materials: ['white marble', 'glass acrylic', 'cherry red accent'],
    logoReferences: {
      lobbyNeon: '/assets/neon-logo.png',
      note: 'Company DNA path /assets/brand/frontal-slayer-logo.png referenced but file not on disk — SETUP REQUIRED',
    },
    typographyReferences: ['Futura PT Book/Medium/Demi', 'Covered By Your Grace', 'Bohemy (unit PDP)'],
    tone: 'luxury editorial · trust over sales · handcrafted storytelling',
  },
  forbiddenDeviations: [
    'Generic AI gloss / synthetic cinematography on every shot',
    'Off-brand red substitutions for #EB1C24',
    'Invented products outside six signature units',
    'Nia wardrobe deviations from locked film-trilogy look without approval',
    'Redesign locked SET-001 architecture without explicit request',
  ],
  status: 'approved' as const,
};

/** Nia — film trilogy protagonist. Text canon confirmed; image refs SETUP REQUIRED. */
export const FS_CHARACTER_NIA = {
  characterKey: 'nia',
  canonicalName: 'Nia',
  role: 'Campaign protagonist — film trilogy / social pilot',
  description:
    'Guest-archetype protagonist. Subconscious movement — mouths lyrics, light dance, environmental discovery. Not a model.',
  referenceUrls: {},
  bodyNotes: {
    hair: 'Long luxurious soft waves — healthy, voluminous, natural movement',
    personality: 'Subconscious gestures — never choreographed',
  },
  visualInvariants: [
    'Long soft waves',
    'White cropped fitted polo with FS red piping',
    'White pleated skirt with FS red trim at hem',
    'White toe shoes with red detailing',
    'White earbuds — one hand free at all times',
    'Iced matcha or latte',
    'No purse',
    'No sunglasses',
    'Minimal jewelry',
  ],
  forbiddenDeviations: [
    'Choreographed model poses',
    'Sunglasses or purse',
    'Hair outside locked soft-wave look',
    'Wardrobe outside locked polo/skirt set',
  ],
  providerMetadata: {},
  status: 'setup_required' as const,
  canonLocked: true,
};

export const REFERENCE_PACK_V1_SLOTS = [
  'front',
  'three_quarter_left',
  'three_quarter_right',
  'profile_left',
  'profile_right',
  'medium',
  'full_body',
  'neutral',
  'smile',
  'serious',
  'movement',
  'hair_detail',
  'skin_detail',
] as const;

export type ReferencePackSlot = (typeof REFERENCE_PACK_V1_SLOTS)[number];
export type ReferencePackSlotState = 'approved' | 'missing' | 'replace' | 'archived';

export function buildNiaReferencePackV1SlotStates(): Record<ReferencePackSlot, ReferencePackSlotState> {
  const states = {} as Record<ReferencePackSlot, ReferencePackSlotState>;
  for (const slot of REFERENCE_PACK_V1_SLOTS) {
    states[slot] = 'missing';
  }
  return states;
}

export const FS_PRODUCTS = SIGNATURE_COLLECTION_UNITS.map((unit) => ({
  productKey: unit.slug,
  name: unit.label,
  description: `Signature Collection ${unit.collectionNo} — ${unit.label}`,
  canonicalImages: {
    reference: unit.referenceImageSrc,
    shopPath: unit.shopPath,
  },
  packagingRules: { collectionNo: unit.collectionNo },
  labelRules: { realCatalogOnly: true },
  forbiddenDeviations: ['Incorrect unit texture/pattern', 'Wrong collection labeling'],
  status: 'approved' as const,
  canonLocked: true,
}));

export const FS_ENVIRONMENT_SET001 = {
  environmentKey: 'set-001-flagship',
  name: 'SET-001 Frontal Slayer Flagship',
  description:
    'Physical flagship boutique — Reality One campaign set. Timeless, pre-existing, never dramatically introduced.',
  canonicalImages: [],
  spatialNotes: {
    spaceIds: ['S1-EXT', 'S1-VIT', 'S1-THR', 'S1-REC', 'S2-GAL'],
    source: 'brand-bible/environments/set-001-production-design-dossier.md',
  },
  lightingConditions: { campaign: 'morning sun exterior', interior: 'boutique vitrine glow' },
  permittedModifications: ['Prop staging', 'Overnight exterior prop reset'],
  forbiddenModifications: ['Structural architecture redesign', 'Material substitution away from marble/glass/red'],
  status: 'approved' as const,
  canonLocked: true,
};

export const FS_CAMERA_PROFILE = {
  profileKey: 'fs-social-campaign-v1',
  label: 'Frontal Slayer Social Campaign Camera DNA',
  shotTypes: [
    'environmental_wide',
    'observational_medium',
    'intimate_hero',
    'profile',
    'three_quarter',
    'product_macro',
    'hand_detail_insert',
    'walking_coverage',
    'restrained_tracking',
    'over_the_shoulder',
    'phone_social_framing',
    'locked_commercial',
  ],
  framing: {
    subjectDominance: 'Nia should rarely dominate frame — environmental context matters',
    realism: 'Observational documentary over glossy synthetic AI cinematography',
    depthOfField: 'Natural, not excessive bokeh on every shot',
  },
  movement: {
    preferred: ['pedestrian tracking', 'subtle push-in', 'locked commercial for product'],
    forbidden: ['Unmotivated whip pans', 'Generic AI drone sweeps'],
  },
  forbiddenBehavior: ['Every shot as hero close-up', 'Synthetic glossy grade on all frames'],
};

export const FS_BEHAVIOR_PROFILE = {
  profileKey: 'nia-social-v1',
  label: 'Nia — Social Campaign Behavior',
  behaviorNotes: {
    movement: 'Natural walking cadence — walk to the beat',
    gestures: 'Restrained — tap fingers, sip drink, light dance',
    eyes: 'Believable — glance into storefront windows',
    camera: 'Subconscious — rarely acknowledges camera directly in social pilot',
    expression: 'Occasional smile — never performative model energy',
    socialVsCommercial: 'Social pilot favors candid pauses over polished ad performance',
  },
  characterAssociations: ['nia'],
};

export const FS_WARDROBE_NIA_LOCKED = {
  wardrobeKey: 'nia-locked-look-v1',
  label: 'Nia Locked Look — Film Trilogy',
  garmentType: 'outfit',
  referenceUrls: [],
  associations: { character: 'nia', source: 'film-trilogy-visual-story-bible.md' },
  status: 'approved' as const,
  canonLocked: true,
};

export const FS_PROPS_NIA = [
  { propKey: 'white-earbuds', label: 'White Earbuds', propType: 'accessory' },
  { propKey: 'iced-matcha-latte', label: 'Iced Matcha or Latte', propType: 'beverage' },
];
