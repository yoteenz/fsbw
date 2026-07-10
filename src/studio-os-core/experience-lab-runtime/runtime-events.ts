/**
 * Canonical Runtime Event Bus — Experience Lab publishes, World Compiler listens.
 */

export const RUNTIME_EVENT_TYPES = [
  'RuntimeStarted',
  'ShellLoaded',
  'LandmarkGenerated',
  'ArchitectureGenerated',
  'FurnitureGenerated',
  'MaterialsApplied',
  'LightingCalculated',
  'AtmosphereApplied',
  'MotionApplied',
  'ReflectionsBaked',
  'RenderCompleted',
  'RuntimeError',
  'RuntimePaused',
  'RuntimeResumed',
  'ProgressUpdated',
  'CompilerSubscribed',
  'CompilerDetached',
] as const;

export type RuntimeEventType = (typeof RUNTIME_EVENT_TYPES)[number];

export type RuntimeEventPayload = {
  type: RuntimeEventType;
  sessionId: string;
  compileRunId: string;
  timestamp: number;
  stage?: string;
  progressPct?: number;
  detail?: string;
  errorCode?: string;
};
