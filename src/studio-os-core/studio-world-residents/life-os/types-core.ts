import type { ResidentId } from '../types';

export type WorldId = string;
export type OrganizationId = string;
export type LocationId = string;
export type ResidentEventId = string;
export type MemoryId = string;
export type HumanEmployeeId = string;
export type TrainingCanonId = string;

export type ResidentPresenceState =
  | 'AVAILABLE'
  | 'FOCUSED'
  | 'IN_MEETING'
  | 'OFFSITE'
  | 'COMMUTING'
  | 'AT_HOME'
  | 'SOCIAL'
  | 'DO_NOT_DISTURB'
  | 'ASLEEP'
  | 'AWAY'
  | 'ON_LEAVE';

export type NeedDimension =
  | 'ENERGY'
  | 'FOCUS'
  | 'SOCIAL_CONNECTION'
  | 'PRIVACY'
  | 'CREATIVE_STIMULATION'
  | 'AUTONOMY'
  | 'RECOGNITION'
  | 'BELONGING'
  | 'ENVIRONMENTAL_COMFORT'
  | 'PURPOSE'
  | 'NOVELTY'
  | 'RECOVERY';

export type EmotionalOperatingDimension =
  | 'CALM'
  | 'CONFIDENCE'
  | 'IRRITATION'
  | 'CURIOSITY'
  | 'SOCIAL_OPENNESS'
  | 'PLAYFULNESS'
  | 'VULNERABILITY'
  | 'TRUST'
  | 'PRESSURE';

export type MemoryClass =
  | 'CORE_MEMORY'
  | 'EPISODIC_MEMORY'
  | 'RELATIONAL_MEMORY'
  | 'EMOTIONAL_MEMORY'
  | 'PROCEDURAL_MEMORY'
  | 'WORLD_MEMORY'
  | 'CAST_MEMORY'
  | 'PRIVATE_MEMORY'
  | 'DORMANT_MEMORY';

export type KnowledgeState =
  | 'KNOWS'
  | 'SUSPECTS'
  | 'BELIEVES'
  | 'MISUNDERSTANDS'
  | 'DOES_NOT_KNOW'
  | 'PRIVATE_KNOWLEDGE'
  | 'SHARED_SECRET';

export type ResidentAgencyVerb =
  | 'OBSERVE'
  | 'INTERPRET'
  | 'INITIATE'
  | 'PROPOSE'
  | 'COLLABORATE'
  | 'DELEGATE'
  | 'EXECUTE'
  | 'ESCALATE'
  | 'REFUSE';

export type AutonomyLevel = 'NONE' | 'ASSISTED' | 'ROLE_BOUND' | 'HIGH' | 'FULL_WITHIN_AUTHORITY';

export type DecisionDisposition =
  | 'HANDLE_MYSELF'
  | 'HANDLE_WITH_RESIDENT'
  | 'INFORM_FOUNDER_AFTERWARD'
  | 'ASK_FOUNDER_BEFORE_ACTION'
  | 'ESCALATE_IMMEDIATELY';

export type CareerStateKind =
  | 'ESTABLISHED'
  | 'GROWING'
  | 'THRIVING'
  | 'STABLE'
  | 'RESTLESS'
  | 'OVEREXTENDED'
  | 'UNDERUTILIZED'
  | 'MISALIGNED'
  | 'SEEKING_GROWTH'
  | 'CONSIDERING_CHANGE'
  | 'TRANSFER_REQUESTED'
  | 'ON_ROTATION'
  | 'ON_LEAVE'
  | 'NOTICE_PERIOD'
  | 'ALUMNI';

export type SimulationMode = 'LIVE' | 'COMPRESSED' | 'OVERNIGHT' | 'WEEKEND' | 'RETROSPECTIVE';

export type VisibilityScope =
  | 'PUBLIC'
  | 'OFFICE_KNOWN'
  | 'TEAM_ONLY'
  | 'FRIENDS_ONLY'
  | 'PRIVATE'
  | 'SECRET'
  | 'FOUNDER_PRIVILEGED'
  | 'MANAGER_ONLY'
  | 'COMPLIANCE_ONLY';

export type FounderInterventionKind = 'SOFT_DIRECTION' | 'DIRECTORIAL_DIRECTION' | 'SYSTEM_OVERRIDE';

export type DomainEntityKind =
  | 'STUDIO_WORLD_RESIDENT'
  | 'HUMAN_EMPLOYEE'
  | 'BRAND_VP_CHARACTER'
  | 'CAST_ROLE_PERSONA'
  | 'CLIENT_EXCLUSIVE_TRAINER';

export type ResidentLifeTwinRef = {
  residentId: ResidentId;
  worldId: WorldId;
  organizationId: OrganizationId;
  lifeOsVersion: string;
};
