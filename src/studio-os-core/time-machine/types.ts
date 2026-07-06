import type {
  PLAYBACK_STATES,
  RECONSTRUCTION_LAYERS,
  REPLAY_EVENT_TYPES,
  TIME_MACHINE_PHILOSOPHY,
  TIMELINE_CONTROLS,
} from './constants';

export type ReplayEventType = (typeof REPLAY_EVENT_TYPES)[number];
export type ReconstructionLayer = (typeof RECONSTRUCTION_LAYERS)[number];
export type TimelineControl = (typeof TIMELINE_CONTROLS)[number];
export type PlaybackState = (typeof PLAYBACK_STATES)[number];
export type TimeMachinePhilosophyLine = (typeof TIME_MACHINE_PHILOSOPHY)[number];

export type ReconstructedLayer = {
  layer: ReconstructionLayer;
  label: string;
  snapshot: string;
  active: boolean;
};

export type ReplayStep = {
  stepIndex: number;
  timestamp: string;
  label: string;
  actor: string;
  action: string;
  layerHighlights: ReconstructionLayer[];
  detail: string;
};

export type StudioIntelligenceCommentary = {
  whatHappened: string;
  whyItHappened: string;
  alternativeOutcomes: string[];
  whatCouldHavePrevented: string[];
  recommendedImprovements: string[];
};

export type ReplayEvent = {
  id: string;
  eventType: ReplayEventType;
  eventLabel: string;
  title: string;
  occurredAt: string;
  durationMinutes: number;
  stepCount: number;
  reconstructedLayers: ReconstructedLayer[];
  steps: ReplayStep[];
  commentary: StudioIntelligenceCommentary;
  replayable: true;
};

export type TimelineFilter = {
  eventType: ReplayEventType | 'all';
  dateFrom: string | null;
  dateTo: string | null;
  layer: ReconstructionLayer | 'all';
};

export type MomentComparison = {
  momentA: { label: string; timestamp: string; summary: string };
  momentB: { label: string; timestamp: string; summary: string };
  differences: string[];
};

export type OrganizationTimeMachineProfile = {
  organizationId: string;
  companyName: string;
  updatedAt: string;
  replayScore: number;
  totalReplayableEvents: number;
  eventsReconstructed: number;
  playbackState: PlaybackState;
  currentReplayId: string | null;
  currentStepIndex: number;
  activeFilter: TimelineFilter;
  replayEvents: ReplayEvent[];
  momentComparison: MomentComparison | null;
  dockTimeMachineLine: string;
  understandWhyNotWhat: true;
  lastSyncedAt: string;
};

export type TimeMachineStore = {
  version: string;
  profiles: OrganizationTimeMachineProfile[];
};

export type TimeMachineDockAdvice = {
  response: string;
  concierge: string;
  replayScore?: number;
};

export type TimeMachineSearchHit = {
  type: 'event' | 'step' | 'layer';
  id: string;
  label: string;
  score: number;
  matchReason: string;
};
