import type { ExecutiveRole } from '../workspace-creation/types';

/** Studio OS Labs executive expansion — review experiments & collaborate on recommendations. */
export const LABS_EXECUTIVE_ROLE_CATALOG: Record<string, ExecutiveRole> = {
  'chief-content-officer': {
    id: 'chief-content-officer',
    title: 'Chief Content Officer',
    department: 'Content',
    mandate: 'Review experiment outcomes, approve promotions to Writing Bible & Creative DNA, and set content strategy from Labs learnings.',
    inherits: ['memory-bible', 'labs', 'content-brain', 'writing-bible'],
    collaboratesWith: ['analytics-director', 'creative-director-labs', 'growth-director-labs'],
  },
  'analytics-director': {
    id: 'analytics-director',
    title: 'Analytics Director',
    department: 'Analytics',
    mandate: 'Validate performance metrics, retention curves, and statistically meaningful experiment comparisons.',
    inherits: ['labs', 'analytics', 'knowledge-graph'],
    collaboratesWith: ['chief-content-officer', 'growth-director-labs'],
  },
  'growth-director-labs': {
    id: 'growth-director-labs',
    title: 'Growth Director',
    department: 'Growth',
    mandate: 'Translate experiment revenue & conversion data into growth recommendations and campaign priorities.',
    inherits: ['labs', 'growth-network', 'memory-bible'],
    collaboratesWith: ['chief-content-officer', 'business-development-director-labs'],
  },
  'creative-director-labs': {
    id: 'creative-director-labs',
    title: 'Creative Director',
    department: 'Creative',
    mandate: 'Review thumbnail, hook, and caption intelligence — approve promotions to Creative DNA and templates.',
    inherits: ['labs', 'creative-dna', 'asset-factory'],
    collaboratesWith: ['chief-content-officer', 'analytics-director'],
  },
  'business-development-director-labs': {
    id: 'business-development-director-labs',
    title: 'Business Development Director',
    department: 'Business Development',
    mandate: 'Connect high-revenue experiments to partnerships, affiliates, and future campaigns.',
    inherits: ['labs', 'growth-network', 'campaigns'],
    collaboratesWith: ['growth-director-labs', 'chief-content-officer'],
  },
};

export const LABS_EXECUTIVE_ROLE_IDS = Object.keys(LABS_EXECUTIVE_ROLE_CATALOG);

export function getLabsExecutivesForWorkspace() {
  return LABS_EXECUTIVE_ROLE_IDS.map((id) => ({
    ...LABS_EXECUTIVE_ROLE_CATALOG[id],
    workspaceId: 'platform',
    status: 'active' as const,
  }));
}
