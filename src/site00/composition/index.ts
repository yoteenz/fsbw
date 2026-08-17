export type {
  CompositionAnalysisStatus,
  CompositionFocalPoint,
  CompositionLayoutContext,
  CompositionRules,
  CompositionZone,
  CompositionZoneType,
  DisplayedImageBounds,
  EnvironmentCompositionMap,
  NormalizedRect,
  RegisteredOverlay,
  SemanticZoneRole,
  ViewportRect,
} from './types';

export {
  allCompositionZones,
  buildCompositionLayout,
  compositionCssVars,
  computeDisplayedImageBounds,
  isImplementationReady,
  normalizedRectToViewport,
} from './engine';

export {
  detectProtectedCollisions,
  formatCompositionWarnings,
  type CompositionCollision,
} from './collision';

export {
  EnvironmentalStage,
  useCompositionStage,
  useCompositionZone,
  CompositionStageContext,
} from './EnvironmentalStage';

export { CompositionZoneSlot } from './CompositionZoneSlot';
export { useCompositionOverlayRef } from './useCompositionOverlayRef';
