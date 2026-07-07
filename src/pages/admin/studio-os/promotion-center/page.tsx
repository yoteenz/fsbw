import { useNavigate } from 'react-router-dom';
import { StudioPlatformLayout } from '../../../../components/admin/studio-os/StudioPlatformLayout';
import { useRequireAdminPageAccess } from '../../../../hooks/useRequireAdminPageAccess';
import { STUDIO_OS_ROUTES } from '../../../../studio-os-core/workspace/routes';
import { useWorkspaceCreationEngine } from '../../../../hooks/useWorkspaceCreationEngine';
import { PromotionCenterPanel } from '../../../../components/admin/studio-os/workspace-creation/PromotionCenterPanel';
import { ADMIN_STUDIO_THEME } from '../../../../utils/adminStudioTheme';

export default function AdminStudioOsPromotionCenterPage() {
  useRequireAdminPageAccess();
  const navigate = useNavigate();
  const { store, advancePromotion } = useWorkspaceCreationEngine();

  return (
    <StudioPlatformLayout
      title="PROMOTION CENTER"
      subtitle="AI MEDIA → FRONTAL SLAYER → ALL FUTURE WORKSPACES"
      onBack={() => navigate(STUDIO_OS_ROUTES.entry)}
    >
      <PromotionCenterPanel items={store.promotionPipeline} onAdvance={advancePromotion} />
      <p className="text-[6px] font-futura mt-4 text-center" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary }}>
        AI MEDIA → FRONTAL SLAYER → ALL FUTURE WORKSPACES
      </p>
    </StudioPlatformLayout>
  );
}
