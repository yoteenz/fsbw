import { useMemo } from 'react';
import { allocateBeatDurations, resolveTimelinePreset } from '../timeline/presets';
import { resolveTimelineId } from '../utilities/resolve';
import type { FscsAudioMarker, FscsTimelineId } from '../utilities/types';
import { FSCS_BEAT_AUDIO_MAP } from '../audio/cues';

export type UseCinematicTimelineOptions = {
  preset?: FscsTimelineId | string;
};

export function useCinematicTimeline(options: UseCinematicTimelineOptions = {}) {
  const presetId = resolveTimelineId(String(options.preset ?? 'commercial-60'));
  const preset = useMemo(() => resolveTimelinePreset(presetId), [presetId]);
  const beatDurations = useMemo(() => allocateBeatDurations(preset), [preset]);

  const audioMarkers = useMemo((): FscsAudioMarker[] => {
    const markers: FscsAudioMarker[] = [];
    let cursor = 0;

    preset.beats.forEach((beatId) => {
      const cues = FSCS_BEAT_AUDIO_MAP[beatId] ?? [];
      cues.forEach((cueId) => {
        markers.push({ cueId, atMs: cursor, action: 'in' });
        markers.push({
          cueId,
          atMs: cursor + (beatDurations[beatId] ?? 0),
          action: 'out',
        });
      });
      cursor += beatDurations[beatId] ?? 0;
    });

    return markers;
  }, [preset.beats, beatDurations]);

  return { preset, presetId, beatDurations, audioMarkers, totalDurationMs: preset.totalDurationMs };
}

export { useCinematicTimeline as useFscsTimeline };
