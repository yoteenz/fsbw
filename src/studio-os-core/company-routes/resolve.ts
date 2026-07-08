import { STUDIO_COMPANIES_BASE } from './constants';
import { getCompanyBySlug } from './registry';
import {
  COMPANY_HEADQUARTERS_ROUTES,
  resolveCompanyRouteTarget,
  resolveCompanyLegacyPath,
  resolveGlobalRouteTarget,
} from './route-catalog';
import type { CompanyDepartmentId, CompanyRouteKind, CompanyRouteResolution } from './types';

function parseCompanySegments(pathname: string): { companySlug: string; tail: string } | null {
  const prefix = `${STUDIO_COMPANIES_BASE}/`;
  if (!pathname.startsWith(prefix)) return null;
  const rest = pathname.slice(prefix.length);
  const slash = rest.indexOf('/');
  if (slash === -1) {
    return { companySlug: rest, tail: '' };
  }
  return { companySlug: rest.slice(0, slash), tail: rest.slice(slash + 1) };
}

function parseGlobalSegments(pathname: string): string | null {
  const base = '/admin/studio/';
  if (!pathname.startsWith(base)) return null;
  const rest = pathname.slice(base.length);
  if (rest.startsWith('companies/') || rest.startsWith('world/') || rest.startsWith('studio-os')) {
    return null;
  }
  const globalKeys = [
    'command-center',
    'archives',
    'expeditions',
    'mission-control',
    'atlas',
  ];
  for (const key of globalKeys) {
    if (rest === key || rest.startsWith(`${key}/`)) {
      return rest;
    }
  }
  return null;
}

export function resolveCompanyRoute(pathname: string): CompanyRouteResolution {
  const clean = pathname.replace(/\/$/, '') || pathname;

  const globalSeg = parseGlobalSegments(clean);
  if (globalSeg) {
    const target = resolveGlobalRouteTarget(globalSeg);
    return {
      kind: 'global',
      companySlug: null,
      company: null,
      segments: globalSeg.split('/').filter(Boolean),
      activeHeadquarters: null,
      activeDepartment: null,
      activeRoom: null,
      activeScene: null,
      legacyPath: target?.legacyPath ?? '/admin/studio/overview',
      displayLabel: target?.displayLabel ?? 'Studio World™',
    };
  }

  const parsed = parseCompanySegments(clean);
  if (!parsed) {
    return {
      kind: 'unknown',
      companySlug: null,
      company: null,
      segments: [],
      activeHeadquarters: null,
      activeDepartment: null,
      activeRoom: null,
      activeScene: null,
      legacyPath: '/admin/studio/overview',
      displayLabel: 'Studio World™',
    };
  }

  const company = getCompanyBySlug(parsed.companySlug);
  const target = resolveCompanyRouteTarget(parsed.tail);

  let kind: CompanyRouteKind = 'unknown';
  if (!parsed.tail) kind = 'company-home';
  else if (parsed.tail.startsWith('creative-direction/')) kind = 'creative-direction-room';
  else if (parsed.tail === 'creative-direction') kind = 'creative-direction';
  else if (parsed.tail === 'departments') kind = 'department-overview';
  else if (parsed.tail.startsWith('departments/')) kind = 'department';
  else if (parsed.tail in COMPANY_HEADQUARTERS_ROUTES) {
    kind = 'headquarters-room';
  }

  const legacyPath = resolveCompanyLegacyPath(parsed.companySlug, parsed.tail);

  return {
    kind,
    companySlug: parsed.companySlug,
    company,
    segments: parsed.tail.split('/').filter(Boolean),
    activeHeadquarters:
      kind === 'headquarters-room' || kind === 'company-home'
        ? (parsed.tail.split('/')[0] ?? 'grand-atrium')
        : null,
    activeDepartment: (target?.departmentId as CompanyDepartmentId | undefined) ?? null,
    activeRoom: target?.roomId ?? null,
    activeScene: target?.sceneId ?? null,
    legacyPath,
    displayLabel: target?.displayLabel ?? company?.companyName ?? parsed.companySlug,
  };
}

export function isCompanyScopedPath(pathname: string): boolean {
  return pathname.includes(`${STUDIO_COMPANIES_BASE}/`) || parseGlobalSegments(pathname) !== null;
}
