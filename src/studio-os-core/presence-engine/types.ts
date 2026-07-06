import type { ATMOSPHERE_STATES, COMMUNICATION_CONTEXTS, EXECUTIVE_PRESENCE_TYPES } from './constants';

export type ExecutivePresenceType = (typeof EXECUTIVE_PRESENCE_TYPES)[number];
export type CommunicationContext = (typeof COMMUNICATION_CONTEXTS)[number];
export type AtmosphereState = (typeof ATMOSPHERE_STATES)[number];

export type ExecutivePresenceMoment = {
  id: string;
  type: ExecutivePresenceType;
  label: string;
  message: string;
  tone: 'warm' | 'professional' | 'supportive' | 'celebratory';
  deliveredAt: string;
};

export type CommunicationStyleSnapshot = {
  context: CommunicationContext;
  label: string;
  active: boolean;
  styleDescription: string;
  examplePhrase: string;
};

export type OrganizationalAtmosphereSnapshot = {
  state: AtmosphereState;
  label: string;
  description: string;
  headquartersCue: string;
  intensityPct: number;
};

export type OrganizationPresenceProfile = {
  organizationId: string;
  companyName: string;
  industryId: string;
  updatedAt: string;
  presenceScore: number;
  reassuranceLevel: number;
  activeCommunicationContext: CommunicationContext;
  activeAtmosphere: AtmosphereState;
  presenceMoments: ExecutivePresenceMoment[];
  communicationStyles: CommunicationStyleSnapshot[];
  organizationalAtmosphere: OrganizationalAtmosphereSnapshot;
  dockPresenceLine: string;
  neverNoisy: true;
  syncedSources: string[];
};

export type PresenceEngineStore = {
  version: string;
  profiles: OrganizationPresenceProfile[];
};

export type PresenceEngineDockAdvice = {
  response: string;
  concierge: string;
  presenceScore?: number;
  atmosphere?: AtmosphereState;
};
