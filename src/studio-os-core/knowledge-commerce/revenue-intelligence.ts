import type { KnowledgeProduct } from './types';
import type { KnowledgeCommerceOpportunity, RevenueIntelligenceInsight } from './types';
import type { OrganizationProfessionBrainProfile } from '../profession-brain/types';

export function buildRevenueIntelligence(
  profile: OrganizationProfessionBrainProfile,
  products: KnowledgeProduct[]
): RevenueIntelligenceInsight[] {
  const insights: RevenueIntelligenceInsight[] = [];

  const topProduct = [...products].sort((a, b) => b.revenueUsd - a.revenueUsd)[0];
  if (topProduct) {
    insights.push({
      id: 'ri-profitable',
      type: 'profitable',
      title: 'Most profitable knowledge product',
      detail: `${topProduct.title} · $${topProduct.revenueUsd.toLocaleString()} lifetime · expertise as appreciating asset.`,
      confidence: 92,
    });
  }

  const aiExperts = products.filter((p) => p.type === 'ai-expert-experience');
  if (aiExperts[0]) {
    insights.push({
      id: 'ri-converting',
      type: 'converting',
      title: 'Highest-converting expert experience',
      detail: `${aiExperts[0].title} · ${aiExperts[0].usageCount} sessions · powered by Profession Brain™.`,
      confidence: 88,
    });
  }

  for (const brain of profile.brains.slice(0, 3)) {
    insights.push({
      id: `ri-topic-${brain.id}`,
      type: 'requested',
      title: `Most requested: ${brain.knowledgeEntries[0]?.title ?? brain.label}`,
      detail: `Answered repeatedly — candidate for Knowledge Product Builder.`,
      confidence: 75 + brain.maturityPct / 5,
    });
  }

  insights.push({
    id: 'ri-gap',
    type: 'gap',
    title: 'Knowledge gap detected',
    detail: 'Customers search for workflow templates not yet published — suggested premium offering.',
    confidence: 70,
  });

  return insights.slice(0, 8);
}

export function detectCommerceOpportunities(
  profile: OrganizationProfessionBrainProfile
): KnowledgeCommerceOpportunity[] {
  const opportunities: KnowledgeCommerceOpportunity[] = [];

  for (const brain of profile.brains) {
    for (const entry of brain.knowledgeEntries.filter((e) => e.kind === 'best-practice' || e.kind === 'exception').slice(0, 2)) {
      opportunities.push({
        id: `opp-${brain.id}-${entry.id}`,
        brainId: brain.id,
        title: entry.title,
        prompt: `You've answered "${entry.title}" many times this year. Would you like me to turn it into a Knowledge Product?`,
        reason: `Frequently requested topic from ${brain.label}.`,
        suggestedProductType: 'checklist',
      });
    }

    if (brain.knowledgeEntries.some((e) => e.kind === 'template')) {
      opportunities.push({
        id: `opp-workflow-${brain.id}`,
        brainId: brain.id,
        title: `${brain.label} workflow`,
        prompt: 'This workflow could become a customer course.',
        reason: 'Operational workflow with high reuse potential.',
        suggestedProductType: 'course',
      });
    }
  }

  for (const hk of profile.humanKnowledge.filter((h) => h.type === 'checklist').slice(0, 2)) {
    opportunities.push({
      id: `opp-checklist-${hk.id}`,
      brainId: hk.brainId,
      title: hk.title,
      prompt: 'This checklist is frequently requested. Publish it to the Expert Marketplace?',
      reason: 'Human knowledge artifact ready for monetization.',
      suggestedProductType: 'checklist',
    });
  }

  return opportunities.slice(0, 10);
}
