/**
 * Ecosystem Relationships™ — the knowledge → innovation → commerce loop.
 */

import type { DistrictThemeId } from '../architectural-navigation/district-themes';

export type EcosystemEdge = {
  from: DistrictThemeId;
  to: DistrictThemeId;
  verb: string;
  label: string;
  /** Primary health metric this edge strengthens */
  healthMetric: import('./types').WorldHealthMetricId;
};

/** Canonical campus ecology loop */
export const ECOSYSTEM_LOOP: EcosystemEdge[] = [
  {
    from: 'knowledge-library',
    to: 'innovation-district',
    verb: 'feeds',
    label: 'Knowledge Library™ feeds Innovation District™',
    healthMetric: 'knowledge-flow',
  },
  {
    from: 'innovation-district',
    to: 'marketplace',
    verb: 'creates',
    label: 'Innovation District™ creates Marketplace™',
    healthMetric: 'innovation-velocity',
  },
  {
    from: 'marketplace',
    to: 'museum',
    verb: 'funds',
    label: 'Marketplace™ funds Museum™',
    healthMetric: 'marketplace-energy',
  },
  {
    from: 'museum',
    to: 'warehouse',
    verb: 'preserves',
    label: 'Museum™ preserves Archives™',
    healthMetric: 'historical-preservation',
  },
  {
    from: 'warehouse',
    to: 'knowledge-library',
    verb: 'teaches',
    label: 'Archives™ teach Knowledge Library™',
    healthMetric: 'production-capacity',
  },
];

/** District Synergy™ — strong and weak adjacency relationships */
export const DISTRICT_SYNERGY_MAP: Record<
  DistrictThemeId,
  { strong: DistrictThemeId[]; weak: DistrictThemeId[] }
> = {
  'knowledge-library': {
    strong: ['innovation-district', 'museum', 'warehouse'],
    weak: ['marketplace'],
  },
  'innovation-district': {
    strong: ['knowledge-library', 'marketplace', 'warehouse'],
    weak: ['museum'],
  },
  marketplace: {
    strong: ['innovation-district', 'museum'],
    weak: ['knowledge-library', 'warehouse'],
  },
  museum: {
    strong: ['marketplace', 'warehouse', 'knowledge-library'],
    weak: ['innovation-district'],
  },
  warehouse: {
    strong: ['innovation-district', 'museum', 'knowledge-library'],
    weak: ['marketplace'],
  },
  'command-center': {
    strong: ['warehouse', 'innovation-district', 'knowledge-library'],
    weak: ['marketplace', 'museum'],
  },
  'creative-direction': {
    strong: ['innovation-district', 'marketplace'],
    weak: ['museum', 'warehouse'],
  },
  atlas: {
    strong: ['command-center', 'knowledge-library', 'innovation-district'],
    weak: ['warehouse', 'museum'],
  },
};

export function ecologyLoopNeighbors(districtId: DistrictThemeId): DistrictThemeId[] {
  const upstream = ECOSYSTEM_LOOP.filter((e) => e.to === districtId).map((e) => e.from);
  const downstream = ECOSYSTEM_LOOP.filter((e) => e.from === districtId).map((e) => e.to);
  return [...new Set([...upstream, ...downstream])];
}
