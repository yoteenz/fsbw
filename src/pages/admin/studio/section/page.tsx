import { Navigate, useParams } from 'react-router-dom';
import { AdminStudioPlaceholderShell } from '../../../../components/admin/studio/AdminStudioPlaceholderShell';
import { getAdminStudioSectionById } from '../../../../utils/adminStudioDemo';

const BUILT_SECTIONS = new Set(['shows', 'content-packs', 'ai-studio', 'prompt-library']);

/** Dynamic Studio section placeholder — one route, all hub cards. */
export default function AdminStudioSectionPage() {
  const { sectionId } = useParams<{ sectionId: string }>();

  if (sectionId && BUILT_SECTIONS.has(sectionId)) {
    return <Navigate to={`/admin/studio/${sectionId}`} replace />;
  }

  const section = sectionId ? getAdminStudioSectionById(sectionId) : undefined;

  if (!section) {
    return <Navigate to="/admin/studio" replace />;
  }

  return <AdminStudioPlaceholderShell section={section} />;
}
