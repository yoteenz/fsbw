import {
  VISION_AUDIO_KEY,
  VISION_CHANGED_EVENT,
  VISION_PARTNER_KEY,
  VISION_RECORD_KEY,
  VISION_SESSION_KEY,
} from './constants';
import { canLaunchVisionPresentation } from './access';

function sessionFlag(key: string): boolean {
  if (typeof sessionStorage === 'undefined') return false;
  try {
    return sessionStorage.getItem(key) === '1';
  } catch {
    return false;
  }
}

function setSessionFlag(key: string, active: boolean): void {
  if (typeof sessionStorage === 'undefined') return;
  if (active) sessionStorage.setItem(key, '1');
  else sessionStorage.removeItem(key);
}

function dispatchChanged(): void {
  window.dispatchEvent(new CustomEvent(VISION_CHANGED_EVENT));
}

export function isVisionSessionActive(): boolean {
  return sessionFlag(VISION_SESSION_KEY);
}

export function isVisionPresenterMode(): boolean {
  return sessionFlag(VISION_PARTNER_KEY);
}

export function isVisionRecordMode(): boolean {
  return sessionFlag(VISION_RECORD_KEY);
}

export function isVisionLuxuryAudioEnabled(): boolean {
  return sessionFlag(VISION_AUDIO_KEY);
}

export function isVisionPresentationActive(): boolean {
  return isVisionSessionActive();
}

export function setVisionSessionActive(active: boolean): void {
  if (active && !canLaunchVisionPresentation()) return;
  setSessionFlag(VISION_SESSION_KEY, active);
  if (active) {
    document.documentElement.setAttribute('data-vision-engine', 'active');
  } else {
    document.documentElement.removeAttribute('data-vision-engine');
    document.documentElement.removeAttribute('data-vision-record');
    setSessionFlag(VISION_PARTNER_KEY, false);
    setSessionFlag(VISION_RECORD_KEY, false);
  }
  dispatchChanged();
}

export function setVisionPresenterMode(active: boolean): void {
  setSessionFlag(VISION_PARTNER_KEY, active);
  dispatchChanged();
}

export function setVisionRecordMode(active: boolean): void {
  setSessionFlag(VISION_RECORD_KEY, active);
  if (active) {
    setVisionPresenterMode(true);
    document.documentElement.setAttribute('data-vision-record', '1');
  } else {
    document.documentElement.removeAttribute('data-vision-record');
  }
  dispatchChanged();
}

export function setVisionLuxuryAudioEnabled(enabled: boolean): void {
  setSessionFlag(VISION_AUDIO_KEY, enabled);
  dispatchChanged();
}

export function activateVisionRecordWalkthrough(): void {
  if (!canLaunchVisionPresentation()) return;
  setVisionSessionActive(true);
  setVisionRecordMode(true);
}

export type ActiveVisionSession = {
  modeId: string;
  workspaceId: string;
};

const ACTIVE_MODE_KEY = 'studioOs_visionActiveMode';

export function setActiveVisionMode(modeId: string, workspaceId: string): void {
  if (typeof sessionStorage === 'undefined') return;
  sessionStorage.setItem(ACTIVE_MODE_KEY, JSON.stringify({ modeId, workspaceId }));
}

export function getActiveVisionMode(): ActiveVisionSession | null {
  if (typeof sessionStorage === 'undefined') return null;
  try {
    const raw = sessionStorage.getItem(ACTIVE_MODE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as ActiveVisionSession;
  } catch {
    return null;
  }
}

export function clearActiveVisionMode(): void {
  if (typeof sessionStorage === 'undefined') return;
  sessionStorage.removeItem(ACTIVE_MODE_KEY);
}
