import { getPackDefinition } from '../industry-architecture/pack-registry';
import { getOrganizationArchitectureProfile } from '../industry-architecture/store';
import type { GrowthRecommendation, OrganizationMonetizationProfile } from './types';

export function listGrowthRecommendations(
  profile: OrganizationMonetizationProfile
): GrowthRecommendation[] {
  const arch = getOrganizationArchitectureProfile(profile.organizationId);
  const industryId = arch?.industryId ?? 'creator';
  const owned = new Set(profile.ownedPackIds);
  const recommendations: GrowthRecommendation[] = [];

  if ((industryId === 'painting' || industryId === 'contractor' || industryId === 'landscaping') && !owned.has('creator-studio')) {
    recommendations.push({
      id: 'rec-creator-studio-trade',
      signal: 'Publishing volume has increased.',
      headline: 'Your organization is ready for a creative department.',
      recommendedExpansion: 'Creator Studio',
      packId: 'creator-studio',
      executiveTone:
        'Your field teams are capturing valuable expertise. I recommend expanding Headquarters with Creator Studio — Production, Publishing, and Distribution wings — so that knowledge reaches customers at scale.',
    });
  }

  if ((industryId === 'contractor' || industryId === 'painting') && !owned.has('sales-crm')) {
    recommendations.push({
      id: 'rec-lead-concierge',
      signal: 'Your sales team is manually following up with leads.',
      headline: 'Recommended hire: Lead Concierge',
      recommendedExpansion: 'Sales CRM + Lead Concierge',
      packId: 'sales-crm',
      staffId: 'lead-concierge',
      executiveTone:
        'Open estimates are waiting on manual follow-up. Would you like to activate Lead Concierge and expand the Sales wing?',
    });
  }

  if (!owned.has('creator-studio') && (industryId === 'restaurant' || industryId === 'fitness')) {
    recommendations.push({
      id: 'rec-creator-restaurant',
      signal: 'Customer education content is outperforming ads.',
      headline: 'Recommended Expansion: Creator Studio',
      recommendedExpansion: 'Creator Studio',
      packId: 'creator-studio',
      executiveTone:
        'Your guests respond to story-driven content. Creator Studio adds Production and Publishing wings without changing how you operate today.',
    });
  }

  if (owned.has('contractor-pack') && !owned.has('warehouse')) {
    recommendations.push({
      id: 'rec-warehouse-contractor',
      signal: 'Material orders are tracked outside Headquarters.',
      headline: 'Recommended Expansion: Warehouse Department',
      recommendedExpansion: 'Warehouse · Inventory Center',
      packId: 'warehouse',
      executiveTone:
        'Receiving and materials are still manual. A Warehouse wing would centralize inventory, shipping, and storage under one roof.',
    });
  }

  if (owned.has('beauty-pack') && !owned.has('accounting')) {
    recommendations.push({
      id: 'rec-accounting-beauty',
      signal: 'Revenue is growing faster than finance visibility.',
      headline: 'Recommended Expansion: Accounting Department',
      recommendedExpansion: 'Finance Wing · Payroll · Forecasting',
      packId: 'accounting',
      staffId: 'finance-concierge',
      executiveTone:
        'Membership and product revenue deserve a dedicated Finance wing. Accounting permanently expands Headquarters with forecasting and reporting.',
    });
  }

  if (!owned.has('creator-studio') && industryId === 'creator' && arch) {
    const publishingConcierge = arch.conciergeRoster.some((c) => c.role.includes('PUBLISHING'));
    if (publishingConcierge) {
      recommendations.push({
        id: 'rec-publishing-concierge',
        signal: 'Our publishing volume is increasing.',
        headline: 'Recommended hire: Publishing Concierge',
        recommendedExpansion: 'Publishing Concierge',
        staffId: 'publishing-concierge',
        executiveTone:
          'Publishing volume is increasing. I recommend hiring a Publishing Concierge to own schedule optimization and approval flow.',
      });
    }
  }

  if ((industryId === 'beauty' || industryId === 'ecommerce') && !owned.has('warehouse')) {
    recommendations.push({
      id: 'rec-customer-experience',
      signal: 'Customer inquiries increased.',
      headline: 'Recommended Expansion: Customer Experience Department',
      recommendedExpansion: 'Customer Experience Concierge',
      staffId: 'customer-experience-concierge',
      executiveTone:
        'Support volume is rising. Activating Customer Experience Concierge would route delight and escalation without adding operational chaos.',
    });
  }

  if ((industryId === 'contractor' || industryId === 'agency') && !owned.has('sales-crm')) {
    recommendations.push({
      id: 'rec-scheduling-dept',
      signal: 'Your organization has outgrown manual scheduling.',
      headline: 'Recommended Expansion: Scheduling Department',
      recommendedExpansion: 'Scheduling Concierge',
      staffId: 'scheduling-concierge',
      executiveTone:
        'Calendar conflicts are costing throughput. Scheduling Concierge would coordinate crews and appointments as a dedicated operations employee.',
    });
  }

  for (const packId of arch?.recommendedExpansionPackIds ?? []) {
    if (owned.has(packId)) continue;
    const pack = getPackDefinition(packId);
    if (!pack) continue;
    if (recommendations.some((r) => r.packId === packId)) continue;
    recommendations.push({
      id: `rec-pack-${packId}`,
      signal: 'Headquarters is ready for its next wing.',
      headline: `Recommended Expansion: ${pack.name}`,
      recommendedExpansion: pack.name,
      packId,
      executiveTone: `${pack.installPreview} Visit Expansion Center to grow — not to buy software.`,
    });
  }

  return recommendations.slice(0, 4);
}

export function getPrimaryGrowthRecommendation(
  profile: OrganizationMonetizationProfile
): GrowthRecommendation | null {
  return listGrowthRecommendations(profile)[0] ?? null;
}
