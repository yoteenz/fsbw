import { getVisionModeById } from './store';
import {
  clearActiveVisionMode,
  setActiveVisionMode,
  setVisionLuxuryAudioEnabled,
  setVisionPresenterMode,
  setVisionRecordMode,
  setVisionSessionActive,
} from './session';
import { canLaunchVisionPresentation, setVisionShareSessionActive } from './access';
import { getWorkspaceRegistry } from '../workspace/registry';

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
  getWorkspaceRegistry().bootstrapVisionEngine?.(options.workspaceId);
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

/** Fully reset Vision Share / presentation flags (e.g. when entering Creative Preview designer link). */
export function resetVisionPresentationSession(): void {
  stopVisionPresentation();
  setVisionShareSessionActive(false);
  if (typeof document !== 'undefined') {
    document.documentElement.removeAttribute('data-vision-engine');
    document.documentElement.removeAttribute('data-vision-record');
  }
}
