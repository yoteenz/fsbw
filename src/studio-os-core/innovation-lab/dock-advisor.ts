import { IDEA_CATEGORY_LABELS } from './constants';
import { summarizeInnovationLabProfile } from './innovation-lab-builder';
import { summarizeInnovationIdeas } from './idea-generator';
import { summarizeInnovationSources } from './innovation-sources';
import { summarizePipeline } from './innovation-pipeline';
import { summarizeCollaborativeInnovation } from './collaborative-innovation';
import {
  ensureOrganizationInnovationLabProfile,
  getOrganizationInnovationLabProfile,
} from './store';
import type { InnovationLabDockAdvice } from './types';

export function resolveInnovationLabAdvice(
  input: string,
  organizationId: string
): InnovationLabDockAdvice | null {
  const trimmed = input.trim();
  if (!trimmed) return null;

  const profile =
    getOrganizationInnovationLabProfile(organizationId) ??
    ensureOrganizationInnovationLabProfile(organizationId);

  if (
    /innovation lab|innovation capability|ideation|invent what comes next|permanent innovation/i.test(
      trimmed
    )
  ) {
    return {
      response: summarizeInnovationLabProfile(profile),
      concierge: 'Chief Concierge',
      innovationCapabilityScore: profile.innovationCapabilityScore,
      ideasGenerated: profile.ideasGenerated,
    };
  }

  if (/revenue opportun|discovered three|new revenue/i.test(trimmed)) {
    return {
      response: `${profile.dockInnovationLine} ${profile.revenueOpportunitiesDiscovered} high-revenue opportunities identified.`,
      concierge: 'Chief Concierge',
      innovationCapabilityScore: profile.innovationCapabilityScore,
    };
  }

  if (/workflow.*product|become a product|productization/i.test(trimmed)) {
    const workflow = profile.ideas.find((i) => i.category === 'workflows' || i.category === 'automations');
    return {
      response: workflow
        ? `Workflow opportunity: "${workflow.title}" — ${workflow.chiefConciergeRecommendation}`
        : profile.dockInnovationLine,
      concierge: 'Chief Concierge',
    };
  }

  if (/customer problem|new service|frequently enough/i.test(trimmed)) {
    const service = profile.ideas.find(
      (i) => i.sourceId === 'customer-feedback' || i.category === 'services'
    );
    return {
      response: service
        ? `${service.workbench.problemBeingSolved} ${service.chiefConciergeRecommendation}`
        : 'Customer feedback patterns monitored — new service ideas generated when problems recur.',
      concierge: 'Chief Concierge',
    };
  }

  if (/prototype|prepared two|concept/i.test(trimmed)) {
    const prototypes = profile.ideas.filter((i) => i.stage === 'prototype' || i.stage === 'testing');
    return {
      response:
        prototypes.length >= 1
          ? `I've prepared ${prototypes.length} prototype concept${prototypes.length > 1 ? 's' : ''}: ${prototypes.map((p) => p.title).join(' · ')}`
          : 'Prototype concepts generated when ideas advance through the pipeline.',
      concierge: 'Chief Concierge',
    };
  }

  if (/pipeline|discovered|researching|validating|archived|searchable/i.test(trimmed)) {
    return {
      response: summarizePipeline(profile.pipelineSummary),
      concierge: 'Chief Concierge',
      ideasGenerated: profile.ideasGenerated,
    };
  }

  if (/workbench|executive summary|opportunity analysis|founder notes/i.test(trimmed)) {
    const top = profile.ideas.find((i) => !i.archived);
    return {
      response: top
        ? `${top.title}: ${top.workbench.executiveSummary} ${top.workbench.opportunityAnalysis}`
        : summarizeInnovationIdeas(profile.ideas),
      concierge: 'Chief Concierge',
    };
  }

  if (/collaborat|concierge|marketing|finance|legal|department/i.test(trimmed)) {
    const top = profile.ideas.find((i) => !i.archived);
    return {
      response: top
        ? summarizeCollaborativeInnovation(top.collaborativeReviews, top.chiefConciergeRecommendation)
        : 'Digital Concierges collaborate on every idea — Chief Concierge synthesizes executive recommendation.',
      concierge: 'Chief Concierge',
    };
  }

  if (/sources|profession brain|genome|blueprint|world knowledge|founder vision/i.test(trimmed)) {
    return {
      response: summarizeInnovationSources(profile.sourceContributions),
      concierge: 'Chief Concierge',
    };
  }

  if (/ideas|categories|products|services|memberships|automations/i.test(trimmed)) {
    return {
      response: summarizeInnovationIdeas(profile.ideas),
      concierge: 'Chief Concierge',
      ideasGenerated: profile.ideasGenerated,
    };
  }

  const categoryMatch = profile.ideas.find((i) =>
    new RegExp(IDEA_CATEGORY_LABELS[i.category].split(' ')[0] ?? '', 'i').test(trimmed)
  );
  if (categoryMatch) {
    return {
      response: `${categoryMatch.categoryLabel}: "${categoryMatch.title}" — ${categoryMatch.chiefConciergeRecommendation}`,
      concierge: 'Chief Concierge',
    };
  }

  return null;
}

export function listInnovationLabDockSuggestions(organizationId: string): string[] {
  ensureOrganizationInnovationLabProfile(organizationId);
  return [
    'What new revenue opportunities has Innovation Lab discovered?',
    'Show me ideas ready for prototype review.',
    'Which customer problems could become new services?',
    'Summarize the innovation pipeline status.',
  ].slice(0, 4);
}

export function buildProactiveInnovationLabSuggestion(organizationId: string): string | null {
  const profile = getOrganizationInnovationLabProfile(organizationId);
  if (!profile) return null;
  return summarizeInnovationLabProfile(profile);
}

export function buildInnovationLabOpeningLine(organizationId: string): string {
  const profile = ensureOrganizationInnovationLabProfile(organizationId);
  return profile.dockInnovationLine;
}
