/**
 * Guided Tour activation — presentation mode for Frontal Slayer.
 * Activate: `?guidedTour=<VITE_GUIDED_TOUR_TOKEN>` or founder session on any env.
 */

import { isPreviewEnvironment } from '../../../utils/adminAuth';
import {
  GUIDED_TOUR_AUDIO_KEY,
  GUIDED_TOUR_CHANGED_EVENT,
  GUIDED_TOUR_PARTNER_KEY,
  GUIDED_TOUR_RECORD_KEY,
  GUIDED_TOUR_SESSION_KEY,
  GUIDED_TOUR_URL_PARAM,
} from './constants';

function readEnvToken(): string {
  const v = import.meta.env?.VITE_GUIDED_TOUR_TOKEN;
  return typeof v === 'string' ? v.trim() : '';
}

export function getGuidedTourTokenFromEnv(): string {
  return readEnvToken();
}

function sessionFlag(key: string): boolean {
  if (typeof window === 'undefined' || !window.sessionStorage) return false;
  try {
    return window.sessionStorage.getItem(key) === '1';
  } catch {
    return false;
  }
}

function setSessionFlag(key: string, active: boolean): void {
  if (typeof window === 'undefined' || !window.sessionStorage) return;
  if (active) window.sessionStorage.setItem(key, '1');
  else window.sessionStorage.removeItem(key);
}

function dispatchChanged(): void {
  window.dispatchEvent(new CustomEvent(GUIDED_TOUR_CHANGED_EVENT));
}

export function isGuidedTourSessionActive(): boolean {
  return sessionFlag(GUIDED_TOUR_SESSION_KEY);
}

export function isCreativePartnerTourMode(): boolean {
  return sessionFlag(GUIDED_TOUR_PARTNER_KEY);
}

export function isGuidedTourRecordMode(): boolean {
  return sessionFlag(GUIDED_TOUR_RECORD_KEY);
}

export function isGuidedTourLuxuryAudioEnabled(): boolean {
  return sessionFlag(GUIDED_TOUR_AUDIO_KEY);
}

/** Presentation layer active — hide debug, lock nav, cinematic timing. */
export function isGuidedTourPresentationActive(): boolean {
  return isGuidedTourSessionActive();
}

export function setGuidedTourSessionActive(active: boolean): void {
  setSessionFlag(GUIDED_TOUR_SESSION_KEY, active);
  if (active) {
    document.documentElement.setAttribute('data-guided-tour', 'active');
  } else {
    document.documentElement.removeAttribute('data-guided-tour');
    setSessionFlag(GUIDED_TOUR_PARTNER_KEY, false);
    setSessionFlag(GUIDED_TOUR_RECORD_KEY, false);
  }
  dispatchChanged();
}

export function setCreativePartnerTourMode(active: boolean): void {
  setSessionFlag(GUIDED_TOUR_PARTNER_KEY, active);
  dispatchChanged();
}

export function setGuidedTourRecordMode(active: boolean): void {
  setSessionFlag(GUIDED_TOUR_RECORD_KEY, active);
  if (active) {
    setCreativePartnerTourMode(true);
    document.documentElement.setAttribute('data-guided-tour-record', '1');
  } else {
    document.documentElement.removeAttribute('data-guided-tour-record');
  }
  dispatchChanged();
}

export function setGuidedTourLuxuryAudioEnabled(enabled: boolean): void {
  setSessionFlag(GUIDED_TOUR_AUDIO_KEY, enabled);
  dispatchChanged();
}

function tokenMatches(submitted: string): boolean {
  const expected = readEnvToken();
  if (!expected || !submitted.trim()) return false;
  return submitted.trim() === expected;
}

function tryActivateFromUrlSearch(search: string): boolean {
  const params = new URLSearchParams(search.startsWith('?') ? search : `?${search}`);
  const raw = params.get(GUIDED_TOUR_URL_PARAM);
  if (!raw) return false;

  if (raw === '1' || raw === 'record') {
    if (!isPreviewEnvironment() && !readEnvToken()) return false;
    setGuidedTourSessionActive(true);
    if (raw === 'record') setGuidedTourRecordMode(true);
    return true;
  }

  if (!tokenMatches(raw)) return false;
  setGuidedTourSessionActive(true);
  return true;
}

function stripParamFromUrl(): void {
  try {
    const url = new URL(window.location.href);
    if (!url.searchParams.has(GUIDED_TOUR_URL_PARAM)) return;
    url.searchParams.delete(GUIDED_TOUR_URL_PARAM);
    window.history.replaceState({}, '', `${url.pathname}${url.search}${url.hash}`);
  } catch {
    /* ignore */
  }
}

/** Call at app startup. Returns true when guided tour session is active. */
export function bootstrapGuidedTourMode(): boolean {
  if (typeof window === 'undefined') return false;
  tryActivateFromUrlSearch(window.location.search);
  if (isGuidedTourSessionActive()) {
    document.documentElement.setAttribute('data-guided-tour', 'active');
    stripParamFromUrl();
  }
  return isGuidedTourSessionActive();
}

export function canShowGuidedTourLauncher(): boolean {
  if (isGuidedTourSessionActive()) return true;
  if (isPreviewEnvironment()) return true;
  if (readEnvToken()) return true;
  return false;
}

/** One-click record walkthrough setup. */
export function activateRecordWalkthrough(): void {
  setGuidedTourSessionActive(true);
  setGuidedTourRecordMode(true);
  setCreativePartnerTourMode(true);
}
