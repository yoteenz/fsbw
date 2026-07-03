import { Navigate, useParams } from 'react-router-dom';
import { AdminStudioPlaceholderShell } from '../../../../components/admin/studio/AdminStudioPlaceholderShell';
import { getAdminStudioSectionById } from '../../../../utils/adminStudioDemo';

/** Dynamic Studio section placeholder — one route, all hub cards. */
export default function AdminStudioSectionPage() {
  const { sectionId } = useParams<{ sectionId: string }>();
  const section = sectionId ? getAdminStudioSectionById(sectionId) : undefined;

  if (!section) {
    return <Navigate to="/admin/studio" replace />;
  }

  return <AdminStudioPlaceholderShell section={section} />;
}
