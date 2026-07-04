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
    if (sectionId === 'production') {
      return <Navigate to="/admin/studio/production" replace />;
    }
    if (sectionId === 'ai-production-engine') {
      return <Navigate to="/admin/studio/ai-production-engine" replace />;
    }
    if (sectionId === 'distribution-network') {
      return <Navigate to="/admin/studio/distribution-network" replace />;
    }
    if (sectionId === 'audience-brain') {
      return <Navigate to="/admin/studio/audience-brain" replace />;
    }
    if (sectionId === 'executive-command-center') {
      return <Navigate to="/admin/studio/executive-command-center" replace />;
    }
    if (sectionId === 'mission-control') {
      return <Navigate to="/admin/studio/mission-control" replace />;
    }
    if (sectionId === 'legacy-system') {
      return <Navigate to="/admin/studio/legacy-system" replace />;
    }
    if (sectionId === 'asset-director') {
      return <Navigate to="/admin/studio/asset-director" replace />;
    }
    if (sectionId === 'blueprint-manager') {
      return <Navigate to="/admin/studio/blueprint-manager" replace />;
    }
    if (sectionId === 'asset-factory') {
      return <Navigate to="/admin/studio/asset-factory" replace />;
    }
    if (sectionId === 'brand-assets') {
      return <Navigate to="/admin/studio/brand-assets" replace />;
    }
    return <Navigate to={`/admin/studio/${sectionId}`} replace />;
  }

  const section = sectionId ? getAdminStudioSectionById(sectionId) : undefined;

  if (!section) {
    return <Navigate to="/admin/studio" replace />;
  }

  return <AdminStudioPlaceholderShell section={section} />;
}
