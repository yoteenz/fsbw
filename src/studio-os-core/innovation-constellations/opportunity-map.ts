import type { OpportunityRegion } from './types';

export function buildOpportunityMap(): OpportunityRegion[] {
  return [
    {
      id: 'opp-beauty-ops',
      galaxyId: 'beauty',
      constellationId: 'automation',
      label: 'Beauty Galaxy — Luxury Operations Gap',
      reason: 'The Beauty Galaxy lacks a luxury operations framework — no major innovation currently exists here.',
      darkness: 85,
      suggestedFounderFit: 'Founder automation expertise',
    },
    {
      id: 'opp-hospitality-cx',
      galaxyId: 'hospitality',
      constellationId: 'customer-experience',
      label: 'Underserved Concierge Workflow',
      reason: 'This workflow has never been solved at enterprise scale in Hospitality Galaxy™.',
      darkness: 72,
    },
    {
      id: 'opp-retail-merge',
      galaxyId: 'retail',
      label: 'Retail + AI Operations whitespace',
      reason: 'No constellation anchor connects retail automation with customer experience yet.',
      darkness: 68,
      suggestedFounderFit: 'Cross-constellation merge opportunity',
    },
    {
      id: 'opp-education',
      galaxyId: 'education',
      label: 'Education Galaxy — Creator curriculum systems',
      reason: 'This category is underserved — emerging Blue Star™ opportunity.',
      darkness: 90,
    },
  ];
}

export function summarizeOpportunities(regions: OpportunityRegion[]): string {
  const dark = regions.filter((r) => r.darkness >= 75);
  return `${regions.length} opportunity regions · ${dark.length} high-whitespace zones revealed`;
}
