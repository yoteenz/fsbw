import type { LineageDiscoveryOpportunity } from './types';

export function buildLineageDiscoveryOpportunities(organizationId: string): LineageDiscoveryOpportunity[] {
  return [
    {
      id: `disc-${organizationId}-auto`,
      headline: 'This Blueprint could benefit from your automation expertise.',
      rationale: 'Innovation Graph™ shows Retail Experience System™ fork awaiting automation merge — 82% complement.',
      complementScore: 82,
      suggestedAction: 'Invite Marcus Chen into merge session',
    },
    {
      id: `disc-${organizationId}-cx`,
      headline: "You're one of the highest-rated contributors in customer experience.",
      rationale: 'Contribution Timeline™ ranks you top 3 in luxury retail environments across Marketplace.',
      complementScore: 91,
      suggestedAction: 'Publish enhanced fork with lineage preserved',
    },
    {
      id: `disc-${organizationId}-graph`,
      headline: 'Innovation Graph suggests three creators whose work complements yours.',
      rationale: 'Elena Voss · Marcus Chen · Dr. Amara Okonkwo — shared lineage on Luxury Customer Experience HQ™.',
      complementScore: 88,
      suggestedAction: 'Open Innovation Lineage Gallery™ exhibit',
    },
  ];
}
