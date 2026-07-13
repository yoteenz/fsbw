import type { ConstructionPlan } from '../blueprint-author/construction-plan-schema';
import { CONSTRUCTION_PLAN_SCHEMA_VERSION } from '../blueprint-author/construction-plan-schema';
import { defineAssetSockets } from '../blueprint-author/asset-socket-system';
import { defineCameraAnchors } from '../blueprint-author/camera-anchor-system';
import { defineLightingProfile } from '../blueprint-author/lighting-profile-system';
import { BLUEPRINT_AUTHOR_VERSION } from '../blueprint-author/contract';
import { defineDefaultDepartmentUiSockets } from '../architecture-law-001/ui-socket-registry';
import type { CanonicalMainDepartmentId } from './canonical-department-registry';
import { getCanonicalDepartmentRecord } from './canonical-department-registry';
import { resolveDepartmentCharter } from './department-charters';
import { resolveDepartmentFingerprint } from './department-architectural-fingerprints';

export const DEPARTMENT_BLUEPRINT_BUILDER_VERSION = 'department-blueprint-builder.v1' as const;

type DepartmentBlueprintSpec = {
  architectureId: string;
  shellSpecId: string;
  sceneVersionPrefix: string;
  lightingProfileId: string;
  ambientProfile: string;
  navigationGraphId: string;
  heroAssets: Array<{ assetId: string; assetClass: string; socketId: string; label: string }>;
  furnitureAssets: Array<{ assetId: string; assetClass: string; socketId: string; label: string }>;
  decorAssets: Array<{ assetId: string; assetClass: string; socketId: string; label: string }>;
};

function buildSpecFromFingerprint(departmentId: CanonicalMainDepartmentId): DepartmentBlueprintSpec {
  const fp = resolveDepartmentFingerprint(departmentId);
  const shellVersion = '1';
  const architectureId = fp.shellId;
  const shellSpecId = `shell-${departmentId}-v${shellVersion}`;

  const commandDockSocket = {
    assetId: `${departmentId}-command-dock`,
    assetClass: 'command-dock-shell',
    socketId: 'CommandDockSocket',
    label: 'Integrated blank command dock',
  };
  const workbenchSocket = {
    assetId: `${departmentId}-workbench`,
    assetClass: 'workbench-shell',
    socketId: 'WorkbenchSocket',
    label: 'Integrated blank workbench',
  };

  const heroFromFingerprint = fp.signatureElements.slice(0, 3).map((el, i) => ({
    assetId: `${departmentId}-hero-${i}`,
    assetClass: 'department-signature',
    socketId: `HeroSocket${i}`,
    label: el,
  }));

  const furnitureFromFingerprint = fp.signatureElements.slice(3, 6).map((el, i) => ({
    assetId: `${departmentId}-furniture-${i}`,
    assetClass: 'department-furniture',
    socketId: `FurnitureSocket${i}`,
    label: el,
  }));

  return {
    architectureId,
    shellSpecId,
    sceneVersionPrefix: `scene-${departmentId}`,
    lightingProfileId: `${architectureId}Lighting`,
    ambientProfile: `${departmentId}-ambient`,
    navigationGraphId: `${architectureId}Navigation`,
    heroAssets: [...heroFromFingerprint, commandDockSocket],
    furnitureAssets: [...furnitureFromFingerprint, workbenchSocket],
    decorAssets: fp.signatureElements.slice(6, 8).map((el, i) => ({
      assetId: `${departmentId}-decor-${i}`,
      assetClass: 'department-decor',
      socketId: `DecorSocket${i}`,
      label: el,
    })),
  };
}

function buildSockets(spec: DepartmentBlueprintSpec) {
  const sockets = [
    ...spec.heroAssets.map((a) => ({
      socketId: a.socketId,
      role: 'hero' as const,
      label: a.label,
      bounds: { left: '20%', top: '40%', width: '25%', height: '25%' },
      compatibleAssetClasses: [a.assetClass],
      required: true,
    })),
    ...spec.furnitureAssets.map((a, i) => ({
      socketId: a.socketId,
      role: 'furniture' as const,
      label: a.label,
      bounds: { left: `${10 + i * 15}%`, top: '65%', width: '14%', height: '18%' },
      compatibleAssetClasses: [a.assetClass],
      required: i < 2,
    })),
    ...spec.decorAssets.map((a, i) => ({
      socketId: a.socketId,
      role: 'decor' as const,
      label: a.label,
      bounds: { left: `${60 + i * 10}%`, top: '45%', width: '12%', height: '15%' },
      compatibleAssetClasses: [a.assetClass],
      required: false,
    })),
    {
      socketId: 'ViewportSocket',
      role: 'interaction' as const,
      label: 'Department viewport',
      bounds: { left: '30%', top: '25%', width: '40%', height: '40%' },
      compatibleAssetClasses: [],
      required: true,
    },
  ];
  return defineAssetSockets(sockets);
}

