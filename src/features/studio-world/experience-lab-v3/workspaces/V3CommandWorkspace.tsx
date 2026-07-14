import { useExperienceLabV3Store } from '../store/ExperienceLabV3Store';
import { ELAB_V3_COMPOSITION } from '../experience-lab-v3-composition';

const METRICS: Array<{ key: keyof ReturnType<typeof useExperienceLabV3Store>['state']['operations']; label: string; format?: (v: number) => string }> = [
  { key: 'todaySpendUsd', label: "Today's Spend", format: (v) => `$${v.toFixed(2)}` },
  { key: 'gpuUsagePercent', label: 'GPU Usage', format: (v) => `${v}%` },
  { key: 'generationQueueCount', label: 'Generation Queue' },
  { key: 'creditsRemaining', label: 'Credits' },
  { key: 'pendingReviews', label: 'Pending Reviews' },
  { key: 'failedJobs', label: 'Failed Jobs' },
  { key: 'systemHealthPercent', label: 'System Health', format: (v) => `${v}%` },
  { key: 'founderNotifications', label: 'Founder Notifications' },
];

/** Workspace 05 — Command / mission control diagnostics (viewport-contained, no scroll). */
export function V3CommandWorkspace() {
  const { state } = useExperienceLabV3Store();

  return (
    <section
      className="elab-v3-ws-pane elab-v3-ws-pane--command"
      {...{ [ELAB_V3_COMPOSITION.commandWorkspace]: '' }}
      aria-label="Command workspace"
    >
      <div className="elab-v3-ws-pane__grid elab-v3-ws-pane__grid--command">
        {METRICS.map((m) => {
          const raw = state.operations[m.key] as number;
          const display = m.format ? m.format(raw) : String(raw);
          return (
            <div key={m.key} className="elab-v3-ws-pane__tile">
              <span className="elab-v3-ws-pane__tile-label">{m.label}</span>
              <span className="elab-v3-ws-pane__tile-value">{display}</span>
            </div>
          );
        })}
      </div>
    </section>
  );
}
