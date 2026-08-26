/**
 * P0.VR.3D semantic authority for SITE 00 founder-designable experience scope.
 * Baseline: 28 website/client routes + 5 visual states + 9 missing dependencies ≈ 42 targets.
 */
import type { CustomerJourneyStage, DesignRoutePriority, ExperiencePageType } from './types';

export type Site00CanonicalExperiencePage = {
  id: string;
  displayName: string;
  sectionId: string;
  experienceType: ExperiencePageType;
  routePatterns: RegExp[];
  priority: DesignRoutePriority;
  journeyStage: CustomerJourneyStage;
  founderPrimary: boolean;
  materialScreenLabels?: string[];
};

export type Site00CanonicalVisualState = {
  id: string;
  displayName: string;
  parentPageId: string;
  routePatterns: RegExp[];
};

export type Site00MissingExperiencePage = {
  id: string;
  displayName: string;
  sectionId: string;
  suggestedRoute: string;
  priority: DesignRoutePriority;
};

export const SITE00_P0_VR_3D_BASELINE_COUNT = 42;
export const SITE00_P0_VR_3D_ROUTE_COUNT = 28;
export const SITE00_P0_VR_3D_STATE_COUNT = 5;
export const SITE00_P0_VR_3D_MISSING_COUNT = 9;

export const SITE00_EXPERIENCE_SECTIONS = [
  { sectionId: 'site00:section:origin', displayName: 'ORIGIN', order: 0 },
  { sectionId: 'site00:section:waiting-room', displayName: 'WAITING ROOM', order: 1 },
  { sectionId: 'site00:section:identity', displayName: 'IDENTITY', order: 2 },
  { sectionId: 'site00:section:builder', displayName: 'BUILDER', order: 3 },
  { sectionId: 'site00:section:evolve', displayName: 'EVOLVE', order: 4 },
  { sectionId: 'site00:section:system', displayName: 'SYSTEM', order: 5 },
  { sectionId: 'site00:section:information', displayName: 'INFORMATION', order: 6 },
  { sectionId: 'site00:section:account-auth', displayName: 'ACCOUNT / AUTH', order: 7 },
  { sectionId: 'site00:section:asset-vault', displayName: 'ASSET VAULT', order: 8 },
] as const;

