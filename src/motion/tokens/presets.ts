import { FSMS_EASE_DISSOLVE, FSMS_EASE_LUXURY, FSMS_EASE_MORNING } from './easing';
import type { FsmsPreset, FsmsPresetId } from './types';

function preset(
  id: FsmsPresetId,
  label: string,
  timing: FsmsPreset['timing'],
  opts: Partial<Omit<FsmsPreset, 'id' | 'label' | 'timing' | 'totalDuration'>> = {},
): FsmsPreset {
  const totalDuration =
    timing.delay + timing.sparkleIn + timing.sweep + timing.hold + timing.dissolve;
  return {
    id,
    label,
    timing,
    totalDuration,
    easing: FSMS_EASE_LUXURY,
    sparkleDensity: 0.35,
    sweepIntensity: 0.55,
    bloom: 0.12,
    loop: false,
    ...opts,
  };
}

/** Official FSMS motion presets */
export const FSMS_PRESETS: Record<FsmsPresetId, FsmsPreset> = {
  'luxury-reveal': preset(
    'luxury-reveal',
    'Luxury Reveal',
    { delay: 0, sparkleIn: 320, sweep: 900, hold: 1200, dissolve: 800 },
    { easing: FSMS_EASE_LUXURY, sparkleDensity: 0.4, sweepIntensity: 0.5 },
  ),
  'morning-reveal': preset(
    'morning-reveal',
    'Morning Reveal',
    { delay: 200, sparkleIn: 400, sweep: 1100, hold: 1400, dissolve: 900 },
    {
      easing: FSMS_EASE_MORNING,
      sparkleDensity: 0.3,
      sweepIntensity: 0.65,
      bloom: 0.18,
    },
  ),
  'sunlight-sweep': preset(
    'sunlight-sweep',
    'Sunlight Sweep',
    { delay: 0, sparkleIn: 180, sweep: 1400, hold: 800, dissolve: 600 },
    { sweepIntensity: 0.75, sparkleDensity: 0.25, bloom: 0.22 },
  ),
  'crystal-fade': preset(
    'crystal-fade',
    'Crystal Fade',
    { delay: 0, sparkleIn: 200, sweep: 700, hold: 2000, dissolve: 1200 },
    { sparkleDensity: 0.2, sweepIntensity: 0.4 },
  ),
  'elegant-dissolve': preset(
    'elegant-dissolve',
    'Elegant Dissolve',
    { delay: 100, sparkleIn: 250, sweep: 600, hold: 900, dissolve: 1600 },
    { easing: FSMS_EASE_DISSOLVE, sparkleDensity: 0.15, sweepIntensity: 0.35 },
  ),
  'campaign-intro': preset(
    'campaign-intro',
    'Campaign Intro',
    { delay: 400, sparkleIn: 500, sweep: 1200, hold: 1800, dissolve: 0 },
    { loop: false, sparkleDensity: 0.45, sweepIntensity: 0.6, bloom: 0.15 },
  ),
  'campaign-outro': preset(
    'campaign-outro',
    'Campaign Outro',
    { delay: 0, sparkleIn: 150, sweep: 500, hold: 400, dissolve: 1400 },
    { easing: FSMS_EASE_DISSOLVE, sparkleDensity: 0.2, sweepIntensity: 0.3 },
  ),
};

export function resolveFsmsPreset(id: FsmsPresetId): FsmsPreset {
  return FSMS_PRESETS[id];
}

export function scalePresetTiming(
  base: FsmsPreset,
  durationOverride?: number,
  delayOverride?: number,
): FsmsPreset['timing'] & { totalDuration: number } {
  const t = { ...base.timing };
  if (delayOverride !== undefined) t.delay = delayOverride;
  if (durationOverride === undefined) {
    return { ...t, totalDuration: base.totalDuration };
  }
  const baseTotal =
    base.timing.sparkleIn + base.timing.sweep + base.timing.hold + base.timing.dissolve;
  const scale = baseTotal > 0 ? durationOverride / baseTotal : 1;
  t.sparkleIn = Math.round(t.sparkleIn * scale);
  t.sweep = Math.round(t.sweep * scale);
  t.hold = Math.round(t.hold * scale);
  t.dissolve = Math.round(t.dissolve * scale);
  return { ...t, totalDuration: t.delay + t.sparkleIn + t.sweep + t.hold + t.dissolve };
}
