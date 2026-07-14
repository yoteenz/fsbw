import { useExperienceLabV3Store } from '../store/ExperienceLabV3Store';

const OPS_LABELS: Record<string, string> = {
  queued: 'Queued',
  generating: 'Generating',
  waiting: 'Waiting',
  blocked: 'Blocked',
  'founder-review': 'Founder Review',
  'approval-needed': 'Approval Needed',
  'asset-manufacturing': 'Asset Manufacturing',
  'cds-ready': 'CDS Ready',
  'marketplace-ready': 'Marketplace Ready',
  published: 'Published',
  completed: 'Completed',
  failed: 'Failed',
};

/** Live operation board — production command center chips. */
export function V3LiveOperationBoard() {
  const { state } = useExperienceLabV3Store();

  const counts = state.workOrders.reduce<Record<string, number>>((acc, wo) => {
    acc[wo.status] = (acc[wo.status] ?? 0) + 1;
    return acc;
  }, {});

  const chips = Object.entries(counts).filter(([, n]) => n > 0);

  return (
    <div className="elab-v3-ops-board" data-elab-v3-live-operations>
      {chips.map(([status, count]) => (
        <div key={status} className={`elab-v3-ops-board__chip elab-v3-ops-board__chip--${status}`}>
          <span className="elab-v3-ops-board__count">{count}</span>
          <span className="elab-v3-ops-board__label">{OPS_LABELS[status] ?? status}</span>
        </div>
      ))}
    </div>
  );
}
