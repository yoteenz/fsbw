import type { PromotionPipelineItem } from '../../../../studio-os-core/workspace-creation/types';
import {
  PROMOTION_STAGE_LABELS,
  promotionStageProgress,
} from '../../../../studio-os-core/workspace-creation/promotionPipeline';
import { ADMIN_STUDIO_THEME } from '../../../../utils/adminStudioTheme';

type PromotionCenterPanelProps = {
  items: PromotionPipelineItem[];
  onAdvance?: (id: string) => void;
};

export function PromotionCenterPanel({ items, onAdvance }: PromotionCenterPanelProps) {
  return (
    <div className="space-y-3">
      <p className="text-[7px] font-futura leading-relaxed" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary }}>
        FEATURE LIFECYCLE · DEVELOP → DEPLOY TO AI MEDIA → PRODUCTION TESTING → ANALYTICS → BUG FIXES → APPROVAL → PROMOTE TO FRONTAL SLAYER → RELEASE TO ALL WORKSPACES
      </p>

      {items.map((item) => {
        const pct = promotionStageProgress(item.currentStage);
        return (
          <div
            key={item.id}
            className="p-2 border"
            style={{ borderColor: ADMIN_STUDIO_THEME.panelBorder, background: 'rgba(255,255,255,0.85)' }}
          >
            <p className="text-[8px] font-futura" style={{ fontWeight: 515, color: '#6366F1' }}>
              {item.featureName.toUpperCase()}
            </p>
            <p className="text-[6px] font-futura mt-1" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary }}>
              {item.description}
            </p>
            <p className="text-[6px] font-futura mt-1" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textPrimary }}>
              STAGE · {PROMOTION_STAGE_LABELS[item.currentStage].toUpperCase()} · PILOT {item.pilotWorkspaceId.toUpperCase()} → PRODUCTION {item.productionWorkspaceId.toUpperCase()}
            </p>
            <div className="mt-2 h-1.5 bg-gray-200">
              <div className="h-full bg-indigo-500 transition-all" style={{ width: `${pct}%` }} />
            </div>
            {onAdvance && item.currentStage !== 'release-all-workspaces' ? (
              <button
                type="button"
                className="mt-2 px-2 py-1 text-[6px] font-futura border"
                style={{ fontWeight: 515, color: '#6366F1', borderColor: ADMIN_STUDIO_THEME.panelBorder }}
                onClick={() => onAdvance(item.id)}
              >
                ADVANCE STAGE
              </button>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}
