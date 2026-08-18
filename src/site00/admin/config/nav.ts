import { SITE00_ADMIN_ROUTES } from './routes';

export type Site00AdminNavItem = {
  id: string;
  label: string;
  href: string;
  badge?: number;
};

export const SITE00_ADMIN_NAV: Site00AdminNavItem[] = [
  { id: 'dashboard', label: 'DASHBOARD', href: SITE00_ADMIN_ROUTES.dashboard },
  { id: 'studio', label: 'STUDIO', href: SITE00_ADMIN_ROUTES.studio },
  { id: 'approvals', label: 'APPROVALS', href: SITE00_ADMIN_ROUTES.approvals },
  { id: 'identities', label: 'IDENTITIES', href: SITE00_ADMIN_ROUTES.identities },
  { id: 'bldr-intakes', label: 'BLDR INTAKES', href: SITE00_ADMIN_ROUTES.bldrIntakes },
  { id: 'leads', label: 'LEADS', href: SITE00_ADMIN_ROUTES.leads },
  { id: 'discovery', label: 'DISCOVERY', href: SITE00_ADMIN_ROUTES.discovery },
  { id: 'projects', label: 'PROJECTS', href: SITE00_ADMIN_ROUTES.projects },
  { id: 'sites', label: 'SITES', href: SITE00_ADMIN_ROUTES.sites },
  { id: 'ctrl-room', label: 'CTRL ROOM', href: SITE00_ADMIN_ROUTES.ctrlRoom },
  { id: 'finance', label: 'FINANCE', href: SITE00_ADMIN_ROUTES.finance },
  { id: 'team', label: 'TEAM', href: SITE00_ADMIN_ROUTES.team },
  { id: 'reports', label: 'REPORTS', href: SITE00_ADMIN_ROUTES.reports },
  { id: 'settings', label: 'SETTINGS', href: SITE00_ADMIN_ROUTES.settings },
];

export const SITE00_ADMIN_MOBILE_NAV = [
  { id: 'dashboard', label: 'DASHBOARD', href: SITE00_ADMIN_ROUTES.dashboard },
  { id: 'studio', label: 'STUDIO', href: SITE00_ADMIN_ROUTES.studio },
  { id: 'approvals', label: 'APPROVALS', href: SITE00_ADMIN_ROUTES.approvals },
  { id: 'projects', label: 'PROJECTS', href: SITE00_ADMIN_ROUTES.projects },
  { id: 'more', label: 'MORE', href: SITE00_ADMIN_ROUTES.settings },
];

export const PROJECT_WORKSPACE_TABS = [
  { id: 'overview', label: 'OVERVIEW', suffix: '' },
  { id: 'intelligence', label: 'INTELLIGENCE', suffix: '/intelligence' },
  { id: 'studio', label: 'STUDIO', suffix: '/studio' },
  { id: 'approvals', label: 'APPROVALS', suffix: '/approvals' },
  { id: 'deliverables', label: 'DELIVERABLES', suffix: '/deliverables' },
  { id: 'access', label: 'ACCESS', suffix: '/access' },
  { id: 'activity', label: 'ACTIVITY', suffix: '/activity' },
] as const;
