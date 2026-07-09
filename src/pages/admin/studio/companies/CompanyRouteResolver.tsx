import { useEffect, useLayoutEffect } from 'react';
import { Navigate, useLocation, useParams } from 'react-router-dom';
import {
  CompanyRouteProvider,
  getCompanyBySlug,
  resolveCompanyRoute,
  studioCompanyGrandAtriumPath,
} from '../../../../studio-os-core/company-routes';
import { useWorkspace } from '../../../../studio-os-core/context/WorkspaceProvider';
import { CompanyRouteContent } from './CompanyRouteContent';

function CompanyRouteResolverInner() {
  const { pathname } = useLocation();
  const { companySlug = '' } = useParams<{ companySlug: string }>();
  const resolution = resolveCompanyRoute(pathname);
  const company = getCompanyBySlug(companySlug);
  const { enterWorkspace } = useWorkspace();

  useLayoutEffect(() => {
    if (company?.workspaceId) {
      enterWorkspace(company.workspaceId);
    }
  }, [company?.workspaceId, enterWorkspace]);

  useEffect(() => {
    document.body.dataset.studioCompanySlug = companySlug;
    return () => {
      delete document.body.dataset.studioCompanySlug;
    };
  }, [companySlug]);

  if (!company && companySlug) {
    return <Navigate to="/admin/studio/companies" replace />;
  }

  if (!resolution.segments.length && companySlug) {
    return <Navigate to={studioCompanyGrandAtriumPath(companySlug)} replace />;
  }

  return <CompanyRouteContent />;
}

/**
 * Canonical company-scoped routes render through CompanyRouteContext™ with legacy room implementations.
 * URL stays at /admin/studio/companies/{companySlug}/...
 */
export default function CompanyRouteResolverPage() {
  return (
    <CompanyRouteProvider>
      <CompanyRouteResolverInner />
    </CompanyRouteProvider>
  );
}
