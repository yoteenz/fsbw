import { Link } from 'react-router-dom';
import { isDemoMode } from '../../config/dataMode';
import { aioPaths } from '../../utils/paths';

/** Compact demo utility — only shown in demo/preview environments. */
export function DemoPortalAccess() {
  if (!isDemoMode()) return null;

  return (
    <aside className="aio-auth-premium__demo" aria-label="Demo environment access">
      <div className="aio-auth-premium__demo-inner">
        <span className="aio-auth-premium__demo-icon" aria-hidden="true">
          ◆
        </span>
        <div className="aio-auth-premium__demo-body">
          <p className="aio-auth-premium__demo-label">Demo Environment</p>
          <p className="aio-auth-premium__demo-copy">Preview the client portal without creating an account.</p>
        </div>
        <Link to={aioPaths.portal} className="aio-auth-premium__demo-link">
          Enter Demo Portal →
        </Link>
      </div>
    </aside>
  );
}
