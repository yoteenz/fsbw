import type { ResidentId } from '../types';
import type { HumanEmployeeId, OrganizationId, ResidentEventId, VisibilityScope, WorldId } from './types-core';

export type TruthStatus = 'AUTHORITATIVE' | 'SIMULATED' | 'PROPOSED' | 'SUPERSEDED';

export type ResidentLifeEventType =
  | 'LOCATION_CHANGED'
  | 'ACTIVITY_STARTED'
  | 'NEED_STATE_CHANGED'
  | 'DECISION_RECORDED'
  | 'SOCIAL_INTERACTION'
  | 'RUMOR_PROPAGATED'
  | 'WORK_DELEGATED'
  | 'RESIDENT_REQUEST_CREATED'
  | 'CAREER_EVENT'
  | 'FOUNDER_INTERVENTION'
  | 'WORLD_STORY'
  | 'MEMORY_FORMED'
  | 'REFLECTION_WINDOW'
  | 'TRAINING_SESSION'
  | 'ORG_MEMORY_RECORDED';

export type ResidentLifeEventEnvelope = {
  eventId: ResidentEventId;
  eventType: ResidentLifeEventType;
  timestamp: string;
  worldId: WorldId;
  organizationId: OrganizationId;
  residentIds: ResidentId[];
  humanUserIds?: HumanEmployeeId[];
  locationId?: string;
  projectId?: string;
  visibility: VisibilityScope;
  source: 'simulation' | 'founder' | 'studio_os' | 'system';
  payload: Record<string, unknown>;
  causalParentEventId?: ResidentEventId;
  truthStatus: TruthStatus;
  canonVersion: string;
};
