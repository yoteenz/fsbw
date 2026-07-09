import { useEffect, useLayoutEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { CompanyRouteLoadErrorBoundary } from '../../../../components/admin/studio/companies/CompanyRouteLoadErrorBoundary';
import { ExecutiveHeadquartersWorkspace } from '../../../../components/admin/studio/executive-headquarters';
import { useRequireAdminPageAccess } from '../../../../hooks/useRequireAdminPageAccess';
import { getCompanyBySlug } from '../../../../studio-os-core/company-routes';
import { useWorkspace } from '../../../../studio-os-core/context/WorkspaceProvider';

function CompanyGrandAtriumContent() {
  const { companySlug = '' } = useParams<{ companySlug: string }>();
  const company = getCompanyBySlug(companySlug);
  const { enterWorkspace } = useWorkspace();

  useLayoutEffect(() => {
    if (company?.workspaceId) {
      enterWorkspace(company.workspaceId);
    }
  }, [company?.workspaceId, enterWorkspace]);

  useEffect(() => {
    const html = document.documentElement;
    const body = document.body;
    const prevHtmlOverflow = html.style.overflow;
    const prevBodyOverflow = body.style.overflow;
    html.style.overflow = 'hidden';
    body.style.overflow = 'hidden';
    body.classList.add('gb-immersive-active');
    return () => {
      html.style.overflow = prevHtmlOverflow;
      body.style.overflow = prevBodyOverflow;
      body.classList.remove('gb-immersive-active');
    };
  }, []);

  return (
    <div
      className="company-grand-atrium-root"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 200,
        width: '100vw',
        height: '100dvh',
        overflow: 'hidden',
      }}
    >
      <ExecutiveHeadquartersWorkspace />
    </div>
  );
}

/**
 * Company-scoped Grand Atrium™ — Executive Headquarters™ without DepartmentGoldenBuildShell.
 * Skips the dark immersive portal + 500KB Studio Orb chunk so mobile Safari can load reliably.
 * URL: `/admin/studio/companies/:companySlug/grand-atrium`
 */
export default function CompanyGrandAtriumPage() {
  useRequireAdminPageAccess();
  const navigate = useNavigate();

  return (
    <CompanyRouteLoadErrorBoundary onBack={() => navigate('/admin/dashboard')}>
      <CompanyGrandAtriumContent />
    </CompanyRouteLoadErrorBoundary>
  );
}
