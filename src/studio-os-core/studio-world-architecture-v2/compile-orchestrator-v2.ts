import type { BlueprintShellRecord } from './blueprint-shell';
import { validateBlueprintShell } from './blueprint-shell';
import type { RoomBlueprint } from './room-blueprint';
import type { WorldAssetRecord } from './asset-hierarchy';
import { assertMaterialLibraryOnly } from './material-library';
import { buildRoomHealthSnapshot, type SubsystemHealthRecord } from './room-health';
import { planRoomImmuneRecovery } from './immune-room-recovery';
import { assembleSceneStackV2 } from './scene-stack-assembly-v2';
import {
  WORLD_COMPILER_V2_ORDER,
  type WorldCompilerV2StageResult,
  isGenerationPhase,
  assertArchitectureGatePassed,
} from './world-compiler-order-v2';
import type { GenerationPhase } from './contract';
import type { SceneStackLayerId } from '../scene-stack/types';

export const COMPILE_ORCHESTRATOR_V2_VERSION = 'compile-orchestrator-v2.v1';

export type WorldBuildV2Input = {
  organizationId: string;
  buildingId: string;
  floorId: string;
  roomId: string;
  stationId: string;
  departmentId: string;
  projectId: string;
  blueprintShell: BlueprintShellRecord;
  roomBlueprint: RoomBlueprint;
  heroAssets: WorldAssetRecord[];
  furnitureAssets: WorldAssetRecord[];
  decorAssets: WorldAssetRecord[];
  mountedLayers: Partial<Record<SceneStackLayerId, { publicUrl: string; approved: boolean }>>;
  materialIds: import('./material-library').StudioWorldMaterialId[];
  architectureValidation?: Partial<import('./blueprint-shell').BlueprintShellValidationInput>;
};

export type WorldBuildV2Result = {
  success: boolean;
  stages: WorldCompilerV2StageResult[];
  roomHealth: ReturnType<typeof buildRoomHealthSnapshot>;
  immunePlan: ReturnType<typeof planRoomImmuneRecovery>;
  assembly: ReturnType<typeof assembleSceneStackV2>;
  failedPhase: GenerationPhase | null;
};

function stageResult(
  phase: GenerationPhase,
  success: boolean,
  detail: string,
  durationMs = 0
): WorldCompilerV2StageResult {
  return {
    phase,
    success,
    durationMs,
    detail,
    generationOccurred: isGenerationPhase(phase),
  };
}

