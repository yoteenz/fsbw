import {
  ensureOrganizationKnowledgeCommerceProfile,
  getOrganizationKnowledgeCommerceProfile,
} from './store';
import type { KnowledgeCommerceDockAdvice } from './types';

export function resolveKnowledgeCommerceAdvice(
  input: string,
  organizationId: string
): KnowledgeCommerceDockAdvice | null {
  const trimmed = input.trim();
  if (!trimmed) return null;

  const profile = getOrganizationKnowledgeCommerceProfile(organizationId);
  if (!profile) return null;

  if (/knowledge product|monetize|turn.*into.*product|47 times/i.test(trimmed)) {
    const opp = profile.opportunities[0];
    if (opp) {
      return {
        response: opp.prompt,
        concierge: 'Chief Concierge',
        suggestPublish: true,
      };
    }
  }

  if (/customer course|workflow.*course/i.test(trimmed)) {
    const workflow = profile.opportunities.find((o) => o.suggestedProductType === 'course');
    if (workflow) {
      return {
        response: workflow.prompt,
        concierge: 'Chief Concierge',
        suggestPublish: true,
      };
    }
  }

  if (/checklist|publish.*marketplace/i.test(trimmed)) {
    const checklist = profile.opportunities.find((o) => o.suggestedProductType === 'checklist');
    if (checklist) {
      return {
        response: checklist.prompt,
        concierge: 'Chief Concierge',
        productId: profile.products.find((p) => p.type === 'checklist')?.id,
        suggestPublish: true,
      };
    }
  }

  if (/knowledge commerce|revenue|mrr|monetize knowledge/i.test(trimmed)) {
    return {
      response: `Knowledge Commerce™ · $${profile.totalMrrUsd.toLocaleString()} MRR · $${profile.totalLifetimeRevenueUsd.toLocaleString()} lifetime · ${profile.products.filter((p) => p.published).length} products published · MONETIZE KNOWLEDGE.`,
      concierge: 'Chief Concierge',
    };
  }

  return null;
}

export function listKnowledgeCommerceDockSuggestions(organizationId: string): string[] {
  ensureOrganizationKnowledgeCommerceProfile(organizationId);
  const profile = getOrganizationKnowledgeCommerceProfile(organizationId);
  if (!profile) {
    return ['Open Knowledge Commerce from Expert Marketplace.', 'Monetize expertise from Profession Brain.'];
  }

  const suggestions: string[] = [];
  if (profile.opportunities[0]) {
    suggestions.push(profile.opportunities[0].prompt);
  }
  suggestions.push(
    'Show Profession Brain commerce dashboards.',
    'Which knowledge products are most profitable?',
    'Suggest new premium offerings from our expertise.'
  );
  return suggestions.slice(0, 4);
}

export function buildProactiveCommerceSuggestion(organizationId: string): string | null {
  const profile = getOrganizationKnowledgeCommerceProfile(organizationId);
  if (!profile || profile.opportunities.length === 0) return null;
  return profile.opportunities[0].prompt;
}
