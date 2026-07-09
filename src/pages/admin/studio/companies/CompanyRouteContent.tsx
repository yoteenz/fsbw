import { Suspense, useEffect, useMemo, type ComponentType, type LazyExoticComponent } from 'react';
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

/** Module-scoped lazy pages — do not create React.lazy() inside render/useMemo. */
const LAZY_LEGACY_PAGES: Record<string, LazyExoticComponent<ComponentType>> = {
  'mission-control': lazyWithRetry(() => import('../mission-control/page'), 'CompanyRoute:mission-control'),
  'ndxbook/mission-control': lazyWithRetry(
    () => import('../ndxbook/mission-control/page'),
    'CompanyRoute:ndxbook/mission-control'
  ),
  'chief-of-staff': lazyWithRetry(() => import('../chief-of-staff/page'), 'CompanyRoute:chief-of-staff'),
  'organization-pulse': lazyWithRetry(
    () => import('../organization-pulse/page'),
    'CompanyRoute:organization-pulse'
  ),
  'concierge-layer': lazyWithRetry(() => import('../concierge-layer/page'), 'CompanyRoute:concierge-layer'),
  'ambient-awareness': lazyWithRetry(
    () => import('../ambient-awareness/page'),
    'CompanyRoute:ambient-awareness'
  ),
  'department/creative-direction': lazyWithRetry(
    () => import('../department/page'),
    'CompanyRoute:department/creative-direction'
  ),
  'ndxbook/creative-direction': lazyWithRetry(
    () => import('../ndxbook/creative-direction/page'),
    'CompanyRoute:ndxbook/creative-direction'
  ),
  overview: lazyWithRetry(() => import('../overview/page'), 'CompanyRoute:overview'),
  'brand-architect': lazyWithRetry(() => import('../brand-architect/page'), 'CompanyRoute:brand-architect'),
  'business-model-engine': lazyWithRetry(
    () => import('../business-model-engine/page'),
    'CompanyRoute:business-model-engine'
  ),
  'work-orchestration': lazyWithRetry(
    () => import('../work-orchestration/page'),
    'CompanyRoute:work-orchestration'
  ),
  production: lazyWithRetry(() => import('../production/page'), 'CompanyRoute:production'),
  'chief-experience-officer': lazyWithRetry(
    () => import('../chief-experience-officer/page'),
    'CompanyRoute:chief-experience-officer'
  ),
  'intelligence-engine': lazyWithRetry(
    () => import('../intelligence-engine/page'),
    'CompanyRoute:intelligence-engine'
  ),
  'distribution-network': lazyWithRetry(
    () => import('../distribution-network/page'),
    'CompanyRoute:distribution-network'
  ),
  'talent-agency': lazyWithRetry(() => import('../talent-agency/page'), 'CompanyRoute:talent-agency'),
  'professional-trust-framework': lazyWithRetry(
    () => import('../professional-trust-framework/page'),
    'CompanyRoute:professional-trust-framework'
  ),
};

function legacyPathToSegment(legacyPath: string): string {
  const base = '/admin/studio/';
  if (!legacyPath.startsWith(base)) return legacyPath.replace(/^\//, '');
  return legacyPath.slice(base.length).split('?')[0]!;
}

function resolveLazyPage(legacyPath: string): LazyExoticComponent<ComponentType> | null {
  const segment = legacyPathToSegment(legacyPath);
  return LAZY_LEGACY_PAGES[segment] ?? null;
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

  const LazyPage = useMemo(() => resolveLazyPage(resolution.legacyPath), [resolution.legacyPath]);

  if (!company && companySlug) {
    return <Navigate to="/admin/studio/companies" replace />;
  }

  if (!resolution.segments.length && companySlug) {
    return <Navigate to={studioCompanyGrandAtriumPath(companySlug)} replace />;
  }

  /** Grand Atrium is served by dedicated App route — avoid duplicate resolution here. */
  if (legacyPathToSegment(resolution.legacyPath) === 'executive-headquarters') {
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
