/** Luxury sound architecture — optional · disabled by default. */

export type StudioOrbSoundId =
  | 'awakening'
  | 'conversation-open'
  | 'conversation-close'
  | 'workflow-complete'
  | 'voice-activate'
  | 'emergency'
  | 'radial-open';

const STORAGE_KEY = 'studioOs_studioOrbSoundEnabled_v1';

let enabledCache: boolean | null = null;

export function isStudioOrbSoundEnabled(): boolean {
  if (enabledCache !== null) return enabledCache;
  if (typeof window === 'undefined') return false;
  enabledCache = localStorage.getItem(STORAGE_KEY) === '1';
  return enabledCache;
}

export function setStudioOrbSoundEnabled(value: boolean): void {
  enabledCache = value;
  if (typeof window === 'undefined') return;
  if (value) localStorage.setItem(STORAGE_KEY, '1');
  else localStorage.removeItem(STORAGE_KEY);
}

/** Placeholder — wire Web Audio premium tones when sound assets ship. */
export function playStudioOrbSound(_id: StudioOrbSoundId): void {
  if (!isStudioOrbSoundEnabled()) return;
}
