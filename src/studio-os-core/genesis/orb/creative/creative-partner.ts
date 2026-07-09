import type { OrbCreativeInsight } from '../types';

/** Creative Partner — Content Engine™ / Studio Foundry™ adapter */
export function buildOrbCreativeInsights(pathname: string): OrbCreativeInsight[] {
  const inCreative = pathname.includes('creative') || pathname.includes('content') || pathname.includes('campaign');
  return [
    {
      insightId: 'creative-direction-alignment',
      title: inCreative ? 'Creative direction session active' : 'Creative direction ready for review',
      detail: inCreative
        ? 'Orb can critique direction against Company Genome™ tone and downstream asset impact.'
        : 'No active creative room — open Creative Direction Studio when brand decisions are needed.',
      alignment: inCreative ? 'aligned' : 'needs-review',
      downstreamImpact: 'Direction changes may affect campaigns, assets, and publishing queue.',
      sourceSystems: ['Content Engine™', 'Creative Direction Studio™', 'Company Genome™'],
    },
    {
      insightId: 'creative-foundry-bridge',
      title: 'Studio Foundry™ creation path',
      detail: 'Generation and asset creation should route through Foundry with Orb critique before approval.',
      alignment: 'aligned',
      sourceSystems: ['Studio Foundry™', 'Asset Registry™'],
    },
  ];
}
