import {
  ADMIN_STUDIO_AI_PIPELINE_STEPS,
  type AdminStudioAiPipelineStepId,
} from '../../../utils/adminStudioAiStudioDemo';

type AdminStudioGenerationPipelineProps = {
  activeStepIndex: number;
  completedSteps: Set<AdminStudioAiPipelineStepId>;
  isComplete: boolean;
  onReset: () => void;
};

/** Animated faux-AI pipeline — demo only, no backend. */
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
            color: '#EB1C24',
          }}
        >
          {isComplete ? 'DRAFT COMPLETE' : 'GENERATING PACK'}
        </p>
        {isComplete ? (
          <span
            className="text-[7px] font-futura uppercase px-2 py-1"
            style={{
              fontWeight: 515,
              color: '#FBBF24',
              border: '1px solid #FBBF2455',
              background: '#FBBF2415',
            }}
          >
            ALL OUTPUTS · DRAFT
          </span>
        ) : (
          <span
            className="inline-block w-2 h-2 rounded-full animate-pulse"
            style={{ background: '#EB1C24' }}
          />
        )}
      </div>

      <p
        className="text-[8px] font-futura uppercase"
        style={{ fontWeight: 515, color: '#9A9A9A', lineHeight: 1.5 }}
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
              className="flex items-center gap-3 px-3 py-2 transition-all duration-300"
              style={{
                background: isActive
                  ? 'rgba(235,28,36,0.12)'
                  : isDone
                    ? 'rgba(74,222,128,0.08)'
                    : 'rgba(255,255,255,0.03)',
                borderLeft: isActive
                  ? '2px solid #EB1C24'
                  : isDone
                    ? '2px solid #4ADE80'
                    : '2px solid rgba(255,255,255,0.08)',
                opacity: isPending && !isComplete ? 0.45 : 1,
              }}
            >
              <span
                className="flex-shrink-0 w-5 h-5 flex items-center justify-center text-[8px] font-futura"
                style={{
                  fontWeight: 515,
                  color: isDone ? '#4ADE80' : isActive ? '#EB1C24' : '#9A9A9A',
                  border: `1px solid ${isDone ? '#4ADE8055' : isActive ? '#EB1C2455' : 'rgba(255,255,255,0.15)'}`,
                  borderRadius: '50%',
                }}
              >
                {isDone ? '✓' : isActive ? '●' : index + 1}
              </span>
              <span
                className="flex-1 text-[9px] font-futura uppercase"
                style={{
                  fontWeight: 515,
                  color: isDone ? '#FFFFFF' : isActive ? '#EB1C24' : '#9A9A9A',
                }}
              >
                {step.label}
              </span>
              {isActive ? (
                <span
                  className="text-[6px] font-futura uppercase animate-pulse"
                  style={{ fontWeight: 515, color: '#EB1C24' }}
                >
                  PROCESSING
                </span>
              ) : null}
              {isDone && step.id === 'draft-complete' ? (
                <span
                  className="text-[6px] font-futura uppercase"
                  style={{ fontWeight: 515, color: '#FBBF24' }}
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
          className="w-full mt-4 py-3 text-[9px] font-futura uppercase transition-opacity hover:opacity-90"
          style={{
            fontWeight: 515,
            color: '#FFFFFF',
            background: 'rgba(255,255,255,0.08)',
            border: '1px solid rgba(255,255,255,0.2)',
          }}
        >
          NEW GENERATION
        </button>
      ) : null}
    </div>
  );
}
