import {
  ADMIN_STUDIO_AI_PIPELINE_STEPS,
  type AdminStudioAiPipelineStepId,
} from '../../../utils/adminStudioAiStudioDemo';
import { ADMIN_STUDIO_THEME } from '../../../utils/adminStudioTheme';

type AdminStudioGenerationPipelineProps = {
  activeStepIndex: number;
  completedSteps: Set<AdminStudioAiPipelineStepId>;
  isComplete: boolean;
  onReset: () => void;
};

export function AdminStudioGenerationPipeline({
  activeStepIndex,
  completedSteps,
  isComplete,
  onReset,
}: AdminStudioGenerationPipelineProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p
          className="text-lg"
          style={{
            fontFamily: '"Covered By Your Grace", "Covered By Your Grace Preload", sans-serif',
            color: ADMIN_STUDIO_THEME.accent,
          }}
        >
          {isComplete ? 'DRAFT COMPLETE' : 'GENERATING PACK'}
        </p>
        {isComplete ? (
          <span
            className="text-[7px] font-futura uppercase px-2 py-1 bg-white border"
            style={{
              fontWeight: 515,
              color: '#CA8A04',
              borderColor: '#CA8A0444',
            }}
          >
            ALL OUTPUTS · DRAFT
          </span>
        ) : (
          <span
            className="inline-block w-2 h-2 rounded-full animate-pulse"
            style={{ background: ADMIN_STUDIO_THEME.accent }}
          />
        )}
      </div>

      <p
        className="text-[8px] font-futura uppercase"
        style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary, lineHeight: 1.5 }}
      >
        {isComplete
          ? 'CONTENT PACK SAVED AS DRAFT — NO PUBLISHING · DEMO PIPELINE ONLY'
          : 'PIPELINE RUNNING — RESEARCH THROUGH PACKAGING'}
      </p>

      <div className="space-y-1.5">
        {ADMIN_STUDIO_AI_PIPELINE_STEPS.map((step, index) => {
          const isDone = completedSteps.has(step.id);
          const isActive = activeStepIndex === index && !isComplete;
          const isPending = !isDone && !isActive;

          return (
            <div
              key={step.id}
              className="flex items-center gap-3 px-3 py-2 transition-all duration-300 border bg-white/70"
              style={{
                background: isActive
                  ? ADMIN_STUDIO_THEME.selectedBg
                  : isDone
                    ? 'rgba(22,163,74,0.08)'
                    : ADMIN_STUDIO_THEME.panelBg,
                borderColor: ADMIN_STUDIO_THEME.panelBorder,
                borderLeft: isActive
                  ? `2px solid ${ADMIN_STUDIO_THEME.accent}`
                  : isDone
                    ? '2px solid #16A34A'
                    : `2px solid ${ADMIN_STUDIO_THEME.panelBorder}`,
                opacity: isPending && !isComplete ? 0.55 : 1,
              }}
            >
              <span
                className="flex-shrink-0 w-5 h-5 flex items-center justify-center text-[8px] font-futura bg-white border"
                style={{
                  fontWeight: 515,
                  color: isDone ? '#16A34A' : isActive ? ADMIN_STUDIO_THEME.accent : ADMIN_STUDIO_THEME.textSecondary,
                  borderColor: ADMIN_STUDIO_THEME.panelBorder,
                  borderRadius: '50%',
                }}
              >
                {isDone ? '✓' : isActive ? '●' : index + 1}
              </span>
              <span
                className="flex-1 text-[9px] font-futura uppercase"
                style={{
                  fontWeight: 515,
                  color: isDone ? ADMIN_STUDIO_THEME.textPrimary : isActive ? ADMIN_STUDIO_THEME.accent : ADMIN_STUDIO_THEME.textSecondary,
                }}
              >
                {step.label}
              </span>
              {isActive ? (
                <span
                  className="text-[6px] font-futura uppercase animate-pulse"
                  style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.accent }}
                >
                  PROCESSING
                </span>
              ) : null}
              {isDone && step.id === 'draft-complete' ? (
                <span
                  className="text-[6px] font-futura uppercase"
                  style={{ fontWeight: 515, color: '#CA8A04' }}
                >
                  DRAFT
                </span>
              ) : null}
            </div>
          );
        })}
      </div>

      {isComplete ? (
        <button
          type="button"
          onClick={onReset}
          className="w-full mt-4 py-3 text-[9px] font-futura uppercase transition-opacity hover:opacity-90 bg-white border"
          style={{
            fontWeight: 515,
            color: ADMIN_STUDIO_THEME.textPrimary,
            borderColor: ADMIN_STUDIO_THEME.panelBorderStrong,
          }}
        >
          NEW GENERATION
        </button>
      ) : null}
    </div>
  );
}
