import type { ConstructionTimeline } from '../../../../studio-os-core/founder-review';

type Props = {
  timeline: ConstructionTimeline;
  compact?: boolean;
};

/** Construction Timeline — the "build movie" after approval. */
export function ConstructionTimelinePanel({ timeline, compact }: Props) {
  return (
    <div
      data-construction-timeline
      style={{
        marginTop: 16,
        padding: 16,
        background: '#0f172a',
        borderRadius: 12,
        color: '#e2e8f0',
        fontFamily: 'system-ui, sans-serif',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <p style={{ margin: 0, fontSize: '10px', fontWeight: 800, letterSpacing: '0.12em', color: '#94a3b8' }}>
          CONSTRUCTION TIMELINE
        </p>
        <span style={{ fontSize: '11px', fontWeight: 700, color: '#fbbf24' }}>{timeline.progressPercent}%</span>
      </div>
      <div
        style={{
          display: compact ? 'flex' : 'grid',
          flexDirection: compact ? 'row' : undefined,
          flexWrap: compact ? 'wrap' : undefined,
          gap: compact ? 6 : 4,
          gridTemplateColumns: compact ? undefined : '1fr',
          maxHeight: compact ? undefined : 280,
          overflowY: compact ? undefined : 'auto',
        }}
      >
        {timeline.steps.map((step, i) => (
          <div
            key={step.stepId}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: compact ? '4px 8px' : '6px 0',
              fontSize: compact ? '10px' : '12px',
              opacity: step.status === 'pending' ? 0.45 : 1,
            }}
          >
            <span
              style={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                flexShrink: 0,
                background:
                  step.status === 'complete' ? '#22c55e' : step.status === 'active' ? '#fbbf24' : '#475569',
                boxShadow: step.status === 'active' ? '0 0 8px #fbbf24' : undefined,
              }}
            />
            {!compact && i > 0 ? (
              <span style={{ color: '#475569', fontSize: '10px', marginRight: 4 }}>↓</span>
            ) : null}
            <span style={{ fontWeight: step.status === 'active' ? 700 : 500, color: step.status === 'active' ? '#fff' : '#cbd5e1' }}>
              {step.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
