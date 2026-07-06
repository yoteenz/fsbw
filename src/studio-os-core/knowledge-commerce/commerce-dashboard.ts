import type { KnowledgeProduct } from './types';
import type { BrainCommerceDashboard } from './types';
import type { OrganizationProfessionBrainProfile } from '../profession-brain/types';

export function buildBrainCommerceDashboards(
  profile: OrganizationProfessionBrainProfile,
  products: KnowledgeProduct[]
): BrainCommerceDashboard[] {
  return profile.brains.map((brain) => {
    const brainProducts = products.filter((p) => p.brainId === brain.id);
    const published = brainProducts.filter((p) => p.published);
    const courseRev = brainProducts.filter((p) => p.type === 'course').reduce((s, p) => s + p.revenueUsd, 0);
    const consultRev = brainProducts.filter((p) => p.type.includes('consult')).reduce((s, p) => s + p.revenueUsd, 0);
    const memberRev = brainProducts.filter((p) => p.type === 'membership').reduce((s, p) => s + p.revenueUsd, 0);
    const certRev = brainProducts.filter((p) => p.type === 'certification-program').reduce((s, p) => s + p.revenueUsd, 0);
    const downloadRev = brainProducts.filter((p) => p.type === 'downloadable-resource' || p.type === 'template').reduce((s, p) => s + p.revenueUsd, 0);
    const mrr = brainProducts
      .filter((p) => p.licenseModel.includes('subscription'))
      .reduce((s, p) => s + p.priceUsd * (p.usageCount > 0 ? 3 : 0), 0);
    const lifetime = brainProducts.reduce((s, p) => s + p.revenueUsd, 0);

    return {
      brainId: brain.id,
      brainLabel: brain.label,
      productsPublished: published.length,
      subscriptions: brainProducts.filter((p) => p.licenseModel.includes('subscription')).length,
      courseRevenueUsd: courseRev,
      consultationRevenueUsd: consultRev,
      membershipRevenueUsd: memberRev,
      certificationRevenueUsd: certRev,
      digitalDownloadRevenueUsd: downloadRev,
      monthlyRecurringRevenueUsd: mrr,
      lifetimeRevenueUsd: lifetime,
      knowledgeUtilizationPct: Math.min(100, brain.maturityPct + published.length * 5),
      mostPopularTopics: brain.knowledgeEntries.slice(0, 4).map((e) => e.title),
    };
  });
}
