export const VOICE_MODE_VERSION = '1.0.0';
export const VOICE_MODE_STORAGE_KEY = 'studioOsVoiceMode_v1';

export const VOICE_MODE_STATES = [
  'idle',
  'listening',
  'processing',
  'unsupported',
  'permission-denied',
] as const;
