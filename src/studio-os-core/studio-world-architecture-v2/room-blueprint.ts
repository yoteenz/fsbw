import type { StudioWorldRoomRef } from './contract';

export const ROOM_BLUEPRINT_VERSION = 'room-blueprint.v1';

export type RoomBlueprintType =
  | 'reception'
  | 'founder-suite'
  | 'showroom'
  | 'tv-lounge'
  | 'gallery'
  | 'concierge'
  | 'story-table'
  | 'custom';

export type AssetSocket = {
  socketId: string;
  role: 'hero' | 'furniture' | 'decor' | 'lighting' | 'interaction';
  label: string;
  bounds: { left: string; top: string; width: string; height: string };
  compatibleAssetClasses: string[];
  required: boolean;
};

export type RoomZone = {
  zoneId: string;
  zoneType: 'walkable' | 'lighting' | 'sound' | 'interaction' | 'visibility' | 'navigation';
  label: string;
  bounds: { left: string; top: string; width: string; height: string };
};

export type RoomBlueprint = {
  blueprintId: string;
  blueprintVersion: string;
  room: StudioWorldRoomRef;
  roomType: RoomBlueprintType;
  purpose: string;
  boundaries: string;
  cameraAnchors: string[];
  navigationAnchors: string[];
  walkableAreas: string[];
  assetSockets: AssetSocket[];
  zones: RoomZone[];
  /** Intelligence only — no assets generated at this phase */
  generationPhase: 'room-blueprint';
  createdAt: string;
};

export function roomBlueprintHasRequiredSockets(blueprint: RoomBlueprint): boolean {
  const required = blueprint.assetSockets.filter((s) => s.required);
  return required.every((s) => s.socketId && s.compatibleAssetClasses.length > 0);
}

export function resolveRoomBlueprintType(stationId: string): RoomBlueprintType {
  const map: Record<string, RoomBlueprintType> = {
    'story-table': 'story-table',
    reception: 'reception',
    concierge: 'concierge',
    gallery: 'gallery',
    'executive-atrium': 'reception',
  };
  return map[stationId] ?? 'custom';
}
