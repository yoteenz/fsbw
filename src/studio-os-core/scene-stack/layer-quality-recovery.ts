import { emitStudioOsRuntimeEvent } from '../../studio-os/diagnostics/runtime-emit';
import type { IsolatedLayerQualityClassification } from './isolated-layer-contract';
import type { SceneStackLayerId } from './types';

export type LayerQualityRecoveryEvent =
  | 'LayerQualityFailureDetected'
  | 'FullSceneRerenderDiagnosed'
  | 'ShellPreservationConfirmed'
  | 'IsolationPromptStrengthened'
  | 'LayerRegenerationStarted'
  | 'LayerRevalidated'
  | 'LayerMounted'
  | 'CompileResumed'
  | 'LayerRegenerationEscalated';

export function recordLayerQualityRecovery(
  event: LayerQualityRecoveryEvent,
  detail: {
    layerId: SceneStackLayerId;
    stationId: string;
    departmentId: string;
    projectId: string;
    classification?: IsolatedLayerQualityClassification;
    isolationAttempt?: number;
    publicUrl?: string;
    shellPreserved?: boolean;
    message?: string;
  }
): void {
  const payload = {
    audit: 'layer-quality-recovery',
    event,
    at: new Date().toISOString(),
    ...detail,
  };
  console.info(JSON.stringify(payload));
  emitStudioOsRuntimeEvent('WARNING', 'scene-stack.layer-quality-recovery', payload);
}
