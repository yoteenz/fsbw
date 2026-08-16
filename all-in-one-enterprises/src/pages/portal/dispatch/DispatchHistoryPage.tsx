import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useDemoStore } from '../../../demo/useDemoStore';
import { getDispatchMetrics, getLoads, getOrganizationId } from '../../../demo/dispatchActions';
import { computeAllMilesRpm, computeLoadedRpm } from '../../../dispatch/dispatchCalculations';
import { LoadLane, LoadStatusBadge } from '../../../components/dispatch/LoadDisplay';
import { formatMoney } from '../../../billing/money';
import { aioPaths } from '../../../utils/paths';

export function DispatchHistoryPage() {
  const store = useDemoStore();
  const orgId = getOrganizationId(store);
  const [filter, setFilter] = useState('');
  const loads = useMemo(() => {
    const all = getLoads(orgId, store);
    const q = filter.trim().toLowerCase();
    if (!q) return all;
    return all.filter(
      (l) =>
        l.loadNumber.toLowerCase().includes(q) ||
        l.originCity.toLowerCase().includes(q) ||
        l.destinationCity.toLowerCase().includes(q) ||
        l.brokerName.toLowerCase().includes(q),
    );
  }, [orgId, store.loads, filter]);

  const metrics = useMemo(() => getDispatchMetrics(orgId, store), [orgId, store.loads]);
  const completed = loads.filter((l) => l.operationalStatus === 'complete');
  const avgLoadedRpm =
    completed.length > 0
      ? computeLoadedRpm(
          completed.reduce((s, l) => s + l.confirmedGrossMinor, 0),
          completed.reduce((s, l) => s + l.loadedMiles, 0),
        )
      : 0;
  const avgAllRpm =
    completed.length > 0
      ? computeAllMilesRpm(
          completed.reduce((s, l) => s + l.confirmedGrossMinor, 0),
          completed.reduce((s, l) => s + l.loadedMiles, 0),
          completed.reduce((s, l) => s + l.deadheadMiles, 0),
        )
      : 0;

  return (
    <div className="aio-dispatch">
      <Link to={aioPaths.portalDispatch} className="aio-rr-link">← Dispatch</Link>
      <header className="aio-dispatch-hero aio-dispatch-hero--compact">
        <h1>Dispatch History</h1>
        <p>Operational summary — not profit &amp; loss.</p>
      </header>

      <section className="aio-dispatch-card">
        <h2>Dispatch Summary</h2>
        <dl className="aio-dispatch-metrics aio-dispatch-metrics--inline">
          <div><dt>Completed</dt><dd>{metrics.completedLoads}</dd></div>
          <div><dt>Loaded mi</dt><dd>{metrics.loadedMiles}</dd></div>
          <div><dt>Deadhead mi</dt><dd>{metrics.deadheadMiles}</dd></div>
          <div><dt>Gross</dt><dd>{formatMoney(metrics.grossMinor)}</dd></div>
          <div><dt>Avg Loaded RPM</dt><dd>{avgLoadedRpm ? `$${(avgLoadedRpm / 100).toFixed(2)}` : '—'}</dd></div>
          <div><dt>Avg All-Miles RPM</dt><dd>{avgAllRpm ? `$${(avgAllRpm / 100).toFixed(2)}` : '—'}</dd></div>
        </dl>
      </section>

      <label className="aio-dispatch-search">
        Search
        <input type="search" value={filter} onChange={(e) => setFilter(e.target.value)} placeholder="Origin, destination, broker…" />
      </label>

      {loads.map((l) => (
        <Link key={l.id} to={aioPaths.portalDispatchLoad(l.id)} className="aio-dispatch-card aio-dispatch-list-card">
          <LoadStatusBadge load={l} />
          <strong>{l.loadNumber}</strong>
          <LoadLane load={l} />
          <span>{formatMoney(l.confirmedGrossMinor)} · Factoring: {l.factoringHandoffStatus.replace(/_/g, ' ')}</span>
        </Link>
      ))}
    </div>
  );
}
