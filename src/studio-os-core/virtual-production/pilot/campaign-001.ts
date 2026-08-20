/**
 * FRONTAL SLAYER / CAMPAIGN 001 — High-consistency social production pilot.
 * Hybrid mode · 9:16 · 15–30s · Instagram Reels / TikTok
 */

import type { ShotTransitionType, VirtualProductionMode } from '../types';

export type ShotCriticality = 'low' | 'medium' | 'high';

export type Campaign001ShotDef = {
  shotKey: string;
  sortOrder: number;
  title: string;
  purpose: string;
  durationSeconds: number;
  shotType: string;
  productionMode: VirtualProductionMode;
  providerId: string;
  capabilityRequired: string;
  identityCriticality: ShotCriticality;
  productCriticality: ShotCriticality;
  environmentCriticality: ShotCriticality;
  transitionType: ShotTransitionType;
  editorialNote?: string;
  characterKeys: string[];
  environmentKey?: string;
  productKey?: string;
  wardrobeKeys: string[];
  propKeys: string[];
  actionDirection: string;
  emotionalDirection: string;
  startState: Record<string, unknown>;
  endState: Record<string, unknown>;
  storyboardFrameKind: 'reference_frame' | 'text_concept';
  hybridRepairCandidate?: boolean;
};

export const CAMPAIGN_001_META = {
  campaignKey: 'campaign-001',
  name: 'FRONTAL SLAYER / CAMPAIGN 001',
  objective: 'HIGH-CONSISTENCY SOCIAL PRODUCTION PILOT',
  platform: 'Instagram Reels · TikTok',
  audience: 'Social — lifestyle discovery',
  productionMode: 'hybrid' as const,
  format: { aspectRatio: '9:16', durationTargetMin: 15, durationTargetMax: 30 },
  creativeBrief:
    'Demonstrate editorial continuity: recognition → environment → movement → detail → product → recognition → hero resolution. Invisible-cut strategy — identity not required in every frame.',
  narrativeConcept:
    'Nia discovers the Frontal Slayer boutique the same way the audience does — subconscious movement, environmental context, product recognition without spoiled reveals.',
  treatment:
    'Observational luxury social film. Hybrid: Director-speed multi-scene with Precision repair on identity/product-critical shots.',
  lifecycleStatus: 'preproduction' as const,
  currentPhase: 'storyboard',
  audioPlan: {
    music: { status: 'planned', note: 'Nia world music — fades as she enters boutique' },
    voice: { status: 'none', note: 'No VO for pilot unless founder adds' },
    ambience: { status: 'planned', note: 'Street ambience, boutique interior hush' },
    sfx: { status: 'planned', note: 'Earbud removal, glass vitrine subtle' },
  },
  deliverable: {
    deliverableKey: 'social-master-001',
    title: 'CAMPAIGN 001 SOCIAL MASTER',
    platform: 'instagram_reels',
    aspectRatio: '9:16',
    destinations: ['Instagram Reels', 'TikTok'],
  },
};

