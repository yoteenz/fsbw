import { useExperienceLabV3Store } from '../store/ExperienceLabV3Store';

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

/** Mission control bottom strip — always visible. */
export function V3BottomOperationsBoard() {
  const { state } = useExperienceLabV3Store();

  return (
    <footer className="elab-v3-bottom-ops" data-elab-v3-bottom-operations>
      {METRICS.map((m) => {
        const raw = state.operations[m.key] as number;
        const display = m.format ? m.format(raw) : String(raw);
        return (
          <div key={m.key} className="elab-v3-bottom-ops__metric">
            <span className="elab-v3-bottom-ops__label">{m.label}</span>
            <span className="elab-v3-bottom-ops__value">{display}</span>
          </div>
        );
      })}
    </footer>
  );
}
