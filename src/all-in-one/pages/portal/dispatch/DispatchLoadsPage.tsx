import { Link } from 'react-router-dom';
import { useDemoStore } from '../../../demo/useDemoStore';
import { getLoads, getOrganizationId } from '../../../demo/dispatchActions';
import { LoadLane, LoadStatusBadge } from '../../../components/dispatch/LoadDisplay';
import { formatMoney } from '../../../billing/money';
import { aioPaths } from '../../../utils/paths';

export function DispatchLoadsPage() {
  const store = useDemoStore();
  const orgId = getOrganizationId(store);
  const loads = getLoads(orgId, store).filter((l) => l.operationalStatus !== 'complete');

  return (
    <div className="aio-dispatch">
      <Link to={aioPaths.portalDispatch} className="aio-rr-link">← Dispatch</Link>
      <header className="aio-dispatch-hero aio-dispatch-hero--compact">
        <h1>Active Loads</h1>
      </header>
      {loads.length === 0 ? (
        <p className="aio-empty-state__text">No active loads.</p>
      ) : (
        loads.map((l) => (
          <Link key={l.id} to={aioPaths.portalDispatchLoad(l.id)} className="aio-dispatch-card aio-dispatch-list-card">
            <LoadStatusBadge load={l} />
            <strong>{l.loadNumber}</strong>
            <LoadLane load={l} />
            <span>{formatMoney(l.grossMinor)} · {l.loadedMiles} loaded mi</span>
          </Link>
        ))
      )}
    </div>
  );
}
