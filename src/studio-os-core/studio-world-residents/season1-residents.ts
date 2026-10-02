import type { ResidentCanonicalIdentity, ResidentId } from './types';

const SEED_TIMESTAMP = '2026-10-02T00:00:00.000Z';

function baseVersionHistory(_residentId: ResidentId): ResidentCanonicalIdentity['versionHistory'] {
  return [
    {
      version: 'v1.0.0',
      status: 'approved',
      changedAt: SEED_TIMESTAMP,
      approvedBy: 'season1-foundation-sprint',
      reason: 'Season 1 core cast seed canon',
      fieldsChanged: ['initial_canon'],
    },
  ];
}

function baseEmbodiment(): ResidentCanonicalIdentity['embodimentTargets'] {
  return [
    {
      kind: 'ue_metahuman',
      status: 'NOT_STARTED',
      referenceLinks: [],
      notes: 'UE / MetaHuman is an embodiment target — canonical identity exists independently.',
    },
  ];
}

type ResidentSeed = Omit<
  ResidentCanonicalIdentity,
  'season' | 'identityStatus' | 'canonLifecycleStatus' | 'canonVersion' | 'versionHistory' | 'embodimentTargets' | 'updatedAt'
> & {
  fabricationStatus: ResidentCanonicalIdentity['fabricationStatus'];
  documentarySheetApproved?: boolean;
};

function finalize(seed: ResidentSeed): ResidentCanonicalIdentity {
  return {
    ...seed,
    season: 1,
    identityStatus: 'canonical',
    canonLifecycleStatus: 'approved',
    canonVersion: 'v1.0.0',
    versionHistory: baseVersionHistory(seed.residentId),
    embodimentTargets: baseEmbodiment(),
    updatedAt: SEED_TIMESTAMP,
  };
}

export const SEASON1_RESIDENT_IDS = [
  'SW-RESIDENT-001',
  'SW-RESIDENT-002',
  'SW-RESIDENT-003',
  'SW-RESIDENT-004',
  'SW-RESIDENT-005',
  'SW-RESIDENT-006',
  'SW-RESIDENT-007',
  'SW-RESIDENT-008',
] as const satisfies readonly ResidentId[];

