import { GLOBAL_STUDIO_ROUTES } from './constants';
import { studioCompanyPath } from './paths';
import type { CompanyRouteResolution } from './types';

export function buildCompanyRouteBreadcrumbs(resolution: CompanyRouteResolution): Array<{ label: string; path: string }> {
  const crumbs: Array<{ label: string; path: string }> = [
    { label: 'Studio World™', path: GLOBAL_STUDIO_ROUTES.commandCenter },
  ];

  if (resolution.kind === 'global') {
    crumbs.push({ label: resolution.displayLabel, path: `/admin/studio/${resolution.segments.join('/')}` });
    return crumbs;
  }

  if (!resolution.companySlug || !resolution.company) {
    return crumbs;
  }

  crumbs.push({
    label: resolution.company.companyName,
    path: studioCompanyPath(resolution.companySlug),
  });

  if (resolution.segments.length === 0) {
    crumbs.push({ label: 'Grand Atrium™', path: studioCompanyPath(resolution.companySlug, 'grand-atrium') });
    return crumbs;
  }

  const pathAcc: string[] = [];
  for (const seg of resolution.segments) {
    pathAcc.push(seg);
    const label =
      seg === 'creative-direction'
        ? 'Creative Direction Studio™'
        : seg === 'story-table'
          ? 'Story Table™'
          : seg === 'departments'
            ? 'Departments™'
            : seg.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
    crumbs.push({
      label,
      path: studioCompanyPath(resolution.companySlug, ...pathAcc),
    });
  }

  return crumbs;
}
