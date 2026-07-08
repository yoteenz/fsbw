import { STUDIO_COMPANIES_BASE } from './constants';
import { studioCompanyCreativeDirectionPath, studioCompanyGrandAtriumPath } from './paths';
import { resolveCompanySlugFromWorkspaceId } from './registry';

/** Legacy paths → canonical Multi-Company Route Architecture™ URLs */
export const LEGACY_TO_CANONICAL_REDIRECTS: Array<{
  test: (pathname: string) => boolean;
  resolve: (pathname: string) => string;
}> = [
  {
    test: (p) => p === '/admin/studio/mission-control',
    resolve: () => studioCompanyGrandAtriumPath('frontal-slayer'),
  },
  {
    test: (p) => p === '/admin/headquarters' || p === '/admin/headquarters/',
    resolve: () => studioCompanyGrandAtriumPath('frontal-slayer'),
  },
  {
    test: (p) => p === '/admin/studio/department/creative-direction',
    resolve: () => studioCompanyCreativeDirectionPath('frontal-slayer'),
  },
  {
    test: (p) => /^\/admin\/studio\/department\/[^/]+$/.test(p),
    resolve: (p) => {
      const id = p.split('/').pop()!;
      if (id === 'creative-direction') return studioCompanyCreativeDirectionPath('frontal-slayer');
      return `${STUDIO_COMPANIES_BASE}/frontal-slayer/departments/${id}`;
    },
  },
  {
    test: (p) => p === '/admin/studio/world/headquarters' || p.startsWith('/admin/studio/world/headquarters/'),
    resolve: () => studioCompanyGrandAtriumPath('frontal-slayer'),
  },
  {
    test: (p) => p === '/admin/studio/world/creative-direction-studio',
    resolve: () => studioCompanyCreativeDirectionPath('frontal-slayer'),
  },
  {
    test: (p) => p === '/admin/studio/world-atlas',
    resolve: () => '/admin/studio/atlas',
  },
  {
    test: (p) => p === '/admin/studio/studio-archives',
    resolve: () => '/admin/studio/archives',
  },
  {
    test: (p) => p === '/admin/studio/studio-warehouse',
    resolve: () => '/admin/studio/archives/warehouse',
  },
  {
    test: (p) => p === '/admin/studio/world/command-center',
    resolve: () => '/admin/studio/command-center',
  },
  {
    test: (p) => p === '/admin/studio' || p === '/admin/studio/',
    resolve: () => '/admin/studio/command-center',
  },
];

export function resolveLegacyCanonicalRedirect(pathname: string): string | null {
  const clean = pathname.replace(/\/$/, '') || pathname;
  for (const rule of LEGACY_TO_CANONICAL_REDIRECTS) {
    if (rule.test(clean)) return rule.resolve(clean);
  }
  return null;
}

export function canonicalDepartmentPath(workspaceId: string, departmentId: string): string {
  const slug = resolveCompanySlugFromWorkspaceId(workspaceId);
  if (departmentId === 'creative-direction') {
    return studioCompanyCreativeDirectionPath(slug);
  }
  return `${STUDIO_COMPANIES_BASE}/${slug}/departments/${departmentId}`;
}
