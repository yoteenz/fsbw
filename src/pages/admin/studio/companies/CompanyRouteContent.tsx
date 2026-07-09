import { Suspense, useEffect, useMemo, type ComponentType } from 'react';
import { Navigate, useLocation, useNavigate, useParams } from 'react-router-dom';
import LoadingScreen from '../../../../components/base/LoadingScreen';
import { CompanyRouteLoadErrorBoundary } from '../../../../components/admin/studio/companies/CompanyRouteLoadErrorBoundary';
import { useWorkspace } from '../../../../studio-os-core/context/WorkspaceProvider';
import {
  getCompanyBySlug,
  resolveCompanyRoute,
  studioCompanyGrandAtriumPath,
} from '../../../../studio-os-core/company-routes';
import { lazyWithRetry } from '../../../../utils/lazyWithRetry';

type PageModule = { default: ComponentType };

const LEGACY_SEGMENT_LOADERS: Record<string, () => Promise<PageModule>> = {
  'mission-control': () => import('../mission-control/page'),
  'ndxbook/mission-control': () => import('../ndxbook/mission-control/page'),
  'chief-of-staff': () => import('../chief-of-staff/page'),
  'organization-pulse': () => import('../organization-pulse/page'),
  'concierge-layer': () => import('../concierge-layer/page'),
  'ambient-awareness': () => import('../ambient-awareness/page'),
  'department/creative-direction': () => import('../department/page'),
  'ndxbook/creative-direction': () => import('../ndxbook/creative-direction/page'),
  overview: () => import('../overview/page'),
  'brand-architect': () => import('../brand-architect/page'),
  'business-model-engine': () => import('../business-model-engine/page'),
  'work-orchestration': () => import('../work-orchestration/page'),
  production: () => import('../production/page'),
  'chief-experience-officer': () => import('../chief-experience-officer/page'),
  'intelligence-engine': () => import('../intelligence-engine/page'),
  'distribution-network': () => import('../distribution-network/page'),
  'talent-agency': () => import('../talent-agency/page'),
  'professional-trust-framework': () => import('../professional-trust-framework/page'),
};

function legacyPathToSegment(legacyPath: string): string {
  const base = '/admin/studio/';
  if (!legacyPath.startsWith(base)) return legacyPath.replace(/^\//, '');
  return legacyPath.slice(base.length).split('?')[0]!;
}

function resolvePageLoader(legacyPath: string): (() => Promise<PageModule>) | null {
  const segment = legacyPathToSegment(legacyPath);
  return LEGACY_SEGMENT_LOADERS[segment] ?? null;
}

/**
 * Renders the legacy room implementation at the canonical company URL.
 * URL stays at /admin/studio/companies/{companySlug}/...
 */
export function CompanyRouteContent() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { companySlug = '' } = useParams<{ companySlug: string }>();
  const { enterWorkspace } = useWorkspace();
  const resolution = resolveCompanyRoute(pathname);
  const company = getCompanyBySlug(companySlug);

  useEffect(() => {
    document.body.dataset.studioCompanySlug = companySlug;
    return () => {
      delete document.body.dataset.studioCompanySlug;
    };
  }, [companySlug]);

  useEffect(() => {
    if (company?.workspaceId) {
      enterWorkspace(company.workspaceId);
    }
  }, [company?.workspaceId, enterWorkspace]);

  const LazyPage = useMemo(() => {
    const loader = resolvePageLoader(resolution.legacyPath);
    if (!loader) return null;
    const segment = legacyPathToSegment(resolution.legacyPath);
    return lazyWithRetry(loader, `CompanyRoute:${segment}`);
  }, [resolution.legacyPath]);

  if (!company && companySlug) {
    return <Navigate to="/admin/studio/companies" replace />;
  }

  if (!resolution.segments.length && companySlug) {
    return <Navigate to={studioCompanyGrandAtriumPath(companySlug)} replace />;
  }

  if (!LazyPage) {
    return <Navigate to="/admin/studio/command-center" replace />;
  }

  return (
    <CompanyRouteLoadErrorBoundary onBack={() => navigate('/admin/dashboard')}>
      <Suspense fallback={<LoadingScreen />}>
        <LazyPage />
      </Suspense>
    </CompanyRouteLoadErrorBoundary>
  );
}