export function runWorldBuildV2(input: WorldBuildV2Input): WorldBuildV2Result {
  const stages: WorldCompilerV2StageResult[] = [];
  let failedPhase: GenerationPhase | null = null;
  let architectureValid = false;

  for (const phase of WORLD_COMPILER_V2_ORDER) {
    const gate = assertArchitectureGatePassed(architectureValid, phase);
    if (!gate.ok && phase !== 'world-blueprint' && phase !== 'room-blueprint' && phase !== 'architecture-validation') {
      stages.push(stageResult(phase, false, gate.reason));
      failedPhase = phase;
      break;
    }

    switch (phase) {
      case 'world-blueprint':
        stages.push(
          stageResult(
            phase,
            Boolean(input.blueprintShell.sourceUrl),
            input.blueprintShell.sourceUrl
              ? `BlueprintShell ${input.blueprintShell.shellId} v${input.blueprintShell.version}`
              : 'BlueprintShell missing source'
          )
        );
        if (!input.blueprintShell.sourceUrl) failedPhase = phase;
        break;

      case 'room-blueprint':
        stages.push(
          stageResult(
            phase,
            input.roomBlueprint.assetSockets.length > 0,
            `Room blueprint ${input.roomBlueprint.blueprintId} — ${input.roomBlueprint.assetSockets.length} sockets`
          )
        );
        break;

      case 'architecture-validation': {
        const validation = validateBlueprintShell({
          shell: input.blueprintShell,
          roomProportionsValid: input.architectureValidation?.roomProportionsValid ?? true,
          wallContinuity: input.architectureValidation?.wallContinuity ?? true,
          floorContinuity: input.architectureValidation?.floorContinuity ?? true,
          ceilingContinuity: input.architectureValidation?.ceilingContinuity ?? true,
          cameraContinuity: input.architectureValidation?.cameraContinuity ?? true,
          walkabilityValid: input.architectureValidation?.walkabilityValid ?? true,
          collisionZonesClear: input.architectureValidation?.collisionZonesClear ?? true,
        });
        architectureValid = validation.passed;
        stages.push(
          stageResult(
            phase,
            validation.passed,
            validation.passed
              ? 'Architecture validated'
              : `Architecture failed: ${validation.issues.join(' ')}`
          )
        );
        if (!validation.passed) failedPhase = phase;
        break;
      }

      case 'signature-asset-generation':
        stages.push(
          stageResult(
            phase,
            input.heroAssets.every((a) => a.approved),
            `${input.heroAssets.length} hero asset(s) — independent validation`
          )
        );
        break;

      case 'furniture-generation':
        stages.push(
          stageResult(
            phase,
            true,
            `${input.furnitureAssets.length} furniture asset(s) — independent tier`
          )
        );
        break;

      case 'decoration-generation':
        stages.push(
          stageResult(
            phase,
            true,
            `${input.decorAssets.length} decor asset(s) — disposable tier`
          )
        );
        break;

      case 'material-application': {
        const matCheck = assertMaterialLibraryOnly({
          organizationId: input.organizationId,
          requestedMaterialIds: input.materialIds,
        });
        stages.push(
          stageResult(
            phase,
            matCheck.ok,
            matCheck.ok
              ? `Applied ${matCheck.materials.length} library material(s)`
              : `Material library missing: ${!matCheck.ok ? matCheck.missing.join(', ') : ''}`
          )
        );
        if (!matCheck.ok) failedPhase = phase;
        break;
      }

      case 'lighting-pass':
        stages.push(stageResult(phase, true, 'Lighting pass independent — no furniture regeneration'));
        break;

      case 'scene-assembly': {
        const assembly = assembleSceneStackV2({
          departmentId: input.departmentId,
          projectId: input.projectId,
          stationId: input.stationId,
          mountedLayers: input.mountedLayers,
        });
        stages.push(
          stageResult(
            phase,
            assembly.ok,
            assembly.ok
              ? `Assembled ${assembly.assembledSteps.length} steps — zero generation`
              : assembly.errors.join(' ')
          )
        );
        if (!assembly.ok) failedPhase = phase;
        break;
      }

      case 'room-validation':
        stages.push(stageResult(phase, architectureValid, 'Per-subsystem room validation'));
        break;

      case 'immune-check':
        stages.push(stageResult(phase, true, 'Immune system — localized recovery plan'));
        break;

      case 'activate-room':
        stages.push(stageResult(phase, !failedPhase, failedPhase ? 'Room blocked' : 'Room online'));
        break;
    }

    if (failedPhase) break;
  }

  const subsystems: SubsystemHealthRecord[] = [
    {
      subsystem: 'architecture',
      state: architectureValid ? 'healthy' : 'critical',
      lastCheckedAt: new Date().toISOString(),
      message: architectureValid ? null : 'BlueprintShell validation failed',
    },
    {
      subsystem: 'hero-assets',
      state: input.heroAssets.every((a) => a.approved && a.health === 'healthy')
        ? 'healthy'
        : input.heroAssets.some((a) => a.health === 'critical')
          ? 'critical'
          : 'warning',
      lastCheckedAt: new Date().toISOString(),
      message: null,
    },
    {
      subsystem: 'furniture',
      state: 'healthy',
      lastCheckedAt: new Date().toISOString(),
      message: null,
    },
    {
      subsystem: 'decor',
      state: 'healthy',
      lastCheckedAt: new Date().toISOString(),
      message: null,
    },
    {
      subsystem: 'lighting',
      state: 'healthy',
      lastCheckedAt: new Date().toISOString(),
      message: null,
    },
    {
      subsystem: 'materials',
      state: 'healthy',
      lastCheckedAt: new Date().toISOString(),
      message: null,
    },
    {
      subsystem: 'effects',
      state: 'healthy',
      lastCheckedAt: new Date().toISOString(),
      message: null,
    },
    {
      subsystem: 'interaction',
      state: 'healthy',
      lastCheckedAt: new Date().toISOString(),
      message: null,
    },
  ];

  const roomHealth = buildRoomHealthSnapshot({
    roomId: input.roomId,
    organizationId: input.organizationId,
    buildingId: input.buildingId,
    floorId: input.floorId,
    subsystems,
  });

  const immunePlan = planRoomImmuneRecovery(subsystems);

  const assembly = assembleSceneStackV2({
    departmentId: input.departmentId,
    projectId: input.projectId,
    stationId: input.stationId,
    mountedLayers: input.mountedLayers,
  });

  return {
    success: !failedPhase && assembly.ok,
    stages,
    roomHealth,
    immunePlan,
    assembly,
    failedPhase,
  };
}
