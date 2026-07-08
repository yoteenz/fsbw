import type {
  ACTIVATION_PHASES,
  CONTINUOUS_SCALE_LEVELS,
  MISSION_CONTROL_MODES,
  MISSION_CONTROL_TRAVEL_OPTIONS,
} from './constants';
import type { AtlasMapMode } from '../studio-world-atlas/types';

export type MissionControlMode = (typeof MISSION_CONTROL_MODES)[number];
export type ActivationPhase = (typeof ACTIVATION_PHASES)[number];
export type ContinuousScaleLevel = (typeof CONTINUOUS_SCALE_LEVELS)[number];
export type MissionControlTravelOption = (typeof MISSION_CONTROL_TRAVEL_OPTIONS)[number];

export type MissionControlOrbLine = {
  id: string;
  message: string;
  priority: 'high' | 'medium' | 'low';
};

export type ConstellationStar = {
  id: string;
  title: string;
  mapX: number;
  mapY: number;
  brightness: number;
  orbitCount: number;
  knowledgeBridges: number;
  headquarters: boolean;
};

export type WorldHealthSignal = {
  nodeId: string;
  title: string;
  health: 'thriving' | 'growing' | 'stable' | 'strained' | 'opportunity';
  glowIntensity: number;
  label: string;
};

export type TravelPreview = {
  destinationId: string;
  destinationTitle: string;
  routeVerb: string;
  estimatedSeconds: number;
  collaboratorsNearby: string[];
  previewLine: string;
};

export type MissionControlActivationState = {
  phase: ActivationPhase;
  progress: number;
  ready: boolean;
};

export type MissionControlModeMapping = {
  mode: MissionControlMode;
  atlasMapMode: AtlasMapMode;
  tableClass: string;
  ambientClass: string;
};
