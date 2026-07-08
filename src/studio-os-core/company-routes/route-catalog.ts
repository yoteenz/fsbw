import { GLOBAL_STUDIO_ROUTES } from './constants';
import type { CompanyDepartmentId } from './types';

export type CompanyRouteTarget = {
  legacyPath: string;
  displayLabel: string;
  departmentId?: CompanyDepartmentId;
  roomId?: string;
  sceneId?: string;
};

const ADMIN = '/admin/studio';

/** Headquarters rooms → legacy implementation paths */
export const COMPANY_HEADQUARTERS_ROUTES: Record<string, CompanyRouteTarget> = {
  'grand-atrium': { legacyPath: `${ADMIN}/mission-control`, displayLabel: 'Grand Atrium™' },
  'founder-office': { legacyPath: `${ADMIN}/chief-of-staff`, displayLabel: 'Founder Office™' },
  'company-pulse': { legacyPath: `${ADMIN}/organization-pulse`, displayLabel: 'Company Pulse™' },
  concierge: { legacyPath: `${ADMIN}/concierge-layer`, displayLabel: 'Concierge™' },
  'daily-briefing': { legacyPath: `${ADMIN}/ambient-awareness`, displayLabel: 'Daily Briefing™' },
};

export const COMPANY_CREATIVE_ROUTES: Record<string, CompanyRouteTarget> = {
  'creative-direction': {
    legacyPath: `${ADMIN}/department/creative-direction`,
    displayLabel: 'Creative Direction Studio™',
    departmentId: undefined,
    roomId: 'creative-direction-studio',
  },
  'creative-direction/story-table': {
    legacyPath: `${ADMIN}/department/creative-direction`,
    displayLabel: 'Story Table™',
    roomId: 'story-table',
    sceneId: 'story-table',
  },
};

export const COMPANY_DEPARTMENT_ROUTES: Record<CompanyDepartmentId, CompanyRouteTarget> = {
  marketing: { legacyPath: `${ADMIN}/brand-architect`, displayLabel: 'Marketing™', departmentId: 'marketing' },
  finance: { legacyPath: `${ADMIN}/business-model-engine`, displayLabel: 'Finance™', departmentId: 'finance' },
  operations: { legacyPath: `${ADMIN}/work-orchestration`, displayLabel: 'Operations™', departmentId: 'operations' },
  product: { legacyPath: `${ADMIN}/production`, displayLabel: 'Product™', departmentId: 'product' },
  'customer-experience': {
    legacyPath: `${ADMIN}/chief-experience-officer`,
    displayLabel: 'Customer Experience™',
    departmentId: 'customer-experience',
  },
  intelligence: { legacyPath: `${ADMIN}/intelligence-engine`, displayLabel: 'Intelligence™', departmentId: 'intelligence' },
  distribution: { legacyPath: `${ADMIN}/distribution-network`, displayLabel: 'Distribution™', departmentId: 'distribution' },
  hiring: { legacyPath: `${ADMIN}/talent-agency`, displayLabel: 'Hiring™', departmentId: 'hiring' },
  legal: { legacyPath: `${ADMIN}/professional-trust-framework`, displayLabel: 'Legal™', departmentId: 'legal' },
};

export const GLOBAL_ROUTE_TARGETS: Record<string, CompanyRouteTarget> = {
  'command-center': { legacyPath: `${ADMIN}/world/command-center`, displayLabel: 'Command Center™' },
  archives: { legacyPath: `${ADMIN}/studio-archives`, displayLabel: 'Studio Archives™' },
  'archives/warehouse': { legacyPath: `${ADMIN}/studio-warehouse`, displayLabel: 'Studio Warehouse™' },
  'archives/museum': { legacyPath: `${ADMIN}/studio-archives?zone=museum-wing`, displayLabel: 'Museum Wing™' },
  'archives/hall-of-innovation': { legacyPath: `${ADMIN}/innovation-lab`, displayLabel: 'Hall of Innovation™' },
  'archives/blueprints': { legacyPath: `${ADMIN}/blueprint-manager`, displayLabel: 'Blueprint Archive™' },
  'archives/marketplace': { legacyPath: `${ADMIN}/marketplace`, displayLabel: 'Archives Marketplace™' },
  expeditions: { legacyPath: `${ADMIN}/innovation-expeditions`, displayLabel: 'Expeditions™' },
  'mission-control': { legacyPath: `${ADMIN}/world-atlas`, displayLabel: 'Mission Control™' },
  atlas: { legacyPath: `${ADMIN}/world-atlas`, displayLabel: 'Atlas Table™' },
};

/** Per-company legacy implementation overrides (workspace-specific HQ, etc.) */
const COMPANY_LEGACY_OVERRIDES: Record<string, Record<string, string>> = {
  ndxbook: {
    '': '/admin/studio/ndxbook/mission-control',
    'grand-atrium': '/admin/studio/ndxbook/mission-control',
    'creative-direction': '/admin/studio/ndxbook/creative-direction',
    'creative-direction/story-table': '/admin/studio/ndxbook/creative-direction',
  },
};

export function resolveCompanyLegacyPath(companySlug: string, tail: string): string {
  const clean = tail.replace(/^\//, '').replace(/\/$/, '');
  const override = COMPANY_LEGACY_OVERRIDES[companySlug]?.[clean];
  if (override) return override;
  const target = resolveCompanyRouteTarget(clean);
  return target?.legacyPath ?? `/admin/studio/companies/${companySlug}`;
}

export function resolveGlobalRouteTarget(segmentPath: string): CompanyRouteTarget | null {
  const clean = segmentPath.replace(/^\//, '');
  if (GLOBAL_ROUTE_TARGETS[clean]) return GLOBAL_ROUTE_TARGETS[clean];
  if (clean === 'command-center') return GLOBAL_ROUTE_TARGETS['command-center']!;
  return null;
}

export function resolveCompanyRouteTarget(segmentPath: string): CompanyRouteTarget | null {
  const clean = segmentPath.replace(/^\//, '').replace(/\/$/, '');
  if (!clean) return { legacyPath: GLOBAL_STUDIO_ROUTES.missionControl, displayLabel: 'Grand Atrium™' };

  if (COMPANY_CREATIVE_ROUTES[clean]) return COMPANY_CREATIVE_ROUTES[clean];
  if (COMPANY_HEADQUARTERS_ROUTES[clean]) return COMPANY_HEADQUARTERS_ROUTES[clean];

  if (clean === 'departments') {
    return { legacyPath: `${ADMIN}/overview`, displayLabel: 'Departments™' };
  }

  const deptMatch = clean.match(/^departments\/([^/]+)$/);
  if (deptMatch) {
    const deptId = deptMatch[1] as CompanyDepartmentId;
    return COMPANY_DEPARTMENT_ROUTES[deptId] ?? {
      legacyPath: `${ADMIN}/overview`,
      displayLabel: deptId.replace(/-/g, ' '),
      departmentId: deptId,
    };
  }

  return null;
}
