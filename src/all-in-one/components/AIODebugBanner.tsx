import { canResetDemoData, getBackendSetupWarning, getEnvironmentLabel, isDemoMode } from '../config/dataMode';
import { resetDemoStore } from '../demo/demoStore';
import { aioPaths } from '../utils/paths';
import { Link } from 'react-router-dom';

export function AIODebugBanner() {
  const envLabel = getEnvironmentLabel();
  const setupWarning = getBackendSetupWarning();

  const handleReset = () => {
    if (
      window.confirm(
        'Reset all demo data? This restores the canonical seed state for clients, requests, office, and portal.',
      )
    ) {
      resetDemoStore();
      window.location.href = '/all-in-one';
    }
  };

  return (
    <div className="aio-debug-banner" role="status" aria-label="Environment indicator">
      <span className="aio-debug-banner__label">
        AIO PREVIEW · {envLabel ?? 'STAGING'}
      </span>
      {isDemoMode() && (
        <>
          <Link to={aioPaths.office} className="aio-debug-banner__office-link">
            Enter Internal Demo →
          </Link>
          <Link to={aioPaths.portal} className="aio-debug-banner__office-link">
            Enter Demo Portal →
          </Link>
        </>
      )}
      {!isDemoMode() && (
        <Link to={aioPaths.login} className="aio-debug-banner__office-link">
          Sign In
        </Link>
      )}
      {canResetDemoData() && (
        <button type="button" className="aio-debug-banner__reset" onClick={handleReset}>
          Reset Demo Data
        </button>
      )}
      {setupWarning && (
        <span className="aio-debug-banner__warning" title={setupWarning}>
          Backend setup pending
        </span>
      )}
    </div>
  );
}
