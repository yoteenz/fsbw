import type { CommandCenterCameraZoneId } from '../../../../studio-os-core/studio-command-center/camera-zones';

export type CommandCenterCameraZone = {
  id: CommandCenterCameraZoneId;
  label: string;
  shortLabel: string;
  index: number;
  requiresArrival: boolean;
  teaching: string;
};

export const COMMAND_CENTER_CAMERA_ZONES: CommandCenterCameraZone[] = [
  {
    id: 'threshold',
    label: 'Command Threshold™',
    shortLabel: 'Threshold',
    index: 0,
    requiresArrival: false,
    teaching: 'Threshold™ — sightlines into the Executive Atrium™ beyond.',
  },
  {
    id: 'executive-atrium',
    label: 'Executive Atrium™',
    shortLabel: 'Atrium',
    index: 1,
    requiresArrival: true,
    teaching: 'Central operational hub — all company wings branch from here.',
  },
];

export function getCommandCenterZone(id: CommandCenterCameraZoneId): CommandCenterCameraZone {
  return COMMAND_CENTER_CAMERA_ZONES.find((z) => z.id === id) ?? COMMAND_CENTER_CAMERA_ZONES[0];
}

export function commandCenterZonePanVw(zone: CommandCenterCameraZone): number {
  return zone.index * 100;
}
