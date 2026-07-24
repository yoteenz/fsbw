import './styles/fscs.css';

/**
 * Frontal Slayer Cinematic System (FSCS)
 * Official cinematic language for every Frontal Slayer production.
 */

// Types & utilities
export * from './utilities';

// Camera
export { FSCS_CAMERA_PRESETS, resolveCameraPreset } from './camera';
export { useCameraPreset } from './camera/useCameraPreset';

// Transitions
export { FSCS_TRANSITION_PRESETS, resolveTransitionPreset } from './transitions';
export { useCinematicTransition } from './transitions/useCinematicTransition';

// Timeline
export {
  FSCS_TIMELINE_PRESETS,
  resolveTimelinePreset,
  allocateBeatDurations,
} from './timeline';
export { useCinematicTimeline, useFscsTimeline } from './timeline/useCinematicTimeline';

// Story & campaign
export {
  FSCS_CAMPAIGN_BEATS,
  FSCS_STORY_RHYTHM,
  resolveCampaignBeat,
} from './story';

// Audio
export { FSCS_AUDIO_CUES, FSCS_BEAT_AUDIO_MAP, resolveAudioCue } from './audio';

// Templates
export {
  FSCS_SCENE_TEMPLATES,
  FSCS_SHOT_LIBRARY,
  resolveSceneTemplate,
  resolveShotTemplate,
} from './templates';

// Titles (FSMS integration)
export {
  CinematicTitle,
  FscsTitle,
  CampaignCinematicTitle,
  ChapterCinematicTitle,
  SceneCinematicTitle,
  LocationCinematicTitle,
  ProductCinematicTitle,
  EpisodeCinematicTitle,
  CreditsCinematicTitle,
  CinematicLogoEnding,
} from './titles';

// Overlays
export { LowerThird, CinematicOverlay, CreditsOverlay } from './overlays';
export type { LowerThirdProps, CinematicOverlayProps, CreditsOverlayProps } from './overlays';

// Scenes
export {
  CinematicScene,
  FscsScene,
  LuxuryArrivalScene,
  MorningRoutineScene,
  ShowroomWalkthroughScene,
  CampaignEndingScene,
  CinematicSequence,
} from './scenes';
export type { CinematicSceneProps, SceneTemplateProps, CinematicSequenceProps } from './scenes';

// Integration notes (FDS + FSMS + Studio World)
export const FSCS_INTEGRATION = {
  motion: '@/motion',
  designSystem: '@/design-system',
  studioWorld: 'Studio World experience compiler (future pipeline hook)',
  aiPipeline: 'Future AI generation pipeline (shot/camera metadata export)',
} as const;