/** 9-shot pilot list */
export const CAMPAIGN_001_SHOTS: Campaign001ShotDef[] = [
  {
    shotKey: 'shot-01',
    sortOrder: 1,
    title: 'Identity Hero',
    purpose: 'Establish Nia — identity-critical hero',
    durationSeconds: 3,
    shotType: 'intimate_hero',
    productionMode: 'precision',
    providerId: 'fal',
    capabilityRequired: 'character_reference',
    identityCriticality: 'high',
    productCriticality: 'low',
    environmentCriticality: 'medium',
    transitionType: 'hard_cut',
    characterKeys: ['nia'],
    environmentKey: 'set-001-flagship',
    wardrobeKeys: ['nia-locked-look-v1'],
    propKeys: ['white-earbuds', 'iced-matcha-latte'],
    actionDirection: 'Medium intimate — Nia mid-stride, subconscious smile',
    emotionalDirection: 'Effortless taste — not performing for camera',
    startState: { character: { nia: { position: 'street approach' } } },
    endState: { character: { nia: { facing: '3/4 right', expression: 'soft smile' } } },
    storyboardFrameKind: 'reference_frame',
  },
  {
    shotKey: 'shot-02',
    sortOrder: 2,
    title: 'Environmental Wide',
    purpose: 'Establish SET-001 boutique in context',
    durationSeconds: 2.5,
    shotType: 'environmental_wide',
    productionMode: 'director',
    providerId: 'openart-director',
    capabilityRequired: 'directed_multi_scene',
    identityCriticality: 'low',
    productCriticality: 'low',
    environmentCriticality: 'high',
    transitionType: 'cut',
    editorialNote: 'WHY THIS CUT WORKS: Wide establishes place before we return to face',
    environmentKey: 'set-001-flagship',
    characterKeys: [],
    wardrobeKeys: [],
    propKeys: [],
    actionDirection: 'Locked wide — boutique exists before Nia notice',
    emotionalDirection: 'Timeless — boutique waiting',
    startState: { environment: { set001: { view: 'S1-EXT wide' } } },
    endState: { environment: { set001: { view: 'S1-EXT wide held' } } },
    storyboardFrameKind: 'text_concept',
  },
  {
    shotKey: 'shot-03',
    sortOrder: 3,
    title: 'Movement Tracking',
    purpose: 'Nia walking coverage — movement continuity',
    durationSeconds: 3,
    shotType: 'walking_coverage',
    productionMode: 'director',
    providerId: 'openart-director',
    capabilityRequired: 'directed_multi_scene',
    identityCriticality: 'medium',
    productCriticality: 'low',
    environmentCriticality: 'medium',
    transitionType: 'motion_cut',
    characterKeys: ['nia'],
    environmentKey: 'set-001-flagship',
    wardrobeKeys: ['nia-locked-look-v1'],
    propKeys: ['white-earbuds'],
    actionDirection: 'Side tracking — mouthing lyrics, light dance',
    emotionalDirection: 'Subconscious rhythm',
    startState: { character: { nia: { motion: 'walking beat' } } },
    endState: { character: { nia: { motion: 'approach storefront' } } },
    storyboardFrameKind: 'text_concept',
  },
  {
    shotKey: 'shot-04',
    sortOrder: 4,
    title: 'Detail Insert',
    purpose: 'Hands / matcha / earbuds — distraction cut',
    durationSeconds: 1.5,
    shotType: 'hand_detail_insert',
    productionMode: 'director',
    providerId: 'openart-director',
    capabilityRequired: 'directed_multi_scene',
    identityCriticality: 'low',
    productCriticality: 'low',
    environmentCriticality: 'low',
    transitionType: 'insert',
    editorialNote: 'WHY THIS CUT WORKS: Detail insert breaks face continuity intentionally',
    characterKeys: ['nia'],
    wardrobeKeys: [],
    propKeys: ['iced-matcha-latte', 'white-earbuds'],
    actionDirection: 'Macro insert — sip, finger tap',
    emotionalDirection: 'Candid pause',
    startState: { prop: { drink: 'raised' } },
    endState: { prop: { drink: 'lowered' } },
    storyboardFrameKind: 'text_concept',
  },
  {
    shotKey: 'shot-05',
    sortOrder: 5,
    title: 'Product Critical',
    purpose: 'NOIR in vitrine — product fidelity shot',
    durationSeconds: 2,
    shotType: 'product_macro',
    productionMode: 'precision',
    providerId: 'fal',
    capabilityRequired: 'multi_reference',
    identityCriticality: 'low',
    productCriticality: 'high',
    environmentCriticality: 'medium',
    transitionType: 'detail',
    productKey: 'noir',
    environmentKey: 'set-001-flagship',
    characterKeys: [],
    wardrobeKeys: [],
    propKeys: [],
    actionDirection: 'Hero product in vitrine — exact NOIR presentation',
    emotionalDirection: 'Quiet luxury product reveal',
    startState: { product: { noir: { state: 'vitrine display' } } },
    endState: { product: { noir: { state: 'vitrine held' } } },
    storyboardFrameKind: 'reference_frame',
  },
  {
    shotKey: 'shot-06',
    sortOrder: 6,
    title: 'Profile Identity',
    purpose: '3/4 profile identity reinforcement',
    durationSeconds: 2.5,
    shotType: 'three_quarter',
    productionMode: 'precision',
    providerId: 'fal',
    capabilityRequired: 'character_reference',
    identityCriticality: 'high',
    productCriticality: 'low',
    environmentCriticality: 'low',
    transitionType: 'cut',
    characterKeys: ['nia'],
    wardrobeKeys: ['nia-locked-look-v1'],
    propKeys: [],
    actionDirection: 'Profile 3/4 — glance toward vitrine',
    emotionalDirection: 'Curiosity awakening',
    startState: { character: { nia: { facing: 'profile left' } } },
    endState: { character: { nia: { facing: '3/4 toward vitrine' } } },
    storyboardFrameKind: 'reference_frame',
  },
  {
    shotKey: 'shot-07',
    sortOrder: 7,
    title: 'Occlusion Transition',
    purpose: 'Glass reflection / occlusion editorial cut',
    durationSeconds: 2,
    shotType: 'environmental_medium',
    productionMode: 'director',
    providerId: 'openart-director',
    capabilityRequired: 'directed_multi_scene',
    identityCriticality: 'medium',
    productCriticality: 'low',
    environmentCriticality: 'high',
    transitionType: 'occlusion',
    editorialNote: 'WHY THIS CUT WORKS: Occlusion hides identity transition — recognition → distraction',
    environmentKey: 'set-001-flagship',
    characterKeys: ['nia'],
    wardrobeKeys: ['nia-locked-look-v1'],
    propKeys: [],
    actionDirection: 'Through glass — partial silhouette',
    emotionalDirection: 'Discovery moment building',
    startState: { environment: { glass: 'reflection partial' } },
    endState: { environment: { glass: 'reflection clear' } },
    storyboardFrameKind: 'text_concept',
  },
  {
    shotKey: 'shot-08',
    sortOrder: 8,
    title: 'Recognition Return',
    purpose: 'Return to face after distraction — HYBRID repair test target',
    durationSeconds: 2.5,
    shotType: 'intimate_hero',
    productionMode: 'hybrid',
    providerId: 'openart-director',
    capabilityRequired: 'directed_multi_scene',
    identityCriticality: 'high',
    productCriticality: 'low',
    environmentCriticality: 'medium',
    transitionType: 'reaction',
    editorialNote: 'WHY THIS CUT WORKS: Recognition return after detail/occlusion beats',
    hybridRepairCandidate: true,
    characterKeys: ['nia'],
    environmentKey: 'set-001-flagship',
    wardrobeKeys: ['nia-locked-look-v1'],
    propKeys: [],
    actionDirection: 'Face return — subtle realization',
    emotionalDirection: 'Brain catch-up — boutique noticed',
    startState: { character: { nia: { expression: 'neutral' } } },
    endState: { character: { nia: { expression: 'quiet recognition' } } },
    storyboardFrameKind: 'text_concept',
  },
  {
    shotKey: 'shot-09',
    sortOrder: 9,
    title: 'Hero Resolution',
    purpose: 'Final recognition + boutique resolution',
    durationSeconds: 3,
    shotType: 'observational_medium',
    productionMode: 'director',
    providerId: 'openart-director',
    capabilityRequired: 'directed_multi_scene',
    identityCriticality: 'medium',
    productCriticality: 'low',
    environmentCriticality: 'high',
    transitionType: 'match_action',
    editorialNote: 'WHY THIS CUT WORKS: Hero resolution — environment + character in balance',
    characterKeys: ['nia'],
    environmentKey: 'set-001-flagship',
    wardrobeKeys: ['nia-locked-look-v1'],
    propKeys: ['white-earbuds'],
    actionDirection: 'Medium — Nia at vitrine threshold, choice moment',
    emotionalDirection: 'The Choice — FRAME 009 grammar',
    startState: { character: { nia: { position: 'vitrine threshold' } } },
    endState: { character: { nia: { position: 'entry decision' } } },
    storyboardFrameKind: 'text_concept',
  },
];

export const CAMPAIGN_001_SCENE = {
  sceneKey: 'scene-01',
  title: 'Discovery — Street to Vitrine',
  description: 'First act grammar adapted for 15–30s social pilot',
  sortOrder: 1,
};
