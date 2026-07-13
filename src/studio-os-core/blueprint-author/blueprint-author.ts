import type { FounderCompileRequest } from './contract';
import { BLUEPRINT_AUTHOR_VERSION } from './contract';
import type { ConstructionPlan } from './construction-plan-schema';
import { CONSTRUCTION_PLAN_SCHEMA_VERSION } from './construction-plan-schema';
import { defineAssetSockets } from './asset-socket-system';
import { defineCameraAnchors } from './camera-anchor-system';
import { defineLightingProfile } from './lighting-profile-system';
import { resolveStyleProfile } from './style-library';
import { fixtureReceptionConstructionPlan } from './fixtures';

export const BLUEPRINT_AUTHOR_ENGINE_VERSION = 'blueprint-author-engine.v1';

/**
 * Blueprint Author™ — translates founder intent to deterministic Construction Plan.
 * Performs ZERO image generation. Design only.
 */
export function authorConstructionPlan(request: FounderCompileRequest): ConstructionPlan {
  const style = resolveStyleProfile(request.styleProfileId);
  if (!style) {
    throw new Error(`Unknown style profile: ${request.styleProfileId}`);
  }

  if (request.roomType === 'reception' || request.stationId === 'story-table') {
    return fixtureReceptionConstructionPlan({
      organizationId: request.organizationId,
      buildingId: request.buildingId,
      floorId: request.floorId,
      roomId: request.roomId,
      requestId: request.requestId,
      founderIntent: request.founderIntent,
      styleProfile: style,
    });
  }

  return buildGenericConstructionPlan(request, style);
}

function buildGenericConstructionPlan(
  request: FounderCompileRequest,
  style: import('./construction-plan-schema').StyleProfileSpec
): ConstructionPlan {
  const now = new Date().toISOString();
  const sockets = defineAssetSockets([
    {
      socketId: 'socket-hero-primary',
      role: 'hero',
      label: 'Primary hero asset',
      bounds: { left: '35%', top: '55%', width: '30%', height: '25%' },
      compatibleAssetClasses: ['signature-landmark', 'reception-desk'],
      required: true,
    },
  ]);

  return {
    schemaVersion: CONSTRUCTION_PLAN_SCHEMA_VERSION,
    planId: `plan-${request.requestId}`,
    metadata: {
      revision: 1,
      author: BLUEPRINT_AUTHOR_VERSION,
      authoredAt: now,
      compilerVersion: 'world-compiler.v2',
      organizationId: request.organizationId,
      sceneVersion: 'scene.v1',
    },
    versions: {
      blueprintVersion: '1.0.0',
      organizationVersion: '1.0.0',
      worldVersion: '1.0.0',
      roomVersion: '1.0.0',
      architectureVersion: '1.0.0',
      materialVersion: '1.0.0',
      assetVersion: '1.0.0',
      interactionVersion: '1.0.0',
      lightingVersion: '1.0.0',
      validationVersion: '1.0.0',
      generationVersion: '1.0.0',
      promptVersion: '1.0.0',
      compilerVersion: 'world-compiler.v2',
    },
    building: { buildingId: request.buildingId, displayName: 'Studio World HQ' },
    floor: { floorId: request.floorId, level: 1, displayName: 'Executive Level' },
    room: {
      roomId: request.roomId,
      roomType: request.roomType,
      displayName: request.roomType,
      purpose: request.founderIntent,
    },
    architecture: {
      architectureId: `arch-${request.roomId}`,
      version: '1.0.0',
      shellSpecId: `shell-${request.roomId}`,
      immutable: true,
    },
    heroAssets: [
      {
        assetId: 'hero-primary',
        version: '1.0.0',
        assetClass: 'signature-landmark',
        socketId: 'socket-hero-primary',
        tier: 'hero',
      },
    ],
    furnitureSet: { setId: 'furniture-default', version: '1.0.0', assets: [] },
    decorSet: { setId: 'decor-default', version: '1.0.0', assets: [] },
    materialSet: {
      materialSetId: 'FounderMaterialLibrary',
      version: '1.0.0',
      materialIds: ['founder-marble', 'founder-chrome', 'founder-crystal'],
      organizationId: request.organizationId,
    },
    lightingProfile: defineLightingProfile({
      profileId: 'DefaultLighting',
      version: '1.0.0',
      colorTemperatureK: 4500,
      reflectionIntensity: 0.7,
      shadowSoftness: 0.5,
      bounceCount: 2,
      glassResponse: 0.8,
      materialResponse: 0.9,
      ambientProfile: 'executive-ambient',
    }),
    cameraAnchors: defineCameraAnchors([
      { anchorId: 'arrival', label: 'Arrival Camera', purpose: 'arrival', position: '0,1.6,5', orientation: '0,0,0' },
      { anchorId: 'overview', label: 'Overview Camera', purpose: 'overview', position: '0,3,8', orientation: '-15,0,0' },
    ]),
    navigationGraph: {
      graphId: 'nav-default',
      version: '1.0.0',
      loaded: true,
      entryAnchors: ['main-entrance'],
      walkPaths: ['center-path'],
    },
    validationProfile: {
      profileId: 'DefaultValidation',
      version: '1.0.0',
      rules: ['correct-socket', 'correct-material-ids', 'correct-scale', 'correct-orientation'],
    },
    interactionProfile: {
      profileId: 'DefaultInteraction',
      version: '1.0.0',
      zones: ['walkable-center'],
    },
    styleProfile: style,
    assetSockets: sockets,
    collisionZones: ['architecture-shell'],
    accessibilityRules: ['walkable-path-clear'],
    negativeRules: ['no-generic-marble', 'no-full-scene-render', 'no-invented-layout'],
    organizationRules: ['use-approved-materials-only', 'socket-placement-only'],
  };
}
