import type { OrganizationDiscoveryBlueprint } from '../business-discovery-blueprint/types';
import { parseServiceList } from '../business-discovery-blueprint/progress';
import { ensureOrganizationArchitectureProfile } from '../industry-architecture/store';
import { ensureOrganizationMonetizationProfile } from '../monetization-architecture/store';
import { listGrowthRecommendations } from '../monetization-architecture/growth-recommendations';
import type { InaugurationRecommendation } from './types';

function answer(blueprint: OrganizationDiscoveryBlueprint, promptId: string): string {
  return blueprint.responses.find((r) => r.promptId === promptId)?.answer.trim() ?? '';
}

export function buildInaugurationRecommendations(
  blueprint: OrganizationDiscoveryBlueprint
): InaugurationRecommendation[] {
  const recs: InaugurationRecommendation[] = [];
  const automation = answer(blueprint, 'growth-automation');
  const missingProcess = answer(blueprint, 'founder-only-you');
  const training = answer(blueprint, 'wisdom-new-employee');
  const services = parseServiceList(answer(blueprint, 'identity-core-services'));

  if (automation) {
    recs.push({
      id: 'rec-automation',
      category: 'automation',
      headline: 'Immediate automation opportunity',
      detail: automation,
    });
  }

  const monetization = ensureOrganizationMonetizationProfile(blueprint.organizationId);
  for (const growth of listGrowthRecommendations(monetization).slice(0, 2)) {
    recs.push({
      id: growth.id,
      category: growth.staffId ? 'digital-staff' : 'department-pack',
      headline: growth.headline,
      detail: growth.executiveTone,
    });
  }

  if (missingProcess) {
    recs.push({
      id: 'rec-process-gap',
      category: 'process',
      headline: 'Knowledge only you hold today',
      detail: `Document and delegate: ${missingProcess.slice(0, 200)}`,
    });
  }

  const arch = ensureOrganizationArchitectureProfile(blueprint.organizationId);
  for (const packId of arch.recommendedExpansionPackIds.slice(0, 2)) {
    recs.push({
      id: `rec-pack-${packId}`,
      category: 'expansion',
      headline: `Suggested Department Pack · ${packId.replace(/-/g, ' ')}`,
      detail: arch.marketingInsight || 'Expand Headquarters when this wing strengthens your documented services.',
    });
  }

  if (training) {
    recs.push({
      id: 'rec-training',
      category: 'training',
      headline: 'Training Academy priority',
      detail: training,
    });
  }

  if (services.length > 1) {
    recs.push({
      id: 'rec-quick-service',
      category: 'quick-win',
      headline: 'Quick win · service workflow map',
      detail: `Complete deep discovery for ${services[0]} first — SOPs and Profession Brain seeds are ready to generate.`,
    });
  }

  if (recs.length === 0) {
    recs.push({
      id: 'rec-default',
      category: 'quick-win',
      headline: 'Review your Organization Charter',
      detail: 'Your founding document is accessible from Headquarters — share it with your first hire.',
    });
  }

  return recs.slice(0, 8);
}
