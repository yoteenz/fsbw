import { useNavigate } from 'react-router-dom';
import { AdminStudioStageShell } from '../../../../components/admin/studio/AdminStudioStageShell';
import { AdminStudioDisclaimerFooter } from '../../../../components/admin/studio/AdminStudioDisclaimerFooter';
import { MemoryEngineWorkspace } from '../../../../components/admin/studio/memory-engine/MemoryEngineWorkspace';
import {
  MEMORY_ENGINE_PAGE_PHILOSOPHY,
  MEMORY_ENGINE_PAGE_SUBTITLE,
} from '../../../../utils/adminStudioMemoryEngineDemo';
import { ADMIN_STUDIO_THEME } from '../../../../utils/adminStudioTheme';
import {
  adminStudioProfessionBrainPath,
  adminStudioOrganizationGenomePath,
} from '../../../../utils/adminStudioRoutes';

export default function AdminStudioMemoryEnginePage() {
  const navigate = useNavigate();

  return (
    <AdminStudioStageShell
      title="MEMORY ENGINE™"
      subtitle={MEMORY_ENGINE_PAGE_SUBTITLE}
      breadcrumbParentLabel="PROFESSION BRAIN"
      breadcrumbParentPath={adminStudioProfessionBrainPath()}
      onBack={() => navigate(adminStudioProfessionBrainPath())}
      navGroupId="intelligence"
    >
      <div className="p-3 mb-4 border" style={{ background: ADMIN_STUDIO_THEME.panelBg, borderColor: ADMIN_STUDIO_THEME.panelBorder }}>
        <p className="text-[7px] font-futura uppercase" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary }}>
          {MEMORY_ENGINE_PAGE_PHILOSOPHY}
        </p>
      </div>

      <MemoryEngineWorkspace />

      <div className="flex gap-2 mt-4">
        <button
          type="button"
          onClick={() => navigate(adminStudioProfessionBrainPath())}
          className="flex-1 py-2 text-[7px] font-futura uppercase border"
          style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary, borderColor: ADMIN_STUDIO_THEME.panelBorder }}
        >
          ← PROFESSION BRAIN
        </button>
        <button
          type="button"
          onClick={() => navigate(adminStudioOrganizationGenomePath())}
          className="flex-1 py-2 text-[7px] font-futura uppercase border"
          style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary, borderColor: ADMIN_STUDIO_THEME.panelBorder }}
        >
          ORGANIZATION GENOME →
        </button>
      </div>

      <AdminStudioDisclaimerFooter>
        MEMORY ENGINE™ V1.0 · REMEMBER FOREVER · DEMO PLACEHOLDER
      </AdminStudioDisclaimerFooter>
    </AdminStudioStageShell>
  );
}
