import { XNI_SUBSYSTEM_VERSION } from '../constants';
import type { XniProductionGenome, XniStore } from '../types';

const now = '2026-07-09T12:00:00.000Z';

function genome(
  brandId: string,
  partial: Omit<XniProductionGenome, 'genomeId' | 'brandId' | 'brandDnaRef' | 'updatedAt' | 'version'>
): XniProductionGenome {
  return {
    genomeId: `pg-${brandId}`,
    brandId,
    brandDnaRef: `brand-dna:${brandId}`,
    updatedAt: now,
    version: '1.0.0',
    ...partial,
  };
}

export const SEED_PRODUCTION_GENOMES: XniProductionGenome[] = [
  genome('studio-os', {
    intro: 'Crystalline logo resolve · marble daylight · institutional calm',
    outro: 'Legacy seal · Orb acknowledgment · single primary CTA',
    themeMusic: 'Measured piano + subtle strings · 72 BPM · no hype',
    editingStyle: 'Architectural restraint · evidence-first cuts · one reveal per act',
    motionStyle: 'Slow parallax · glass refraction · minimal UI motion',
    cameraStyle: 'Wide establishing → medium executive framing · stable tripod',
    visualLanguage: 'Marble, glass, crystal, manuscript cards · Studio OS red sparingly',
    presenterStyle: 'Founder-as-architect · calm authority · legacy framing',
    orbBehavior: 'Evidence companion · speaks after proof · never hype',
    sceneSelectionRules: [
      'Grand Atrium before department wings',
      'One primary action per viewport',
      'Department color before body copy',
    ],
    episodeRhythm: 'Hook (15s) → Context (45s) → Proof (90s) → Decision (30s) → CTA',
    status: 'canonical',
  }),
  genome('frontal-slayer', {
    intro: 'Vanity mirror glow · concierge welcome · founder warmth',
    outro: 'Appointment CTA · product card hero · mirror reflection hold',
    themeMusic: 'Soft glam R&B undertone · 88 BPM · editorial polish',
    editingStyle: 'Beauty editorial cuts · ritual pacing · mirror-match transitions',
    motionStyle: 'Silk wipes · product card float · gentle lens flare',
    cameraStyle: 'Beauty close-ups · mirror doubles · salon daylight',
    visualLanguage: 'Marble vanity · chrome · velvet · gloss product cards',
    presenterStyle: 'Founder concierge · intimate · glamorous direct address',
    orbBehavior: 'Personal recognition · remembers client context · warm not salesy',
    sceneSelectionRules: [
      'Mansion arrival before service rooms',
      'Mirror moments for transformation beats',
      'Product cards as proof objects',
    ],
    episodeRhythm: 'Welcome (10s) → Desire (40s) → Ritual (80s) → Glow proof (40s) → Book',
    status: 'canonical',
  }),
  genome('ndx', {
    intro: 'Data crystal pulse · precision grid · executive briefing tone',
    outro: 'Metric seal · next insight tease · dashboard handoff',
    themeMusic: 'Minimal electronic · precise rhythm · 96 BPM',
    editingStyle: 'Data-forward · chart reveals · crisp match cuts',
    motionStyle: 'Grid animations · metric count-ups · subtle depth',
    cameraStyle: 'Screen-in-screen · analyst medium shots · clean overhead',
    visualLanguage: 'Dark slate · signal green accents · crisp typography',
    presenterStyle: 'Analyst-strategist · numbers then narrative · confident brevity',
    orbBehavior: 'Insight synthesizer · cites sources · flags uncertainty',
    sceneSelectionRules: [
      'Insight before recommendation',
      'One metric hero per scene',
      'Risk callout before CTA',
    ],
    episodeRhythm: 'Question (15s) → Data (60s) → Insight (45s) → Action (30s) → Follow',
    status: 'canonical',
  }),
];

export function buildNarrativeIntelligenceSeedStore(): Partial<XniStore> {
  return {
    version: XNI_SUBSYSTEM_VERSION,
    productionGenomeRegistry: SEED_PRODUCTION_GENOMES,
    blueprintRegistry: [],
    playground: {
      topic: 'Why Studio OS exists',
      brandId: 'studio-os',
      companyId: 'studio-os',
      narrativeType: 'episode',
    },
    constitutionLocked: true,
    seededAt: now,
  };
}
