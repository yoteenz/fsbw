import type {
  CreativeConceptAnalysis,
  CreativeConceptArchetype,
  CreativeConceptFuture,
} from './creative-pipeline-types';

function uid(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
}

const ARCHETYPE_META: Record<
  Exclude<CreativeConceptArchetype, 'merged-concept'>,
  { label: string; tagline: string; mood: string }
> = {
  'luxury-editorial': {
    label: 'Luxury Editorial',
    tagline: 'Concept A™',
    mood: 'Cinematic marble · golden hour rim · editorial negative space',
  },
  'apple-minimal': {
    label: 'Apple Minimal',
    tagline: 'Concept B™',
    mood: 'Monolithic white planes · soft top light · product-reveal clarity',
  },
  'futuristic-luxury': {
    label: 'Futuristic Luxury',
    tagline: 'Concept C™',
    mood: 'Glass lattice · volumetric haze · holographic accent lines',
  },
  'modern-penthouse': {
    label: 'Modern Penthouse',
    tagline: 'Concept D™',
    mood: 'Floor-to-ceiling glass · city glow · warm walnut + brass',
  },
  'gallery-experience': {
    label: 'Gallery Experience',
    tagline: 'Concept E™',
    mood: 'Museum white cube · track spots · rotating hero plinth',
  },
  'architectural-showcase': {
    label: 'Architectural Showcase',
    tagline: 'Concept F™',
    mood: 'Brutalist concrete · dramatic skylight · monumental scale',
  },
};

function analysisFor(archetype: CreativeConceptArchetype): CreativeConceptAnalysis {
  const table: Record<Exclude<CreativeConceptArchetype, 'merged-concept'>, CreativeConceptAnalysis> = {
    'luxury-editorial': {
      generationCostEstimate: '$42.8K',
      creativeBudgetImpact: '+12% Creative Budget',
      productionTimeWeeks: 5,
      reusePct: 58,
      marketplacePotential: '$68K annual',
      creativeEquity: '+1,240 CE',
      navigationEfficiency: 86,
      brandGenomeAlignment: 91,
    },
    'apple-minimal': {
      generationCostEstimate: '$28.4K',
      creativeBudgetImpact: '+6% Creative Budget',
      productionTimeWeeks: 3,
      reusePct: 72,
      marketplacePotential: '$34K annual',
      creativeEquity: '+820 CE',
      navigationEfficiency: 94,
      brandGenomeAlignment: 88,
    },
    'futuristic-luxury': {
      generationCostEstimate: '$56.2K',
      creativeBudgetImpact: '+18% Creative Budget',
      productionTimeWeeks: 7,
      reusePct: 41,
      marketplacePotential: '$112K annual',
      creativeEquity: '+1,680 CE',
      navigationEfficiency: 78,
      brandGenomeAlignment: 76,
    },
    'modern-penthouse': {
      generationCostEstimate: '$38.6K',
      creativeBudgetImpact: '+10% Creative Budget',
      productionTimeWeeks: 4,
      reusePct: 64,
      marketplacePotential: '$52K annual',
      creativeEquity: '+1,050 CE',
      navigationEfficiency: 89,
      brandGenomeAlignment: 84,
    },
    'gallery-experience': {
      generationCostEstimate: '$31.2K',
      creativeBudgetImpact: '+8% Creative Budget',
      productionTimeWeeks: 4,
      reusePct: 69,
      marketplacePotential: '$44K annual',
      creativeEquity: '+940 CE',
      navigationEfficiency: 92,
      brandGenomeAlignment: 82,
    },
    'architectural-showcase': {
      generationCostEstimate: '$48.5K',
      creativeBudgetImpact: '+14% Creative Budget',
      productionTimeWeeks: 6,
      reusePct: 52,
      marketplacePotential: '$76K annual',
      creativeEquity: '+1,420 CE',
      navigationEfficiency: 81,
      brandGenomeAlignment: 79,
    },
  };
  if (archetype === 'merged-concept') {
    return {
      generationCostEstimate: '$36.8K',
      creativeBudgetImpact: '+9% Creative Budget',
      productionTimeWeeks: 4,
      reusePct: 78,
      marketplacePotential: '$88K annual',
      creativeEquity: '+1,320 CE',
      navigationEfficiency: 90,
      brandGenomeAlignment: 89,
    };
  }
  return table[archetype];
}

function layersFor(archetype: CreativeConceptArchetype): Omit<
  CreativeConceptFuture,
  'id' | 'archetype' | 'label' | 'tagline' | 'mood' | 'analysis' | 'createdAt' | 'updatedAt'
