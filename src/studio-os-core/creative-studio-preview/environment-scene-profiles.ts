import type { CreativePreviewCompanyId } from './types';

export type EnvironmentSceneVariant = 'production' | 'alternative' | 'experimental';

export type EnvironmentSceneProfile = {
  companyId: CreativePreviewCompanyId;
  variant: EnvironmentSceneVariant;
  /** Maps concept a/b/c */
  conceptId: 'a' | 'b' | 'c';
  industryTarget: string;
  architecturalKeywords: string[];
  atmosphere: string;
  circulation: string;
  impliedWorkflow: string;
  emotionalTone: string;
};

export const ENVIRONMENT_SCENE_PROFILES: Record<
  CreativePreviewCompanyId,
  Record<'a' | 'b' | 'c', EnvironmentSceneProfile>
> = {
  'studio-os': {
    a: {
      companyId: 'studio-os',
      variant: 'production',
      conceptId: 'a',
      industryTarget: 'Executive headquarters · knowledge institution · operating system company',
      architecturalKeywords: [
        'executive atrium',
        'constitutional archive',
        'knowledge observatory',
        'executive bridge',
        'crystal',
        'white marble',
        'chrome',
        'institutional scale',
      ],
      atmosphere: 'Ceremonial calm — daylight through glass vault, dust motes in still air',
      circulation: 'Axial procession · mezzanine observation · bridge crossing to command wing',
      impliedWorkflow: 'Arrive → orient at crystal registry → ascend to department wings',
      emotionalTone: 'Permanent · protective · civilizational',
    },
    b: {
      companyId: 'studio-os',
      variant: 'alternative',
      conceptId: 'b',
      industryTarget: 'Operating system company — command-forward alternative',
      architecturalKeywords: ['executive bridge', 'observation deck', 'chrome', 'glass spine', 'compact atrium'],
      atmosphere: 'Focused daylight — narrower volume, faster orientation',
      circulation: 'Direct ramp to bridge · archive alcoves recessed',
      impliedWorkflow: 'Arrive → bridge overview → immediate department dispatch',
      emotionalTone: 'Decisive · efficient · still institutional',
    },
    c: {
      companyId: 'studio-os',
      variant: 'experimental',
      conceptId: 'c',
      industryTarget: 'Knowledge institution — observatory-first experimental',
      architecturalKeywords: ['knowledge observatory', 'floating archive rings', 'crystal lens', 'vault light'],
      atmosphere: 'Twilight observatory — refracted light through crystal lens array',
      circulation: 'Spiral ascent around observatory core · archive rings at altitude',
      impliedWorkflow: 'Arrive → observatory reveal → descend into wing galleries',
      emotionalTone: 'Wonder · archival depth · experimental gravitas',
    },
  },
  'frontal-slayer': {
    a: {
      companyId: 'frontal-slayer',
      variant: 'production',
      conceptId: 'a',
      industryTarget: 'Luxury beauty flagship · high-fashion concierge',
      architecturalKeywords: [
        'concierge arrival',
        'luxury showroom',
        'mirror diagnostics',
        'beauty consultation',
        'editorial salon',
        'floating acrylic',
        'white marble',
        'signature hospitality',
      ],
      atmosphere: 'Salon daylight — soft mirror glow, polished stone reflections',
      circulation: 'Concierge threshold → consultation arc → showroom gallery loop',
      impliedWorkflow: 'Greet → mirror diagnostics → private consultation → product reveal',
      emotionalTone: 'Intimate · glamorous · personally known',
    },
    b: {
      companyId: 'frontal-slayer',
      variant: 'alternative',
      conceptId: 'b',
      industryTarget: 'Couture retail — gallery-first alternative',
      architecturalKeywords: ['luxury showroom', 'couture retail', 'pedestal gallery', 'editorial salon'],
      atmosphere: 'Gallery spotlights — dramatic product isolation on marble',
      circulation: 'Open gallery circuit · consultation pods at perimeter',
      impliedWorkflow: 'Browse gallery → enter pod → guided selection',
      emotionalTone: 'Editorial · aspirational · unhurried',
    },
    c: {
      companyId: 'frontal-slayer',
      variant: 'experimental',
      conceptId: 'c',
      industryTarget: 'Beauty consultation lab — experimental diagnostic environment',
      architecturalKeywords: ['mirror diagnostics', 'beauty consultation', 'floating acrylic', 'crystal', 'lab salon'],
      atmosphere: 'Clinical glamour — mirror wall luminance, acrylic volumes suspended',
      circulation: 'Diagnostic corridor · rotating consultation island',
      impliedWorkflow: 'Scan → diagnose at mirror wall → collaborative styling island',
      emotionalTone: 'Precise · caring · futuristic salon',
    },
  },
  ndx: {
    a: {
      companyId: 'ndx',
      variant: 'production',
      conceptId: 'a',
      industryTarget: 'Modern media headquarters · editorial command center',
      architecturalKeywords: [
        'live newsroom',
        'signal wall',
        'editorial floor',
        'broadcast command',
        'producer stations',
        'media archive',
        'dynamic displays',
      ],
      atmosphere: 'Live energy — screen glow, overhead track lights, murmured urgency',
      circulation: 'Editorial floor sweep · command tier above · archive spine rear',
      impliedWorkflow: 'Scan signal wall → producer station → story lock → broadcast command',
      emotionalTone: 'Informed · current · controlled urgency',
    },
    b: {
      companyId: 'ndx',
      variant: 'alternative',
      conceptId: 'b',
      industryTarget: 'Editorial command — compact broadcast alternative',
      architecturalKeywords: ['broadcast command', 'producer stations', 'story production', 'signal wall'],
      atmosphere: 'Focused command glow — tighter floor plate, elevated command deck',
      circulation: 'Command deck overlooks floor · rapid station access',
      impliedWorkflow: 'Command overview → assign stations → signal confirmation',
      emotionalTone: 'Sharp · director-led · high tempo',
    },
    c: {
      companyId: 'ndx',
      variant: 'experimental',
      conceptId: 'c',
      industryTarget: 'Signal research floor — experimental media lab',
      architecturalKeywords: ['signal wall', 'dynamic displays', 'high-energy circulation', 'media archive'],
      atmosphere: 'Pulsing displays — experimental signal arrays, kinetic light trails',
      circulation: 'Circular energy loop · archive visible through glass spine',
      impliedWorkflow: 'Signal discovery loop → archive cross-reference → story prototype',
      emotionalTone: 'Experimental · kinetic · culturally alert',
    },
  },
};

export function resolveEnvironmentSceneProfile(
  companyId: CreativePreviewCompanyId,
  conceptId: 'a' | 'b' | 'c'
): EnvironmentSceneProfile {
  return ENVIRONMENT_SCENE_PROFILES[companyId][conceptId];
}
