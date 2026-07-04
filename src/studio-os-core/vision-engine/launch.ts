import { getVisionModeById } from './store';
import {
  clearActiveVisionMode,
  setActiveVisionMode,
  setVisionLuxuryAudioEnabled,
  setVisionPresenterMode,
  setVisionRecordMode,
  setVisionSessionActive,
} from './session';
import { canLaunchVisionPresentation } from './access';
import { bootstrapFrontalSlayerVisionEngine } from '../../workspaces/frontal-slayer/vision-engine';

export type LaunchVisionOptions = {
  modeId: string;
  workspaceId: string;
  presenterMode?: boolean;
  recordMode?: boolean;
  luxuryAudio?: boolean;
};

/** Internal-only — activate a Vision Mode presentation session. */
export function launchVisionPresentation(options: LaunchVisionOptions): boolean {
  if (!canLaunchVisionPresentation()) return false;
  bootstrapFrontalSlayerVisionEngine();
  const mode = getVisionModeById(options.modeId, options.workspaceId);
  if (!mode) return false;

  setActiveVisionMode(options.modeId, options.workspaceId);
  setVisionSessionActive(true);
  setVisionPresenterMode(options.presenterMode ?? mode.presenterModeDefault);
  setVisionRecordMode(options.recordMode ?? false);
  setVisionLuxuryAudioEnabled(options.luxuryAudio ?? false);
  return true;
}

export function stopVisionPresentation(): void {
  setVisionSessionActive(false);
  clearActiveVisionMode();
}
