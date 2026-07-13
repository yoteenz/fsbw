import type { CSSProperties } from 'react';
import type { ConstructionPlanSummary } from '../../../../studio-os-core/blueprint-author/workflow-session';
import type { ConstructionPlan } from '../../../../studio-os-core/blueprint-author/construction-plan-schema';
import type { FounderRenderJobView } from '../../../../studio-os-core/founder-render';

const rowStyle: CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
  gap: 12,
  marginTop: 16,
  padding: 16,
  background: 'rgba(255,255,255,0.92)',
  borderRadius: 12,
  border: '1px solid rgba(0,0,0,0.06)',
  backdropFilter: 'blur(12px)',
};

const chipStyle: CSSProperties = {
  fontSize: '10px',
  fontWeight: 800,
  letterSpacing: '0.08em',
  textTransform: 'uppercase',
  color: '#64748b',
  margin: '0 0 4px',
};

type Props = {
  summary: ConstructionPlanSummary;
  plan: ConstructionPlan;
  renderJob?: FounderRenderJobView | null;
};

function formatDuration(ms: number): string {
  if (ms < 60_000) return `${Math.round(ms / 1000)}s`;
  return `${Math.round(ms / 60_000)}m`;
}

function previewStatusLabel(status: FounderRenderJobView['status']): string {
  switch (status) {
    case 'no_preview':
      return 'No Preview';
    case 'queued':
      return 'Queued';
    case 'generating':
      return 'Generating';
    case 'ready':
      return 'Ready';
    case 'failed':
      return 'Failed';
    case 'stale':
      return 'Stale — regenerate required';
    case 'approved':
      return 'Approved';
    default:
      return status;
  }
}

/** Founder-facing metadata — no engineering terminology. */
export function FounderReviewMetadata({ summary, plan, renderJob }: Props) {
  const items: Array<[string, string]> = [
    ['Preview Status', renderJob ? previewStatusLabel(renderJob.status) : 'No Preview'],
    ['Blueprint Revision', String(renderJob?.currentBlueprintRevision ?? plan.metadata.revision)],
    ['Model Used', renderJob?.providerModel ?? 'Pending generation'],
    ['Founder Material Library', plan.materialSet.materialSetId.replace(/-/g, ' ')],
    ['Lighting Profile', plan.lightingProfile.profileId.replace(/-/g, ' ')],
    ['Camera', plan.cameraAnchors[0]?.label ?? 'Hero'],
    ['Estimated Build Time', formatDuration(summary.estimatedBuildTimeMs)],
    ['Estimated AI Credits', `${summary.estimatedCost} units`],
    ['Estimated Asset Count', String(summary.estimatedAssets)],
    ['Confidence Score', `${summary.confidenceScore}%`],
  ];

  return (
    <div data-founder-review-metadata style={rowStyle}>
      {items.map(([label, value]) => (
        <div key={label}>
          <p style={chipStyle}>{label}</p>
          <p style={{ margin: 0, fontSize: '13px', fontWeight: 600, color: '#0f172a' }}>{value}</p>
        </div>
      ))}
    </div>
  );
}
