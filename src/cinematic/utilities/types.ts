/** Frontal Slayer Cinematic System (FSCS) — shared types */

import type { CSSProperties, ReactNode } from 'react';
import type { FsmsPresetId } from '../../motion/tokens/types';

export type FscsCameraId =
  | 'drone-push'
  | 'slow-push'
  | 'side-tracking'
  | 'rear-follow'
  | 'front-tracking'
  | 'orbit'
  | 'pedestal'
  | 'reveal'
  | 'static-luxury'
  | 'macro-detail'
  | 'hero-product'
  | 'architectural-reveal';

export type FscsShotId =
  | 'opening-establishing'
  | 'lifestyle-coverage'
  | 'environmental-insert'
  | 'product-hero'
  | 'character-reveal'
  | 'walking-sequence'
  | 'storefront-reveal'
  | 'interior-reveal'
  | 'closing-hero'
  | 'logo-ending';

export type FscsTransitionId =
  | 'crystal-fade'
  | 'luxury-dissolve'
  | 'architectural-reveal'
  | 'light-sweep'
  | 'glass-reflection'
  | 'soft-blur'
  | 'morning-glow'
  | 'elegant-cut'
  | 'invisible-match-cut';

export type FscsTimelineId =
  | 'commercial-30'
  | 'commercial-60'
  | 'brand-film-90'
  | 'launch-campaign'
  | 'social-reel'
  | 'product-reveal'
  | 'documentary'
  | 'founder-story';

export type FscsSceneTemplateId =
  | 'luxury-arrival'
  | 'morning-routine'
  | 'shopping-district'
  | 'showroom-walkthrough'
  | 'founder-introduction'
  | 'customer-story'
  | 'transformation-reveal'
  | 'product-spotlight'
  | 'membership-reveal'
  | 'campaign-ending';

export type FscsTitleKind =
  | 'campaign'
  | 'chapter'
  | 'scene'
  | 'location'
  | 'product'
  | 'episode'
  | 'credits'
  | 'lower-third';

export type FscsAudioCueId =
  | 'music-main'
  | 'music-ambient'
  | 'ambient-city'
  | 'footsteps'
  | 'door-chime'
  | 'coffee-bell'
  | 'wind'
  | 'birds'
  | 'room-tone';

export type FscsCampaignBeatId =
  | 'opening-atmosphere'
  | 'environmental-context'
  | 'character-introduction'
  | 'journey'
  | 'discovery'
  | 'emotional-peak'
  | 'brand-reveal'
  | 'closing-statement'
  | 'logo'
  | 'end-card';

export type FscsCameraPreset = {
  id: FscsCameraId;
  label: string;
  movementSpeed: number;
  acceleration: number;
  framing: 'wide' | 'medium' | 'close' | 'macro' | 'hero';
  focalLengthSim: number;
  parallax: number;
  durationMs: number;
  easing: string;
};

export type FscsShotTemplate = {
  id: FscsShotId;
  label: string;
  recommendedCamera: FscsCameraId;
  durationMs: number;
  holdMs: number;
  transition: FscsTransitionId;
};

export type FscsTransitionPreset = {
  id: FscsTransitionId;
  label: string;
  durationMs: number;
  fsmsPreset?: FsmsPresetId;
  easing: string;
  description: string;
};

export type FscsTimelinePreset = {
  id: FscsTimelineId;
  label: string;
  totalDurationMs: number;
  beats: FscsCampaignBeatId[];
  pacing: 'slow' | 'moderate' | 'dynamic';
};

export type FscsSceneTemplate = {
  id: FscsSceneTemplateId;
  label: string;
  shots: FscsShotId[];
  camera: FscsCameraId;
  transition: FscsTransitionId;
  rhythmHoldMs: number;
  silenceBeforeRevealMs: number;
};

export type FscsAudioCue = {
  id: FscsAudioCueId;
  label: string;
  layer: 'music' | 'ambient' | 'foley' | 'tone';
  defaultVolume: number;
  fadeInMs: number;
  fadeOutMs: number;
};

export type FscsAudioMarker = {
  cueId: FscsAudioCueId;
  atMs: number;
  action: 'in' | 'out' | 'swell' | 'duck';
};

export type FscsCampaignBeat = {
  id: FscsCampaignBeatId;
  label: string;
  suggestedDurationMs: number;
  silenceBeforeMs: number;
  holdAfterMs: number;
  recommendedTransition: FscsTransitionId;
};

export type FscsBaseProps = {
  className?: string;
  style?: CSSProperties;
  children?: ReactNode;
};

export type FscsTitleProps = FscsBaseProps & {
  text: string;
  kind?: FscsTitleKind;
  duration?: number;
  delay?: number;
};
