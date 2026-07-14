import { useExperienceLabV3Store } from '../store/ExperienceLabV3Store';
import { ELAB_V3_COMPOSITION } from '../experience-lab-v3-composition';

const METRICS: Array<{ key: keyof ReturnType<typeof useExperienceLabV3Store>['state']['operations']; label: string; format?: (v: number) => string }> = [
  { key: 'todaySpendUsd', label: "Today's Spend", format: (v) => `$${v.toFixed(2)}` },
  { key: 'gpuUsagePercent', label: 'GPU Usage', format: (v) => `${v}%` },
  { key: 'generationQueueCount', label: 'Generation Queue' },
  { key: 'creditsRemaining', label: 'Credits' },
  { key: 'pendingReviews', label: 'Pending Reviews' },
  { key: 'assetManufacturingCount', label: 'Asset Manufacturing' },
  { key: 'marketplaceJobs', label: 'Marketplace Jobs' },
  { key: 'cdsQueueCount', label: 'CDS Queue' },
  { key: 'failedJobs', label: 'Failed Jobs' },
  { key: 'systemHealthPercent', label: 'System Health', format: (v) => `${v}%` },
  { key: 'founderNotifications', label: 'Founder Notifications' },
];

/** Workspace 05 — studio intelligence and analytics. */
export function V3IntelligenceWorkspace() {
  const { state } = useExperienceLabV3Store();

  return (
    <section
      className="elab-v3-ws elab-v3-ws--intelligence"
      {...{ [ELAB_V3_COMPOSITION.intelligenceWorkspace]: '' }}
      aria-label="Intelligence workspace"
    >
      <div className="elab-v3-ws__intel-grid">
        {METRICS.map((m) => {
          const raw = state.operations[m.key] as number;
          const display = m.format ? m.format(raw) : String(raw);
          return (
            <div key={m.key} className="elab-v3-ws__intel-metric">
              <span className="elab-v3-ws__intel-label">{m.label}</span>
              <span className="elab-v3-ws__intel-value">{display}</span>
            </div>
          );
        })}
      </div>
      <p className="elab-v3-ws__intel-note">
        Diagnostics, provider health, render history, and queue analytics for package{' '}
        <strong>{state.activePackage?.packageId}</strong>.
      </p>
    </section>
  );
}
