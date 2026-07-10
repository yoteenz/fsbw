import type { CSSProperties } from 'react';
import type { RenderPipelineProgress } from '../../../../studio-os-core/creative-studio-preview';
import type { RenderPipelineRunMeta } from '../../../../studio-os-core/experience-lab-runtime';

type Props = {
  progress: RenderPipelineProgress;
  runMeta: RenderPipelineRunMeta;
  summary?: string;
  compact?: boolean;
};

function formatDuration(ms: number): string {
  const sec = Math.floor(ms / 1000);
  if (sec < 60) return `${sec}s`;
  const min = Math.floor(sec / 60);
  return `${min}m ${sec % 60}s`;
}

/** Visible pipeline progress — step bar, percentage, elapsed time, stall detection. */
export function CreativeStudioPipelineStatusBar({ progress, runMeta, summary, compact = false }: Props) {
  const { steps, progressPct, currentStepLabel, stepIndex, totalSteps, isRunning, isComplete, isFailed, isStalled } = {
    ...progress,
    isStalled: runMeta.isStalled,
  };

  const statusColor = isFailed ? '#991b1b' : isStalled ? '#b45309' : isComplete ? '#166534' : '#2563eb';
  const barFill = isFailed ? '#fecaca' : isStalled ? '#fde68a' : isComplete ? '#bbf7d0' : '#93c5fd';

  return (
    <div
      data-xelab-pipeline-status
      data-running={isRunning ? 'true' : 'false'}
      data-complete={isComplete ? 'true' : 'false'}
      data-stalled={isStalled ? 'true' : 'false'}
      style={wrapStyle}
    >
      <div style={headerRowStyle}>
        <span style={{ ...labelStyle, color: statusColor }}>
          {isFailed ? 'Pipeline failed' : isStalled ? 'Step stalled' : isComplete ? 'Render complete' : 'Pipeline running'}
        </span>
        <span style={metaStyle}>
          Run #{runMeta.runAttempt || 1} · {formatDuration(runMeta.elapsedMs)}
          {isRunning ? ` · step ${stepIndex + 1}/${totalSteps}` : ''}
        </span>
      </div>

      <div style={trackStyle} role="progressbar" aria-valuenow={progressPct} aria-valuemin={0} aria-valuemax={100}>
        <div
          style={{
            ...fillStyle,
            width: `${progressPct}%`,
            background: barFill,
            transition: isRunning ? 'width 0.4s ease' : undefined,
          }}
        />
      </div>

      <p style={{ margin: '6px 0 0', fontSize: compact ? '10px' : '11px', fontWeight: 600, color: '#111' }}>
        {progressPct}% — {currentStepLabel}
        {summary ? ` · ${summary}` : ''}
      </p>

      {isStalled ? (
        <p style={{ margin: '4px 0 0', fontSize: '10px', color: '#b45309' }}>
          No progress on this step for {formatDuration(runMeta.stepStallMs)} (threshold{' '}
          {formatDuration(90_000)}). Generation may still be running — or tap retry below if frozen.
        </p>
      ) : null}

      {!compact ? (
        <ol style={stepListStyle}>
          {steps.map((step) => (
            <li
              key={step.id}
              style={{
                ...stepItemStyle,
                color:
                  step.status === 'failed'
                    ? '#991b1b'
                    : step.status === 'done'
                      ? '#166534'
                      : step.status === 'active'
                        ? '#1d4ed8'
                        : '#9ca3af',
                fontWeight: step.status === 'active' ? 700 : 400,
              }}
            >
              <span style={stepDotStyle(step.status)} aria-hidden />
              {step.label}
            </li>
          ))}
        </ol>
      ) : null}
    </div>
  );
}

function stepDotStyle(status: string): CSSProperties {
  const base: CSSProperties = {
    display: 'inline-block',
    width: 6,
    height: 6,
    borderRadius: '50%',
    marginRight: 6,
    verticalAlign: 'middle',
  };
  if (status === 'done') return { ...base, background: '#16a34a' };
  if (status === 'active') return { ...base, background: '#2563eb' };
  if (status === 'failed') return { ...base, background: '#dc2626' };
  return { ...base, background: '#d1d5db' };
}

const wrapStyle: CSSProperties = {
  padding: '10px 12px',
  background: '#fff',
  borderBottom: '1px solid #e5e7eb',
  fontFamily: 'system-ui, sans-serif',
};

const headerRowStyle: CSSProperties = {
  display: 'flex',
  flexWrap: 'wrap',
  justifyContent: 'space-between',
  gap: 6,
  alignItems: 'baseline',
};

const labelStyle: CSSProperties = {
  fontSize: '9px',
  fontWeight: 800,
  letterSpacing: '0.08em',
  textTransform: 'uppercase',
};

const metaStyle: CSSProperties = {
  fontSize: '9px',
  color: '#6b7280',
  letterSpacing: '0.04em',
};

const trackStyle: CSSProperties = {
  marginTop: 8,
  height: 8,
  borderRadius: 99,
  background: '#e5e7eb',
  overflow: 'hidden',
};

const fillStyle: CSSProperties = {
  height: '100%',
  borderRadius: 99,
  minWidth: 4,
};

const stepListStyle: CSSProperties = {
  margin: '10px 0 0',
  padding: 0,
  listStyle: 'none',
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
  gap: '2px 8px',
  maxHeight: 120,
  overflowY: 'auto',
};

const stepItemStyle: CSSProperties = {
  fontSize: '9px',
  lineHeight: 1.4,
};
