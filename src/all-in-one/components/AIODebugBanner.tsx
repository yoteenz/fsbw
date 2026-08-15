import { useDemoStore } from '../demo/useDemoStore';
import { setPortalMemberRole, setPortalOrganization, setShipperOrganization } from '../portal/organizationContext';
import { canResetDemoData, getEnvironmentLabel, isDemoMode } from '../config/dataMode';
import { resetDemoStore } from '../demo/demoStore';
import { aioPaths } from '../utils/paths';
import { Link } from 'react-router-dom';

const DEMO_ORGS = [
  { id: 'client-a', label: 'A — Summit Ridge (new OO)' },
  { id: 'client-b', label: 'B — Heartland (active)' },
  { id: 'client-c', label: 'C — Pioneer Fleet' },
  { id: 'client-d', label: 'D — BlueLine (factoring)' },
  { id: 'client-f', label: 'F — Delta (active load)' },
  { id: 'client-g', label: 'G — RidgeLine (caught up)' },
  { id: 'client-e', label: 'E — NorthStar Shipper' },
];

const DEMO_ROLES = ['owner', 'admin', 'operations', 'driver', 'accounting', 'viewer'] as const;

export function AIODebugBanner() {
  const store = useDemoStore();
  const envLabel = getEnvironmentLabel();

  const handleReset = () => {
    if (window.confirm('Reset all demo data? This restores the canonical seed state.')) {
      resetDemoStore();
      window.location.href = '/all-in-one';
    }
  };

  return (
    <div className="aio-debug-banner" role="status" aria-label="Environment indicator">
      <span className="aio-debug-banner__label">AIO PREVIEW · {envLabel ?? 'STAGING'}</span>
      {isDemoMode() && (
        <>
          <select
            className="aio-debug-banner__select"
            aria-label="Demo organization"
            value={store.portalClientId ?? 'client-a'}
            onChange={(e) => setPortalOrganization(e.target.value)}
          >
            {DEMO_ORGS.filter((o) => o.id !== 'client-e').map((o) => (
              <option key={o.id} value={o.id}>{o.label}</option>
            ))}
          </select>
          <select
            className="aio-debug-banner__select"
            aria-label="Portal member role"
            value={store.portalMemberRole ?? 'owner'}
            onChange={(e) => setPortalMemberRole(e.target.value as typeof DEMO_ROLES[number])}
          >
            {DEMO_ROLES.map((r) => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>
          <button type="button" className="aio-debug-banner__office-link" onClick={() => setShipperOrganization('client-e')}>
            Shipper Org
          </button>
          <Link to={aioPaths.office} className="aio-debug-banner__office-link">Office →</Link>
          <Link to={aioPaths.portal} className="aio-debug-banner__office-link">Portal →</Link>
        </>
      )}
      {!isDemoMode() && (
        <Link to={aioPaths.login} className="aio-debug-banner__office-link">Sign In</Link>
      )}
      {canResetDemoData() && (
        <button type="button" className="aio-debug-banner__reset" onClick={handleReset}>Reset Demo Data</button>
      )}
    </div>
  );
}
