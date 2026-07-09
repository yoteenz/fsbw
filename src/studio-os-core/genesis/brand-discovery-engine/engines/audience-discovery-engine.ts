import type { XbdBrandDnaRecord } from '../types';

/** Audience Discovery Engine™ — derives audience narrative from Brand DNA */
export function buildAudienceDiscoverySummary(brand: XbdBrandDnaRecord): string {
  const { audienceProfile: a } = brand;
  return [
    `Primary: ${a.primaryAudience}`,
    `Psychology: ${a.psychology}`,
    `Desire: ${a.customerDesire}`,
    `Signals: ${a.identitySignals.join(', ')}`,
    a.secondaryAudiences.length
      ? `Secondary: ${a.secondaryAudiences.join(' · ')}`
      : '',
  ]
    .filter(Boolean)
    .join(' · ');
}

export function buildAudienceDirection(brand: XbdBrandDnaRecord): string {
  return `Speak to ${brand.audienceProfile.primaryAudience} who want to feel ${brand.emotionalTerritory.slice(0, 2).join(' and ')}. Lead with ${brand.audienceProfile.customerDesire}. Avoid audiences who need ${brand.competitors[0] ?? 'generic alternatives'}.`;
}
