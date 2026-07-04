import type { VisionModeDefinition, VisionModeKind, VisionStop } from './types';

/** Filter stops for mode-specific presentations (subset strategies). */
export function resolveStopsForVisionModeKind(
  baseStops: VisionStop[],
  kind: VisionModeKind
): VisionStop[] {
  if (kind === 'creative-partner' || kind === 'self-guided') return baseStops;

  const filters: Partial<Record<VisionModeKind, (s: VisionStop) => boolean>> = {
    investor: (s) =>
      ['opening', 'home-intro', 'mansion-intro', 'penthouse-showroom', 'baw-atelier', 'founder-suite', 'closing-home', 'ending'].includes(s.id),
    'brand-story': (s) =>
      ['opening', 'home-intro', 'mansion-intro', 'lobby', 'concierge-reception', 'closing-home', 'ending'].includes(s.id),
    'product-showcase': (s) => s.id.startsWith('baw-') || ['penthouse-showroom', 'extensions-boutique', 'opening', 'ending'].includes(s.id),
    'product-launch': (s) =>
      ['opening', 'home-intro', 'penthouse-showroom', 'baw-atelier', 'baw-color', 'tv-lounge', 'ending'].includes(s.id),
    'employee-onboarding': (s) => !s.id.startsWith('mobile-') && s.id !== 'interactive',
    'agency-presentation': (s) => !['founder-suite'].includes(s.id),
    'press-tour': (s) => !s.id.includes('founder') && !s.id.includes('psa'),
    'sales-demo': (s) =>
      ['opening', 'home-intro', 'penthouse-showroom', 'baw-atelier', 'baw-color', 'members-lounge', 'rewards', 'ending'].includes(s.id),
    'franchise-demo': (s) =>
      ['opening', 'mansion-intro', 'lobby', 'penthouse-showroom', 'concierge-reception', 'closing-home', 'ending'].includes(s.id),
  };

  const fn = filters[kind];
  if (!fn) return baseStops;
  const filtered = baseStops.filter(fn);
  return filtered.length >= 3 ? filtered : baseStops;
}

export function cloneModeWithKind(base: VisionModeDefinition, kind: VisionModeKind): VisionModeDefinition {
  const stops = resolveStopsForVisionModeKind(base.stops, kind);
  return {
    ...base,
    id: `${base.workspaceId}-${kind}`,
    kind,
    name: base.name.replace(/Creative Partner/i, kind.replace(/-/g, ' ')),
    stops,
    presenterModeDefault: kind === 'creative-partner' || kind === 'investor' || kind === 'agency-presentation',
    recordOptimized: kind !== 'self-guided' && kind !== 'employee-onboarding',
  };
}
