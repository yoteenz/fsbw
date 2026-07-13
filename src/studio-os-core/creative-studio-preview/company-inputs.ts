import { getCompanyRegistryEntry } from '../company-genome/company-registry/registry';
import type { ModuleTenantId } from '../workspace/tenant-ids';
import { SEED_BRAND_DNA } from '../genesis/experience-engine/bootstrap/seed-data';
import type { XeeBrandDna } from '../genesis/experience-engine/types';
import type {
  CreativePreviewCompanyId,
  GoverningInputRef,
  PreviewArchitectureArchetype,
  PreviewSpecification,
} from './types';

export const CREATIVE_PREVIEW_COMPANY_IDS: CreativePreviewCompanyId[] = [
  'studio-os',
  'frontal-slayer',
  'ndx',
];

/**
 * @deprecated Company selector removed from Experience Lab (2026-07-13).
 * Use Studio World Registry → Industry Pack selection (`canonical-studio-world/`).
 * These IDs remain for internal preview compiler bridge only.
 */
export const CREATIVE_PREVIEW_COMPANY_LABELS: Record<CreativePreviewCompanyId, string> = {
  'studio-os': 'Studio OS',
  'frontal-slayer': 'Frontal Slayer',
  ndx: 'NDX',
};

export function resolveRegistryCompanyId(companyId: CreativePreviewCompanyId): ModuleTenantId {
  if (companyId === 'ndx') return 'ndxbook';
  return companyId;
}

export function resolveBrandDna(companyId: CreativePreviewCompanyId): XeeBrandDna | null {
  return SEED_BRAND_DNA.find((b) => b.brandId === companyId) ?? null;
}

export function resolveArchitectureArchetype(
  companyId: CreativePreviewCompanyId
): PreviewArchitectureArchetype {
  switch (companyId) {
    case 'studio-os':
      return 'institutional-crystal';
    case 'frontal-slayer':
      return 'luxury-flagship';
    case 'ndx':
      return 'broadcast-command';
  }
}

const OPERATING_MODEL: Record<CreativePreviewCompanyId, string> = {
  'studio-os':
    'Platform operating system — Genesis → Workspace → Company Genome → department expansion → executive intelligence.',
  'frontal-slayer':
    'Luxury commerce organism — desire → product → client → revenue → operating engines with founder-led concierge authority.',
  ndx: 'Authority media loop — vision → content → distribution → reader → relationship → authority → revenue.',
};

const NARRATIVE_INTELLIGENCE: Record<CreativePreviewCompanyId, string> = {
  'studio-os': 'Institutional permanence — expertise preserved, legacy compounding, founder as civilization builder.',
  'frontal-slayer': 'Trust over sales — intimate concierge, hair bestie warmth, flagship salon hospitality.',
  ndx: 'Stat-forward authority — signal desk clarity, headline-aware urgency without panic loops.',
};

const DESIGN_CANON: Record<CreativePreviewCompanyId, string> = {
  'studio-os': 'Executive marble/glass/crystal — department color before body text, orb as Chief of Staff.',
  'frontal-slayer': 'Luxury editorial beauty — mirror-light diagnostics, floating acrylic, couture showroom (not mansion pastiche).',
  ndx: 'Broadcast editorial dark — signal-first hierarchy, acrylic panels, ticker metadata always visible.',
};

const SPATIAL_RULES: Record<CreativePreviewCompanyId, string> = {
  'studio-os':
    'Grand Atrium axial symmetry · wing zones radiate from executive lobby · crystal health grids at center.',
  'frontal-slayer':
    'Luxury flagship sequence — concierge threshold → mirror diagnostics → editorial salon → couture showroom gallery.',
  ndx: 'Media command desk — story map left · signal wall center · producer console right · rundown ticker base.',
};

const DEPARTMENT_TOPOLOGY: Record<CreativePreviewCompanyId, string[]> = {
  'studio-os': ['Executive', 'Knowledge', 'Creative Direction', 'Command', 'AI Operations'],
  'frontal-slayer': ['Founder Office', 'Concierge', 'Creative Lab', 'Commerce', 'Client Care'],
  ndx: ['Newsroom', 'Editorial', 'Distribution', 'Reader Intelligence', 'Signal Research'],
};

