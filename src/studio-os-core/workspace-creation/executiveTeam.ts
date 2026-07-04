import type { ExecutiveRole, ExecutiveTeamMember } from './types';
import { getBlueprintById } from './blueprints';

/** Platform executive role catalog — blueprint selects subsets per company. */
export const EXECUTIVE_ROLE_CATALOG: Record<string, ExecutiveRole> = {
  'chief-content-officer': {
    id: 'chief-content-officer',
    title: 'Chief Content Officer',
    department: 'Content',
    mandate: 'Own editorial strategy, content calendar, and cross-platform narrative coherence.',
    inherits: ['memory-bible', 'writing-bible', 'creative-dna', 'company-objectives'],
    collaboratesWith: ['creative-director-media', 'head-of-distribution', 'analytics-director'],
  },
  'creative-director-media': {
    id: 'creative-director-media',
    title: 'Creative Director',
    department: 'Creative',
    mandate: 'Translate brand DNA into thumbnails, hooks, and visual systems for every platform.',
    inherits: ['creative-dna', 'writing-bible', 'workflows', 'documentation'],
    collaboratesWith: ['chief-content-officer', 'head-of-distribution'],
  },
  'head-of-distribution': {
    id: 'head-of-distribution',
    title: 'Head of Distribution',
    department: 'Distribution',
    mandate: 'Optimize platform-specific packaging, posting cadence, and cross-posting strategy.',
    inherits: ['knowledge-graph', 'workflows', 'automation', 'social-accounts'],
    collaboratesWith: ['chief-content-officer', 'audience-growth-strategist', 'analytics-director'],
  },
  'audience-growth-strategist': {
    id: 'audience-growth-strategist',
    title: 'Audience Growth Strategist',
    department: 'Growth',
    mandate: 'Identify audience segments, retention loops, and content experiments for scale.',
    inherits: ['analytics', 'memory-bible', 'campaigns'],
    collaboratesWith: ['head-of-distribution', 'analytics-director', 'chief-content-officer'],
  },
  'analytics-director': {
    id: 'analytics-director',
    title: 'Analytics Director',
    department: 'Intelligence',
    mandate: 'Review performance data and return evidence-based recommendations to the executive team.',
    inherits: ['analytics', 'reporting-dashboards', 'knowledge-graph'],
    collaboratesWith: ['chief-content-officer', 'head-of-distribution', 'audience-growth-strategist'],
  },
  'automation-engineer': {
    id: 'automation-engineer',
    title: 'Automation Engineer',
    department: 'Operations',
    mandate: 'Wire approval workflows, schedulers, and production automations across the workspace.',
    inherits: ['automation', 'workflows', 'documentation', 'operating-rules'],
    collaboratesWith: ['chief-content-officer', 'head-of-distribution'],
  },
  'luxury-brand-director': {
    id: 'luxury-brand-director',
    title: 'Luxury Brand Director',
    department: 'Brand',
    mandate: 'Guard premium positioning, visual genome, and editorial standards across all touchpoints.',
    inherits: ['memory-bible', 'creative-dna', 'writing-bible', 'brand-rules'],
    collaboratesWith: ['creative-director', 'photography-director', 'head-of-ecommerce'],
  },
  'creative-director': {
    id: 'creative-director',
    title: 'Creative Director',
    department: 'Creative',
    mandate: 'Lead campaign creative, asset direction, and visual storytelling for the brand.',
    inherits: ['creative-dna', 'writing-bible', 'workflows'],
    collaboratesWith: ['luxury-brand-director', 'campaign-director', 'photography-director'],
  },
  'head-of-ecommerce': {
    id: 'head-of-ecommerce',
    title: 'Head of Ecommerce',
    department: 'Commerce',
    mandate: 'Own product presentation, conversion surfaces, and merchandising intelligence.',
    inherits: ['analytics', 'asset-factory', 'workflows'],
    collaboratesWith: ['luxury-brand-director', 'customer-experience-director'],
  },
  'customer-experience-director': {
    id: 'customer-experience-director',
    title: 'Customer Experience Director',
    department: 'Experience',
    mandate: 'Ensure every customer touchpoint reflects brand standards and service excellence.',
    inherits: ['memory-bible', 'workflows', 'documentation'],
    collaboratesWith: ['head-of-ecommerce', 'campaign-director'],
  },
  'campaign-director': {
    id: 'campaign-director',
    title: 'Campaign Director',
    department: 'Marketing',
    mandate: 'Orchestrate launches, seasonal campaigns, and cross-channel messaging.',
    inherits: ['campaigns', 'writing-bible', 'automation'],
    collaboratesWith: ['creative-director', 'customer-experience-director'],
  },
  'photography-director': {
    id: 'photography-director',
    title: 'Photography Director',
    department: 'Production',
    mandate: 'Own product photography bible, creative DNA compliance, and master hero standards.',
    inherits: ['creative-dna', 'asset-factory', 'workflows'],
    collaboratesWith: ['luxury-brand-director', 'creative-director'],
  },
  'product-director': {
    id: 'product-director',
    title: 'Product Director',
    department: 'Product',
    mandate: 'Define roadmap, feature priorities, and workspace module adoption.',
    inherits: ['memory-bible', 'documentation', 'company-objectives'],
    collaboratesWith: ['analytics-director', 'automation-engineer'],
  },
  'client-experience-director': {
    id: 'client-experience-director',
    title: 'Client Experience Director',
    department: 'Client Services',
    mandate: 'Manage client approvals, deliverables, and agency workflow quality.',
    inherits: ['approval-workflows', 'documentation', 'workflows'],
    collaboratesWith: ['creative-director', 'campaign-director'],
  },
};

export function buildExecutiveTeamForBlueprint(
  workspaceId: string,
  blueprintId: string
): ExecutiveTeamMember[] {
  const blueprint = getBlueprintById(blueprintId);
  if (!blueprint) return [];
  return blueprint.executiveRoleIds
    .map((roleId) => EXECUTIVE_ROLE_CATALOG[roleId])
    .filter(Boolean)
    .map((role) => ({
      ...role,
      workspaceId,
      status: 'active' as const,
    }));
}

export function getExecutiveCollaborationChain(
  team: ExecutiveTeamMember[],
  startRoleId: string
): ExecutiveTeamMember[] {
  const start = team.find((m) => m.id === startRoleId);
  if (!start) return [];
  const visited = new Set<string>();
  const chain: ExecutiveTeamMember[] = [start];
  visited.add(start.id);

  let current = start;
  for (let depth = 0; depth < 4; depth++) {
    const nextId = current.collaboratesWith.find((id) => team.some((m) => m.id === id && !visited.has(id)));
    if (!nextId) break;
    const next = team.find((m) => m.id === nextId);
    if (!next) break;
    chain.push(next);
    visited.add(next.id);
    current = next;
  }
  return chain;
}
