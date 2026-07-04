import { useNavigate } from 'react-router-dom';
import AdminHeader from '../../components/AdminHeader';
import { useRequireAdminPageAccess } from '../../../../hooks/useRequireAdminPageAccess';
import { STUDIO_OS_PLATFORM } from '../../../../studio-os-core/config/platform';
import { STUDIO_OS_ROUTES } from '../../../../studio-os-core/workspace/routes';
import { useWorkspaceCreationEngine } from '../../../../hooks/useWorkspaceCreationEngine';
import { PromotionCenterPanel } from '../../../../components/admin/studio-os/workspace-creation/PromotionCenterPanel';
import { ADMIN_STUDIO_THEME } from '../../../../utils/adminStudioTheme';

export default function AdminStudioOsPromotionCenterPage() {
  useRequireAdminPageAccess();
  const navigate = useNavigate();
  const { store, advancePromotion } = useWorkspaceCreationEngine();

  return (
    <div className="min-h-screen relative uppercase" style={{ textTransform: 'uppercase' }}>
      <div className="fixed inset-0 -z-10" style={{ backgroundImage: `url('/assets/marble-half.png')`, backgroundSize: 'contain', backgroundRepeat: 'repeat' }} />
      <AdminHeader
        title="PROMOTION CENTER"
        showBack
        onBack={() => navigate(STUDIO_OS_ROUTES.entry)}
        breadcrumbParentLabel={STUDIO_OS_PLATFORM.name}
        breadcrumbParentPath={STUDIO_OS_ROUTES.entry}
      />
      <div className="pb-8 px-4 max-w-2xl mx-auto">
        <PromotionCenterPanel items={store.promotionPipeline} onAdvance={advancePromotion} />
        <p className="text-[6px] font-futura mt-4 text-center" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary }}>
          AI MEDIA → FRONTAL SLAYER → ALL FUTURE WORKSPACES
        </p>
      </div>
    </div>
  );
}
