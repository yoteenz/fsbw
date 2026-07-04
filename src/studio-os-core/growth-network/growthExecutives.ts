import type { ExecutiveRole } from '../workspace-creation/types';

/** Growth Network executive expansion — collaborates via Knowledge Graph. */
export const GROWTH_EXECUTIVE_ROLE_CATALOG: Record<string, ExecutiveRole> = {
  'chief-growth-officer': {
    id: 'chief-growth-officer',
    title: 'Chief Growth Officer',
    department: 'Growth',
    mandate: 'Own company-wide growth strategy, roadmap stage progression, and cross-functional growth priorities.',
    inherits: ['memory-bible', 'analytics', 'growth-network', 'company-objectives'],
    collaboratesWith: ['partnership-director', 'revenue-strategist', 'market-intelligence-director'],
  },
  'partnership-director': {
    id: 'partnership-director',
    title: 'Partnership Director',
    department: 'Partnerships',
    mandate: 'Qualify leads, manage deal pipeline, and nurture brand relationships through renewal.',
    inherits: ['growth-network', 'workflows', 'approval-workflows'],
    collaboratesWith: ['chief-growth-officer', 'contract-analyst', 'business-development-director'],
  },
  'business-development-director': {
    id: 'business-development-director',
    title: 'Business Development Director',
    department: 'Business Development',
    mandate: 'Source new opportunities, collaborations, and strategic alliances aligned with company DNA.',
    inherits: ['growth-network', 'knowledge-graph', 'memory-bible'],
    collaboratesWith: ['partnership-director', 'chief-growth-officer', 'community-manager'],
  },
  'revenue-strategist': {
    id: 'revenue-strategist',
    title: 'Revenue Strategist',
    department: 'Revenue',
    mandate: 'Optimize revenue mix, pricing, and diversification score across all channels.',
    inherits: ['analytics', 'reporting-dashboards', 'growth-network'],
    collaboratesWith: ['chief-growth-officer', 'affiliate-director', 'analytics-director'],
  },
  'affiliate-director': {
    id: 'affiliate-director',
    title: 'Affiliate Director',
    department: 'Affiliate',
    mandate: 'Identify, negotiate, and optimize affiliate programs for sustainable passive income.',
    inherits: ['growth-network', 'campaigns', 'analytics'],
    collaboratesWith: ['revenue-strategist', 'partnership-director'],
  },
  'contract-analyst': {
    id: 'contract-analyst',
    title: 'Contract Analyst',
    department: 'Legal Ops',
    mandate: 'Review agreements for payment terms, usage rights, renewal clauses, and flagged language — educational insights only.',
    inherits: ['growth-network', 'documentation', 'operating-rules'],
    collaboratesWith: ['partnership-director', 'chief-growth-officer'],
  },
  'community-manager': {
    id: 'community-manager',
    title: 'Community Manager',
    department: 'Community',
    mandate: 'Grow community partnerships, engagement loops, and audience retention programs.',
    inherits: ['memory-bible', 'social-accounts', 'writing-bible'],
    collaboratesWith: ['business-development-director', 'audience-growth-strategist'],
  },
  'market-intelligence-director': {
    id: 'market-intelligence-director',
    title: 'Market Intelligence Director',
    department: 'Intelligence',
    mandate: 'Monitor industry trends, competitor moves, and opportunity signals for proactive growth actions.',
    inherits: ['analytics', 'knowledge-graph', 'growth-network'],
    collaboratesWith: ['chief-growth-officer', 'analytics-director'],
  },
};

export const GROWTH_EXECUTIVE_ROLE_IDS = Object.keys(GROWTH_EXECUTIVE_ROLE_CATALOG);

export function getGrowthExecutivesForWorkspace() {
  return GROWTH_EXECUTIVE_ROLE_IDS.map((id) => ({
    ...GROWTH_EXECUTIVE_ROLE_CATALOG[id],
    workspaceId: 'platform',
    status: 'active' as const,
  }));
}
