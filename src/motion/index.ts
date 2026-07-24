import './styles/fsms.css';

/** Frontal Slayer Motion System (FSMS) — public API */

// Components
export { CrystalTitle } from './components/CrystalTitle';
export { CrystalSubtitle } from './components/CrystalSubtitle';
export { CrystalLogo } from './components/CrystalLogo';
export { LightSweep } from './components/LightSweep';
export { SparkleSystem } from './components/SparkleSystem';
export { RevealMask } from './components/RevealMask';
export { FadeSequence } from './components/FadeSequence';
export { GlassOverlay } from './components/GlassOverlay';
export { TransitionLayer } from './components/TransitionLayer';
export { SceneIntro } from './components/SceneIntro';
export { SceneOutro } from './components/SceneOutro';
export { SectionDivider } from './components/SectionDivider';
export { LogoReveal } from './components/LogoReveal';
export { CampaignTitle } from './components/CampaignTitle';
export { ChapterTitle } from './components/ChapterTitle';
export { FloatingGlassPanel } from './components/FloatingGlassPanel';
export { CrystalTextBase } from './components/CrystalTextBase';

// Engine
export {
  DEFAULT_LIGHTING,
  buildLightingFromPreset,
  sweepKeyframes,
  generateSparkleField,
  buildEnvironmentReflectionStyle,
} from './engine';
export type { SparkleEngineOptions, EnvironmentReflectionOptions } from './engine';

// Hooks
export { useReducedMotion } from './hooks/useReducedMotion';
export { useFsmsPreset } from './hooks/useFsmsPreset';
export { useCrystalReveal } from './hooks/useCrystalReveal';
export type { UseFsmsPresetOptions, ResolvedFsmsPreset } from './hooks/useFsmsPreset';
export type { UseCrystalRevealOptions, CrystalRevealPhase } from './hooks/useCrystalReveal';

// Tokens & presets
export {
  FSMS_PRESETS,
  resolveFsmsPreset,
  scalePresetTiming,
} from './tokens/presets';
export {
  FSMS_EASE_LUXURY,
  FSMS_EASE_MORNING,
  FSMS_EASE_DISSOLVE,
  fsmsFramerEase,
} from './tokens/easing';
export { FSMS_CSS_VARS, applyFsmsCssVariables } from './tokens/css-variables';
export type {
  FsmsAlign,
  FsmsPresetId,
  FsmsPreset,
  FsmsPhaseTiming,
  FsmsLightingConfig,
  FsmsSparkleSpec,
  FsmsBaseProps,
  CrystalTextProps,
} from './tokens/types';

// Utils
export { resolvePresetId } from './utils/resolvePresetId';
