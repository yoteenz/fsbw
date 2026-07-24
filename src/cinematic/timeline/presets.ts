import type { FscsCampaignBeatId, FscsTimelineId, FscsTimelinePreset } from '../utilities/types';

function timeline(
  id: FscsTimelineId,
  label: string,
  totalDurationMs: number,
  beats: FscsCampaignBeatId[],
  pacing: FscsTimelinePreset['pacing'],
): FscsTimelinePreset {
  return { id, label, totalDurationMs, beats, pacing };
}

/** Timeline presets — standardized cinematic durations */
export const FSCS_TIMELINE_PRESETS: Record<FscsTimelineId, FscsTimelinePreset> = {
  'commercial-30': timeline('commercial-30', '30 Second Commercial', 30000, [
    'opening-atmosphere',
    'environmental-context',
    'discovery',
    'emotional-peak',
    'brand-reveal',
    'logo',
    'end-card',
  ], 'dynamic'),
  'commercial-60': timeline('commercial-60', '60 Second Commercial', 60000, [
    'opening-atmosphere',
    'environmental-context',
    'character-introduction',
    'journey',
    'discovery',
    'emotional-peak',
    'brand-reveal',
    'closing-statement',
    'logo',
    'end-card',
  ], 'moderate'),
  'brand-film-90': timeline('brand-film-90', '90 Second Brand Film', 90000, [
    'opening-atmosphere',
    'environmental-context',
    'character-introduction',
    'journey',
    'discovery',
    'emotional-peak',
    'brand-reveal',
    'closing-statement',
    'logo',
    'end-card',
  ], 'slow'),
  'launch-campaign': timeline('launch-campaign', 'Launch Campaign', 75000, [
    'opening-atmosphere',
    'environmental-context',
    'journey',
    'discovery',
    'emotional-peak',
    'brand-reveal',
    'closing-statement',
    'logo',
    'end-card',
  ], 'moderate'),
  'social-reel': timeline('social-reel', 'Social Reel', 15000, [
    'opening-atmosphere',
    'discovery',
    'emotional-peak',
    'brand-reveal',
    'end-card',
  ], 'dynamic'),
  'product-reveal': timeline('product-reveal', 'Product Reveal', 45000, [
    'opening-atmosphere',
    'environmental-context',
    'discovery',
    'emotional-peak',
    'brand-reveal',
    'logo',
  ], 'slow'),
  documentary: timeline('documentary', 'Documentary', 120000, [
    'opening-atmosphere',
    'environmental-context',
    'character-introduction',
    'journey',
    'discovery',
    'emotional-peak',
    'closing-statement',
    'end-card',
  ], 'slow'),
  'founder-story': timeline('founder-story', 'Founder Story', 90000, [
    'opening-atmosphere',
    'character-introduction',
    'journey',
    'discovery',
    'emotional-peak',
    'closing-statement',
    'logo',
    'end-card',
  ], 'slow'),
};

export function resolveTimelinePreset(id: FscsTimelineId): FscsTimelinePreset {
  return FSCS_TIMELINE_PRESETS[id];
}

/** Distribute beat durations across a timeline preset */
export function allocateBeatDurations(preset: FscsTimelinePreset): Record<FscsCampaignBeatId, number> {
  const weights: Partial<Record<FscsCampaignBeatId, number>> = {
    'opening-atmosphere': 1.2,
    'environmental-context': 1,
    'character-introduction': 1.1,
    journey: 1.3,
    discovery: 1.2,
    'emotional-peak': 1.4,
    'brand-reveal': 1,
    'closing-statement': 0.9,
    logo: 0.6,
    'end-card': 0.5,
  };

  const totalWeight = preset.beats.reduce((sum, b) => sum + (weights[b] ?? 1), 0);
  const result = {} as Record<FscsCampaignBeatId, number>;

  preset.beats.forEach((beat) => {
    const w = weights[beat] ?? 1;
    result[beat] = Math.round((preset.totalDurationMs * w) / totalWeight);
  });

  return result;
}
