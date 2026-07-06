import { EIA, eiaCaption } from './executiveIaTheme';

export type PipelineStage = {
  id: string;
  label: string;
  state: 'complete' | 'active' | 'pending';
};

type ExecutivePipelineVizProps = {
  stages: PipelineStage[];
  label?: string;
};

/** Production pipeline — state at a glance. */
export function ExecutivePipelineViz({ stages, label }: ExecutivePipelineVizProps) {
  return (
    <div>
      {label ? <p style={{ ...eiaCaption, marginBottom: 10 }}>{label}</p> : null}
      <div className="flex items-stretch gap-1 overflow-x-auto pb-1">
        {stages.map((stage, idx) => {
          const isActive = stage.state === 'active';
          const isComplete = stage.state === 'complete';
          return (
            <div key={stage.id} className="flex items-center flex-shrink-0">
              <div
                className={isActive ? 'executive-ia-pipeline-active' : undefined}
                style={{
                  padding: '8px 10px',
                  minWidth: 72,
                  textAlign: 'center',
                  border: isActive ? `2px solid ${EIA.red}` : EIA.border,
                  background: isComplete ? 'rgba(22,163,74,0.08)' : isActive ? undefined : 'rgba(255,255,255,0.6)',
                }}
              >
                <p
                  style={{
                    ...eiaCaption,
                    color: isActive ? EIA.red : isComplete ? EIA.pass : EIA.black,
                    fontFamily: '"Futura PT Medium"',
                    fontSize: '7px',
                  }}
                >
                  {stage.label}
                </p>
              </div>
              {idx < stages.length - 1 ? (
                <span style={{ color: EIA.gray, margin: '0 4px', fontSize: '9px' }}>→</span>
              ) : null}
            </div>
          );
        })}
      </div>
    </div>
  );
}