export const SITE00_CANONICAL_EXPERIENCE_PAGES: Site00CanonicalExperiencePage[] = [
  {
    id: 'site00:xp:origin',
    displayName: 'Origin',
    sectionId: 'site00:section:origin',
    experienceType: 'PUBLIC_PAGE',
    routePatterns: [/^\/$/, /^\/origin(\/|$)/],
    priority: 'CRITICAL',
    journeyStage: 'ENTRY',
    founderPrimary: true,
  },
  {
    id: 'site00:xp:waiting-room',
    displayName: 'Waiting Room',
    sectionId: 'site00:section:waiting-room',
    experienceType: 'PUBLIC_PAGE',
    routePatterns: [/^\/enter(\/|$)/],
    priority: 'PRIMARY',
    journeyStage: 'ENTRY',
    founderPrimary: true,
  },
  {
    id: 'site00:xp:identity',
    displayName: 'Identity',
    sectionId: 'site00:section:identity',
    experienceType: 'WORKFLOW_PAGE',
    routePatterns: [/^\/idnty(\/|$)/],
    priority: 'CRITICAL',
    journeyStage: 'CONSIDERATION',
    founderPrimary: true,
    materialScreenLabels: ['Entry', 'Assessment', 'State Selection'],
  },
  {
    id: 'site00:xp:builder',
    displayName: 'Builder',
    sectionId: 'site00:section:builder',
    experienceType: 'WORKFLOW_PAGE',
    routePatterns: [/^\/bldr(\/|$)/],
    priority: 'CRITICAL',
    journeyStage: 'CONFIGURATION',
    founderPrimary: true,
    materialScreenLabels: ['Entry', 'Assessment', 'Templates', 'Start'],
  },
  {
    id: 'site00:xp:evolve',
    displayName: 'Evolve',
    sectionId: 'site00:section:evolve',
    experienceType: 'WORKFLOW_PAGE',
    routePatterns: [/^\/evolve(\/|$)/],
    priority: 'PRIMARY',
    journeyStage: 'RETENTION',
    founderPrimary: true,
    materialScreenLabels: ['Entry', 'Assessment', 'State Selection'],
  },
  {
    id: 'site00:xp:system',
    displayName: 'System',
    sectionId: 'site00:section:system',
    experienceType: 'PUBLIC_PAGE',
    routePatterns: [/^\/system(\/|$)/],
    priority: 'SECONDARY',
    journeyStage: 'DISCOVERY',
    founderPrimary: true,
  },
  {
    id: 'site00:xp:sites',
    displayName: 'Sites',
    sectionId: 'site00:section:system',
    experienceType: 'PUBLIC_PAGE',
    routePatterns: [/^\/sites(\/|$)/],
    priority: 'SECONDARY',
    journeyStage: 'DISCOVERY',
    founderPrimary: true,
  },
  {
    id: 'site00:xp:services',
    displayName: 'Services',
    sectionId: 'site00:section:system',
    experienceType: 'PUBLIC_PAGE',
    routePatterns: [/^\/services(\/|$)/],
    priority: 'SECONDARY',
    journeyStage: 'DISCOVERY',
    founderPrimary: true,
  },
  {
    id: 'site00:xp:about',
    displayName: 'About',
    sectionId: 'site00:section:information',
    experienceType: 'PUBLIC_PAGE',
    routePatterns: [/^\/about(\/|$)/],
    priority: 'SECONDARY',
    journeyStage: 'DISCOVERY',
    founderPrimary: true,
  },
  {
    id: 'site00:xp:journal',
    displayName: 'Journal',
    sectionId: 'site00:section:information',
    experienceType: 'PUBLIC_PAGE',
    routePatterns: [/^\/journal(\/|$)/],
    priority: 'SUPPORTING',
    journeyStage: 'DISCOVERY',
    founderPrimary: true,
  },
  {
    id: 'site00:xp:support',
    displayName: 'Support',
    sectionId: 'site00:section:information',
    experienceType: 'PUBLIC_PAGE',
    routePatterns: [/^\/support(\/|$)/],
    priority: 'SUPPORTING',
    journeyStage: 'SUPPORT',
    founderPrimary: true,
  },
  {
    id: 'site00:xp:sign-in',
    displayName: 'Sign In',
    sectionId: 'site00:section:account-auth',
    experienceType: 'PUBLIC_PAGE',
    routePatterns: [/^\/origin\/sign-in(\/|$)/, /^\/sign-in(\/|$)/],
    priority: 'PRIMARY',
    journeyStage: 'ENTRY',
    founderPrimary: true,
  },
  {
    id: 'site00:xp:account',
    displayName: 'Account',
    sectionId: 'site00:section:account-auth',
    experienceType: 'PUBLIC_PAGE',
    routePatterns: [/^\/account(\/|$)/],
    priority: 'PRIMARY',
    journeyStage: 'ACCOUNT',
    founderPrimary: true,
  },
  {
    id: 'site00:xp:asset-vault',
    displayName: 'Asset Vault',
    sectionId: 'site00:section:asset-vault',
    experienceType: 'WORKSPACE_PAGE',
    routePatterns: [/^\/assts(\/|$)/],
    priority: 'PRIMARY',
    journeyStage: 'ACCOUNT',
    founderPrimary: false,
    materialScreenLabels: ['Library', 'Batch Review', 'Asset Inspection'],
  },
  {
    id: 'site00:xp:projects',
    displayName: 'Projects',
    sectionId: 'site00:section:system',
    experienceType: 'PORTAL_PAGE',
    routePatterns: [/^\/projects(\/|$)/],
    priority: 'SECONDARY',
    journeyStage: 'ACCOUNT',
    founderPrimary: true,
  },
  {
    id: 'site00:xp:control',
    displayName: 'Control Room',
    sectionId: 'site00:section:system',
    experienceType: 'PORTAL_PAGE',
    routePatterns: [/^\/control(\/|$)/],
    priority: 'SECONDARY',
    journeyStage: 'ACCOUNT',
    founderPrimary: false,
  },
];

