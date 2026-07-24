import type { FscsCampaignBeat, FscsCampaignBeatId } from '../utilities/types';

function beat(
  id: FscsCampaignBeatId,
  label: string,
  suggestedDurationMs: number,
  silenceBeforeMs: number,
  holdAfterMs: number,
  recommendedTransition: FscsCampaignBeat['recommendedTransition'],
): FscsCampaignBeat {
  return { id, label, suggestedDurationMs, silenceBeforeMs, holdAfterMs, recommendedTransition };
}

/** Campaign structure — reusable narrative framework */
export const FSCS_CAMPAIGN_BEATS: Record<FscsCampaignBeatId, FscsCampaignBeat> = {
  'opening-atmosphere': beat('opening-atmosphere', 'Opening Atmosphere', 4000, 800, 600, 'morning-glow'),
  'environmental-context': beat('environmental-context', 'Environmental Context', 5000, 400, 500, 'architectural-reveal'),
  'character-introduction': beat('character-introduction', 'Character Introduction', 4500, 600, 700, 'luxury-dissolve'),
  journey: beat('journey', 'Journey', 6000, 300, 400, 'invisible-match-cut'),
  discovery: beat('discovery', 'Discovery', 5000, 500, 800, 'light-sweep'),
  'emotional-peak': beat('emotional-peak', 'Emotional Peak', 5500, 700, 1200, 'crystal-fade'),
  'brand-reveal': beat('brand-reveal', 'Brand Reveal', 4000, 400, 900, 'luxury-dissolve'),
  'closing-statement': beat('closing-statement', 'Closing Statement', 3500, 300, 600, 'soft-blur'),
  logo: beat('logo', 'Logo', 2800, 200, 1400, 'crystal-fade'),
  'end-card': beat('end-card', 'End Card', 2200, 0, 800, 'luxury-dissolve'),
};

/** Story rhythm rules — never rush emotional moments */
export const FSCS_STORY_RHYTHM = {
  silenceBeforeRevealMs: 600,
  holdBeforeTransitionMs: 400,
  slowIntroductionMultiplier: 1.25,
  breathingRoomRatio: 0.18,
  minEmotionalHoldMs: 1200,
  maxCutFrequencyMs: 2800,
  principles: [
    'Silence before reveal.',
    'Hold before transition.',
    'Slow introduction.',
    'Natural breathing room.',
    'Never rush emotional moments.',
  ],
} as const;

export function resolveCampaignBeat(id: FscsCampaignBeatId): FscsCampaignBeat {
  return FSCS_CAMPAIGN_BEATS[id];
}
