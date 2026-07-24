import type { FscsAudioCue, FscsAudioCueId } from '../utilities/types';

function cue(
  id: FscsAudioCueId,
  label: string,
  layer: FscsAudioCue['layer'],
  defaultVolume: number,
  fadeInMs: number,
  fadeOutMs: number,
): FscsAudioCue {
  return { id, label, layer, defaultVolume, fadeInMs, fadeOutMs };
}

/** Audio cue library — timing markers for cinematic rhythm */
export const FSCS_AUDIO_CUES: Record<FscsAudioCueId, FscsAudioCue> = {
  'music-main': cue('music-main', 'Main Score', 'music', 0.72, 2400, 3200),
  'music-ambient': cue('music-ambient', 'Ambient Score Layer', 'music', 0.35, 1800, 2800),
  'ambient-city': cue('ambient-city', 'City Ambience', 'ambient', 0.28, 1200, 1600),
  footsteps: cue('footsteps', 'Footsteps', 'foley', 0.42, 200, 400),
  'door-chime': cue('door-chime', 'Door Chime', 'foley', 0.55, 100, 800),
  'coffee-bell': cue('coffee-bell', 'Coffee Shop Bell', 'foley', 0.38, 150, 600),
  wind: cue('wind', 'Wind', 'ambient', 0.22, 2000, 2400),
  birds: cue('birds', 'Birds', 'ambient', 0.18, 1600, 2000),
  'room-tone': cue('room-tone', 'Soft Room Tone', 'tone', 0.15, 800, 1200),
};

export function resolveAudioCue(id: FscsAudioCueId): FscsAudioCue {
  return FSCS_AUDIO_CUES[id];
}

/** Suggested cue placement for a campaign beat start */
export const FSCS_BEAT_AUDIO_MAP: Partial<Record<string, FscsAudioCueId[]>> = {
  'opening-atmosphere': ['room-tone', 'wind', 'music-ambient'],
  'environmental-context': ['ambient-city', 'birds'],
  journey: ['footsteps', 'music-main'],
  'storefront-reveal': ['door-chime'],
  discovery: ['music-main'],
  'emotional-peak': ['music-main', 'music-ambient'],
  'brand-reveal': ['music-main'],
  logo: ['music-ambient'],
};
