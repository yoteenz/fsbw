import { useNavigate, useParams } from 'react-router-dom';
import { AdminStudioLayout } from '../../../../components/admin/studio/AdminStudioLayout';
import { DepartmentVerticalSliceRoom } from '../../../../components/admin/studio-os/department-vertical-slice';
import { loadDepartmentPackage } from '../../../../studio-os-core/department-package';

/**
 * Studio OS Alpha — Department Vertical Slice™
 * Generic route: any registered department package can mount the immersive room.
 */
export default function AdminStudioDepartmentVerticalSlicePage() {
  const { departmentId = '' } = useParams<{ departmentId: string }>();
  const navigate = useNavigate();
  const pkg = loadDepartmentPackage(departmentId);

  if (!pkg) {
    return (
      <AdminStudioLayout
        title="DEPARTMENT NOT FOUND"
        subtitle={departmentId}
        onBack={() => navigate('/admin/studio/overview')}
        hideNavTabs
      >
        <p className="text-[10px] font-futura uppercase tracking-widest text-gray-500">
          No department package registered for &quot;{departmentId}&quot;.
        </p>
      </AdminStudioLayout>
    );
  }

  return (
    <AdminStudioLayout
      title={pkg.definition.displayName.toUpperCase()}
      subtitle="STUDIO OS ALPHA · VERTICAL SLICE™"
      breadcrumbParentLabel="STUDIO OVERVIEW"
      breadcrumbParentPath="/admin/studio/overview"
      onBack={() => navigate('/admin/studio/overview')}
      hideNavTabs
      hideOverviewLink
    >
      <DepartmentVerticalSliceRoom departmentId={departmentId} />
    </AdminStudioLayout>
  );
}
