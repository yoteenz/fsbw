import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { StudioPlatformLayout } from '../../../../components/admin/studio-os/StudioPlatformLayout';
import { STUDIO_ADMINISTRATION_ROUTES } from '../../../../studio-os-core/application/routes';
import { STUDIO_OS_KNOWN_ORGANIZATIONS } from '../../../../studio-os-core/application/layers';
import {
  CROSS_COMPANY_INSIGHTS,
  ORGANIZATIONS_REQUIRING_ATTENTION,
  PORTFOLIO_HEALTH_METRICS,
  STUDIO_COMMAND_CENTER_HEADLINE,
  STUDIO_COMMAND_CENTER_SUBTITLE,
} from '../../../../studio-os-core/platform/command-center-demo';
import { readWorkspaceRegistryStore } from '../../../../studio-os-core/workspace-registry/store';
import { useWorkspace } from '../../../../studio-os-core/context/WorkspaceProvider';
import { useCampusTransition } from '../../../../components/admin/studio-os/campus/CampusTransitionProvider';
import { ADMIN_STUDIO_THEME } from '../../../../utils/adminStudioTheme';
import { WorkspaceRegistryCard } from '../../../../components/admin/studio-os/WorkspaceRegistryCard';
import { useWorkspaceCreationEngine } from '../../../../hooks/useWorkspaceCreationEngine';

/**
 * Studio Command Center — portfolio operating view for Studio Administration.
 * Replaces organization Mission Control at the platform layer.
 */
export default function StudioCommandCenterPage() {
  const navigate = useNavigate();
  const { workspaces } = useWorkspace();
  const { travelToWorkspace } = useCampusTransition();
  const { workspaces: registryWorkspaces } = useWorkspaceCreationEngine();
  const registryStore = readWorkspaceRegistryStore();

  const registryById = useMemo(() => {
    const map = new Map<string, (typeof registryWorkspaces)[number]>();
    for (const r of registryWorkspaces) {
      map.set(r.id, r);
    }
    return map;
  }, [registryWorkspaces]);

  const severityColor = (severity: 'high' | 'medium' | 'low') => {
    if (severity === 'high') return '#EB1C24';
    if (severity === 'medium') return '#92704A';
    return '#808080';
  };

  return (
    <StudioPlatformLayout title={STUDIO_COMMAND_CENTER_HEADLINE} subtitle={STUDIO_COMMAND_CENTER_SUBTITLE} showBack={false}>
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-2">
          {PORTFOLIO_HEALTH_METRICS.map((metric) => (
            <div key={metric.id} className="p-2 border" style={{ borderColor: ADMIN_STUDIO_THEME.panelBorder }}>
              <p style={{ fontFamily: '"Futura PT Medium"', fontSize: '6px', color: '#808080', margin: 0 }}>{metric.label}</p>
              <p style={{ fontFamily: '"Covered By Your Grace", sans-serif', fontSize: '18px', color: '#6366F1', margin: '2px 0 0' }}>
                {metric.value}
              </p>
              {metric.trend ? (
                <p style={{ fontFamily: '"Futura PT Book"', fontSize: '5px', color: '#666', margin: '2px 0 0' }}>{metric.trend}</p>
              ) : null}
            </div>
          ))}
        </div>

        <div className="p-3 border" style={{ borderColor: ADMIN_STUDIO_THEME.panelBorder }}>
          <p style={{ fontFamily: '"Futura PT Medium"', fontSize: '7px', color: '#333', margin: 0 }}>ORGANIZATIONS REQUIRING ATTENTION</p>
          {ORGANIZATIONS_REQUIRING_ATTENTION.map((item) => (
            <div key={item.id} className="mt-2 p-2" style={{ background: 'rgba(235,28,36,0.04)', border: '1px solid #eee' }}>
              <p style={{ fontFamily: '"Futura PT Medium"', fontSize: '6px', color: severityColor(item.severity), margin: 0 }}>
                {item.organization} · {item.severity.toUpperCase()}
              </p>
              <p style={{ fontFamily: '"Futura PT Book"', fontSize: '6px', color: '#444', margin: '4px 0 0', lineHeight: 1.45 }}>
                {item.issue}
              </p>
            </div>
          ))}
        </div>

        <div className="p-3 border" style={{ borderColor: ADMIN_STUDIO_THEME.panelBorder, background: 'rgba(146,112,74,0.06)' }}>
          <p style={{ fontFamily: '"Futura PT Medium"', fontSize: '7px', color: '#92704A', margin: 0 }}>CROSS-COMPANY INSIGHTS</p>
          {CROSS_COMPANY_INSIGHTS.map((insight) => (
            <p key={insight} style={{ fontFamily: '"Futura PT Book"', fontSize: '6px', color: '#444', margin: '6px 0 0', lineHeight: 1.45 }}>
              {insight}
            </p>
          ))}
          {registryStore.studioPortfolioInsights.slice(0, 2).map((ins) => (
            <p key={ins.id} style={{ fontFamily: '"Futura PT Book"', fontSize: '6px', color: '#444', margin: '6px 0 0', lineHeight: 1.45 }}>
              {ins.insight} {ins.metric ? `· ${ins.metric}` : ''}
            </p>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => navigate(STUDIO_ADMINISTRATION_ROUTES.registry)}
            className="py-2 text-[7px] font-futura border col-span-2"
            style={{ fontWeight: 515, color: '#FFF', background: '#6366F1', borderColor: ADMIN_STUDIO_THEME.panelBorder }}
          >
            OPEN ORGANIZATION REGISTRY
          </button>
          <button
            type="button"
            onClick={() => navigate(STUDIO_ADMINISTRATION_ROUTES.marketplace)}
            className="py-2 text-[7px] font-futura border"
            style={{ fontWeight: 515, color: '#6366F1', borderColor: ADMIN_STUDIO_THEME.panelBorder, background: 'rgba(255,255,255,0.85)' }}
          >
            MARKETPLACE
          </button>
          <button
            type="button"
            onClick={() => navigate(STUDIO_ADMINISTRATION_ROUTES.systemHealth)}
            className="py-2 text-[7px] font-futura border"
            style={{ fontWeight: 515, color: '#6366F1', borderColor: ADMIN_STUDIO_THEME.panelBorder, background: 'rgba(255,255,255,0.85)' }}
          >
            SYSTEM HEALTH
          </button>
        </div>

        <div>
          <p style={{ fontFamily: '"Futura PT Medium"', fontSize: '7px', color: '#333', marginBottom: 8 }}>ENTER ORGANIZATION HEADQUARTERS</p>
          <div className="grid grid-cols-1 gap-3">
            {workspaces.map((ws) => {
              const registry = registryById.get(ws.id);
              return (
                <WorkspaceRegistryCard
                  key={ws.id}
                  workspace={ws}
                  isActive={false}
                  onEnter={() => travelToWorkspace(ws.id, { missionControl: true })}
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
        </div>

        <p className="text-[6px] font-futura uppercase text-center px-2" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary, lineHeight: 1.6 }}>
          {STUDIO_OS_KNOWN_ORGANIZATIONS.map((o) => o.label).join(' · ')} · MISSION CONTROL EXISTS ONLY INSIDE EACH HEADQUARTERS
        </p>
      </div>
    </StudioPlatformLayout>
  );
}
