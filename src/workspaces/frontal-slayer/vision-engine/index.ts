import { registerWorkspaceManifest } from '../../../studio-os-core/vision-engine/store';
import { buildFrontalSlayerVisionManifest } from './manifest';

export { FRONTAL_SLAYER_VISION_STOPS, getVisionStopById, getVisionStopIndex } from './tourScript';
export { buildFrontalSlayerVisionManifest } from './manifest';

/** Register Frontal Slayer as the first workspace powered by Vision Engine™. */
export function bootstrapFrontalSlayerVisionEngine(): void {
  registerWorkspaceManifest(buildFrontalSlayerVisionManifest());
}
