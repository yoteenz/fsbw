import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminHeader from '../components/AdminHeader';
import { useRequireAdminPageAccess } from '../../../hooks/useRequireAdminPageAccess';
import { STUDIO_OS_PLATFORM } from '../../../studio-os-core/config/platform';
import { STUDIO_OS_VOCABULARY } from '../../../studio-os-core/core/vocabulary';
import { useWorkspace } from '../../../studio-os-core/context/WorkspaceProvider';
import { STUDIO_OS_ROUTES } from '../../../studio-os-core/workspace/routes';
import { getRegistryWorkspaceById } from '../../../studio-os-core/workspace-creation/registry';
import { isDynamicWorkspaceId } from '../../../workspaces';
import { useWorkspaceCreationEngine } from '../../../hooks/useWorkspaceCreationEngine';
import { ADMIN_STUDIO_THEME } from '../../../utils/adminStudioTheme';
import type { WorkspaceListItem } from '../../../studio-os-core/workspace/types';
import {
  DEPLOYMENT_STAGE_LABELS,
  WORKSPACE_TYPE_LABELS,
} from '../../../utils/adminStudioWorkspaceCreationDemo';

export default function AdminStudioOsPage() {
  useRequireAdminPageAccess();
  const navigate = useNavigate();
  const { workspaces, setActiveWorkspace, workspaceId } = useWorkspace();
  const { workspaces: registryWorkspaces } = useWorkspaceCreationEngine();

  const registryById = useMemo(() => {
    const map = new Map<string, ReturnType<typeof getRegistryWorkspaceById>>();
    for (const r of registryWorkspaces) map.set(r.id, r);
    return map;
  }, [registryWorkspaces]);

  const selectWorkspace = (ws: WorkspaceListItem) => {
    setActiveWorkspace(ws.id);
    if (ws.id === 'frontal-slayer') {
      navigate('/admin/studio/mission-control');
      return;
    }
    if (isDynamicWorkspaceId(ws.id) || registryById.has(ws.id)) {
      navigate(STUDIO_OS_ROUTES.workspaceDashboard(ws.id));
      return;
    }
    navigate(STUDIO_OS_ROUTES.workspaceShell(ws.id));
  };

  return (
    <div className="min-h-screen relative">
      <div
        className="fixed inset-0 -z-10"
        style={{
          backgroundImage: `url('/assets/marble-half.png')`,
          backgroundSize: 'contain',
          backgroundPosition: 'center',
          backgroundRepeat: 'repeat',
          backgroundAttachment: 'fixed',
        }}
      />
      <div className="relative z-10 uppercase" style={{ textTransform: 'uppercase' }}>
        <AdminHeader
          title={STUDIO_OS_PLATFORM.name}
          showBack
          onBack={() => navigate('/admin/dashboard')}
          breadcrumbParentLabel="ADMIN"
          breadcrumbParentPath="/admin/dashboard"
        />

        <div className="pb-8 px-4">
          <div className="max-w-md mx-auto space-y-4">
            <div className="bg-white/60 backdrop-blur-sm border border-black p-4 shadow-lg" style={{ borderWidth: '1.3px' }}>
              <p className="text-red-500 font-bold text-xl tracking-wider" style={{ fontFamily: '"Covered By Your Grace", sans-serif', color: '#EB1C24' }}>
                {STUDIO_OS_PLATFORM.name}
              </p>
              <p className="mt-2 text-[10px] font-futura" style={{ fontWeight: 515, color: '#808080', lineHeight: 1.4 }}>
                {STUDIO_OS_PLATFORM.tagline}
              </p>
              <p className="mt-3 text-[8px] font-futura" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary }}>
                WORKSPACE REGISTRY · {STUDIO_OS_VOCABULARY.workspace.term.toUpperCase()} CREATION ENGINE V1.0
              </p>
            </div>

            <div className="grid grid-cols-1 gap-2">
              <button
                type="button"
                onClick={() => navigate(STUDIO_OS_ROUTES.create)}
                className="w-full py-3 text-[8px] font-futura border"
                style={{ fontWeight: 515, color: '#FFF', background: '#6366F1', borderColor: ADMIN_STUDIO_THEME.panelBorder }}
              >
                LAUNCH NEW COMPANY
              </button>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => navigate(STUDIO_OS_ROUTES.blueprints)}
                  className="py-2 text-[7px] font-futura border"
                  style={{ fontWeight: 515, color: '#6366F1', borderColor: ADMIN_STUDIO_THEME.panelBorder, background: 'rgba(255,255,255,0.85)' }}
                >
                  BLUEPRINT LIBRARY
                </button>
                <button
                  type="button"
                  onClick={() => navigate(STUDIO_OS_ROUTES.promotionCenter)}
                  className="py-2 text-[7px] font-futura border"
                  style={{ fontWeight: 515, color: '#6366F1', borderColor: ADMIN_STUDIO_THEME.panelBorder, background: 'rgba(255,255,255,0.85)' }}
                >
                  PROMOTION CENTER
                </button>
              </div>
              <button
                type="button"
                onClick={() => navigate('/admin/studio/growth-network')}
                className="w-full py-2 text-[7px] font-futura border"
                style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary, borderColor: ADMIN_STUDIO_THEME.panelBorder, background: 'rgba(255,255,255,0.85)' }}
              >
                GROWTH NETWORK · PLATFORM PILLAR
              </button>
            </div>

            <div className="grid grid-cols-1 gap-3">
              {workspaces.map((ws: WorkspaceListItem) => {
                const isActive = ws.id === workspaceId;
                const isPlaceholder = ws.status === 'placeholder';
                const registry = registryById.get(ws.id);
                return (
                  <button
                    key={ws.id}
                    type="button"
                    onClick={() => selectWorkspace(ws)}
                    className="w-full text-left border bg-white/80 shadow-md transition-transform active:scale-[0.98] overflow-hidden"
                    style={{
                      borderWidth: '1.3px',
                      borderColor: isActive ? '#EB1C24' : ADMIN_STUDIO_THEME.panelBorder,
                      borderTop: `2px solid ${isActive ? '#EB1C24' : registry?.isReferencePilot ? '#6366F1' : isPlaceholder ? '#9CA3AF' : '#2563EB'}`,
                    }}
                  >
                    <div className="flex items-center gap-3 p-3">
                      <div className="flex-shrink-0 overflow-hidden border flex items-center justify-center" style={{ width: 48, height: 48, borderColor: ADMIN_STUDIO_THEME.panelBorder }}>
                        {registry?.icon ? (
                          <span className="text-xl">{registry.icon}</span>
                        ) : (
                          <img src={ws.logoSrc} alt="" className="w-full h-full object-cover" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[12px] leading-tight" style={{ fontFamily: '"Covered By Your Grace", sans-serif', color: ADMIN_STUDIO_THEME.textPrimary }}>
                          {ws.displayName}
                        </p>
                        <p className="text-[7px] font-futura mt-1 line-clamp-2" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary, lineHeight: 1.4 }}>
                          {ws.metadata.description}
                        </p>
                        {registry ? (
                          <p className="text-[6px] font-futura mt-1" style={{ fontWeight: 515, color: '#6366F1' }}>
                            {WORKSPACE_TYPE_LABELS[registry.workspaceType]?.toUpperCase()} · {DEPLOYMENT_STAGE_LABELS[registry.deploymentStage]?.toUpperCase()}
                            {registry.isReferencePilot ? ' · REFERENCE PILOT' : ''}
                          </p>
                        ) : null}
                        {isPlaceholder ? (
                          <p className="text-[6px] font-futura mt-1" style={{ fontWeight: 515, color: '#9CA3AF' }}>
                            PLACEHOLDER · ARCHITECTURE TEST
                          </p>
                        ) : null}
                      </div>
                      {isActive ? (
                        <span className="text-[6px] font-futura" style={{ fontWeight: 515, color: '#EB1C24' }}>
                          ACTIVE
                        </span>
                      ) : null}
                    </div>
                  </button>
                );
              })}
            </div>

            <p className="text-[6px] font-futura uppercase text-center px-2" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary, lineHeight: 1.6 }}>
              {STUDIO_OS_PLATFORM.owner} · INCORPORATE NEW COMPANIES FROM BLUEPRINTS · AI MEDIA = PERMANENT PILOT
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
