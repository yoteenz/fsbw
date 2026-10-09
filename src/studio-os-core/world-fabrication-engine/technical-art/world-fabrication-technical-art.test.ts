import { describe, expect, it } from 'vitest';
import {
  PRODUCTION_PROFILE_REGISTRY,
  resolveProductionProfile,
  classifyDeliverableForProfile,
  listProfileIdsByLane,
} from './production-profiles';
import {
  expectedColorSpaceForMapCategory,
  validateTextureMapColorSpace,
  validateGeometryArtifacts,
} from './geometry-uv-texture-material';
import {
  SITE00_BUILD_OBJECT_PACKAGE_AUDIT,
  getSite00BuildObjectAuditRows,
} from './examples/site00-build-object-audit';
import { packageCompletenessSummary, inferFolderExpectations } from './asset-package';
import { evaluateTechnicalQualityGates } from './quality-gates';
import { getEngineDeliveryProfile, ENGINE_DELIVERY_PROFILES } from './delivery-profiles';
import {
  STUDIO_WORLD_SEASON1_RESIDENT_IDS,
  validateCharacterRequirements,
} from './character-rig-animation';
import { runLaneTechnicalQa } from './technical-qa';
import {
  attachTechnicalArtToCodexHandoff,
  buildCodexTechnicalArtExtension,
} from './codex-handoff-extension';
import type { CodexBlenderHandoffPackage } from '../handoffs';
import { validateCodexHandoff } from '../handoffs';
import { ASTREA_ENTRANCE_PROFILE_ID, getAstreaEntranceProductionProfile } from './examples/astrea-entrance-profile';
import {
  exampleResidentProfileBinding,
  STUDIO_WORLD_CHARACTER_PROFILE_ID,
} from './examples/studio-world-profiles';

describe('production lanes and profiles', () => {
  it('registers four canonical example profiles', () => {
    expect(Object.keys(PRODUCTION_PROFILE_REGISTRY).length).toBeGreaterThanOrEqual(4);
    expect(resolveProductionProfile('SITE00_BUILD_OBJECT_WEB_3D')?.productionLane).toBe(
      'PROP_INTERACTIVE_OBJECT_ART'
    );
    expect(listProfileIdsByLane('CHARACTER_ART')).toContain(STUDIO_WORLD_CHARACTER_PROFILE_ID);
  });

  it('classifies deliverables as required, optional, or not applicable', () => {
    const profile = resolveProductionProfile('SITE00_BUILD_OBJECT_WEB_3D')!;
    expect(classifyDeliverableForProfile(profile, 'skeleton')).toBe('NOT_APPLICABLE');
    expect(classifyDeliverableForProfile(profile, 'runtime_glb')).toBe('REQUIRED');
    expect(classifyDeliverableForProfile(profile, 'collision_mesh')).toBe('OPTIONAL');
  });
});

describe('geometry and texture contracts', () => {
  it('validates required geometry roles', () => {
    const results = validateGeometryArtifacts(
      [{ role: 'RUNTIME_GEOMETRY', assetRef: 'mesh.glb', objectNamingStable: true, pivotDocumented: true }],
      ['RUNTIME_GEOMETRY', 'SOURCE_GEOMETRY']
    );
    expect(results.find((r) => r.message.includes('SOURCE_GEOMETRY'))?.passed).toBe(false);
  });

  it('enforces PBR color space by map category', () => {
    expect(expectedColorSpaceForMapCategory('BASE_COLOR')).toBe('SRGB');
    expect(expectedColorSpaceForMapCategory('NORMAL')).toBe('NON_COLOR_DATA');
    const errors = validateTextureMapColorSpace({
      mapId: 'n1',
      category: 'NORMAL',
      colorSpace: 'SRGB',
      validationStatus: 'PASS',
    });
    expect(errors.length).toBe(1);
  });
});