export const SEASON1_RESIDENTS: ResidentCanonicalIdentity[] = [
  finalize({
    residentId: 'SW-RESIDENT-001',
    displayName: 'Etta Vale',
    sortOrder: 1,
    coreWorldRole: 'Founding Presence / Creative Director / Face of Studio World',
    archetype: 'Gravitational center',
    physicalDirection: {
      summary: 'Striking editorial beauty — luxury, intelligence, control.',
      bullets: [
        'Elongated oval face, high cheek structure, almond eyes, full lips',
        'Sleek expensive presence, poised posture',
        'Narrow but not gaunt lower face, polished camera-ready beauty',
      ],
      signatureStyling: 'Sleek hair, sculpted wardrobe, restrained glamour',
    },
    personality: {
      traits: [
        'Exacting',
        'Emotionally intelligent',
        'Quietly funny',
        'Intimidating until she smiles',
        'Notices everything',
        'Never rushes — which makes everyone else feel rushed',
      ],
      humor: 'Dry, precise, devastating one-liners delivered softly',
      icks: [
        'Forced innovation',
        '"We can fix it in post"',
        'Bad taste disguised as boldness',
        'Unearned confidence',
        'Loud people with weak ideas',
      ],
      privateLifeEnergy: 'Deeply curated, private but not secretive; reads, annotates, archives; softer side few see',
      ensembleFunction: 'Gravitational center',
    },
    worldDepartment: 'Creative Direction',
    fabricationStatus: 'CANON_APPROVED',
    continuityRules: ['Face, voice, and core biography remain stable across cast roles'],
    castingRangeNotes: 'Luxury concierge, campaign lead, spokesperson, fashion editor, host, creative director',
  }),
  finalize({
    residentId: 'SW-RESIDENT-002',
    displayName: 'Zuri Hale',
    sortOrder: 2,
    coreWorldRole: 'Strategy Director / Client Intelligence / Office Guide',
    physicalDirection: {
      summary: 'Statuesque, grounded elegance.',
      bullets: [
        'Balanced features, sharp eyes, strong posture',
        'Clean tailored presence — sophisticated without overdone',
      ],
    },
    personality: {
      traits: ['Perceptive', 'Unflustered', 'Discerning', 'Reads people quickly', 'Practical but never boring'],
      humor: 'Subtle observational — "I already knew this would happen" energy',
      icks: ['Indecision', 'Avoidance', 'Fake collaboration', 'Sloppy communication'],
      privateLifeEnergy: 'Hyper-competent, emotionally composed, quiet romantic streak',
      ensembleFunction: 'Helps tenants understand what they actually need',
    },
    worldDepartment: 'Strategy',
    fabricationStatus: 'CANON_APPROVED',
  }),
  finalize({
    residentId: 'SW-RESIDENT-003',
    displayName: 'Jules Mercer',
    sortOrder: 3,
    coreWorldRole: 'Front Office / Concierge / Tenant Relations',
    physicalDirection: {
      summary: 'Charismatic hospitality presence.',
      bullets: [
        'Expressive eyes, polished but warm, approachable attractiveness',
        'Balanced build, immaculate hospitality styling',
      ],
    },
    personality: {
      traits: [
        'Charming',
        'Socially agile',
        'Deeply connected',
        'Remembers everyone',
        'Knows what is happening before anyone says it',
      ],
      humor: 'Witty, lightly messy, friendly gossip — turns tension into levity',
      icks: ['Rudeness', 'People ignoring the vibe', 'Passive-aggressive silence', 'Poor hosting'],
      privateLifeEnergy: 'Social butterfly, always invited somewhere, more vulnerable than they appear',
      ensembleFunction: 'Social glue / public-facing bridge',
    },
    worldDepartment: 'Front Office',
    fabricationStatus: 'CANON_APPROVED',
  }),
  finalize({
    residentId: 'SW-RESIDENT-004',
    displayName: 'Noa Kline',
    sortOrder: 4,
    coreWorldRole: 'Systems Architect / Studio OS Liaison',
    physicalDirection: {
      summary: 'Cool composed cerebral presence.',
      bullets: [
        'Intelligent face, understated styling, lean silhouette',
        'Precise minimal aesthetic — modern / controlled',
      ],
    },
    personality: {
      traits: [
        'Surgical thinker',
        'Low-drama',
        'Emotionally dry but loyal',
        'Deeply competent',
        'Does not speak unless useful',
      ],
      humor: 'Deadpan, ultra-dry, accidentally funny through literalness',
      icks: ['Messy logic', 'Vague requests', '"Just make it pop"', 'Feature creep'],
      privateLifeEnergy: 'Secretly obsessive niche interests, quiet routines, difficult to fully know',
      ensembleFunction: 'Represents the machinery / systems side',
    },
    worldDepartment: 'Systems Liaison',
    fabricationStatus: 'CANON_APPROVED',
  }),
  finalize({
    residentId: 'SW-RESIDENT-005',
    displayName: 'Caspian Reed',
    sortOrder: 5,
    coreWorldRole: 'World Director / Environmental Storyteller',
    physicalDirection: {
      summary: 'Cinematic, slightly dramatic physicality.',
      bullets: ['Expressive features', 'Artful wardrobe — luxe bohemian / futurist energy'],
    },
    personality: {
      traits: [
        'Visionary',
        'Theatrical',
        'Emotionally vivid',
        'Brilliant but can spiral',
        'Makes everything feel mythic',
      ],
      humor: 'Dramatic exaggeration, flamboyant complaints, loves spectacle',
      icks: ['Visual banality', 'Unimaginative people', 'Fluorescent lighting', 'Cheap materials'],
      privateLifeEnergy: 'Romantic, impulsive, sentimental — collects beautiful things',
      ensembleFunction: 'Gives the world emotional theatricality',
    },
    worldDepartment: 'World Direction',
    fabricationStatus: 'CANON_APPROVED',
  }),
  finalize({
    residentId: 'SW-RESIDENT-006',
    displayName: 'Iona Wells',
    sortOrder: 6,
    coreWorldRole: 'Fabrication Lead / Character Lab / Image Construction',
    physicalDirection: {
      summary: 'Futuristic sculptural beauty with technical sharpness.',
      bullets: ['Clean lines', '"She made this" energy'],
    },
    personality: {
      traits: ['Focused', 'Technically obsessive', 'Tactile thinker', 'Very specific', 'Unexpectedly funny when comfortable'],
      humor: 'Nerdy precision — says insane technical things with a straight face',
      icks: ['Muddy references', 'Low-res assets', '"Good enough"', 'People touching unfinished work'],
      privateLifeEnergy: 'Maker energy, perfectionist — lives between elegance and machinery',
      ensembleFunction: 'Bridges character fabrication and asset / material construction',
    },
    worldDepartment: 'Character Lab',
    fabricationStatus: 'CANON_APPROVED',
  }),
  finalize({
    residentId: 'SW-RESIDENT-007',
    displayName: 'Marlowe Saint',
    sortOrder: 7,
    coreWorldRole: 'Casting Director / Performance Design / Persona Mapping',
    physicalDirection: {
      summary: 'Actorly magnetic face — can shift moods convincingly.',
      bullets: ['Polished yet mercurial styling'],
    },
    personality: {
      traits: [
        'Psychologically sharp',
        'Playful',
        'Intuitive',
        'Studies people for fun',
        'Slightly dangerous in how accurately they read everyone',
      ],
      humor: 'Mischievous, clever, lightly manipulative in a funny way',
      icks: ['Flat personalities', 'Inauthenticity', 'People who think charisma is volume'],
      privateLifeEnergy: "Everyone's confidant — no one fully knows them",
      ensembleFunction: 'Makes the casting system commercially powerful',
    },
    worldDepartment: 'Casting',
    fabricationStatus: 'CANON_APPROVED',
  }),
  finalize({
    residentId: 'SW-RESIDENT-008',
    displayName: 'Elio Vahn',
    sortOrder: 8,
    coreWorldRole: 'Tenancy / Expansion / Business Development',
    physicalDirection: {
      summary: 'Commanding tailored executive presence.',
      bullets: ['Very polished, strong tailoring, expensive energy, controlled expression'],
    },
    personality: {
      traits: [
        'Strategic',
        'Ambitious',
        'Persuasive',
        'Sharper than he first appears',
        'Elegant shark energy',
      ],
      humor: 'Smooth, understated, borderline smug — playful sparring',
      icks: ['Wasted leverage', 'Unserious people', 'Unprofitable chaos'],
      privateLifeEnergy: 'Compartmentalized — more sentimental than he wants anyone to know',
      ensembleFunction: 'Monetizes the world without making it feel cheap',
    },
    worldDepartment: 'Tenancy & Expansion',
    fabricationStatus: 'CANON_APPROVED',
  }),
];

export function getEttaVale(): ResidentCanonicalIdentity {
  const etta = SEASON1_RESIDENTS.find((r) => r.residentId === 'SW-RESIDENT-001');
  if (!etta) throw new Error('Etta Vale missing from season 1 registry');
  return etta;
}
