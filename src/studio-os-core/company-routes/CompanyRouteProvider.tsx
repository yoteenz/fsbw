import { createContext, useContext, useMemo, type ReactNode } from 'react';
import { useLocation } from 'react-router-dom';
import { useWorkspace } from '../context/WorkspaceProvider';
import { buildCompanyRouteBreadcrumbs } from './breadcrumbs';
import { getCompanyBySlug, getDefaultCompany } from './registry';
import { studioCompanyPath } from './paths';
import { resolveCompanyRoute } from './resolve';
import type { CompanyRouteContextValue } from './types';

const CompanyRouteContext = createContext<CompanyRouteContextValue | null>(null);

type Props = {
  children: ReactNode;
  /** Override company slug when not inferrable from URL (legacy routes). */
  companySlugOverride?: string;
};

export function CompanyRouteProvider({ children, companySlugOverride }: Props) {
  const { pathname } = useLocation();
  const { workspace } = useWorkspace();

  const value = useMemo((): CompanyRouteContextValue => {
    const resolution = resolveCompanyRoute(pathname);
    const slug =
      resolution.companySlug ??
      companySlugOverride ??
      (workspace.id ? getCompanyBySlug(workspace.id)?.companySlug : null) ??
      getDefaultCompany().companySlug;

    const company = getCompanyBySlug(slug) ?? getDefaultCompany();
    const isGlobal = resolution.kind === 'global';

    const companyPath = (...segments: string[]) => studioCompanyPath(slug, ...segments);

    const breadcrumbs = buildCompanyRouteBreadcrumbs(
      resolution.companySlug
        ? resolution
        : {
            ...resolution,
            companySlug: slug,
            company,
            kind: resolution.kind === 'unknown' ? 'company-home' : resolution.kind,
          }
    );

    return {
      companySlug: slug,
      companyId: company.companyId,
      companyName: company.companyName,
      companyGenome: {
        genomeId: company.genomeId,
        brandVoice: workspace.brandVoice,
        industry: workspace.metadata.industry,
      },
      activeHeadquarters: resolution.activeHeadquarters,
      activeDepartment: resolution.activeDepartment,
      activeRoom: resolution.activeRoom ?? resolution.activeScene,
      activeScene: resolution.activeScene,
      isGlobalRoute: isGlobal,
      breadcrumbs,
      companyPath,
    };
  }, [pathname, companySlugOverride, workspace.brandVoice, workspace.metadata.industry, workspace.id]);

  return <CompanyRouteContext.Provider value={value}>{children}</CompanyRouteContext.Provider>;
}

export function useCompanyRoute(): CompanyRouteContextValue {
  const ctx = useContext(CompanyRouteContext);
  if (!ctx) {
    const fallback = getDefaultCompany();
    return {
      companySlug: fallback.companySlug,
      companyId: fallback.companyId,
      companyName: fallback.companyName,
      companyGenome: { genomeId: fallback.genomeId, brandVoice: 'Luxury editorial atelier' },
      activeHeadquarters: null,
      activeDepartment: null,
      activeRoom: null,
      activeScene: null,
      isGlobalRoute: false,
      breadcrumbs: [{ label: 'Studio World™', path: '/admin/studio/command-center' }],
      companyPath: (...segments: string[]) => studioCompanyPath(fallback.companySlug, ...segments),
    };
  }
  return ctx;
}

export function useCompanyRouteOptional(): CompanyRouteContextValue | null {
  return useContext(CompanyRouteContext);
}
