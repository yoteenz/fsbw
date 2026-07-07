import type { VOICE_MODE_STATES } from './constants';

export type VoiceModeState = (typeof VOICE_MODE_STATES)[number];

export type VoiceTranscriptEntry = {
  id: string;
  text: string;
  final: boolean;
  createdAt: string;
};

export type VoiceModeProfile = {
  organizationId: string;
  state: VoiceModeState;
  transcripts: VoiceTranscriptEntry[];
  lastError: string | null;
  speechSupported: boolean;
  updatedAt: string;
};

export type VoiceModeStore = {
  version: string;
  profiles: VoiceModeProfile[];
};
