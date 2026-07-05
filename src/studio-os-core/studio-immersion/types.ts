export type StudioRoomVariant =
  | 'headquarters'
  | 'production-floor'
  | 'cinema'
  | 'editorial'
  | 'publishing-wing'
  | 'newsroom'
  | 'analytics-center'
  | 'labs'
  | 'institute';

export type ConciergePresenceState = 'available' | 'thinking' | 'busy' | 'completed';

export type OrganizationalPresenceActivity = {
  id: string;
  concierge: string;
  activity: string;
  location: string;
  state: ConciergePresenceState;
  progressPct?: number;
};

export type ChiefConciergeBrief = {
  greeting: string;
  lines: string[];
  cta?: { label: string; route: string };
};

export type ScreenMoment = {
  id: string;
  message: string;
  tone: 'celebration' | 'milestone' | 'countdown' | 'council';
};