export function buildCanonicalDepartmentBlueprint(input: {
  departmentId: CanonicalMainDepartmentId;
  organizationId: string;
  buildingId: string;
  floorId: string;
  requestId: string;
  renderKind: 'landscape' | 'portrait';
  blueprintRevision: number;
  promptVersion: string;
  founderIntent: string;
}): ConstructionPlan {
  const record = getCanonicalDepartmentRecord(input.departmentId)!;
  const charter = resolveDepartmentCharter(input.departmentId);
  const fp = resolveDepartmentFingerprint(input.departmentId);
  const spec = buildSpecFromFingerprint(input.departmentId);
  const now = new Date().toISOString();
  const revision = input.blueprintRevision;
  const assetSockets = buildSockets(spec);

  const plan: ConstructionPlan = {
    schemaVersion: CONSTRUCTION_PLAN_SCHEMA_VERSION,
    planId: `canonical-plan-${input.departmentId}-${input.renderKind}-r${revision}`,
    metadata: {
      revision,
      author: BLUEPRINT_AUTHOR_VERSION,
      authoredAt: now,
      compilerVersion: 'world-compiler.v2',
      organizationId: input.organizationId,
      sceneVersion: `${spec.sceneVersionPrefix}.v${revision}`,
    },
    versions: {
      blueprintVersion: `${revision}.0.0`,
      organizationVersion: '1.0.0',
      worldVersion: '2.0.0',
      roomVersion: `${revision}.0.0`,
      architectureVersion: '1.0.0',
      materialVersion: '12.0.0',
      assetVersion: '1.0.0',
      interactionVersion: '2.0.0',
      lightingVersion: '3.0.0',
      validationVersion: '4.0.0',
      generationVersion: '2.0.0',
      promptVersion: input.promptVersion,
      compilerVersion: 'world-compiler.v2',
    },
    building: { buildingId: input.buildingId, displayName: 'Studio World HQ' },
    floor: { floorId: input.floorId, level: 1, displayName: 'Canonical Infrastructure' },
    room: {
      roomId: input.departmentId,
      roomType: 'canonical-department',
      displayName: record.name,
      purpose: input.founderIntent || charter.mission,
    },
    architecture: {
      architectureId: spec.architectureId,
      version: '1.0.0',
      shellSpecId: spec.shellSpecId,
      immutable: true,
    },
    heroAssets: spec.heroAssets.map((a) => ({
      assetId: a.assetId,
      version: '1.0.0',
      assetClass: a.assetClass,
      socketId: a.socketId,
      tier: 'hero' as const,
    })),
    furnitureSet: {
      setId: `${spec.architectureId}Furniture`,
      version: '1.0.0',
      assets: spec.furnitureAssets.map((a) => ({
        assetId: a.assetId,
        version: '1.0.0',
        assetClass: a.assetClass,
        socketId: a.socketId,
        tier: 'furniture' as const,
      })),
    },
    decorSet: {
      setId: `${spec.architectureId}Decor`,
      version: '1.0.0',
      assets: spec.decorAssets.map((a) => ({
        assetId: a.assetId,
        version: '1.0.0',
        assetClass: a.assetClass,
        socketId: a.socketId,
        tier: 'decor' as const,
      })),
    },
    materialSet: {
      materialSetId: record.materialLibraryId,
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
      profileId: spec.lightingProfileId,
      version: '3.0.0',
      colorTemperatureK: record.lightingProfileId.includes('executive') ? 4200 : 5000,
      reflectionIntensity: 0.85,
      shadowSoftness: 0.35,
      bounceCount: 3,
      glassResponse: 0.92,
      materialResponse: 0.88,
      ambientProfile: spec.ambientProfile,
    }),
    cameraAnchors: defineCameraAnchors([
      { anchorId: 'Overview', label: 'Department Overview', purpose: 'overview', position: '0,4,10', orientation: '-20,0,0' },
      { anchorId: 'Workbench', label: 'Workbench View', purpose: 'inspection', position: '2,1.4,4', orientation: '-5,30,0' },
      { anchorId: 'Arrival', label: 'Department Arrival', purpose: 'arrival', position: '0,1.6,6', orientation: '0,0,0' },
    ]),
    navigationGraph: {
      graphId: spec.navigationGraphId,
      version: '2.0.0',
      loaded: true,
      entryAnchors: [`${input.departmentId}-entrance`],
      walkPaths: [`${input.departmentId}-center-path`],
    },
    validationProfile: {
      profileId: `${spec.architectureId}Validation`,
      version: '4.0.0',
      rules: [
        'correct-size',
        'correct-socket',
        'correct-material-ids',
        'department-identity-isolated',
        'no-reception-contamination',
        'correct-scale',
        'correct-orientation',
      ],
    },
    interactionProfile: {
      profileId: `${spec.architectureId}Interaction`,
      version: '2.0.0',
      zones: [`zone-${input.departmentId}-walkable`, 'command-dock-zone', 'workbench-zone'],
    },
    styleProfile: {
      styleId: 'studio-world-canonical',
      version: '1',
      organizationStyle: 'studio-world-global',
      visualLanguage: charter.visualIdentity,
    },
    assetSockets,
    collisionZones: [`${spec.architectureId}-shell`, 'command-dock-collision', 'workbench-collision'],
    accessibilityRules: ['walkable-path-clear', 'minimum-door-width'],
    negativeRules: [
      'no-reception-desk',
      'no-waiting-lounge',
      'no-concierge-furniture',
      'no-reception-shell',
      'no-generic-marble',
      'no-invented-layout',
      ...fp.forbiddenElements.map((f) => `no-${f.toLowerCase().replace(/\s+/g, '-')}`),
    ],
    organizationRules: [
      'use-approved-materials-only',
      'socket-placement-only',
      'department-identity-required',
      'immutable-architecture-shell',
    ],
    uiMountSockets: defineDefaultDepartmentUiSockets(input.departmentId),
  };

  return plan;
}

export function isCanonicalDepartmentPlan(plan: ConstructionPlan): boolean {
  return plan.room.roomType === 'canonical-department' || plan.metadata.organizationId === 'studio-os';
}
