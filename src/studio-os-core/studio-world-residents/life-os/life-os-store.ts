import type { ResidentCastRoleContract, ResidentId } from '../types';
import { buildSeason1LifeOsSeed } from './life-os-seed';
import type { ResidentLifeEventEnvelope } from './event-envelope';
import type {
  FounderInterventionRecord,
  OrganizationalMemoryRecord,
  ResidentBeliefRecord,
  ResidentDecisionRecord,
  ResidentMemoryRecord,
  RumorFragment,
  SocialTruthEvent,
} from './life-twin-model';
import type {
  PairingOutcomeRecord,
  PrivateDisclosureRecord,
  ResidentRequestRecord,
  WorldStoryRecord,
} from './life-os-domain-records';
import type {
  HumanEmployeeLearningProfile,
  ProposedCanonCorrection,
  TrainingCanonDocument,
  TrainingEscalationRecord,
} from './training-domain';

export type LifeOsSeedBundle = ReturnType<typeof buildSeason1LifeOsSeed>['bundles'] extends Map<infer _K, infer V>
  ? V
  : never;

export type InMemoryLifeOsStore = {
  worldId: string;
  organizationId: string;
  bundles: Map<ResidentId, LifeOsSeedBundle>;
  events: ResidentLifeEventEnvelope[];
  truthEvents: Map<string, SocialTruthEvent>;
  rumors: RumorFragment[];
  memories: Map<ResidentId, ResidentMemoryRecord[]>;
  beliefs: Map<ResidentId, ResidentBeliefRecord[]>;
  interventions: FounderInterventionRecord[];
  decisions: ResidentDecisionRecord[];
  orgMemory: OrganizationalMemoryRecord[];
  pairingOutcomes: PairingOutcomeRecord[];
  worldStories: WorldStoryRecord[];
  privateDisclosures: PrivateDisclosureRecord[];
  residentRequests: ResidentRequestRecord[];
  activeCastRoles: ResidentCastRoleContract[];
  humanEmployees: Map<string, HumanEmployeeLearningProfile>;
  trainingCanons: Map<string, TrainingCanonDocument>;
  proposedCorrections: ProposedCanonCorrection[];
  trainingEscalations: TrainingEscalationRecord[];
  alumni: Set<ResidentId>;
};

let store: InMemoryLifeOsStore | null = null;

export function resetLifeOsStoreForTests(): void {
  store = null;
}

export function getLifeOsStore(): InMemoryLifeOsStore {
  if (!store) {
    const seed = buildSeason1LifeOsSeed();
    store = {
      worldId: seed.worldId,
      organizationId: seed.organizationId,
      bundles: seed.bundles,
      events: [...seed.seedEvents],
      truthEvents: new Map(),
      rumors: [],
      memories: new Map(),
      beliefs: new Map(),
      interventions: [],
      decisions: [],
      orgMemory: [
        {
          orgMemoryId: 'org-mem-001',
          organizationId: seed.organizationId,
          summary: 'Etta and Caspian solve similar concept problems with productive friction',
          source: 'observed_project_pattern',
          confidence: 0.75,
          scope: 'creative_direction',
          recordedAt: seed.seedEvents[0]?.timestamp ?? '2026-10-02T18:00:00.000Z',
          applicableUntil: undefined,
        },
      ],
      pairingOutcomes: [
        {
          pairKey: 'SW-RESIDENT-001:SW-RESIDENT-005:concepting',
          residentAId: 'SW-RESIDENT-001',
          residentBId: 'SW-RESIDENT-005',
          taskType: 'concepting',
          outcomeKind: 'PRODUCTIVE_FRICTION',
          notes: 'Precision vs spectacle — high quality when paired for concepting',
        },
        {
          pairKey: 'SW-RESIDENT-001:SW-RESIDENT-005:rapid_execution',
          residentAId: 'SW-RESIDENT-001',
          residentBId: 'SW-RESIDENT-005',
          taskType: 'rapid_execution',
          outcomeKind: 'PRODUCTIVE_FRICTION',
          notes: 'Slower alignment — context-specific chemistry',
        },
      ],
      worldStories: [],
      privateDisclosures: [],
      residentRequests: [],
      activeCastRoles: [],
      humanEmployees: new Map(),
      trainingCanons: new Map(),
      proposedCorrections: [],
      trainingEscalations: [],
      alumni: new Set(),
    };
  }
  return store;
}
