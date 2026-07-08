type PulseMetric = {
  label: string;
  value: string;
  accent?: boolean;
};

type Props = {
  metrics: PulseMetric[];
  priorityLine: string;
  workspaceName: string;
};

/** Organization Pulse Core™ — living command sculpture at the heart of Executive Atrium™. */
export function OrganizationPulseCore({ metrics, priorityLine, workspaceName }: Props) {
  return (
    <div className="scc-pulse-core" aria-label="Organization Pulse Core">
      <div className="scc-pulse-core__halo" aria-hidden />
      <div className="scc-pulse-core__ring scc-pulse-core__ring--outer" aria-hidden />
      <div className="scc-pulse-core__ring scc-pulse-core__ring--mid" aria-hidden />
      <div className="scc-pulse-core__ring scc-pulse-core__ring--inner" aria-hidden />
      <div className="scc-pulse-core__nucleus">
        <p className="scc-pulse-core__eyebrow">Organization Pulse Core™</p>
        <p className="scc-pulse-core__workspace">{workspaceName}</p>
        <p className="scc-pulse-core__priority">{priorityLine}</p>
        <div className="scc-pulse-core__metrics">
          {metrics.map((m) => (
            <div key={m.label} className={`scc-pulse-core__metric${m.accent ? ' is-accent' : ''}`}>
              <span className="scc-pulse-core__metric-val">{m.value}</span>
              <span className="scc-pulse-core__metric-label">{m.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
