import { recordLayerQualityRecovery } from '../layer-quality-recovery';
import type { SceneStackLayerId } from '../types';
import type { VerifiedAssetProductionStage } from './contract';

export type VerifiedAssetImmuneEvent =
  | 'AssetCandidateGenerated'
  | 'AssetIdentityChecked'
  | 'AssetStructureChecked'
  | 'BackgroundClassified'
  | 'BackgroundRemovalRequested'
  | 'BackgroundRemovalStarted'
  | 'AssetPostprocessChecked'
  | 'AssetApproved'
  | 'AssetMounted'
  | 'ScenePlacementVerified'
  | 'WrongAssetDetected'
  | 'FullSceneDetected'
  | 'SimpleBackgroundDetected'
  | 'CleanupDamageDetected'
  | 'PlacementFailureDetected'
  | 'ReferencePolicyCorrected'
  | 'RegenerationStarted'
  | 'MountCorrectionStarted';

export function emitVerifiedAssetImmuneEvent(
  event: VerifiedAssetImmuneEvent,
  detail: {
    layerId: SceneStackLayerId;
    stationId: string;
    departmentId: string;
    projectId: string;
    assetCandidateId?: string;
    stage?: VerifiedAssetProductionStage;
    classification?: string;
    shellPreserved?: boolean;
    message?: string;
  }
): void {
  const payload = {
    audit: 'verified-asset-production',
    event,
    at: new Date().toISOString(),
    ...detail,
  };
  console.info(JSON.stringify(payload));

  const recoveryMap: Partial<Record<VerifiedAssetImmuneEvent, Parameters<typeof recordLayerQualityRecovery>[0]>> = {
    WrongAssetDetected: 'LayerQualityFailureDetected',
    FullSceneDetected: 'FullSceneRerenderDiagnosed',
    RegenerationStarted: 'LayerRegenerationStarted',
    AssetApproved: 'LayerRevalidated',
    AssetMounted: 'LayerMounted',
  };

  const mapped = recoveryMap[event];
  if (mapped) {
    recordLayerQualityRecovery(mapped, {
      layerId: detail.layerId,
      stationId: detail.stationId,
      departmentId: detail.departmentId,
      projectId: detail.projectId,
      shellPreserved: detail.shellPreserved,
      message: detail.message,
      classification: detail.classification as never,
    });
  }
}
