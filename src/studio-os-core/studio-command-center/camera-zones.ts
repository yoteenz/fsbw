export const COMMAND_CENTER_CAMERA_ZONE_IDS = ['threshold', 'executive-atrium'] as const;

export type CommandCenterCameraZoneId = (typeof COMMAND_CENTER_CAMERA_ZONE_IDS)[number];
