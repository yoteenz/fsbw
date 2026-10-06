import type { ResidentId, ResidentRelationshipEdge } from './types';
import { SEASON1_RESIDENT_IDS } from './season1-residents';

const UPDATED = '2026-10-02T00:00:00.000Z';
const V = 'v1.0.0';

function edge(
  id: string,
  personAId: ResidentId,
  personBId: ResidentId,
  partial: Omit<
    ResidentRelationshipEdge,
    'id' | 'personAId' | 'personBId' | 'lastUpdated' | 'version'
  >
): ResidentRelationshipEdge {
  return {
    id,
    personAId,
    personBId,
    lastUpdated: UPDATED,
    version: V,
    ...partial,
  };
}

const ETTA = 'SW-RESIDENT-001' as ResidentId;
const ZURI = 'SW-RESIDENT-002' as ResidentId;
const JULES = 'SW-RESIDENT-003' as ResidentId;
const NOA = 'SW-RESIDENT-004' as ResidentId;
const CASPIAN = 'SW-RESIDENT-005' as ResidentId;
const IONA = 'SW-RESIDENT-006' as ResidentId;
const MARLOWE = 'SW-RESIDENT-007' as ResidentId;
const ELIO = 'SW-RESIDENT-008' as ResidentId;

const CORE_EDGES: ResidentRelationshipEdge[] = [
  edge('rel-etta-zuri', ETTA, ZURI, {
    relationshipType: 'mutual_respect',
    label: 'Elegant power duo',
    mutual: true,
    trustLevel: 5,
    frictionLevel: 1,
    chemistryLevel: 4,
    loyaltyLevel: 5,
    publicDynamic: 'Aligned taste and strategy in front of tenants',
    privateDynamic: 'Competitive about who saw the problem first',
    currentArc: 'Founding stability',
    historicalEvents: ['Season 1 foundation lock'],
    unresolvedTension: [],
    documentarySocialValue: 'Executive partnership energy',
    canonNotes: 'Mutual respect / elegant power duo',
  }),
  edge('rel-etta-caspian', ETTA, CASPIAN, {
    relationshipType: 'creative_tension',
    label: 'Precision vs spectacle',
    mutual: true,
    trustLevel: 4,
    frictionLevel: 3,
    chemistryLevel: 5,
    loyaltyLevel: 4,
    publicDynamic: 'She edits him; he loosens her',
    privateDynamic: 'Both need the other to feel complete',
    currentArc: 'Creative push-pull',
    historicalEvents: [],
    unresolvedTension: ['How much myth is too much in client work'],
    documentarySocialValue: 'High comedy + creative stakes',
    canonNotes: 'She edits him; he loosens her',
  }),
  edge('rel-etta-noa', ETTA, NOA, {
    relationshipType: 'high_trust_minimal_words',
    label: 'Taste vs logic',
    mutual: true,
    trustLevel: 5,
    frictionLevel: 1,
    chemistryLevel: 3,
    loyaltyLevel: 5,
    publicDynamic: 'Minimal words, maximum trust',
    privateDynamic: 'Noa protects Etta from bad systems decisions',
    currentArc: 'Quiet alliance',
    historicalEvents: [],
    unresolvedTension: [],
    documentarySocialValue: 'Deadpan contrast',
    canonNotes: 'High trust, minimal words',
  }),
  edge('rel-noa-caspian', NOA, CASPIAN, {
    relationshipType: 'systems_vs_drama',
    label: 'Systems vs drama',
    mutual: true,
    trustLevel: 3,
    frictionLevel: 4,
    chemistryLevel: 4,
    loyaltyLevel: 3,
    publicDynamic: 'Classic friction — logic vs theatre',
    privateDynamic: 'Secret respect',
    currentArc: 'Comedic opposition',
    historicalEvents: [],
    unresolvedTension: ['Scope creep disguised as vision'],
    documentarySocialValue: 'High social / comedic value',
    canonNotes: 'Systems vs drama',
  }),
  edge('rel-iona-marlowe', IONA, MARLOWE, {
    relationshipType: 'fabrication_duo',
    label: 'Character fabrication duo',
    mutual: true,
    trustLevel: 4,
    frictionLevel: 2,
    chemistryLevel: 5,
    loyaltyLevel: 4,
    publicDynamic: 'Body / persona complement',
    privateDynamic: 'Finish each other’s sentences about faces',
    currentArc: 'Building the cast machine',
    historicalEvents: [],
    unresolvedTension: [],
    documentarySocialValue: 'Craft banter',
    canonNotes: 'Body / persona complement',
  }),
  edge('rel-zuri-elio', ZURI, ELIO, {
    relationshipType: 'strategic_rivalry',
    label: 'Strategic rivalry',
    mutual: true,
    trustLevel: 3,
    frictionLevel: 4,
    chemistryLevel: 4,
    loyaltyLevel: 3,
    publicDynamic: 'Both understand value differently',
    privateDynamic: 'Professional sparring with mutual admiration',
    currentArc: 'Tenancy philosophy clash',
    historicalEvents: [],
    unresolvedTension: ['What should be complimentary vs paid'],
    documentarySocialValue: 'Boardroom tension',
    canonNotes: 'Both understand value differently',
  }),
];

function julesToEveryone(): ResidentRelationshipEdge[] {
  const others = SEASON1_RESIDENT_IDS.filter((id) => id !== JULES);
  return others.map((otherId, i) =>
    edge(`rel-jules-${otherId}`, JULES, otherId, {
      relationshipType: 'social_glue',
      label: 'Social glue — knows everyone’s business',
      mutual: true,
      trustLevel: 4,
      frictionLevel: 1,
      chemistryLevel: 4,
      loyaltyLevel: 4,
      publicDynamic: 'Warm bridge — remembers details',
      privateDynamic: 'Hoards useful gossip for good, not malice',
      currentArc: 'Office connective tissue',
      historicalEvents: [],
      unresolvedTension: i % 3 === 0 ? ['Overshares once per season'] : [],
      documentarySocialValue: 'Confessional fuel',
      canonNotes: 'Jules ↔ everyone — social glue',
    })
  );
}

function marloweObservesEveryone(): ResidentRelationshipEdge[] {
  const others = SEASON1_RESIDENT_IDS.filter((id) => id !== MARLOWE);
  return others.map((otherId) =>
    edge(`rel-marlowe-observe-${otherId}`, MARLOWE, otherId, {
      relationshipType: 'observes_chemistry',
      label: 'Observes chemistry / confidant',
      mutual: false,
      trustLevel: 3,
      frictionLevel: 2,
      chemistryLevel: 4,
      loyaltyLevel: 3,
      publicDynamic: 'Casting director read on dynamics',
      privateDynamic: 'Files observations for future casting',
      currentArc: 'Relationship instigator',
      historicalEvents: [],
      unresolvedTension: ['Knows too much'],
      documentarySocialValue: 'Meta office commentary',
      canonNotes: 'Marlowe reads everyone — asymmetric observer',
      asymmetricNotes: 'Other party may not know how closely they are studied',
    })
  );
}

export const SEASON1_RELATIONSHIPS: ResidentRelationshipEdge[] = [
  ...CORE_EDGES,
  ...julesToEveryone(),
  ...marloweObservesEveryone(),
];
