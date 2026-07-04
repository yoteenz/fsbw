import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { WorkspaceRegistryRecord } from '../../../../studio-os-core/workspace-creation/types';
import type { ExecutiveTeamMember } from '../../../../studio-os-core/workspace-creation/types';
import type { PromotionPipelineItem } from '../../../../studio-os-core/workspace-creation/types';
import { STUDIO_OS_ROUTES } from '../../../../studio-os-core/workspace/routes';
import { ADMIN_STUDIO_THEME } from '../../../../utils/adminStudioTheme';
import {
  AI_MEDIA_DASHBOARD_TABS,
  DEPLOYMENT_STAGE_LABELS,
  WORKSPACE_DASHBOARD_MODULE_LABELS,
  WORKSPACE_TYPE_LABELS,
} from '../../../../utils/adminStudioWorkspaceCreationDemo';
import { ExecutiveTeamPanel } from './ExecutiveTeamPanel';
import { PromotionCenterPanel } from './PromotionCenterPanel';

type WorkspaceDashboardProps = {
  workspace: WorkspaceRegistryRecord;
  executiveTeam: ExecutiveTeamMember[];
  promotionItems: PromotionPipelineItem[];
  onAdvancePromotion?: (id: string) => void;
};

export function WorkspaceDashboard({
  workspace,
  executiveTeam,
  promotionItems,
  onAdvancePromotion,
}: WorkspaceDashboardProps) {
  const navigate = useNavigate();
  const tabs = useMemo(() => {
    const enabled = new Set(workspace.enabledModules);
    return AI_MEDIA_DASHBOARD_TABS.filter((t) => enabled.has(t) || t === 'dashboard');
  }, [workspace.enabledModules]);

  const [activeTab, setActiveTab] = useState(tabs[0] ?? 'dashboard');

  return (
    <div className="space-y-3">
      <div
        className="p-3 border relative overflow-hidden"
        style={{ borderColor: workspace.accentColor, background: 'rgba(255,255,255,0.88)' }}
      >
        <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ background: `linear-gradient(135deg, ${workspace.accentColor}, transparent)` }} />
        <div className="relative flex items-start gap-3">
          <span className="text-2xl">{workspace.icon}</span>
          <div className="flex-1">
            <p className="text-[14px]" style={{ fontFamily: '"Covered By Your Grace", sans-serif', color: workspace.accentColor }}>
              {workspace.name.toUpperCase()}
            </p>
            <p className="text-[7px] font-futura mt-1" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary }}>
              {workspace.description}
            </p>
            <div className="flex flex-wrap gap-2 mt-2">
              <span className="text-[6px] font-futura px-1 border" style={{ borderColor: workspace.accentColor, color: workspace.accentColor }}>
                {WORKSPACE_TYPE_LABELS[workspace.workspaceType]?.toUpperCase()}
              </span>
              <span className="text-[6px] font-futura px-1 border" style={{ borderColor: ADMIN_STUDIO_THEME.panelBorder, color: ADMIN_STUDIO_THEME.textSecondary }}>
                {DEPLOYMENT_STAGE_LABELS[workspace.deploymentStage]?.toUpperCase()}
              </span>
              {workspace.isReferencePilot ? (
                <span className="text-[6px] font-futura px-1 border" style={{ borderColor: '#6366F1', color: '#6366F1' }}>
                  REFERENCE PILOT
                </span>
              ) : null}
            </div>
          </div>
        </div>
      </div>

      <div className="flex gap-1 overflow-x-auto pb-1">
        {tabs.map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setActiveTab(tab)}
            className="whitespace-nowrap px-2 py-1 text-[6px] font-futura border"
            style={{
              fontWeight: 515,
              borderColor: activeTab === tab ? workspace.accentColor : ADMIN_STUDIO_THEME.panelBorder,
              color: activeTab === tab ? workspace.accentColor : ADMIN_STUDIO_THEME.textSecondary,
              background: activeTab === tab ? 'rgba(99,102,241,0.08)' : 'white',
            }}
          >
            {WORKSPACE_DASHBOARD_MODULE_LABELS[tab]?.toUpperCase() ?? tab}
          </button>
        ))}
      </div>

      <div className="p-3 border min-h-[200px]" style={{ borderColor: ADMIN_STUDIO_THEME.panelBorder, background: 'rgba(255,255,255,0.85)' }}>
        {activeTab === 'dashboard' ? (
          <div className="space-y-2 text-[7px] font-futura" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary }}>
            <p style={{ color: workspace.accentColor }}>WORKSPACE OVERVIEW</p>
            <p>BLUEPRINT · {workspace.blueprintId.toUpperCase()}</p>
            <p>OWNER · {workspace.owner.toUpperCase()}</p>
            <p>MODULES ENABLED · {workspace.enabledModules.length}</p>
            <p>EXECUTIVE TEAM · {executiveTeam.length} AI EXECUTIVES</p>
            {workspace.isReferencePilot ? (
              <p className="text-[#6366F1]">
                PERMANENT PILOT · VALIDATE FEATURES HERE BEFORE FRONTAL SLAYER PROMOTION
              </p>
            ) : null}
          </div>
        ) : null}

        {activeTab === 'executive-ai-director' ? <ExecutiveTeamPanel team={executiveTeam} /> : null}

        {activeTab === 'promotion-center' ? (
          <PromotionCenterPanel items={promotionItems} onAdvance={onAdvancePromotion} />
        ) : null}

        {activeTab !== 'dashboard' && activeTab !== 'executive-ai-director' && activeTab !== 'promotion-center' ? (
          <div className="text-[7px] font-futura space-y-2" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary }}>
            <p style={{ color: workspace.accentColor }}>
              {(WORKSPACE_DASHBOARD_MODULE_LABELS[activeTab] ?? activeTab).toUpperCase()}
            </p>
            <p>MODULE PROVISIONED · OPERATING SYSTEM READY</p>
            <p>INHERITS WORKSPACE MEMORY BIBLE · CREATIVE DNA · KNOWLEDGE GRAPH</p>
            {activeTab === 'memory-bible' ? (
              <button type="button" className="text-[6px] underline" style={{ color: '#6366F1' }} onClick={() => navigate('/admin/studio/memory-bible')}>
                OPEN PLATFORM MEMORY BIBLE (REFERENCE)
              </button>
            ) : null}
            {activeTab === 'growth-network' ? (
              <button type="button" className="text-[6px] underline" style={{ color: '#6366F1' }} onClick={() => navigate('/admin/studio/growth-network')}>
                OPEN GROWTH NETWORK (PLATFORM)
              </button>
            ) : null}
            {activeTab === 'labs' ? (
              <button type="button" className="text-[6px] underline" style={{ color: '#6366F1' }} onClick={() => navigate('/admin/studio/labs')}>
                OPEN STUDIO OS LABS (PLATFORM)
              </button>
            ) : null}
            {activeTab === 'ai-media-network' ? (
              <button type="button" className="text-[6px] underline" style={{ color: '#6366F1' }} onClick={() => navigate('/admin/studio/ai-media-network')}>
                OPEN AI MEDIA NETWORK
              </button>
            ) : null}
            {activeTab === 'talent-network' ? (
              <button type="button" className="text-[6px] underline" style={{ color: '#6366F1' }} onClick={() => navigate('/admin/studio/talent-network')}>
                OPEN TALENT NETWORK
              </button>
            ) : null}
            {activeTab === 'marketplace' ? (
              <button type="button" className="text-[6px] underline" style={{ color: '#6366F1' }} onClick={() => navigate('/admin/studio/marketplace')}>
                OPEN MARKETPLACE
              </button>
            ) : null}
            {activeTab === 'business-model-engine' ? (
              <button type="button" className="text-[6px] underline" style={{ color: '#6366F1' }} onClick={() => navigate('/admin/studio/business-model-engine')}>
                OPEN BUSINESS MODEL ENGINE
              </button>
            ) : null}
            {activeTab === 'ecosystem' ? (
              <button type="button" className="text-[6px] underline" style={{ color: '#6366F1' }} onClick={() => navigate('/admin/studio/ecosystem')}>
                OPEN STUDIO OS ECOSYSTEM
              </button>
            ) : null}
            {activeTab === 'governance' ? (
              <button type="button" className="text-[6px] underline" style={{ color: '#6366F1' }} onClick={() => navigate('/admin/studio/governance')}>
                OPEN STUDIO OS GOVERNANCE
              </button>
            ) : null}
            {activeTab === 'studio-intelligence' ? (
              <button type="button" className="text-[6px] underline" style={{ color: '#6366F1' }} onClick={() => navigate('/admin/studio/studio-intelligence')}>
                OPEN STUDIO INTELLIGENCE
              </button>
            ) : null}
          </div>
        ) : null}
      </div>

      <button
        type="button"
        className="w-full py-2 text-[7px] font-futura border"
        style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary, borderColor: ADMIN_STUDIO_THEME.panelBorder }}
        onClick={() => navigate(STUDIO_OS_ROUTES.entry)}
      >
        BACK TO WORKSPACE REGISTRY
      </button>
    </div>
  );
}