> {
  const shared = { completeSceneStack: true as const };
  const map: Record<
    Exclude<CreativeConceptArchetype, 'merged-concept'>,
    Omit<CreativeConceptFuture, 'id' | 'archetype' | 'label' | 'tagline' | 'mood' | 'analysis' | 'createdAt' | 'updatedAt'>
  > = {
    'luxury-editorial': {
      ...shared,
      environment: 'Marble atelier shell · velvet drapery alcoves',
      lighting: 'Golden rim key · soft fill · practical sconces',
      materials: 'Calacatta marble · brushed brass · silk velvet',
      architecture: 'Radial gallery wings · double-height atrium',
      furniture: 'Curated editorial seating · glass display vitrines',
      heroObjects: 'Signature mood wall · rotating campaign plinth',
      atmosphere: 'Warm haze · dust motes in light shafts',
      motionLanguage: 'Slow dolly reveals · curtain sweeps',
      colorDirection: 'Ivory · champagne gold · deep espresso',
    },
    'apple-minimal': {
      ...shared,
      environment: 'Seamless white volume · hidden seams',
      lighting: 'Overhead softbox grid · edge rim only',
      materials: 'Matte white lacquer · frosted glass · anodized aluminum',
      architecture: 'Single-plane monument · recessed portals',
      furniture: 'Low monolithic benches · invisible storage',
      heroObjects: 'Floating product pedestal · light ring halo',
      atmosphere: 'Clinical clarity · zero haze',
      motionLanguage: 'Linear push-ins · snap transitions',
      colorDirection: 'Pure white · cool gray · single accent red',
    },
    'futuristic-luxury': {
      ...shared,
      environment: 'Glass lattice shell · holographic floor grid',
      lighting: 'Volumetric cones · RGB accent strips',
      materials: 'Smart glass · liquid metal · carbon weave',
      architecture: 'Cantilevered observation deck · data spine',
      furniture: 'Modular pods · levitating display cases',
      heroObjects: 'Holographic brand monolith',
      atmosphere: 'Particle streams · light fog',
      motionLanguage: 'Orbital camera · UI parallax layers',
      colorDirection: 'Midnight blue · electric cyan · chrome',
    },
    'modern-penthouse': {
      ...shared,
      environment: 'Skyline panorama · open loft plate',
      lighting: 'City bounce · warm interior practicals',
      materials: 'Walnut veneer · brushed brass · linen',
      architecture: 'Steel frame windows · floating mezzanine',
      furniture: 'Sectional lounge · marble coffee tableau',
      heroObjects: 'City-facing hero wall · lifestyle vignette',
      atmosphere: 'Evening glow · subtle rain on glass',
      motionLanguage: 'Handheld intimacy · lifestyle cuts',
      colorDirection: 'Warm neutrals · amber city lights',
    },
    'gallery-experience': {
      ...shared,
      environment: 'White cube gallery · polished concrete floor',
      lighting: 'Track spots · wash walls · object pools',
      materials: 'Gallery white · honed concrete · acrylic',
      architecture: 'Orthogonal rooms · sight-line corridors',
      furniture: 'Minimal benches · plinth clusters',
      heroObjects: 'Central rotating plinth · caption rail',
      atmosphere: 'Quiet reverence · controlled silence',
      motionLanguage: 'Static holds · slow orbit',
      colorDirection: 'Museum white · charcoal · accent pigment',
    },
    'architectural-showcase': {
      ...shared,
      environment: 'Exposed concrete shell · skylight void',
      lighting: 'Hard sun shafts · dramatic shadows',
      materials: 'Board-formed concrete · raw steel · stone',
      architecture: 'Monolithic spans · sculptural stair',
      furniture: 'Sparse monumental pieces',
      heroObjects: 'Structural hero column · scale figure',
      atmosphere: 'Dust in sunbeam · industrial air',
      motionLanguage: 'Crane moves · time-lapse shadows',
      colorDirection: 'Concrete gray · oxidized metal · sky blue',
    },
  };
  if (archetype === 'merged-concept') {
    return {
      ...shared,
      environment: 'Synthesized environment shell',
      lighting: 'Merged lighting rig',
      materials: 'Composite material palette',
      architecture: 'Hybrid architectural language',
      furniture: 'Curated furniture mix',
      heroObjects: 'Merged hero landmark',
      atmosphere: 'Blended atmosphere system',
      motionLanguage: 'Unified motion language',
      colorDirection: 'Synthesized color direction',
    };
  }
  return map[archetype];
}

export function buildCreativeConcept(archetype: Exclude<CreativeConceptArchetype, 'merged-concept'>): CreativeConceptFuture {
  const meta = ARCHETYPE_META[archetype];
  const now = new Date().toISOString();
  return {
    id: uid('concept'),
    archetype,
    label: meta.label,
    tagline: meta.tagline,
    mood: meta.mood,
    ...layersFor(archetype),
    analysis: analysisFor(archetype),
    createdAt: now,
    updatedAt: now,
  };
}

/** Story Table™ — generate complete Scene Stack™ concepts (not individual assets). */
export function buildDefaultCreativeConcepts(_founderIntent?: string): CreativeConceptFuture[] {
  const archetypes: Exclude<CreativeConceptArchetype, 'merged-concept'>[] = [
    'luxury-editorial',
    'apple-minimal',
    'futuristic-luxury',
    'modern-penthouse',
    'gallery-experience',
    'architectural-showcase',
  ];
  return archetypes.map(buildCreativeConcept);
}

export function formatConceptAnalysisLines(concept: CreativeConceptFuture): string[] {
  const a = concept.analysis;
  return [
    `${concept.tagline} · ${concept.label}`,
    `Gen ${a.generationCostEstimate} · ${a.productionTimeWeeks} wk`,
    `Reuse ${a.reusePct}% · ${a.creativeBudgetImpact}`,
    `Marketplace ${a.marketplacePotential} · ${a.creativeEquity}`,
    `Genome align ${a.brandGenomeAlignment}%`,
  ];
}

export function synthesizeMergedConceptAnalysis(
  sources: CreativeConceptFuture[]
): CreativeConceptAnalysis {
  if (sources.length === 0) return analysisFor('merged-concept');
  const avg = (fn: (c: CreativeConceptFuture) => number) =>
    Math.round(sources.reduce((s, c) => s + fn(c), 0) / sources.length);
  const base = analysisFor('merged-concept');
  return {
    ...base,
    reusePct: Math.min(95, avg((c) => c.analysis.reusePct) + 8),
    brandGenomeAlignment: avg((c) => c.analysis.brandGenomeAlignment),
    navigationEfficiency: avg((c) => c.analysis.navigationEfficiency),
    generationCostEstimate: `$${Math.round(
      (sources.reduce(
        (s, c) => s + parseFloat(c.analysis.generationCostEstimate.replace(/[^0-9.]/g, '')),
        0
      ) /
        sources.length) *
        0.82
    )}K`,
  };
}
