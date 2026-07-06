import { ensureOrganizationDiscoveryBlueprint } from '../business-discovery-blueprint/store';
import { getOrganizationProfessionBrainProfile } from '../profession-brain/store';
import { getOrganizationWorldKnowledgeProfile } from '../world-knowledge-engine/store';
import { IDEA_CATEGORY_LABELS, PIPELINE_STAGE_LABELS } from './constants';
import { buildCollaborativeReviews, synthesizeChiefConciergeRecommendation } from './collaborative-innovation';
import { buildIdeaWorkbench } from './idea-workbench';
import type { IdeaCategory, InnovationIdea, InnovationSourceContribution, InnovationSourceId, PipelineStage } from './types';

function orgSeed(organizationId: string, salt: string): number {
  let h = 0;
  const s = organizationId + salt;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return h % 100;
}

type IdeaTemplate = {
  title: string;
  category: IdeaCategory;
  sourceId: InnovationSourceId;
  stage: PipelineStage;
  confidencePct: number;
  revenuePotentialScore: number;
};

function buildIdeaTemplates(organizationId: string, companyName: string, industryId: string): IdeaTemplate[] {
  const brain = getOrganizationProfessionBrainProfile(organizationId);
  const blueprint = ensureOrganizationDiscoveryBlueprint(organizationId);
  const world = getOrganizationWorldKnowledgeProfile(organizationId);
  const primaryBrain = brain?.brains[0]?.label ?? 'Core Expertise';
  const service =
    blueprint.responses.find((r) => r.chapterId === 'services')?.answer?.slice(0, 60) ??
    blueprint.serviceSessions[0]?.serviceName ??
    'core services';
  const competitorSignal = world?.filteredSignals.find((s) => s.category === 'competitor-activity');

  const templates: IdeaTemplate[] = [
    {
      title: `${primaryBrain} Workflow Automation Pack`,
      category: 'automations',
      sourceId: 'profession-brain',
      stage: 'validating',
      confidencePct: 72 + orgSeed(organizationId, 'auto'),
      revenuePotentialScore: 68,
    },
    {
      title: `${companyName} Premium Membership Tier`,
      category: 'memberships',
      sourceId: 'knowledge-commerce',
      stage: 'researching',
      confidencePct: 65 + orgSeed(organizationId, 'member'),
      revenuePotentialScore: 74,
    },
    {
      title: `Digital ${primaryBrain} Course Series`,
      category: 'courses',
      sourceId: 'profession-brain',
      stage: 'prototype',
      confidencePct: 78 + orgSeed(organizationId, 'course') % 15,
      revenuePotentialScore: 81,
    },
    {
      title: `${service} — Subscription Service Model`,
      category: 'subscriptions',
      sourceId: 'business-discovery-blueprint',
      stage: 'discovered',
      confidencePct: 60 + orgSeed(organizationId, 'sub'),
      revenuePotentialScore: 70,
    },
    {
      title: 'Customer Problem → Dedicated Service Line',
      category: 'services',
      sourceId: 'customer-feedback',
      stage: 'discovered',
      confidencePct: 70,
      revenuePotentialScore: 62,
    },
    {
      title: competitorSignal
        ? `Differentiated ${competitorSignal.headline.slice(0, 40)} Response`
        : `${industryId.replace(/-/g, ' ')} Market Expansion Pack`,
      category: 'expansion-opportunities',
      sourceId: 'competitor-analysis',
      stage: 'researching',
      confidencePct: 66,
      revenuePotentialScore: 77,
    },
    {
      title: 'Workflow Productization — Internal Process as Product',
      category: 'workflows',
      sourceId: 'historical-performance',
      stage: 'testing',
      confidencePct: 74,
      revenuePotentialScore: 69,
    },
    {
      title: `${primaryBrain} Knowledge Product Bundle`,
      category: 'knowledge-products',
      sourceId: 'knowledge-commerce',
      stage: 'approved',
      confidencePct: 82,
      revenuePotentialScore: 85,
    },
    {
      title: 'Strategic Partnership — Complementary Expert Network',
      category: 'strategic-partnerships',
      sourceId: 'executive-council',
      stage: 'launching',
      confidencePct: 71,
      revenuePotentialScore: 73,
    },
    {
      title: 'New Revenue Stream — Adjacent Market Entry',
      category: 'revenue-streams',
      sourceId: 'market-trends',
      stage: 'discovered',
      confidencePct: 63,
      revenuePotentialScore: 80,
    },
    {
      title: 'Operational Efficiency — Department Pack Upgrade',
      category: 'department-packs',
      sourceId: 'organization-pulse',
      stage: 'completed',
      confidencePct: 88,
      revenuePotentialScore: 55,
    },
    {
      title: 'Founder Vision — Community Program Launch',
      category: 'community-programs',
      sourceId: 'founder-vision',
      stage: 'archived',
      confidencePct: 45,
      revenuePotentialScore: 48,
    },
  ];

  return templates;
}

export function generateInnovationIdeas(
  organizationId: string,
  companyName: string,
  industryId: string,
  _sources: InnovationSourceContribution[]
): InnovationIdea[] {
  const templates = buildIdeaTemplates(organizationId, companyName, industryId);

  return templates.map((t, index) => {
    const workbench = buildIdeaWorkbench(t, organizationId, companyName, industryId);
    const collaborativeReviews = buildCollaborativeReviews(t, organizationId);
    const chiefConciergeRecommendation = synthesizeChiefConciergeRecommendation(collaborativeReviews, t);

    return {
      id: `innovation-${organizationId}-${index}`,
      title: t.title,
      category: t.category,
      categoryLabel: IDEA_CATEGORY_LABELS[t.category],
      sourceId: t.sourceId,
      sourceLabel: t.sourceId.replace(/-/g, ' ').toUpperCase(),
      stage: t.stage,
      stageLabel: PIPELINE_STAGE_LABELS[t.stage],
      confidencePct: Math.min(99, t.confidencePct),
      revenuePotentialScore: t.revenuePotentialScore,
      workbench,
      collaborativeReviews,
      chiefConciergeRecommendation,
      searchable: true,
      archived: t.stage === 'archived',
    };
  });
}

export function summarizeInnovationIdeas(ideas: InnovationIdea[]): string {
  const active = ideas.filter((i) => !i.archived);
  const revenue = active.filter((i) => i.revenuePotentialScore >= 70).length;
  return `${ideas.length} ideas tracked (${active.length} active) · ${revenue} high-revenue opportunities · all searchable including archived.`;
}
