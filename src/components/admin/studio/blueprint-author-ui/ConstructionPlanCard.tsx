import type { CSSProperties } from 'react';
import type { ConstructionPlanSummary } from '../../../../studio-os-core/blueprint-author/workflow-session';

const cardStyle: CSSProperties = {
  background: '#fff',
  border: '1px solid #e5e7eb',
  borderRadius: 12,
  padding: 16,
  fontFamily: 'system-ui, sans-serif',
  fontSize: '12px',
  color: '#111',
};

const labelStyle: CSSProperties = {
  fontSize: '10px',
  fontWeight: 800,
  letterSpacing: '0.08em',
  textTransform: 'uppercase',
  color: '#666',
  margin: '0 0 4px',
};

const valueStyle: CSSProperties = {
  margin: '0 0 12px',
  fontWeight: 600,
};

type Props = {
  summary: ConstructionPlanSummary;
  planId?: string;
};

function formatDuration(ms: number): string {
  if (ms < 60_000) return `${Math.round(ms / 1000)}s`;
  return `${Math.round(ms / 60_000)}m`;
}

/** Construction Plan summary — live Blueprint Author data only. */
export function ConstructionPlanCard({ summary, planId }: Props) {
  const rows: Array<[string, string]> = [
    ['Project Name', summary.projectName],
    ['Blueprint Revision', `rev ${summary.blueprintRevision}`],
    ['Estimated Cost', `${summary.estimatedCost} units`],
    ['Estimated Build Time', formatDuration(summary.estimatedBuildTimeMs)],
    ['Estimated Workers', String(summary.estimatedWorkerCount)],
    ['Estimated Assets', String(summary.estimatedAssets)],
    ['Confidence Score', `${summary.confidenceScore}%`],
    ['Status', summary.status.replace(/-/g, ' ')],
  ];

  return (
    <div data-blueprint-construction-plan style={cardStyle}>
      <p style={{ margin: '0 0 12px', fontSize: '10px', fontWeight: 800, letterSpacing: '0.1em', color: '#eb1c24' }}>
        CONSTRUCTION PLAN
      </p>
      {planId ? (
        <p style={{ margin: '0 0 12px', fontSize: '10px', color: '#666' }}>
          Plan ID: {planId}
        </p>
      ) : null}
      <dl style={{ margin: 0, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 12 }}>
        {rows.map(([label, value]) => (
          <div key={label}>
            <dt style={labelStyle}>{label}</dt>
            <dd style={{ ...valueStyle, margin: 0 }}>{value}</dd>
          </div>
        ))}
      </dl>
      <p style={{ margin: '12px 0 0', padding: 10, background: '#f0fdf4', borderRadius: 8, color: '#166534', fontSize: '11px' }}>
        No AI generation has started. Review the plan, preview the procedural scene, and approve before manufacturing.
      </p>
    </div>
  );
}
