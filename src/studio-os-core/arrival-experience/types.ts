/** Arrival Experience V1.0 — ceremonial headquarters welcome (Milestone 73.6). */

export type ArrivalExperienceWorkspaceId = 'ndxbook' | 'frontal-slayer' | 'studio-os' | 'portfolio';

export type ArrivalPhase =
  | 'transition'
  | 'welcome'
  | 'introductions'
  | 'tour'
  | 'reveal'
  | 'briefing'
  | 'memory'
  | 'home';

export type ArrivalSequenceStep = {
  id: string;
  phase: string;
  description: string;
  atmosphere: string;
  order: number;
};

export type ChiefOfStaffArrivalWelcome = {
  headline: string;
  message: string[];
  tone: string;
  closingNote: string;
};

export type ExecutiveIntroduction = {
  id: string;
  executive: string;
  workspace: string;
  purpose: string;
  responsibilities: string;
  leadershipPhilosophy: string;
  executiveCompass: string;
  founderSupport: string;
};

export type HeadquartersTourStop = {
  id: string;
  stop: string;
  introduction: string;
  order: number;
};

export type OrganizationalRevealItem = {
  id: string;
  element: string;
  reveal: string;
  timing: 'early' | 'mid' | 'late';
};

export type EnvironmentalStorytelling = {
  id: string;
  signal: string;
  expression: string;
  atmosphere: string;
};

export type FirstExecutiveBriefing = {
  organizationalMaturity: string;
  currentPriorities: string[];
  recommendedExecutives: string[];
  recommendedArchitects: string[];
  immediateOpportunities: string[];
  organizationalStrengths: string[];
  nextMilestone: string;
  todaysFocus: string;
};

export type ArrivalMemory = {
  arrivalDate: string;
  organizationFirstDay: string;
  initialMaturity: string;
  firstExecutiveTeam: string[];
  firstRoadmap: string;
  foundersFirstVision: string;
  preservedNote: string;
};

export type ArrivalExperienceStore = {
  version: string;
  lastUpdatedAt: string;
  activeWorkspaceId: ArrivalExperienceWorkspaceId;
  companyName: string;
  arrivalPhase: ArrivalPhase;
  dashboard: {
    summary: string;
    sequenceProgressPct: number;
    executivesIntroduced: number;
    tourStopsComplete: number;
    arrivalComplete: boolean;
    headquartersLive: boolean;
  };
  arrivalPhilosophy: string[];
  arrivalSequence: ArrivalSequenceStep[];
  chiefOfStaffWelcome: ChiefOfStaffArrivalWelcome;
  executiveIntroductions: ExecutiveIntroduction[];
  headquartersTour: HeadquartersTourStop[];
  organizationalReveal: OrganizationalRevealItem[];
  environmentalStorytelling: EnvironmentalStorytelling[];
  firstExecutiveBriefing: FirstExecutiveBriefing;
  arrivalMemory: ArrivalMemory;
  finalMessage: {
    headline: string;
    message: string;
  };
  futureOpportunities: string[];
};
