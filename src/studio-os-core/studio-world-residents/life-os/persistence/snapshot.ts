import type { ResidentCastRoleContract, ResidentId } from '../../types';
import type { ResidentLifeEventEnvelope } from '../event-envelope';
import type {
  FounderInterventionRecord,
  OrganizationalMemoryRecord,
  ResidentBeliefRecord,
  ResidentDecisionRecord,
  ResidentMemoryRecord,
  RumorFragment,
  SocialTruthEvent,
} from '../life-twin-model';
import type {
  PairingOutcomeRecord,
  PrivateDisclosureRecord,
  ResidentRequestRecord,
  WorldStoryRecord,
} from '../life-os-domain-records';
import type { LifeOsSeedBundle } from '../life-os-store';
import type {
  HumanEmployeeLearningProfile,
  ProposedCanonCorrection,
  TrainingCanonDocument,
  TrainingEscalationRecord,
} from '../training-domain';
import type { ResidentRelationshipLifeDimensions } from '../life-twin-model';

/** Serializable full runtime state for rehydration (canon identity stays in registry). */
export type ResidentLifePersistedSnapshot = {
  worldId: string;
  organizationId: string;
  bundles: Record<ResidentId, LifeOsSeedBundle>;
  events: ResidentLifeEventEnvelope[];
  truthEvents: SocialTruthEvent[];
  rumors: RumorFragment[];
  memories: Record<ResidentId, ResidentMemoryRecord[]>;
  beliefs: Record<ResidentId, ResidentBeliefRecord[]>;
  interventions: FounderInterventionRecord[];
  decisions: ResidentDecisionRecord[];
  orgMemory: OrganizationalMemoryRecord[];
  pairingOutcomes: PairingOutcomeRecord[];
  worldStories: WorldStoryRecord[];
  privateDisclosures: PrivateDisclosureRecord[];
  residentRequests: ResidentRequestRecord[];
  activeCastRoles: ResidentCastRoleContract[];
  humanEmployees: HumanEmployeeLearningProfile[];
  trainingCanons: TrainingCanonDocument[];
  proposedCorrections: ProposedCanonCorrection[];
  trainingEscalations: TrainingEscalationRecord[];
  alumni: ResidentId[];
  relationshipLife: ResidentRelationshipLifeDimensions[];
  careerRequests: import('../runtime/career-requests').CareerRequestRecord[];
  completedTickWindows: string[];
};
