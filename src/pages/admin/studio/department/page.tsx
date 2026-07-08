import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { DepartmentVerticalSliceRoom } from '../../../../components/admin/studio-os/department-vertical-slice';
import { CreativeDirectionStudioRoom } from '../../../../components/admin/studio-os/creative-direction-studio/CreativeDirectionStudioRoom';
import { DepartmentGoldenBuildShell } from '../../../../components/admin/studio-os/department-vertical-slice/DepartmentGoldenBuildShell';
import { loadDepartmentPackage } from '../../../../studio-os-core/department-package';
import { useCompanyRouteOptional } from '../../../../studio-os-core/company-routes';

/**
 * Studio OS Alpha — Creative Direction Golden Build™
 * Full-viewport immersive department — not embedded in admin card frame.
 */
export default function AdminStudioDepartmentVerticalSlicePage() {
  const { departmentId: paramDeptId = '' } = useParams<{ departmentId: string }>();
  const { pathname } = useLocation();
  const companyRoute = useCompanyRouteOptional();
  const navigate = useNavigate();

  const departmentId =
    paramDeptId ||
    (pathname.includes('/creative-direction') ? 'creative-direction' : '');

  const backPath = companyRoute
    ? companyRoute.companyPath('departments')
    : '/admin/studio/overview';

  const pkg = loadDepartmentPackage(departmentId);

  if (!pkg) {
    return (
      <DepartmentGoldenBuildShell>
        <div style={{ padding: 24, color: '#f0ebe3', fontFamily: '"Futura PT", sans-serif' }}>
          <button type="button" onClick={() => navigate(backPath)} style={{ fontSize: 8, marginBottom: 12 }}>
            ← Back
          </button>
          <p style={{ fontSize: 10, letterSpacing: '0.1em' }}>DEPARTMENT NOT FOUND</p>
          <p style={{ fontSize: 8, opacity: 0.7, marginTop: 8 }}>{departmentId}</p>
        </div>
      </DepartmentGoldenBuildShell>
    );
  }

  return (
    <DepartmentGoldenBuildShell>
      {departmentId === 'creative-direction' ? (
        <CreativeDirectionStudioRoom />
      ) : (
        <DepartmentVerticalSliceRoom departmentId={departmentId} />
      )}
    </DepartmentGoldenBuildShell>
  );
}
