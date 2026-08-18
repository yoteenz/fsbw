/**
 * Isolated seed/mock data for SITE 00 public pages.
 * Replace with real APIs or CMS when available — do not treat as production records.
 */

export type PortfolioProjectSeed = {
  id: string;
  name: string;
  description: string;
  status: 'completed' | 'in-progress';
  imageUrl?: string;
};

/** Public portfolio — empty until published project API exists. */
export const SITE00_PORTFOLIO_SEED: PortfolioProjectSeed[] = [];

export const SITE00_SERVICES_SEED = [
  { id: 'bldr', title: 'BLDR', description: 'Start building with the Site 00 builder.', cta: 'LAUNCH →', href: '/bldr' },
  { id: 'domains', title: 'DOMAINS', description: 'Search, connect, and manage your domains.', cta: 'MANAGE →', href: '/control/domains' },
  { id: 'forms', title: 'FORMS', description: 'Create and manage powerful forms.', cta: 'VIEW →', href: '/services#forms' },
  { id: 'analytics', title: 'ANALYTICS', description: 'Track performance across your sites.', cta: 'VIEW →', href: '/services#analytics' },
  { id: 'seo', title: 'SEO', description: 'Optimize your sites for search engines.', cta: 'VIEW →', href: '/services#seo' },
  { id: 'backups', title: 'BACKUPS', description: 'Automatic backups and restore points.', cta: 'VIEW →', href: '/services#backups' },
  { id: 'integrations', title: 'INTEGRATIONS', description: 'Connect third-party services and tools.', cta: 'VIEW →', href: '/services#integrations' },
  { id: 'api', title: 'API', description: 'Access the Site 00 developer API.', cta: 'DOCUMENTATION →', href: '/services#api' },
] as const;

export const SITE00_SYSTEM_STATUS_SEED = [
  { id: 'platform', label: 'PLATFORM', state: 'unavailable' as const },
  { id: 'database', label: 'DATABASE', state: 'unavailable' as const },
  { id: 'storage', label: 'STORAGE', state: 'unavailable' as const },
  { id: 'cdn', label: 'CDN', state: 'unavailable' as const },
  { id: 'auth', label: 'AUTH', state: 'unavailable' as const },
];

export const SITE00_JOURNAL_CATEGORIES = ['ALL', 'PRODUCT', 'ENGINEERING', 'COMPANY', 'RESOURCES'] as const;

export type JournalArticleSeed = {
  id: string;
  category: Exclude<(typeof SITE00_JOURNAL_CATEGORIES)[number], 'ALL'>;
  title: string;
  excerpt: string;
  date: string;
  readMinutes: number;
};

export const SITE00_JOURNAL_SEED: JournalArticleSeed[] = [];

export const SITE00_SUPPORT_TOPICS_SEED = [
  { id: 'getting-started', title: 'GETTING STARTED', description: 'Learn the basics of SITE 00.', href: '/support#getting-started' },
  { id: 'billing', title: 'BILLING & PAYMENTS', description: 'Manage plans, invoices, and payments.', href: '/support#billing' },
  { id: 'sites-domains', title: 'SITES & DOMAINS', description: 'Launch sites and connect domains.', href: '/support#sites' },
  { id: 'projects', title: 'PROJECTS', description: 'Organize workspaces and builds.', href: '/support#projects' },
  { id: 'account-security', title: 'ACCOUNT & SECURITY', description: 'Protect your account and access.', href: '/idnty/sign-in-security' },
  { id: 'integrations', title: 'INTEGRATIONS', description: 'Connect external tools and services.', href: '/support#integrations' },
  { id: 'troubleshooting', title: 'TROUBLESHOOTING', description: 'Resolve common issues quickly.', href: '/support#troubleshooting' },
  { id: 'api', title: 'API & DEVELOPER', description: 'Build with the SITE 00 API.', href: '/support#api' },
] as const;

export const SITE00_TEMPLATE_CATEGORIES = ['ALL', 'WEBSITES', 'APPS', 'INFRASTRUCTURE'] as const;

export type TemplateSeed = {
  id: string;
  name: string;
  description: string;
  category: Exclude<(typeof SITE00_TEMPLATE_CATEGORIES)[number], 'ALL'>;
};

export const SITE00_TEMPLATES_SEED: TemplateSeed[] = [];

export const SITE00_IDNTY_HUB_MODULES = [
  { id: 'security', title: 'SIGN IN & SECURITY', href: '/idnty/sign-in-security' },
  { id: 'profile', title: 'PROFILE', href: '/control/settings' },
  { id: 'api-keys', title: 'API KEYS', href: '/control/settings#api-keys' },
  { id: 'sessions', title: 'SESSIONS', href: '/idnty/sign-in-security#sessions' },
  { id: 'notifications', title: 'NOTIFICATIONS', href: '/control/settings#notifications' },
  { id: 'privacy', title: 'PRIVACY', href: '/control/settings#privacy' },
  { id: 'tokens', title: 'ACCESS TOKENS', href: '/control/settings#tokens' },
  { id: 'delete', title: 'DELETE ACCOUNT', href: '/control/settings#delete-account', destructive: true },
] as const;

export const SITE00_BLDR_HUB_ACTIONS = [
  { id: 'start', title: 'START NEW PROJECT', description: 'Begin a new build from your current foundation.', cta: 'START →', href: '/bldr/state' },
  { id: 'templates', title: 'TEMPLATES', description: 'Choose from pre-built templates and blueprints.', cta: 'BROWSE →', href: '/bldr/templates' },
  { id: 'components', title: 'COMPONENTS', description: 'Explore reusable SITE 00 components.', cta: 'EXPLORE →', href: '/bldr/state' },
  { id: 'deploy', title: 'DEPLOY', description: 'Publish your build to production.', cta: 'DEPLOY →', href: '/control/sites' },
] as const;
