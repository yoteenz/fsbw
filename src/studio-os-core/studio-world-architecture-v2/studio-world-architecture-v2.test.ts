import { describe, expect, it } from 'vitest';
import {
  WORLD_CONSTRUCTION_HIERARCHY,
  WORLD_COMPILER_V2_ORDER,
  validateBlueprintShell,
  assertBlueprintShellImmutable,
  roomBlueprintHasRequiredSockets,
  assetTierForClass,
  subsystemForAssetTier,
  assertMaterialLibraryOnly,
  computeRoomHealth,
  decideLocalizedRecovery,
  planRoomImmuneRecovery,
  isGenerationPhase,
  isAssemblyOnlyPhase,
  assertArchitectureGatePassed,
  assembleSceneStackV2,
  resolveModelForAssetTier,
  runWorldBuildV2,
  fixtureReceptionRoom,
  STUDIO_WORLD_ARCHITECTURE_VERSION,
} from './index';

describe('Studio World Architecture v2', () => {
  it('defines canonical construction hierarchy', () => {
    expect(WORLD_CONSTRUCTION_HIERARCHY[0]).toBe('studio-world');
    expect(WORLD_CONSTRUCTION_HIERARCHY).toContain('architecture');
    expect(WORLD_CONSTRUCTION_HIERARCHY).toContain('hero-assets');
    expect(WORLD_CONSTRUCTION_HIERARCHY).toContain('living-world');
  });

  it('orders World Compiler v2 correctly', () => {
    expect(WORLD_COMPILER_V2_ORDER[0]).toBe('world-blueprint');
    expect(WORLD_COMPILER_V2_ORDER).toContain('scene-assembly');
    expect(WORLD_COMPILER_V2_ORDER[WORLD_COMPILER_V2_ORDER.length - 1]).toBe('activate-room');
  });

  it('separates generation from assembly phases', () => {
    expect(isGenerationPhase('world-blueprint')).toBe(true);
    expect(isGenerationPhase('scene-assembly')).toBe(false);
    expect(isAssemblyOnlyPhase('scene-assembly')).toBe(true);
  });

  it('blocks continuation when architecture validation fails', () => {
    const gate = assertArchitectureGatePassed(false, 'signature-asset-generation');
    expect(gate.ok).toBe(false);
  });

  it('validates BlueprintShell architecture only', () => {
    const { blueprintShell } = fixtureReceptionRoom();
    const result = validateBlueprintShell({ shell: blueprintShell });
    expect(result.passed).toBe(true);
    expect(result.repairScope).toBe('blueprint-shell-only');
    expect(assertBlueprintShellImmutable(blueprintShell)).toBe(true);
  });

  it('room blueprint stores intelligence without assets', () => {
    const { roomBlueprint } = fixtureReceptionRoom();
    expect(roomBlueprint.generationPhase).toBe('room-blueprint');
    expect(roomBlueprintHasRequiredSockets(roomBlueprint)).toBe(true);
  });

  it('classifies asset tiers independently', () => {
    expect(assetTierForClass('reception-desk')).toBe('hero');
    expect(assetTierForClass('chair')).toBe('furniture');
    expect(assetTierForClass('plants')).toBe('decor');
    expect(subsystemForAssetTier('hero')).toBe('hero-assets');
  });

  it('requires material library — forbids AI invention', () => {
    const check = assertMaterialLibraryOnly({
      organizationId: 'frontal-slayer',
      requestedMaterialIds: ['founder-marble', 'founder-red-illumination'],
    });
    expect(check.ok).toBe(true);
    const bad = assertMaterialLibraryOnly({
      organizationId: 'frontal-slayer',
      requestedMaterialIds: ['founder-marble'],
      allowAiInventedMaterials: true,
    });
    expect(bad.ok).toBe(false);
  });

  it('localizes immune recovery — landmark only regenerates', () => {
    const decision = decideLocalizedRecovery('hero-assets', 'critical');
    expect(decision.action).toBe('regenerate-subsystem');
    expect(decision.roomRemainsOperational).toBe(true);
    expect(decision.forbiddenActions).toContain('regenerate-entire-scene');
    const decor = decideLocalizedRecovery('decor', 'critical');
    expect(decor.action).toBe('remove-decor');
  });

  it('never rebuilds room for furniture failure', () => {
    const plan = planRoomImmuneRecovery([
      {
        subsystem: 'furniture',
        state: 'critical',
        lastCheckedAt: new Date().toISOString(),
        message: 'Chair unhealthy',
      },
    ]);
    expect(plan[0]?.action).toBe('load-fallback-asset');
    expect(plan[0]?.forbiddenActions).toContain('rebuild-room');
  });

  it('scene assembly performs zero generation', () => {
    const result = assembleSceneStackV2({
      departmentId: 'creative-direction',
      projectId: 'default',
      stationId: 'story-table',
      mountedLayers: {
        'environment-shell': { publicUrl: 'https://example.com/shell.png', approved: true },
        'signature-landmark': { publicUrl: 'https://example.com/desk.png', approved: true },
      },
    });
    expect(result.generationOccurred).toBe(false);
    expect(result.assembledSteps.length).toBeGreaterThan(0);
  });

  it('resolves model per asset tier via registry', () => {
    const route = resolveModelForAssetTier({
      tier: 'hero',
      organizationId: 'frontal-slayer',
      brandGroundingRequired: true,
    });
    expect(route.endpointId).toContain('nano-banana-2');
  });

  it('runs full reception fixture through orchestrator', () => {
    const fx = fixtureReceptionRoom();
    const result = runWorldBuildV2({
      organizationId: 'frontal-slayer',
      buildingId: fx.room.buildingId,
      floorId: fx.room.floorId,
      roomId: fx.room.roomId,
      stationId: 'story-table',
      departmentId: 'creative-direction',
      projectId: 'default',
      blueprintShell: fx.blueprintShell,
      roomBlueprint: fx.roomBlueprint,
      heroAssets: fx.heroAssets,
      furnitureAssets: [],
      decorAssets: [],
      mountedLayers: {
        'environment-shell': { publicUrl: fx.blueprintShell.sourceUrl!, approved: true },
        'signature-landmark': { publicUrl: fx.heroAssets[0]!.sourceUrl!, approved: true },
      },
      materialIds: ['founder-marble', 'founder-red-illumination'],
    });
    expect(result.success).toBe(true);
    expect(result.roomHealth.operationalStatus).toBe('online');
    expect(STUDIO_WORLD_ARCHITECTURE_VERSION).toBe('studio-world-architecture.v2');
  });

  it('architecture failure repairs shell only', () => {
    const fx = fixtureReceptionRoom();
    const broken = { ...fx.blueprintShell, content: { ...fx.blueprintShell.content, walls: false } };
    const result = runWorldBuildV2({
      organizationId: 'frontal-slayer',
      buildingId: fx.room.buildingId,
      floorId: fx.room.floorId,
      roomId: fx.room.roomId,
      stationId: 'story-table',
      departmentId: 'creative-direction',
      projectId: 'default',
      blueprintShell: broken,
      roomBlueprint: fx.roomBlueprint,
      heroAssets: fx.heroAssets,
      furnitureAssets: [],
      decorAssets: [],
      mountedLayers: {},
      materialIds: ['founder-marble'],
      architectureValidation: { wallContinuity: false },
    });
    expect(result.success).toBe(false);
    expect(result.failedPhase).toBe('architecture-validation');
    expect(result.roomHealth.operationalStatus).toBe('offline');
  });

  it('computes building health from rooms', () => {
    const health = computeRoomHealth([
      { subsystem: 'architecture', state: 'healthy', lastCheckedAt: '', message: null },
      { subsystem: 'hero-assets', state: 'healthy', lastCheckedAt: '', message: null },
    ]);
    expect(health.operationalStatus).toBe('online');
  });
});
