import type { FsmsPresetId } from '../tokens/types';

const PRESET_ALIASES: Record<string, FsmsPresetId> = {
  'luxury-reveal': 'luxury-reveal',
  'luxury reveal': 'luxury-reveal',
  'morning-reveal': 'morning-reveal',
  'morning reveal': 'morning-reveal',
  'sunlight-sweep': 'sunlight-sweep',
  'sunlight sweep': 'sunlight-sweep',
  'crystal-fade': 'crystal-fade',
  'crystal fade': 'crystal-fade',
  'elegant-dissolve': 'elegant-dissolve',
  'elegant dissolve': 'elegant-dissolve',
  'campaign-intro': 'campaign-intro',
  'campaign intro': 'campaign-intro',
  'campaign-outro': 'campaign-outro',
  'campaign outro': 'campaign-outro',
};

export function resolvePresetId(preset?: string): FsmsPresetId {
  if (!preset) return 'luxury-reveal';
  const key = preset.trim().toLowerCase();
  return PRESET_ALIASES[key] ?? 'luxury-reveal';
}
