import { Link, Outlet } from 'react-router-dom';
import { useDemoStore } from '../../demo/useDemoStore';
import { resolvePortalContext } from '../../portal/organizationContext';
import { setPortalOrganization } from '../../portal/organizationContext';
import { aioPaths } from '../../utils/paths';
import { canEnterDemoOffice } from '../../config/dataMode';
import { orgHasIftaWorkspace } from '../iftaRouteHelpers';
import { IftaMark } from './IftaMark';
import './ifta-ui.css';

const CLIENT_WORKSPACES = [
  { id: 'ifta', label: 'IFTA filing', state: 'ACTIVE' as const },
  { id: 'bookkeeping', label: 'Bookkeeping', state: 'AVAILABLE_NOT_ACTIVATED' as const },
  { id: 'dispatch', label: 'Dispatch', state: 'NOT_APPLICABLE' as const },
];

export function IftaClientShell() {
  const store = useDemoStore();
  const ctx = resolvePortalContext(store);
  const hasIfta = orgHasIftaWorkspace(store, ctx.organizationId);
  return (
    <div className="ifta-root ifta-root--light">
      <header className="ifta-tight-nav">
        <IftaMark to={aioPaths.portal} label="My Office home" />
        <div className="ifta-tight-nav__links">
          <span style={{ fontWeight: 600, letterSpacing: '0.04em' }}>{ctx.companyName}</span>
          <Link to={aioPaths.portalMessages}>Messages</Link>
          <Link to={aioPaths.portal}>My Office</Link>
        </div>
      </header>
      <main className="ifta-main">
        <div className="ifta-workspace-bar" aria-label="Workspace switcher">
          {CLIENT_WORKSPACES.map((w) => (
            <span
              key={w.id}
              className={`ifta-workspace-chip ${w.id === 'ifta' ? 'ifta-workspace-chip--active' : 'ifta-workspace-chip--muted'}`}
            >
              {w.label}
              {w.state === 'AVAILABLE_NOT_ACTIVATED' ? ' · available' : w.state === 'NOT_APPLICABLE' ? ' · n/a' : ''}
            </span>
          ))}
        </div>
        {!hasIfta && canEnterDemoOffice() && (
          <div className="ifta-demo-hint">
            Demo IFTA data is on Pioneer Fleet.{' '}
            <button type="button" onClick={() => setPortalOrganization('client-c')}>
              Switch to Pioneer Fleet
            </button>{' '}
            to view the filing room.
          </div>
        )}
        {!hasIfta && !canEnterDemoOffice() && (
          <div className="ifta-empty">
            <strong>Workspace not active</strong>
            <p>IFTA filing is not set up for this account yet.</p>
            <Link to={aioPaths.getStartedForService('ifta-filing')} className="ifta-cta">
              Request filing
            </Link>
          </div>
        )}
        {hasIfta && <Outlet />}
      </main>
    </div>
  );
}