export function collectGoverningInputs(companyId: CreativePreviewCompanyId): GoverningInputRef[] {
  const registryId = resolveRegistryCompanyId(companyId);
  const registry = getCompanyRegistryEntry(registryId);
  const brand = resolveBrandDna(companyId);

  const inputs: GoverningInputRef[] = [
    { source: 'Company Registry', field: 'officialName', value: registry.officialName },
    { source: 'Company Registry', field: 'industry', value: registry.industry },
    { source: 'Company Registry', field: 'thesis', value: registry.thesis },
    { source: 'Company Registry', field: 'growthLoop', value: registry.growthLoop },
    { source: 'Operating Model', field: 'structure', value: OPERATING_MODEL[companyId] },
    { source: 'Narrative Intelligence', field: 'voice', value: NARRATIVE_INTELLIGENCE[companyId] },
    { source: 'Design Canon', field: 'visualLaw', value: DESIGN_CANON[companyId] },
    { source: 'Spatial Architecture', field: 'topology', value: SPATIAL_RULES[companyId] },
    {
      source: 'Department Topology',
      field: 'departments',
      value: DEPARTMENT_TOPOLOGY[companyId].join(' · '),
    },
  ];

  if (brand) {
    inputs.push(
      { source: 'Strategic Brand DNA', field: 'philosophy', value: brand.identity.philosophy },
      {
        source: 'Strategic Brand DNA',
        field: 'visualPersonality',
        value: brand.identity.visualPersonality.join(', '),
      },
      {
        source: 'Strategic Brand DNA',
        field: 'environmentalStory',
        value: brand.identity.environmentalStorytelling,
      },
      { source: 'Experience Engine', field: 'materials', value: brand.materials.join(', ') },
      { source: 'Experience Engine', field: 'motionPhilosophy', value: brand.motion.philosophy },
      {
        source: 'Experience Engine',
        field: 'experienceRules',
        value: brand.experienceRules.slice(0, 3).join(' · '),
      }
    );
  }

  return inputs;
}

import { resolveEnvironmentSceneProfile } from './environment-scene-profiles';

function specExtras(companyId: CreativePreviewCompanyId, variant: 'canonical' | 'compressed' | 'expanded') {
  const conceptId = variant === 'canonical' ? 'a' : variant === 'compressed' ? 'b' : 'c';
  const scene = resolveEnvironmentSceneProfile(companyId, conceptId);
  return {
    spatialHierarchy: scene.architecturalKeywords.slice(0, 4).join(' · '),
    circulation: scene.circulation,
    impliedWorkflow: scene.impliedWorkflow,
    furnitureLanguage:
      companyId === 'studio-os'
        ? 'Executive bridge railings · archive shelving · observatory seating at mezzanine'
        : companyId === 'frontal-slayer'
          ? 'Concierge acrylic desk · salon chairs · product pedestals · mirror stations'
          : 'Producer desks · broadcast chairs · story boards · archive stacks',
    environmentalStorytelling: scene.atmosphere,
    departmentRelationships: DEPARTMENT_TOPOLOGY[companyId].join(' ↔ '),
    emotionalTone: scene.emotionalTone,
  };
}

type SpecExtras = ReturnType<typeof specExtras>;

function spreadSpecExtras(extras: SpecExtras): Omit<SpecExtras, 'impliedWorkflow'> {
  const { impliedWorkflow: _, ...rest } = extras;
  return rest;
}

