import type { AtlasMapMode } from '../studio-world-atlas/types';
import type { MissionControlMode, MissionControlModeMapping } from './types';

export const MISSION_CONTROL_MODE_MAPPINGS: MissionControlModeMapping[] = [
  {
    mode: 'architecture',
    atlasMapMode: 'architectural-blueprint',
    tableClass: 'is-mode-architecture',
    ambientClass: 'mc-ambient-architecture',
  },
  {
    mode: 'civilization',
    atlasMapMode: 'organization',
    tableClass: 'is-mode-civilization',
    ambientClass: 'mc-ambient-civilization',
  },
  {
    mode: 'knowledge',
    atlasMapMode: 'innovation',
    tableClass: 'is-mode-knowledge',
    ambientClass: 'mc-ambient-knowledge',
  },
  {
    mode: 'marketplace',
    atlasMapMode: 'marketplace',
    tableClass: 'is-mode-marketplace',
    ambientClass: 'mc-ambient-marketplace',
  },
  {
    mode: 'expansion',
    atlasMapMode: 'master-planner',
    tableClass: 'is-mode-expansion',
    ambientClass: 'mc-ambient-expansion',
  },
  {
    mode: 'time',
    atlasMapMode: 'future-vision',
    tableClass: 'is-mode-time',
    ambientClass: 'mc-ambient-time',
  },
  {
    mode: 'energy',
    atlasMapMode: 'operations',
    tableClass: 'is-mode-energy',
    ambientClass: 'mc-ambient-energy',
  },
];

export function resolveMissionControlModeFromAtlas(atlasMode: AtlasMapMode): MissionControlMode {
  const found = MISSION_CONTROL_MODE_MAPPINGS.find((m) => m.atlasMapMode === atlasMode);
  return found?.mode ?? 'architecture';
}

export function resolveAtlasModeFromMissionControl(mode: MissionControlMode): AtlasMapMode {
  return MISSION_CONTROL_MODE_MAPPINGS.find((m) => m.mode === mode)?.atlasMapMode ?? 'architectural-blueprint';
}

export function resolveModeMapping(mode: MissionControlMode): MissionControlModeMapping {
  return (
    MISSION_CONTROL_MODE_MAPPINGS.find((m) => m.mode === mode) ?? MISSION_CONTROL_MODE_MAPPINGS[0]!
  );
}
