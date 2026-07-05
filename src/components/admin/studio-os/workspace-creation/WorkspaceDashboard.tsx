import { useNavigate } from 'react-router-dom';
import type { WorkspaceRegistryRecord } from '../../../../studio-os-core/workspace-creation/types';
import type { ExecutiveTeamMember } from '../../../../studio-os-core/workspace-creation/types';
import type { PromotionPipelineItem } from '../../../../studio-os-core/workspace-creation/types';
import { STUDIO_OS_ROUTES } from '../../../../studio-os-core/workspace/routes';
import { ADMIN_STUDIO_THEME } from '../../../../utils/adminStudioTheme';
import {
  DEPLOYMENT_STAGE_LABELS,
  WORKSPACE_TYPE_LABELS,
} from '../../../../utils/adminStudioWorkspaceCreationDemo';
import { NdxbookMissionControl } from '../ndxbook-mission-control/NdxbookMissionControl';
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
  const isAiMedia = workspace.id === 'ai-media' || workspace.slug === 'ai-media';

  if (isAiMedia) {
    return (
      <div className="space-y-3">
        <div
          className="p-2 border flex items-center gap-2"
          style={{ borderColor: workspace.accentColor, background: 'rgba(99,102,241,0.04)' }}
        >
          <span className="text-xl">{workspace.icon}</span>
          <div className="flex-1 min-w-0">
            <p className="text-[8px] font-futura" style={{ fontWeight: 515, color: workspace.accentColor }}>
              {workspace.name.toUpperCase()} · NDXBOOK OPERATING CENTER
            </p>
            <p className="text-[6px] font-futura" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary }}>
              {WORKSPACE_TYPE_LABELS[workspace.workspaceType]?.toUpperCase()} · {DEPLOYMENT_STAGE_LABELS[workspace.deploymentStage]?.toUpperCase()} · REFERENCE PILOT
            </p>
          </div>
        </div>

        <button
          type="button"
          className="w-full py-3 text-[8px] font-futura border mb-2"
          style={{
            fontWeight: 515,
            color: '#DC2626',
            borderColor: '#DC2626',
            background: 'rgba(220,38,38,0.06)',
          }}
          onClick={() => navigate(STUDIO_OS_ROUTES.workspaceNewsroom(workspace.id))}
        >
          ENTER NEWSROOM · PRODUCTION FLOOR →
        </button>

        <p className="text-[6px] font-futura mb-1" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary }}>
          MISSION CONTROL · EXECUTIVE LAYER · SUMMARIZES
        </p>

        <NdxbookMissionControl workspaceId={workspace.id} accentColor={workspace.accentColor} />

        <details className="p-2 border" style={{ borderColor: ADMIN_STUDIO_THEME.panelBorder }}>
          <summary className="text-[6px] font-futura cursor-pointer" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary }}>
            WORKSPACE ADMIN · EXECUTIVE TEAM · PROMOTION CENTER
          </summary>
          <div className="mt-2 space-y-3">
            <ExecutiveTeamPanel team={executiveTeam} />
            <PromotionCenterPanel items={promotionItems} onAdvance={onAdvancePromotion} />
          </div>
        </details>

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
          </div>
        </div>
      </div>

      <div className="p-3 border min-h-[200px]" style={{ borderColor: ADMIN_STUDIO_THEME.panelBorder, background: 'rgba(255,255,255,0.85)' }}>
        <div className="text-[7px] font-futura space-y-2" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary }}>
          <p style={{ color: workspace.accentColor }}>WORKSPACE OVERVIEW</p>
          <p>BLUEPRINT · {workspace.blueprintId.toUpperCase()}</p>
          <p>OWNER · {workspace.owner.toUpperCase()}</p>
          <p>MODULES ENABLED · {workspace.enabledModules.length}</p>
          <p>EXECUTIVE TEAM · {executiveTeam.length} AI EXECUTIVES</p>
        </div>
        <ExecutiveTeamPanel team={executiveTeam} />
        <PromotionCenterPanel items={promotionItems} onAdvance={onAdvancePromotion} />
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
