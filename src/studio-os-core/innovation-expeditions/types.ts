import type {
  EXPEDITION_PATH_LEVELS,
  EXPEDITION_TYPES,
  LIVE_EVENT_TYPES,
  REWARD_KINDS,
} from './constants';

export type ExpeditionType = (typeof EXPEDITION_TYPES)[number];
export type ExpeditionPathLevel = (typeof EXPEDITION_PATH_LEVELS)[number];
export type LiveEventType = (typeof LIVE_EVENT_TYPES)[number];
export type ExpeditionRewardKind = (typeof REWARD_KINDS)[number];

export type ExpeditionStop = {
  id: string;
  order: number;
  title: string;
  locationLabel: string;
  worldPath: string;
  routePath: string;
  exhibitKind: 'headquarters' | 'blueprint' | 'monument' | 'marketplace' | 'gallery' | 'district' | 'decision';
  storyBeat: string;
  principle: string;
  orbPrompt: string;
  interactiveAvailable: boolean;
};

export type InteractiveMission = {
  id: string;
  expeditionId: string;
  title: string;
  challenge: string;
  skillArea: 'design' | 'operations' | 'navigation' | 'marketplace' | 'innovation';
  optional: boolean;
  completed: boolean;
};

export type ExpeditionReward = {
  id: string;
  kind: ExpeditionRewardKind;
  title: string;
  description: string;
  unlocked: boolean;
  unlockedAt?: string;
};

export type InnovationExpedition = {
  id: string;
  type: ExpeditionType;
  title: string;
  subtitle: string;
  industry?: string;
  durationMinutes: number;
  stopCount: number;
  principleSummary: string;
  pathLevels: ExpeditionPathLevel[];
  stops: ExpeditionStop[];
  missions: InteractiveMission[];
  rewards: ExpeditionReward[];
  featured: boolean;
  communityAuthored?: boolean;
  authorName?: string;
};

export type CommunityExpedition = {
  id: string;
  title: string;
  authorName: string;
  storySummary: string;
  marketplaceListed: boolean;
  rating: number;
};

export type LiveExpeditionEvent = {
  id: string;
  type: LiveEventType;
  title: string;
  scheduledAt: string;
  host: string;
  seatsRemaining: number;
};

export type ExpeditionGuideLine = {
  id: string;
  message: string;
  priority: 'high' | 'medium' | 'low';
};

export type AtlasExpeditionJourney = {
  expeditionId: string;
  title: string;
  routeIntensity: number;
  activatedBuildings: string[];
  label: string;
};

export type OrganizationInnovationExpeditionsProfile = {
  organizationId: string;
  companyName: string;
  updatedAt: string;
  expeditionScore: number;
  expeditions: InnovationExpedition[];
  communityExpeditions: CommunityExpedition[];
  liveEvents: LiveExpeditionEvent[];
  activeExpeditionId: string | null;
  activeStopIndex: number;
  activePathLevel: ExpeditionPathLevel;
  completedExpeditionIds: string[];
  unlockedRewards: ExpeditionReward[];
  dockExpeditionLine: string;
  syncedSources: string[];
  guidedKnowledgeNetwork: true;
};

export type InnovationExpeditionsStore = {
  version: string;
  profiles: OrganizationInnovationExpeditionsProfile[];
};

export type InnovationExpeditionsDockAdvice = {
  response: string;
  concierge: string;
  expeditionScore?: number;
};
