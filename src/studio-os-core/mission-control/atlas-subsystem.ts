/**
 * Atlas Subsystem™ — World Atlas lives inside Mission Control™, not beside it.
 * Mission Control owns the holographic civilization experience; Atlas supplies the world model.
 */

export const ATLAS_SUBSYSTEM_ID = 'studio-world-atlas';
export const ATLAS_SUBSYSTEM_LABEL = 'Atlas Subsystem™';

export type MissionControlSubsystem = {
  id: string;
  label: string;
  role: string;
  owns: string[];
  delegatesTo: string[];
};

export const MISSION_CONTROL_SUBSYSTEMS: MissionControlSubsystem[] = [
  {
    id: 'mission-control-core',
    label: 'Mission Control™',
    role: 'Holographic civilization command — activation, views, health, Orb projection.',
    owns: [
      'Activation Sequence™',
      'Atlas Table™',
      'Continuous Scale™',
      'World Health™',
      'Orb Projection System™',
      'Environmental Storytelling™',
      'Progressive Presence™ gates',
    ],
    delegatesTo: [ATLAS_SUBSYSTEM_ID],
  },
  {
    id: ATLAS_SUBSYSTEM_ID,
    label: ATLAS_SUBSYSTEM_LABEL,
    role: 'World model — nodes, travel resolution, fog, planner data.',
    owns: [
      'World Graph™ nodes',
      'Architectural Navigation™ paths',
      'Fog of Discovery™',
      'Master Planner™ data',
    ],
    delegatesTo: ['studio-world-experience', 'progressive-presence'],
  },
];

export function getAtlasSubsystem(): MissionControlSubsystem {
  return MISSION_CONTROL_SUBSYSTEMS.find((s) => s.id === ATLAS_SUBSYSTEM_ID)!;
}
