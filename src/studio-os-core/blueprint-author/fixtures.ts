import type { ConstructionPlan } from './construction-plan-schema';
import { CONSTRUCTION_PLAN_SCHEMA_VERSION } from './construction-plan-schema';
import { BLUEPRINT_AUTHOR_VERSION } from './contract';
import { defineAssetSockets } from './asset-socket-system';
import { defineCameraAnchors } from './camera-anchor-system';
import { defineLightingProfile } from './lighting-profile-system';
import type { StyleProfileSpec } from './construction-plan-schema';

export const RECEPTION_CONSTRUCTION_PLAN_FIXTURE_ID = 'reception-construction-plan-v1';

export function fixtureReceptionConstructionPlan(input: {
  organizationId: string;
  buildingId: string;
  floorId: string;
  roomId: string;
  requestId: string;
  founderIntent: string;
  styleProfile: StyleProfileSpec;
}): ConstructionPlan {
  const now = new Date().toISOString();

  const assetSockets = defineAssetSockets([
    {
      socketId: 'ReceptionDeskSocket',
      role: 'hero',
      label: 'Circular concierge desk',
      bounds: { left: '35%', top: '55%', width: '30%', height: '25%' },
      compatibleAssetClasses: ['reception-desk'],
      required: true,
    },
    {
      socketId: 'LandmarkSocket',
      role: 'hero',
      label: 'Signature crystal landmark',
      bounds: { left: '10%', top: '40%', width: '20%', height: '35%' },
      compatibleAssetClasses: ['signature-landmark', 'crystal-installation'],
      required: false,
    },
    {
      socketId: 'LeftSeatingSocket',
      role: 'furniture',
      label: 'Left seating cluster',
      bounds: { left: '5%', top: '65%', width: '15%', height: '20%' },
      compatibleAssetClasses: ['chair', 'lounge'],
      required: false,
    },
    {
      socketId: 'RightSeatingSocket',
      role: 'furniture',
      label: 'Right seating cluster',
      bounds: { left: '80%', top: '65%', width: '15%', height: '20%' },
      compatibleAssetClasses: ['chair', 'lounge'],
      required: false,
    },
    {
      socketId: 'CoffeeTableSocket',
      role: 'furniture',
      label: 'Coffee table',
      bounds: { left: '42%', top: '72%', width: '16%', height: '12%' },
      compatibleAssetClasses: ['table'],
      required: false,
    },
    {
      socketId: 'MonitorSocket',
      role: 'decor',
      label: 'Monitor display',
      bounds: { left: '48%', top: '48%', width: '8%', height: '10%' },
      compatibleAssetClasses: ['glass-object'],
      required: false,
    },
    {
      socketId: 'ReceptionLightingSocket',
      role: 'lighting',
      label: 'Reception accent lighting',
      bounds: { left: '35%', top: '50%', width: '30%', height: '30%' },
      compatibleAssetClasses: [],
      required: true,
    },
    {
      socketId: 'DecorationSocket',
      role: 'decor',
      label: 'Decorative accents',
      bounds: { left: '75%', top: '45%', width: '12%', height: '15%' },
      compatibleAssetClasses: ['plants', 'flowers', 'sculptural-accent'],
      required: false,
    },
    {
      socketId: 'NavigationAnchorSocket',
      role: 'interaction',
      label: 'Navigation anchor',
      bounds: { left: '45%', top: '80%', width: '10%', height: '10%' },
      compatibleAssetClasses: [],
      required: true,
    },
  ]);

  return {
    schemaVersion: CONSTRUCTION_PLAN_SCHEMA_VERSION,
    planId: `plan-${input.requestId}`,
    metadata: {
      revision: 14,
      author: BLUEPRINT_AUTHOR_VERSION,
      authoredAt: now,
      compilerVersion: 'world-compiler.v2',
      organizationId: input.organizationId,
      sceneVersion: 'scene-reception.v4',
    },
    versions: {
      blueprintVersion: '14.0.0',
      organizationVersion: '12.0.0',
      worldVersion: '2.0.0',
      roomVersion: '4.0.0',
      architectureVersion: '4.0.0',
      materialVersion: '12.0.0',
      assetVersion: '7.0.0',
      interactionVersion: '2.0.0',
      lightingVersion: '3.0.0',
      validationVersion: '4.0.0',
      generationVersion: '2.0.0',
      promptVersion: 'signature-landmark-isolated-prompt.v3',
      compilerVersion: 'world-compiler.v2',
    },
    building: {
      buildingId: input.buildingId,
      displayName: 'Studio World HQ',
    },
    floor: {
      floorId: input.floorId,
      level: 1,
      displayName: 'Executive Level',
    },
    room: {
      roomId: input.roomId,
      roomType: 'reception',
      displayName: 'Reception',
      purpose: input.founderIntent || 'Executive reception and concierge presence',
    },
    architecture: {
      architectureId: 'ReceptionShell',
      version: '4.0.0',
      shellSpecId: 'shell-reception-v4',
      immutable: true,
    },
    heroAssets: [
      {
        assetId: 'ReceptionDesk',
        version: '7.0.0',
        assetClass: 'reception-desk',
        socketId: 'ReceptionDeskSocket',
        tier: 'hero',
      },
      {
        assetId: 'CrystalLandmark',
        version: '5.0.0',
        assetClass: 'crystal-installation',
        socketId: 'LandmarkSocket',
        tier: 'hero',
      },
    ],
    furnitureSet: {
      setId: 'ReceptionFurniture',
      version: '2.0.0',
      assets: [
        {
          assetId: 'LeftSeating',
          version: '1.0.0',
          assetClass: 'lounge',
          socketId: 'LeftSeatingSocket',
          tier: 'furniture',
        },
        {
          assetId: 'RightSeating',
          version: '1.0.0',
          assetClass: 'lounge',
          socketId: 'RightSeatingSocket',
          tier: 'furniture',
        },
        {
          assetId: 'CoffeeTable',
          version: '1.0.0',
          assetClass: 'table',
          socketId: 'CoffeeTableSocket',
          tier: 'furniture',
        },
      ],
    },
    decorSet: {
      setId: 'ReceptionDecor',
      version: '1.0.0',
      assets: [
        {
          assetId: 'MonitorDisplay',
          version: '1.0.0',
          assetClass: 'glass-object',
          socketId: 'MonitorSocket',
          tier: 'decor',
        },
        {
          assetId: 'ReceptionPlants',
          version: '1.0.0',
          assetClass: 'plants',
          socketId: 'DecorationSocket',
          tier: 'decor',
        },
      ],
    },
    materialSet: {
      materialSetId: 'FounderMaterialLibrary',
      version: '12.0.0',
      materialIds: [
        'founder-marble',
        'founder-chrome',
        'founder-crystal',
        'founder-glass',
        'founder-red-illumination',
        'founder-white-acrylic',
      ],
      organizationId: input.organizationId,
    },
    lightingProfile: defineLightingProfile({
      profileId: 'ExecutiveReceptionLighting',
      version: '3.0.0',
      colorTemperatureK: 4200,
      reflectionIntensity: 0.85,
      shadowSoftness: 0.35,
      bounceCount: 3,
      glassResponse: 0.92,
      materialResponse: 0.88,
      ambientProfile: 'executive-reception-ambient',
    }),
    cameraAnchors: defineCameraAnchors([
      { anchorId: 'LobbyArrival', label: 'Lobby Arrival', purpose: 'arrival', position: '0,1.6,6', orientation: '0,0,0' },
      { anchorId: 'DeskInspection', label: 'Desk Inspection', purpose: 'inspection', position: '2,1.4,3', orientation: '-5,30,0' },
      { anchorId: 'Overview', label: 'Overview', purpose: 'overview', position: '0,4,10', orientation: '-20,0,0' },
      { anchorId: 'WalkPath', label: 'Walkthrough', purpose: 'walkthrough', position: '0,1.6,4', orientation: '0,0,0' },
      { anchorId: 'Entry', label: 'Entry', purpose: 'photo', position: '-1,1.5,7', orientation: '0,15,0' },
    ]),
    navigationGraph: {
      graphId: 'ReceptionNavigation',
      version: '2.0.0',
      loaded: true,
      entryAnchors: ['main-entrance', 'elevator-bank'],
      walkPaths: ['reception-floor-center', 'concierge-approach'],
    },
    validationProfile: {
      profileId: 'ReceptionValidation',
      version: '4.0.0',
      rules: [
        'correct-size',
        'correct-socket',
        'correct-material-ids',
        'correct-silhouette',
        'correct-transparency',
        'correct-boundaries',
        'correct-scale',
        'correct-orientation',
        'correct-lighting-compatibility',
        'correct-geometry',
      ],
    },
    interactionProfile: {
      profileId: 'ReceptionInteraction',
      version: '2.0.0',
      zones: ['zone-walkable', 'zone-lighting-accent', 'concierge-desk-interaction'],
    },
    styleProfile: input.styleProfile,
    assetSockets,
    collisionZones: ['architecture-shell', 'desk-collision-volume'],
    accessibilityRules: ['walkable-path-clear', 'minimum-door-width'],
    negativeRules: [
      'no-generic-marble',
      'no-generic-stone',
      'no-generic-glass',
      'no-full-scene-render',
      'no-invented-layout',
      'no-invented-lighting-colors',
    ],
    organizationRules: [
      'use-approved-materials-only',
      'socket-placement-only',
      'brand-grounded-hero-assets',
      'immutable-architecture-shell',
    ],
  };
}

export function fixtureFounderReceptionRequest(): import('./contract').FounderCompileRequest {
  return {
    requestId: 'req-reception-story-table-001',
    organizationId: 'frontal-slayer',
    buildingId: 'building-frontal-slayer-hq',
    floorId: 'floor-executive-01',
    roomId: 'room-reception-story-table',
    stationId: 'story-table',
    departmentId: 'executive',
    projectId: 'studio-world-hq',
    founderIntent: 'Executive reception with concierge desk and crystal landmark',
    roomType: 'reception',
    styleProfileId: 'executive-reception',
  };
}
