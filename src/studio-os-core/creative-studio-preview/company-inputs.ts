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
      return 'luxury-mansion';
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
  'frontal-slayer': 'Trust over sales — intimate concierge, hair bestie warmth, editorial mansion rooms.',
  ndx: 'Stat-forward authority — signal desk clarity, headline-aware urgency without panic loops.',
};

const DESIGN_CANON: Record<CreativePreviewCompanyId, string> = {
  'studio-os': 'Executive marble/glass/crystal — department color before body text, orb as Chief of Staff.',
  'frontal-slayer': 'Luxury editorial beauty — mirror-light heroes, mansion corridors, red-carpet polish.',
  ndx: 'Broadcast editorial dark — signal-first hierarchy, acrylic panels, ticker metadata always visible.',
};

const SPATIAL_RULES: Record<CreativePreviewCompanyId, string> = {
  'studio-os':
    'Grand Atrium axial symmetry · wing zones radiate from executive lobby · crystal health grids at center.',
  'frontal-slayer':
    'Mansion room sequence — arrival salon → concierge desk → service corridors · vanity mirror focal walls.',
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

export function buildBaseSpecification(
  companyId: CreativePreviewCompanyId,
  variant: 'canonical' | 'compressed' | 'expanded'
): PreviewSpecification {
  const brand = resolveBrandDna(companyId);

  if (companyId === 'studio-os') {
    const density = variant === 'compressed' ? 'dense command lattice' : variant === 'expanded' ? 'ceremonial wide court' : 'balanced institutional court';
    return {
      designPhilosophy:
        'Operating civilization as architecture — every surface communicates permanence, expertise, and delegated intelligence.',
      interiorArchitecture: `${density} · crystalline column grid · executive lobby as axial spine · department wings as glass chambers`,
      materialSystem: ['marble', 'crystal', 'chrome', 'manuscript paper', 'frosted glass'],
      lightingLanguage: brand?.lighting.keyLight ?? 'warm marble daylight with gold approval edge',
      spatialOrganization:
        'Hero atrium → health crystal grid → priority mission → operations ring → knowledge archive alcove',
      interactionPhilosophy:
        'One decisive action per viewport · orb as persistent Chief of Staff · department color precedes copy',
      motionBehavior: brand?.motion.philosophy ?? 'Calm executive reveal — state communication only',
      environmentalMood: 'Institutional calm · protective intelligence · legacy archive atmosphere',
      workflowStructure:
        'Genesis boot → workspace selection → genome observation → department mission → executive approval',
      signatureExperiences: [
        'Grand Atrium arrival without SaaS dashboard regression',
        'Crystal health grid as living organizational pulse',
        'Orb radial menu for life-culture-aware executive guidance',
      ],
    };
  }

  if (companyId === 'frontal-slayer') {
    const roomStyle =
      variant === 'compressed'
        ? 'intimate vanity suite'
        : variant === 'expanded'
          ? 'grand mansion salon'
          : 'concierge arrival salon';
    return {
      designPhilosophy:
        'Luxury hair concierge as spatial storytelling — every room is a service moment, never a generic storefront.',
      interiorArchitecture: `${roomStyle} · mansion corridor depth · mirror-wall diagnostics · product gallery alcoves`,
      materialSystem: ['marble', 'vanity mirror', 'velvet', 'chrome', 'product cards', 'glass'],
      lightingLanguage: brand?.lighting.keyLight ?? 'salon daylight + mirror glow',
      spatialOrganization:
        'Concierge arrival → mirror-light hero → service selection corridor → private styling chamber',
      interactionPhilosophy:
        'Concierge warmth in copy · trust over sales · personally known client rhythm',
      motionBehavior: brand?.motion.philosophy ?? 'Polished reveal with soft shimmer',
      environmentalMood: 'Cared for · glamorous · founder-led mansion hospitality',
      workflowStructure:
        'Desire signal → concierge routing → product/customization → appointment → fulfillment → loyalty loop',
      signatureExperiences: [
        'Mirror-light hair analysis lab without clinical coldness',
        'Mansion room navigation instead of flat ecommerce grids',
        'PSA hologram as hair bestie, not sales bot',
      ],
    };
  }

  // ndx
  const deskLayout =
    variant === 'compressed'
      ? 'compact signal desk'
      : variant === 'expanded'
        ? 'multi-wall broadcast gallery'
        : 'primary media command desk';
  return {
    designPhilosophy:
      'Authority media as command environment — signal detection, editorial judgment, and publishing velocity in one spatial logic.',
    interiorArchitecture: `${deskLayout} · story map spine · monitor wall · paper stack archives · producer console`,
    materialSystem: ['dark glass', 'broadcast panels', 'metal', 'paper stacks', 'monitor bezels'],
    lightingLanguage: brand?.lighting.keyLight ?? 'studio lights + neon edge',
    spatialOrganization:
      'Signal ticker base → rundown desk center → editorial archive left → distribution console right',
    interactionPhilosophy:
      'Signal-first hierarchy · headline-aware metadata always visible · urgency without panic',
    motionBehavior: brand?.motion.philosophy ?? 'Switcher cuts and signal pulses',
    environmentalMood: 'Informed · current · culturally sharp · newsroom director energy',
    workflowStructure:
      'Vision → content pipeline → distribution → reader graph → relationship → authority compound',
    signatureExperiences: [
      'Live signal desk with editorial metadata rails',
      'Story map navigation instead of blog category lists',
      'Reader intelligence surfaced as broadcast confidence, not CRM tables',
    ],
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