export function buildBaseSpecification(
  companyId: CreativePreviewCompanyId,
  variant: 'canonical' | 'compressed' | 'expanded'
): PreviewSpecification {
  const extras = specExtras(companyId, variant);

  if (companyId === 'studio-os') {
    const density =
      variant === 'compressed'
        ? 'command bridge atrium'
        : variant === 'expanded'
          ? 'observatory vault court'
          : 'executive constitutional atrium';
    return {
      designPhilosophy:
        'Operating civilization as a place — institutional scale where knowledge and command coexist in marble and crystal.',
      interiorArchitecture: `${density} · glass vault · crystal registry column · constitutional archive flanks · executive bridge span`,
      materialSystem: ['white marble', 'crystal', 'chrome', 'frosted glass', 'manuscript stone'],
      lightingLanguage: 'Vault daylight through glass ceiling · crystal refraction · warm stone bounce',
      spatialOrganization:
        'Atrium floor → crystal registry → mezzanine observatory → bridge to command wing → archive galleries',
      interactionPhilosophy:
        'Spatial orientation before interface · movement through institution implies workflow',
      motionBehavior: 'Slow ceremonial reveal — light shifts as you cross the bridge',
      environmentalMood: extras.environmentalStorytelling,
      workflowStructure: extras.impliedWorkflow,
      signatureExperiences: [
        'Executive atrium that reads as headquarters without a logo',
        'Constitutional archive visible from arrival path',
        'Knowledge observatory mezzanine overlooking the floor',
      ],
      ...spreadSpecExtras(extras),
    };
  }

  if (companyId === 'frontal-slayer') {
    const salonStyle =
      variant === 'compressed'
        ? 'couture gallery salon'
        : variant === 'expanded'
          ? 'diagnostic mirror laboratory'
          : 'concierge flagship arrival';
    return {
      designPhilosophy:
        'Luxury beauty as a physical flagship — concierge hospitality, mirror diagnostics, and couture retail in one continuous place.',
      interiorArchitecture: `${salonStyle} · floating acrylic concierge · mirror diagnostic wall · editorial salon curve · product pedestal gallery`,
      materialSystem: ['white marble', 'floating acrylic', 'crystal', 'chrome', 'mirror glass', 'velvet'],
      lightingLanguage: 'Salon daylight · mirror bounce · soft pedestal spots on product forms',
      spatialOrganization:
        'Threshold → concierge acrylic → mirror diagnostics arc → consultation salon → showroom loop',
      interactionPhilosophy: 'Movement implies service sequence — greet, diagnose, consult, reveal',
      motionBehavior: 'Soft shimmer on mirror surfaces · unhurried salon pace',
      environmentalMood: extras.environmentalStorytelling,
      workflowStructure: extras.impliedWorkflow,
      signatureExperiences: [
        'Concierge arrival that feels like a fashion house, not a web store',
        'Mirror diagnostics wall as architectural focal point',
        'Showroom pedestals without product logos — form tells the story',
      ],
      ...spreadSpecExtras(extras),
    };
  }

  const floorStyle =
    variant === 'compressed'
      ? 'elevated broadcast command deck'
      : variant === 'expanded'
        ? 'signal research loop floor'
        : 'live editorial newsroom';
  return {
    designPhilosophy:
      'Media authority as architecture — the room itself broadcasts urgency, editorial judgment, and story velocity.',
    interiorArchitecture: `${floorStyle} · signal wall panorama · producer station rows · media archive spine · command tier`,
    materialSystem: ['dark glass', 'broadcast panels', 'brushed metal', 'paper stacks', 'dynamic display glass'],
    lightingLanguage: 'Track lights · signal wall glow · desk task pools · archive rear wash',
    spatialOrganization:
      'Editorial floor sweep → producer stations → elevated command → archive visible through spine glass',
    interactionPhilosophy: 'Circulation speed matches story tempo — scan, assign, lock, broadcast',
    motionBehavior: 'Signal pulses on displays · kinetic light trails on experimental variant',
    environmentalMood: extras.environmentalStorytelling,
    workflowStructure: extras.impliedWorkflow,
    signatureExperiences: [
      'Live newsroom floor recognizable without a masthead',
      'Signal wall as environmental protagonist',
      'High-energy circulation between stations and command',
    ],
    ...extras,
  };
}

export function buildReasoningChain(companyId: CreativePreviewCompanyId): string[] {
  const registry = getCompanyRegistryEntry(resolveRegistryCompanyId(companyId));
  const brand = resolveBrandDna(companyId);

  return [
    `Industry "${registry.industry}" requires ${companyId === 'studio-os' ? 'institutional permanence' : companyId === 'frontal-slayer' ? 'luxury service intimacy' : 'editorial signal clarity'} — not theme recoloring.`,
    `Company thesis "${registry.thesis.slice(0, 80)}…" drives workflow structure and signature experiences.`,
    brand
      ? `Brand DNA materials [${brand.materials.join(', ')}] define material system — not arbitrary palette swaps.`
      : 'Brand DNA unavailable — compiler used registry fallback only.',
    `Spatial rule: ${SPATIAL_RULES[companyId]}`,
    `Narrative constraint: ${NARRATIVE_INTELLIGENCE[companyId]}`,
    'Preview is READ-ONLY — no Asset Registry, publishing, or production generation invoked.',
  ];
}

export function buildDnaInheritance(companyId: CreativePreviewCompanyId): string[] {
  const brand = resolveBrandDna(companyId);
  if (!brand) return ['Registry-only inheritance — brand DNA seed not found'];

  return [
    `Philosophy: ${brand.identity.philosophy}`,
    `Visual personality: ${brand.identity.visualPersonality.join(' · ')}`,
    `Emotional personality: ${brand.identity.emotionalPersonality.join(' · ')}`,
    `Environmental story: ${brand.identity.environmentalStorytelling}`,
    `Orb personality: ${brand.orbOverrides.personality}`,
    `Navigation tone: ${brand.navigationStyle.tone}`,
  ];
}

export function buildConstraintsRespected(): string[] {
  return [
    'No production asset generation',
    'No Asset Registry writes',
    'No publishing or Content Engine dispatch',
    'No Foundry / FAL pipeline invocation',
    'Preview specification only — Experience Lab validation scope',
  ];
}

export function buildRulesApplied(companyId: CreativePreviewCompanyId): string[] {
  const brand = resolveBrandDna(companyId);
  const rules = brand?.experienceRules ?? [];
  return [
    'Creative Direction Studio constitutional boundary — direction only, not asset truth',
    'Company Genome → Brand DNA → Spatial Architecture inheritance chain',
    'Experience Engine constraints respected (materials, motion, orb, navigation)',
    ...rules.map((r) => `Brand rule: ${r}`),
  ];
}
