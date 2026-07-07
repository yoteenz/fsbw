import { useNavigate } from 'react-router-dom';
import { StudioPlatformLayout } from '../../../../components/admin/studio-os/StudioPlatformLayout';
import { useRequireAdminPageAccess } from '../../../../hooks/useRequireAdminPageAccess';
import { WORKSPACE_BLUEPRINTS } from '../../../../studio-os-core/workspace-creation/blueprints';
import { STUDIO_OS_ROUTES } from '../../../../studio-os-core/workspace/routes';
import { ADMIN_STUDIO_THEME } from '../../../../utils/adminStudioTheme';

export default function AdminStudioOsBlueprintsPage() {
  useRequireAdminPageAccess();
  const navigate = useNavigate();

  return (
    <StudioPlatformLayout
      title="BLUEPRINT LIBRARY"
      subtitle="DUPLICATE · CREATE · IMPORT · EXPORT · CLONE · VERSION · COMPARE — BLUEPRINT MARKETPLACE V1"
      onBack={() => navigate(STUDIO_OS_ROUTES.entry)}
    >
      <div className="space-y-3">
        {WORKSPACE_BLUEPRINTS.map((bp) => (
          <div key={bp.id} className="p-3 border" style={{ borderColor: ADMIN_STUDIO_THEME.panelBorder, background: 'rgba(255,255,255,0.85)' }}>
            <p className="text-[10px]">{bp.icon}</p>
            <p className="text-[9px] font-futura mt-1" style={{ fontWeight: 515, color: '#6366F1' }}>
              {bp.name.toUpperCase()} · V{bp.version}
            </p>
            <p className="text-[6px] font-futura mt-1" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary }}>
              {bp.description}
            </p>
            <p className="text-[6px] font-futura mt-2" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textPrimary }}>
              REQUIRED · {bp.requiredModules.length} · OPTIONAL · {bp.optionalModules.length} · EXECUTIVES · {bp.executiveRoleIds.length}
            </p>
            <div className="flex flex-wrap gap-1 mt-2">
              {['DUPLICATE', 'CLONE', 'EXPORT', 'VERSION', 'COMPARE'].map((action) => (
                <span key={action} className="text-[5px] font-futura px-1 py-0.5 border" style={{ borderColor: ADMIN_STUDIO_THEME.panelBorder, color: '#9CA3AF' }}>
                  {action}
                </span>
              ))}
            </div>
            <button
              type="button"
              className="mt-2 px-2 py-1 text-[6px] font-futura border"
              style={{ fontWeight: 515, color: '#FFF', background: '#6366F1', borderColor: ADMIN_STUDIO_THEME.panelBorder }}
              onClick={() => navigate(`${STUDIO_OS_ROUTES.create}?blueprint=${bp.id}`)}
            >
              USE BLUEPRINT
            </button>
          </div>
        ))}
      </div>
    </StudioPlatformLayout>
  );
}
