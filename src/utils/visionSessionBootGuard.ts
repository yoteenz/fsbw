/**
 * Clear broken Vision Engine session flags before first paint so stale sessionStorage
 * cannot leave the app on a black/blank screen on unrelated routes (/home/shop, admin, etc.).
 */
import { getVisionModeById } from '../studio-os-core/vision-engine/store';
import { getActiveVisionMode, isVisionSessionActive } from '../studio-os-core/vision-engine/session';
import { stopVisionPresentation } from '../studio-os-core/vision-engine/launch';
import { bootstrapFrontalSlayerVisionEngine } from '../workspaces/frontal-slayer/vision-engine';

export function purgeStaleVisionSessionOnBoot(): void {
  if (typeof window === 'undefined') return;
  if (!isVisionSessionActive()) return;

  bootstrapFrontalSlayerVisionEngine();

  const active = getActiveVisionMode();
  if (!active) {
    stopVisionPresentation();
    document.documentElement.removeAttribute('data-vision-engine');
    document.documentElement.removeAttribute('data-vision-record');
    return;
  }

  const mode = getVisionModeById(active.modeId, active.workspaceId);
  if (!mode) {
    stopVisionPresentation();
    document.documentElement.removeAttribute('data-vision-engine');
    document.documentElement.removeAttribute('data-vision-record');
  }
}
