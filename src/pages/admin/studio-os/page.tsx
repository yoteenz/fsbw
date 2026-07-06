import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCampusTransition } from '../../../components/admin/studio-os/campus/CampusTransitionProvider';
import { useRequireAdminPageAccess } from '../../../hooks/useRequireAdminPageAccess';
import { STUDIO_OS_PLATFORM } from '../../../studio-os-core/config/platform';
import { STUDIO_OS_VOCABULARY } from '../../../studio-os-core/core/vocabulary';
import { STUDIO_ADMINISTRATION_ROUTES } from '../../../studio-os-core/application/routes';
import { useWorkspace } from '../../../studio-os-core/context/WorkspaceProvider';
import { readWorkspaceRegistryStore } from '../../../studio-os-core/workspace-registry/store';
import { getRegistryWorkspaceById } from '../../../studio-os-core/workspace-creation/registry';
import { useWorkspaceCreationEngine } from '../../../hooks/useWorkspaceCreationEngine';
import { WorkspaceRegistryCard } from '../../../components/admin/studio-os/WorkspaceRegistryCard';
import { StudioPlatformLayout } from '../../../components/admin/studio-os/StudioPlatformLayout';
import { ADMIN_STUDIO_THEME } from '../../../utils/adminStudioTheme';

export default function AdminStudioOsPage() {
  useRequireAdminPageAccess();
  const navigate = useNavigate();
  const { workspaces, workspaceId } = useWorkspace();
  const { travelToWorkspace } = useCampusTransition();
  const { workspaces: registryWorkspaces } = useWorkspaceCreationEngine();
  const registryStore = readWorkspaceRegistryStore();

  const registryById = useMemo(() => {
    const map = new Map<string, ReturnType<typeof getRegistryWorkspaceById>>();
    const ids = new Set<string>();
    for (const r of registryWorkspaces) {
      map.set(r.id, r);
      ids.add(r.id);
    }
    return { map, ids };
  }, [registryWorkspaces]);

  const enter = (wsId: string, options?: { missionControl?: boolean }) => {
    travelToWorkspace(wsId, {
      ...options,
      registryById: registryById.ids,
    });
  };

  const selectWorkspace = (ws: (typeof workspaces)[number]) => enter(ws.id);

  return (
    <StudioPlatformLayout
      title="ORGANIZATION REGISTRY"
      subtitle={`${STUDIO_OS_PLATFORM.tagline} · ${STUDIO_OS_VOCABULARY.workspace.term.toUpperCase()} CREATION ENGINE V1.0`}
      onBack={() => navigate(STUDIO_ADMINISTRATION_ROUTES.commandCenter)}
    >
      <div className="space-y-4">
            <div className="bg-white/60 backdrop-blur-sm border border-black p-4 shadow-lg" style={{ borderWidth: '1.3px' }}>
              <p className="text-red-500 font-bold text-xl tracking-wider" style={{ fontFamily: '"Covered By Your Grace", sans-serif', color: '#EB1C24' }}>
                {STUDIO_OS_PLATFORM.name}
              </p>
              <p className="mt-2 text-[10px] font-futura" style={{ fontWeight: 515, color: '#808080', lineHeight: 1.4 }}>
                {STUDIO_OS_PLATFORM.tagline}
              </p>
              <p className="mt-3 text-[8px] font-futura" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary }}>
                WORKSPACE REGISTRY · CAMPUS FRONT ENTRANCE · {STUDIO_OS_VOCABULARY.workspace.term.toUpperCase()} CREATION ENGINE V1.0
              </p>
              <p className="mt-2 text-[7px] font-futura" style={{ fontWeight: 515, color: '#333', lineHeight: 1.45 }}>
                Studio OS is the operating system. Every company is a Workspace. Same capabilities · isolated data · unique personality.
              </p>
            </div>

            {registryStore.studioPortfolioInsights.length > 0 ? (
              <div className="p-3 studio-living-panel" style={{ border: ADMIN_STUDIO_THEME.panelBorder, background: 'rgba(146,112,74,0.06)' }}>
                <p style={{ fontFamily: '"Futura PT Medium"', fontSize: '6px', color: '#92704A' }}>STUDIO INTELLIGENCE · PORTFOLIO</p>
                {registryStore.studioPortfolioInsights.slice(0, 2).map((ins) => (
                  <p key={ins.id} style={{ fontFamily: '"Futura PT Book"', fontSize: '6px', color: '#444', margin: '4px 0 0' }}>
                    {ins.insight} {ins.metric ? `· ${ins.metric}` : ''} · requires founder approval
                  </p>
                ))}
              </div>
            ) : null}

            <div className="grid grid-cols-1 gap-2">
              <button
                type="button"
                onClick={() => navigate(STUDIO_ADMINISTRATION_ROUTES.create)}
                className="w-full py-3 text-[8px] font-futura border"
                style={{ fontWeight: 515, color: '#FFF', background: '#6366F1', borderColor: ADMIN_STUDIO_THEME.panelBorder }}
              >
                LAUNCH NEW COMPANY
              </button>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => navigate(STUDIO_ADMINISTRATION_ROUTES.blueprints)}
                  className="py-2 text-[7px] font-futura border"
                  style={{ fontWeight: 515, color: '#6366F1', borderColor: ADMIN_STUDIO_THEME.panelBorder, background: 'rgba(255,255,255,0.85)' }}
                >
                  BLUEPRINT LIBRARY
                </button>
                <button
                  type="button"
                  onClick={() => navigate(STUDIO_ADMINISTRATION_ROUTES.promotionCenter)}
                  className="py-2 text-[7px] font-futura border"
                  style={{ fontWeight: 515, color: '#6366F1', borderColor: ADMIN_STUDIO_THEME.panelBorder, background: 'rgba(255,255,255,0.85)' }}
                >
                  PROMOTION CENTER
                </button>
              </div>
              <button
                type="button"
                onClick={() => navigate(STUDIO_ADMINISTRATION_ROUTES.marketplace)}
                className="w-full py-2 text-[7px] font-futura border"
                style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary, borderColor: ADMIN_STUDIO_THEME.panelBorder, background: 'rgba(255,255,255,0.85)' }}
              >
                MARKETPLACE · PLATFORM PILLAR
              </button>
              <button
                type="button"
                onClick={() => navigate(STUDIO_ADMINISTRATION_ROUTES.studioIntelligence)}
                className="w-full py-2 text-[7px] font-futura border"
                style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary, borderColor: ADMIN_STUDIO_THEME.panelBorder, background: 'rgba(255,255,255,0.85)' }}
              >
                STUDIO INTELLIGENCE · OPERATING INTELLIGENCE
              </button>
            </div>

            <div className="grid grid-cols-1 gap-3">
              {workspaces.map((ws) => {
                const registry = registryById.map.get(ws.id);
                return (
                  <WorkspaceRegistryCard
                    key={ws.id}
                    workspace={ws}
                    isActive={ws.id === workspaceId}
                    onEnter={() => selectWorkspace(ws)}
                    onMorningBriefing={() => enter(ws.id, { missionControl: true })}
                    registryMeta={
                      registry
                        ? {
                            workspaceType: registry.workspaceType,
                            deploymentStage: registry.deploymentStage,
                            isReferencePilot: registry.isReferencePilot,
                          }
                        : undefined
                    }
                  />
                );
              })}
            </div>

            <p className="text-[6px] font-futura uppercase text-center px-2" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary, lineHeight: 1.6 }}>
              {STUDIO_OS_PLATFORM.owner} · SELECT AN ORGANIZATION TO ENTER HEADQUARTERS · MISSION CONTROL IS ORG-SCOPED ONLY
            </p>
      </div>
    </StudioPlatformLayout>
  );
}
