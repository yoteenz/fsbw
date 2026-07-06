import { getOrganizationProfessionBrainProfile } from '../profession-brain/store';
import { generateInnovationIdeas, summarizeInnovationIdeas } from './idea-generator';
import { buildInnovationSourceContributions, summarizeInnovationSources } from './innovation-sources';
import {
  buildPipelineSummary,
  countRevenueOpportunities,
  summarizePipeline,
} from './innovation-pipeline';
import { summarizeCollaborativeInnovation } from './collaborative-innovation';
import type { OrganizationInnovationLabProfile } from './types';

export function computeInnovationCapabilityScore(
  activeSources: number,
  ideasGenerated: number,
  revenueOpportunities: number,
  avgConfidence: number
): number {
  return Math.min(
    99,
    Math.round(activeSources * 4 + ideasGenerated * 2 + revenueOpportunities * 5 + avgConfidence * 0.25)
  );
}

export function buildDockInnovationLine(profile: OrganizationInnovationLabProfile): string {
  const revenueIdeas = profile.ideas.filter((i) => i.revenuePotentialScore >= 70 && !i.archived);
  const workflowIdea = profile.ideas.find((i) => i.category === 'workflows' || i.category === 'automations');
  const customerIdea = profile.ideas.find((i) => i.sourceId === 'customer-feedback');
  const prototypeIdeas = profile.ideas.filter((i) => i.stage === 'prototype');

  if (revenueIdeas.length >= 3) {
    return `I discovered ${revenueIdeas.length} new revenue opportunities — review them in Innovation Lab.`;
  }
  if (workflowIdea && workflowIdea.confidencePct >= 70) {
    return `I believe "${workflowIdea.title}" could become a product — workflow productization opportunity detected.`;
  }
  if (customerIdea) {
    return 'A customer problem appears frequently enough to justify a new service — Innovation Lab has prepared analysis.';
  }
  if (prototypeIdeas.length >= 2) {
    return `I've prepared ${prototypeIdeas.length} prototype concepts — awaiting your review in Innovation Lab.`;
  }
  const top = profile.ideas.find((i) => !i.archived && i.revenuePotentialScore >= 75);
  return top
    ? `Innovation Lab active — "${top.title}" leads ${profile.revenueOpportunitiesDiscovered} revenue opportunities.`
    : 'Innovation Lab™ continuously generating opportunities — innovation as permanent capability.';
}

export function buildOrganizationInnovationLabProfile(organizationId: string): OrganizationInnovationLabProfile {
  const brain = getOrganizationProfessionBrainProfile(organizationId);
  const companyName = brain?.companyName ?? organizationId.replace(/-/g, ' ').toUpperCase();
  const industryId = brain?.industryId ?? organizationId;

  const sourceContributions = buildInnovationSourceContributions(organizationId);
  const ideas = generateInnovationIdeas(organizationId, companyName, industryId, sourceContributions);
  const pipelineSummary = buildPipelineSummary(ideas);
  const activeSources = sourceContributions.filter((s) => s.active).length;
  const revenueOpportunitiesDiscovered = countRevenueOpportunities(ideas);
  const avgConfidence = Math.round(
    ideas.reduce((sum, i) => sum + i.confidencePct, 0) / Math.max(1, ideas.length)
  );
  const ideasInPipeline = ideas.filter((i) => i.stage !== 'archived' && i.stage !== 'completed').length;

  const profile: OrganizationInnovationLabProfile = {
    organizationId,
    companyName,
    industryId,
    updatedAt: new Date().toISOString(),
    innovationCapabilityScore: 0,
    activeSources,
    ideasGenerated: ideas.length,
    ideasInPipeline,
    revenueOpportunitiesDiscovered,
    sourceContributions,
    ideas,
    pipelineSummary,
    dockInnovationLine: '',
    permanentInnovationCapability: true,
    syncedSources: [
      'profession-brain',
      'organization-genome',
      'business-discovery-blueprint',
      'executive-council',
      'organization-pulse',
      'knowledge-commerce',
      'world-knowledge-engine',
      'executive-timeline-history',
      'founder-operating-system',
      'command-dock',
    ],
  };

  profile.innovationCapabilityScore = computeInnovationCapabilityScore(
    activeSources,
    ideas.length,
    revenueOpportunitiesDiscovered,
    avgConfidence
  );
  profile.dockInnovationLine = buildDockInnovationLine(profile);
  return profile;
}

export function summarizeInnovationLabProfile(profile: OrganizationInnovationLabProfile): string {
  const topIdea = profile.ideas.find((i) => !i.archived);
  const topReview = topIdea?.collaborativeReviews[0];
  return [
    profile.dockInnovationLine,
    `Innovation capability ${profile.innovationCapabilityScore}% · ${summarizeInnovationSources(profile.sourceContributions)}`,
    summarizeInnovationIdeas(profile.ideas),
    summarizePipeline(profile.pipelineSummary),
    topIdea && topReview
      ? summarizeCollaborativeInnovation(topIdea.collaborativeReviews, topIdea.chiefConciergeRecommendation)
      : '',
    'Innovation as permanent organizational capability — invent what comes next.',
  ]
    .filter(Boolean)
    .join(' ');
}
