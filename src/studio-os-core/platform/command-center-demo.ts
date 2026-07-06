/** Portfolio-level demo metrics for Studio Command Center — never organization-specific. */

export type PortfolioAttentionItem = {
  id: string;
  organization: string;
  issue: string;
  severity: 'high' | 'medium' | 'low';
};

export type PortfolioHealthMetric = {
  id: string;
  label: string;
  value: string;
  trend?: string;
};

export const STUDIO_COMMAND_CENTER_HEADLINE = 'STUDIO COMMAND CENTER';
export const STUDIO_COMMAND_CENTER_SUBTITLE =
  'PORTFOLIO OPERATING VIEW · EVERY ORGANIZATION · NO DEFAULT COMPANY';

export const PORTFOLIO_HEALTH_METRICS: PortfolioHealthMetric[] = [
  { id: 'health', label: 'PORTFOLIO HEALTH', value: '92%', trend: '+2% VS LAST WEEK' },
  { id: 'orgs', label: 'ACTIVE ORGANIZATIONS', value: '4', trend: 'ALL OPERATIONAL' },
  { id: 'revenue', label: 'PORTFOLIO REVENUE', value: '$284K', trend: 'MTD PACING ON TARGET' },
  { id: 'ai', label: 'GLOBAL AI ACTIVITY', value: '1,842', trend: 'REQUESTS TODAY' },
];

export const ORGANIZATIONS_REQUIRING_ATTENTION: PortfolioAttentionItem[] = [
  {
    id: 'ndxbook-publish',
    organization: 'NDXBOOK',
    issue: 'Distribution pack awaiting approval before publish window closes.',
    severity: 'high',
  },
  {
    id: 'fs-render',
    organization: 'FRONTAL SLAYER',
    issue: 'Render queue backlog above weekly threshold.',
    severity: 'medium',
  },
];

export const CROSS_COMPANY_INSIGHTS = [
  'Executive utilization is highest in FRONTAL SLAYER production modules this week.',
  'NDXBOOK social connectors are live — review workflow ready for first publish.',
  'Marketplace plugin updates available for 2 organizations.',
];

export const STUDIO_ADMIN_DASHBOARD_METRIC = 4;

export const STUDIO_ADMIN_DASHBOARD_ITEMS = [
  { label: 'COMMAND CENTER', value: 'Portfolio', color: 'text-red-500' as const },
  { label: 'ORGANIZATIONS', value: 'Registry', color: 'text-gray-500' as const },
  { label: 'LICENSING', value: 'Ready', color: 'text-gray-500' as const },
  { label: 'MARKETPLACE', value: 'Active', color: 'text-gray-500' as const },
  { label: 'GLOBAL AI', value: 'Live', color: 'text-gray-500' as const },
  { label: 'PLUGINS', value: 'Ready', color: 'text-gray-500' as const },
];

export const STUDIO_ADMIN_DASHBOARD_FOOTER = 'STUDIO ADMINISTRATION · ABOVE EVERY ORGANIZATION';
