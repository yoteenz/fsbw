import type { BlueprintShellRecord } from './blueprint-shell';
import type { RoomBlueprint } from './room-blueprint';
import type { WorldAssetRecord } from './asset-hierarchy';
import type { StudioWorldRoomRef } from './contract';
import { resolveRoomBlueprintType } from './room-blueprint';

export const RECEPTION_ROOM_FIXTURE_ID = 'reception-story-table-v1';

export function fixtureReceptionRoom(organizationId = 'frontal-slayer'): {
  room: StudioWorldRoomRef;
  blueprintShell: BlueprintShellRecord;
  roomBlueprint: RoomBlueprint;
  heroAssets: WorldAssetRecord[];
} {
  const now = new Date().toISOString();
  const room: StudioWorldRoomRef = {
    roomId: 'room-reception-story-table',
    roomType: 'reception',
    floorId: 'floor-executive-01',
    buildingId: 'building-frontal-slayer-hq',
    organizationId,
    purpose: 'Executive reception and concierge presence',
    operationalStatus: 'activating',
  };

  const blueprintShell: BlueprintShellRecord = {
    shellId: 'shell-reception-v1',
    organizationId,
    buildingId: room.buildingId,
    floorId: room.floorId,
    roomId: room.roomId,
    version: 1,
    immutable: true,
    lockedAt: now,
    sourceUrl: 'https://example.com/shell-reception.png',
    promptVersion: 'environment-shell-prompt.v1',
    providerModel: 'fal-ai/nano-banana-pro/edit',
    content: {
      walls: true,
      ceiling: true,
      floor: true,
      windows: true,
      glass: true,
      stairs: false,
      elevatorOpenings: true,
      circulation: true,
      lightingCavities: true,
      structuralOpenings: true,
      architecturalFraming: true,
    },
    health: 'healthy',
    repairHistory: [],
    createdAt: now,
    updatedAt: now,
  };

  const roomBlueprint: RoomBlueprint = {
    blueprintId: 'rb-reception-story-table',
    blueprintVersion: 'room-blueprint.v1',
    room,
    roomType: resolveRoomBlueprintType('story-table'),
    purpose: room.purpose,
    boundaries: 'Executive atrium reception zone',
    cameraAnchors: ['concierge-hero', 'entrance-wide'],
    navigationAnchors: ['main-entrance', 'elevator-bank'],
    walkableAreas: ['reception-floor-center'],
    assetSockets: [
      {
        socketId: 'socket-hero-desk',
        role: 'hero',
        label: 'Circular concierge desk',
        bounds: { left: '35%', top: '55%', width: '30%', height: '25%' },
        compatibleAssetClasses: ['reception-desk', 'signature-landmark'],
        required: true,
      },
      {
        socketId: 'socket-landmark',
        role: 'hero',
        label: 'Signature landmark',
        bounds: { left: '10%', top: '40%', width: '20%', height: '35%' },
        compatibleAssetClasses: ['signature-landmark'],
        required: false,
      },
    ],
    zones: [
      {
        zoneId: 'zone-walkable',
        zoneType: 'walkable',
        label: 'Reception walk path',
        bounds: { left: '20%', top: '70%', width: '60%', height: '20%' },
      },
      {
        zoneId: 'zone-lighting-accent',
        zoneType: 'lighting',
        label: 'Crimson accent wash',
        bounds: { left: '35%', top: '50%', width: '30%', height: '30%' },
      },
    ],
    generationPhase: 'room-blueprint',
    createdAt: now,
  };

  const heroAssets: WorldAssetRecord[] = [
    {
      assetId: 'hero-concierge-desk',
      organizationId,
      roomId: room.roomId,
      tier: 'hero',
      assetClass: 'reception-desk',
      health: 'healthy',
      version: 1,
      promptVersion: 'signature-landmark-isolated-prompt.v3',
      providerModel: 'fal-ai/nano-banana-2/edit',
      generationMetadata: { brandGrounded: true },
      placementMetadata: { socketId: 'socket-hero-desk' },
      boundingVolume: { width: 2.4, height: 1.1, depth: 2.4 },
      socketCompatibility: ['socket-hero-desk'],
      transparencyStatus: 'alpha',
      qualityScore: 0.92,
      repairHistory: [],
      sourceUrl: 'https://example.com/hero-desk.png',
      approved: true,
      createdAt: now,
    },
  ];

  return { room, blueprintShell, roomBlueprint, heroAssets };
}
