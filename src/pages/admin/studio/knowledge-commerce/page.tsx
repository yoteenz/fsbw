import { useNavigate } from 'react-router-dom';
import { AdminStudioStageShell } from '../../../../components/admin/studio/AdminStudioStageShell';
import { AdminStudioDisclaimerFooter } from '../../../../components/admin/studio/AdminStudioDisclaimerFooter';
import { KnowledgeCommerceWorkspace } from '../../../../components/admin/studio/knowledge-commerce/KnowledgeCommerceWorkspace';
import {
  KNOWLEDGE_COMMERCE_PAGE_PHILOSOPHY,
  KNOWLEDGE_COMMERCE_PAGE_SUBTITLE,
} from '../../../../utils/adminStudioKnowledgeCommerceDemo';
import { ADMIN_STUDIO_THEME } from '../../../../utils/adminStudioTheme';
import {
  adminStudioExpertMarketplacePath,
  adminStudioProfessionBrainPath,
} from '../../../../utils/adminStudioRoutes';

export default function AdminStudioKnowledgeCommercePage() {
  const navigate = useNavigate();

  return (
    <AdminStudioStageShell
      title="KNOWLEDGE COMMERCE™"
      subtitle={KNOWLEDGE_COMMERCE_PAGE_SUBTITLE}
      breadcrumbParentLabel="EXPERT MARKETPLACE"
      breadcrumbParentPath={adminStudioExpertMarketplacePath()}
      onBack={() => navigate(adminStudioExpertMarketplacePath())}
      navGroupId="intelligence"
    >
      <div className="p-3 mb-4 border" style={{ background: ADMIN_STUDIO_THEME.panelBg, borderColor: ADMIN_STUDIO_THEME.panelBorder }}>
        <p className="text-[7px] font-futura uppercase" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary }}>
          {KNOWLEDGE_COMMERCE_PAGE_PHILOSOPHY}
        </p>
      </div>

      <KnowledgeCommerceWorkspace />

      <div className="flex gap-2 mt-4">
        <button
          type="button"
          onClick={() => navigate(adminStudioExpertMarketplacePath())}
          className="flex-1 py-2 text-[7px] font-futura uppercase border"
          style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary, borderColor: ADMIN_STUDIO_THEME.panelBorder }}
        >
          ← EXPERT MARKETPLACE
        </button>
        <button
          type="button"
          onClick={() => navigate(adminStudioProfessionBrainPath())}
          className="flex-1 py-2 text-[7px] font-futura uppercase border"
          style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary, borderColor: ADMIN_STUDIO_THEME.panelBorder }}
        >
          PROFESSION BRAIN →
        </button>
      </div>

      <AdminStudioDisclaimerFooter>
        KNOWLEDGE COMMERCE™ V1.0 · EXPERTISE ECONOMY · DEMO PLACEHOLDER
      </AdminStudioDisclaimerFooter>
    </AdminStudioStageShell>
  );
}
