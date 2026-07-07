import { readScopedStore, writeScopedStore } from '../workspace/scoped-store';
import { VOICE_MODE_STORAGE_KEY, VOICE_MODE_VERSION } from './constants';
import type { VoiceModeProfile, VoiceModeState, VoiceModeStore } from './types';

function emptyStore(): VoiceModeStore {
  return { version: VOICE_MODE_VERSION, profiles: [] };
}

function detectSpeechSupport(): boolean {
  if (typeof window === 'undefined') return false;
  return Boolean(
    (window as Window & { SpeechRecognition?: unknown; webkitSpeechRecognition?: unknown })
      .SpeechRecognition ||
      (window as Window & { webkitSpeechRecognition?: unknown }).webkitSpeechRecognition
  );
}

export function buildVoiceModeProfile(organizationId: string): VoiceModeProfile {
  return {
    organizationId,
    state: 'idle',
    transcripts: [],
    lastError: null,
    speechSupported: detectSpeechSupport(),
    updatedAt: new Date().toISOString(),
  };
}

export function readVoiceModeStore(organizationId: string): VoiceModeStore {
  return readScopedStore(VOICE_MODE_STORAGE_KEY, emptyStore, organizationId);
}

export function getVoiceModeProfile(organizationId: string): VoiceModeProfile | null {
  return readVoiceModeStore(organizationId).profiles.find((p) => p.organizationId === organizationId) ?? null;
}

export function ensureVoiceModeProfile(organizationId: string): VoiceModeProfile {
  const store = readVoiceModeStore(organizationId);
  const existing = store.profiles.find((p) => p.organizationId === organizationId);
  if (existing) return existing;
  const profile = buildVoiceModeProfile(organizationId);
  writeVoiceModeStore(organizationId, { ...store, profiles: [...store.profiles, profile] });
  return profile;
}

export function writeVoiceModeStore(organizationId: string, store: VoiceModeStore): void {
  writeScopedStore(
    VOICE_MODE_STORAGE_KEY,
    { ...store, version: VOICE_MODE_VERSION },
    organizationId
  );
}

export function patchVoiceModeProfile(
  organizationId: string,
  patch: Partial<VoiceModeProfile>
): VoiceModeProfile {
  const store = readVoiceModeStore(organizationId);
  const base = store.profiles.find((p) => p.organizationId === organizationId) ?? buildVoiceModeProfile(organizationId);
  const next = { ...base, ...patch, updatedAt: new Date().toISOString() };
  const profiles = store.profiles.filter((p) => p.organizationId !== organizationId);
  writeVoiceModeStore(organizationId, { ...store, profiles: [...profiles, next] });
  return next;
}

export function setVoiceModeState(organizationId: string, state: VoiceModeState): VoiceModeProfile {
  return patchVoiceModeProfile(organizationId, { state });
}

export function appendVoiceTranscript(
  organizationId: string,
  text: string,
  final: boolean
): VoiceModeProfile {
  const profile = ensureVoiceModeProfile(organizationId);
  const entry = {
    id: `vtx-${Date.now()}`,
    text,
    final,
    createdAt: new Date().toISOString(),
  };
  const transcripts = final
    ? [...profile.transcripts.filter((t) => t.final), entry].slice(-20)
    : [...profile.transcripts, entry].slice(-20);
  return patchVoiceModeProfile(organizationId, { transcripts, state: final ? 'idle' : 'listening' });
}

export function clearVoiceTranscripts(organizationId: string): VoiceModeProfile {
  return patchVoiceModeProfile(organizationId, { transcripts: [], lastError: null, state: 'idle' });
}
