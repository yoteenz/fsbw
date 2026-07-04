import { Navigate, useParams } from 'react-router-dom';
import { AdminStudioPlaceholderShell } from '../../../../components/admin/studio/AdminStudioPlaceholderShell';
import { getAdminStudioSectionById } from '../../../../utils/adminStudioDemo';
import { ADMIN_STUDIO_BUILT_SECTION_SET } from '../../../../utils/adminStudioRoutes';

/** Dynamic Studio section placeholder — one route, all hub cards. */
export default function AdminStudioSectionPage() {
  const { sectionId } = useParams<{ sectionId: string }>();

  if (sectionId && ADMIN_STUDIO_BUILT_SECTION_SET.has(sectionId)) {
    if (sectionId === 'content-brain') {
      return <Navigate to="/admin/studio/content-brain" replace />;
    }
    if (sectionId === 'creative-director') {
      return <Navigate to="/admin/studio/creative-director" replace />;
    }
    if (sectionId === 'intelligence-engine') {
      return <Navigate to="/admin/studio/intelligence-engine" replace />;
    }
    if (sectionId === 'ai-orchestrator') {
      return <Navigate to="/admin/studio/ai-orchestrator" replace />;
    }
    if (sectionId === 'show-bible') {
      return <Navigate to="/admin/studio/show-bible" replace />;
    }
    if (sectionId === 'studio-lot') {
      return <Navigate to="/admin/studio/studio-lot" replace />;
    }
    if (sectionId === 'talent-agency') {
      return <Navigate to="/admin/studio/talent-agency" replace />;
    }
    if (sectionId === 'casting') {
      return <Navigate to="/admin/studio/casting" replace />;
    }
    return <Navigate to={`/admin/studio/${sectionId}`} replace />;
  }

  const section = sectionId ? getAdminStudioSectionById(sectionId) : undefined;

  if (!section) {
    return <Navigate to="/admin/studio" replace />;
  }

  return <AdminStudioPlaceholderShell section={section} />;
}
