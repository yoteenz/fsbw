import { Navigate, useParams } from 'react-router-dom';
import { AdminStudioPlaceholderShell } from '../../../../components/admin/studio/AdminStudioPlaceholderShell';
import { getAdminStudioSectionById } from '../../../../utils/adminStudioDemo';
import { ADMIN_STUDIO_BUILT_SECTION_SET } from '../../../../utils/adminStudioRoutes';

/** Dynamic Studio section placeholder — one route, all hub cards. */
export default function AdminStudioSectionPage() {
  const { sectionId } = useParams<{ sectionId: string }>();

  if (sectionId && ADMIN_STUDIO_BUILT_SECTION_SET.has(sectionId)) {
    return <Navigate to={`/admin/studio/${sectionId}`} replace />;
  }

  const section = sectionId ? getAdminStudioSectionById(sectionId) : undefined;

  if (!section) {
    return <Navigate to="/admin/studio" replace />;
  }

  return <AdminStudioPlaceholderShell section={section} />;
}
