/** Campus transition speed — founder preference (localStorage). */
export type CampusTransitionSpeed = 'cinematic' | 'standard' | 'instant';

export type CampusTransitionKind = 'arrival' | 'departure';

export type CampusTransitionPhase =
  | 'idle'
  | 'departing'
  | 'traveling'
  | 'revealing'
  | 'concierge'
  | 'briefing'
  | 'exiting'
  | 'returning'
  | 'complete';

export type HeadquartersTransitionStyle =
  | 'glass-hallway'
  | 'skybridge'
  | 'elevator'
  | 'courtyard-walk'
  | 'soft-zoom'
  | 'atrium'
  | 'architectural-flythrough';

export type HeadquartersAtmosphereCue = {
  id: string;
  label: string;
  motion: 'walk' | 'glow' | 'display' | 'reflection' | 'production';
};

export type HeadquartersProfile = {
  workspaceId: string;
  industryLabel: string;
  maturityTone: string;
  cultureTone: string;
  transitionStyle: HeadquartersTransitionStyle;
  travelCaption: string;
  revealCaption: string;
  ambientCues: HeadquartersAtmosphereCue[];
  lightingGradient: string;
  exteriorAccent: string;
};

export type CampusArrivalBriefing = {
  greeting: string;
  conciergeLines: string[];
  priorities: string[];
  executiveUpdates: string[];
  urgentApprovals: string[];
  productionStatus: string[];
  publishingSchedule: string[];
  organizationalHealth: string[];
  recentAchievements: string[];
  upcomingMilestones: string[];
};

export type CampusTransitionRequest = {
  workspaceId: string;
  destinationPath: string;
  kind: CampusTransitionKind;
  showBriefing?: boolean;
  fromWorkspaceId?: string | null;
};

export type CampusTransitionState = {
  active: boolean;
  phase: CampusTransitionPhase;
  request: CampusTransitionRequest | null;
  profile: HeadquartersProfile | null;
  briefing: CampusArrivalBriefing | null;
  briefingExpanded: boolean;
};

export const CAMPUS_TRANSITION_SPEED_KEY = 'studioOs_campusTransitionSpeed_v1';