describe('asset package completeness', () => {
  it('audits SITE 00 build object with distinct completeness cells', () => {
    const rows = getSite00BuildObjectAuditRows();
    const rig = rows.find((r) => r.slot === 'skeleton');
    expect(rig?.expected).toBe('NOT_APPLICABLE');
    const collision = rows.find((r) => r.slot === 'collision_mesh');
    expect(collision?.actual).toBe('MISSING');
    const summary = packageCompletenessSummary(SITE00_BUILD_OBJECT_PACKAGE_AUDIT);
    expect(summary.blocking.length).toBe(0);
  });

  it('infers folder expectations from profile', () => {
    const folders = inferFolderExpectations(ASTREA_ENTRANCE_PROFILE_ID);
    expect(folders).toContain('02_SOURCE_MODELS');
    expect(folders).toContain('00_MANIFEST');
  });
});

describe('quality gates and delivery profiles', () => {
  it('evaluates conditional gates without blocking static props on animation', () => {
    const gates = evaluateTechnicalQualityGates(
      'SITE00_BUILD_OBJECT_WEB_3D',
      SITE00_BUILD_OBJECT_PACKAGE_AUDIT,
      true,
      false
    );
    const animGate = gates.find((g) => g.gate === 'ANIMATION_READY');
    expect(animGate).toBeUndefined();
    const visual = gates.find((g) => g.gate === 'FOUNDER_VISUAL_APPROVAL');
    expect(visual?.satisfied).toBe(true);
  });

  it('exposes engine delivery profiles', () => {
    expect(getEngineDeliveryProfile('WEB_3D').preferredFormats).toContain('GLB');
    expect(ENGINE_DELIVERY_PROFILES.UNREAL_WORLD.navigationGenerationNotes[0]).toMatch(/navmesh/i);
  });
});

describe('character technical art', () => {
  it('preserves season 1 resident roster ids', () => {
    expect(STUDIO_WORLD_SEASON1_RESIDENT_IDS).toContain('002_ZURI_HALE');
    expect(exampleResidentProfileBinding('002_ZURI_HALE').fabricationAuthorized).toBe(false);
  });

  it('requires rig for interactive characters at contract level', () => {
    const result = validateCharacterRequirements('INTERACTIVE_CHARACTER');
    expect(result.severity).toBe('CRITICAL');
  });
});

describe('technical QA and codex handoff extension', () => {
  it('runs lane QA with executable vs non-executable findings', () => {
    const findings = runLaneTechnicalQa('PROP_INTERACTIVE_OBJECT_ART', SITE00_BUILD_OBJECT_PACKAGE_AUDIT, []);
    expect(findings.some((f) => f.executableInRepo)).toBe(true);
  });

  it('extends codex handoff without breaking base validation', () => {
    const base: CodexBlenderHandoffPackage = {
      handoffId: 'h1',
      manifestId: 'm1',
      approvedReferenceAssets: ['ref1'],
      spatialSpecificationRef: 'sp1',
      expectedModuleHierarchy: ['root'],
      cameraTargets: ['cam1'],
      exportRequirements: ['GLB'],
      qualityRequirements: ['modular'],
      performanceConstraints: ['web'],
      allowedModificationScope: 'geometry-only',
      costLimitsRef: 'cost1',
      validationSteps: ['manifest'],
      expectedReturnPackage: ['GLB'],
      executionEnvironment: 'CODEX_AGENT',
    };
    expect(validateCodexHandoff(base)).toEqual([]);
    const ext = buildCodexTechnicalArtExtension(base, {
      productionLane: 'PROP_INTERACTIVE_OBJECT_ART',
      productionProfileId: 'SITE00_BUILD_OBJECT_WEB_3D',
      deliveryProfileId: 'WEB_3D',
      assetClassificationRef: 'site00_bld_object_poc',
      geometryRequirements: [],
      topologyRequirements: [],
      uvRequirements: [],
      textureRequirements: [],
      materialDefinitions: [],
      collisionRequirements: [],
      lodRequirements: [],
      validationChecklist: ['package manifest'],
      reviewRenderRequirements: ['turntable'],
      executionCapabilityStatus: 'CONTRACT_ONLY',
    });
    const merged = attachTechnicalArtToCodexHandoff(base, ext);
    expect(merged.technicalArt?.productionProfileId).toBe('SITE00_BUILD_OBJECT_WEB_3D');
  });
});

describe('astrea and studio world example profiles', () => {
  it('defines astréa entrance environment profile', () => {
    expect(getAstreaEntranceProductionProfile()?.deliveryProfileId).toBe('UNREAL_WORLD');
  });
});