export const SITE00_CANONICAL_VISUAL_STATES: Site00CanonicalVisualState[] = [
  {
    id: 'site00:vs:identity-expanded',
    displayName: 'Identity Expanded',
    parentPageId: 'site00:xp:identity',
    routePatterns: [/^\/idnty\/state(\/|$)/],
  },
  {
    id: 'site00:vs:builder-expanded',
    displayName: 'Builder Expanded',
    parentPageId: 'site00:xp:builder',
    routePatterns: [/^\/bldr\/state(\/|$)/],
  },
  {
    id: 'site00:vs:evolve-expanded',
    displayName: 'Evolve Expanded',
    parentPageId: 'site00:xp:evolve',
    routePatterns: [/^\/evolve\/state(\/|$)/],
  },
  {
    id: 'site00:vs:waiting-room-menu',
    displayName: 'Waiting Room Menu',
    parentPageId: 'site00:xp:waiting-room',
    routePatterns: [/^\/enter.*menu/i],
  },
  {
    id: 'site00:vs:brand-panel',
    displayName: 'Brand Panel',
    parentPageId: 'site00:xp:identity',
    routePatterns: [/brand/i],
  },
];

export const SITE00_MISSING_EXPERIENCE_PAGES: Site00MissingExperiencePage[] = [
  { id: 'site00:xp-missing:guide', displayName: 'Guide', sectionId: 'site00:section:information', suggestedRoute: '/guide', priority: 'SECONDARY' },
  { id: 'site00:xp-missing:sound', displayName: 'Sound', sectionId: 'site00:section:information', suggestedRoute: '/sound', priority: 'SUPPORTING' },
  { id: 'site00:xp-missing:faq', displayName: 'FAQ', sectionId: 'site00:section:information', suggestedRoute: '/faq', priority: 'SECONDARY' },
  { id: 'site00:xp-missing:contact', displayName: 'Contact', sectionId: 'site00:section:information', suggestedRoute: '/contact', priority: 'PRIMARY' },
  { id: 'site00:xp-missing:blueprints', displayName: 'Blueprints', sectionId: 'site00:section:builder', suggestedRoute: '/bluprint', priority: 'PRIMARY' },
  { id: 'site00:xp-missing:forgot-password', displayName: 'Forgot Password', sectionId: 'site00:section:account-auth', suggestedRoute: '/forgot-password', priority: 'PRIMARY' },
  { id: 'site00:xp-missing:reset', displayName: 'Reset Password', sectionId: 'site00:section:account-auth', suggestedRoute: '/reset', priority: 'PRIMARY' },
  { id: 'site00:xp-missing:account', displayName: 'Account Landing', sectionId: 'site00:section:account-auth', suggestedRoute: '/account', priority: 'PRIMARY' },
  { id: 'site00:xp-missing:brand', displayName: 'Brand', sectionId: 'site00:section:identity', suggestedRoute: '/brand', priority: 'SECONDARY' },
];

const SITE00_HOST_PATTERNS = [/^\/bluprint/, /^\/admin\/studio/, /^\/admin\/site00/];

export function matchSite00CanonicalPage(route: string): Site00CanonicalExperiencePage | undefined {
  const normalized = route.replace(/\/desktop(\/|$)/, '/');
  for (const page of SITE00_CANONICAL_EXPERIENCE_PAGES) {
    if (page.routePatterns.some((re) => re.test(normalized) || re.test(route))) return page;
  }
  return undefined;
}

export function isSite00DesignHostRoute(route: string): boolean {
  return SITE00_HOST_PATTERNS.some((re) => re.test(route));
}

export function isSite00ProductionWorkspaceRoute(route: string): boolean {
  return /^\/admin\/site00/.test(route);
}
