/** Frontal Slayer Guided Tour Experience — presentation layer types. */

export type GuidedTourPhase =
  | 'idle'
  | 'opening'
  | 'running'
  | 'paused'
  | 'transition'
  | 'mobile'
  | 'ending'
  | 'complete';

export type GuidedTourTransitionKind = 'fade' | 'elevator' | 'bloom' | 'glass-wipe' | 'mobile-reveal' | 'none';

export type GuidedTourHotspot = {
  id: string;
  label: string;
  /** Viewport-relative anchor 0–1 */
  x: number;
  y: number;
};

export type GuidedTourPresenterNotes = {
  /** ~20–30 seconds when read aloud */
  voiceover: string;
  whyExists: string;
  problemSolved: string;
  emotionalResponse: string;
  designPhilosophy: string;
  customerJourney: string;
  futureExpansion: string;
};

export type GuidedTourStop = {
  id: string;
  sectionLabel: string;
  title: string;
  subtitle?: string;
  /** Route to navigate — omit for pure overlay stops */
  route?: string;
  durationMs: number;
  transition: GuidedTourTransitionKind;
  /** Use tower elevator when navigating between desktop floors */
  useElevator?: boolean;
  hotspots?: GuidedTourHotspot[];
  presenter: GuidedTourPresenterNotes;
  /** Highlight atmosphere on this stop */
  cinematicDrift?: boolean;
};

export type GuidedTourModeFlags = {
  guidedTourActive: boolean;
  creativePartnerMode: boolean;
  recordMode: boolean;
  luxuryAudioEnabled: boolean;
  autoTourRunning: boolean;
  slowMotion: boolean;
};
