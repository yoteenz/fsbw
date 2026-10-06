import { Link, Outlet } from 'react-router-dom';
import { useDemoStore } from '../../demo/useDemoStore';
import { resolvePortalContext, setPortalOrganization } from '../../portal/organizationContext';
import { aioPaths } from '../../utils/paths';
import { canEnterDemoOffice } from '../../config/dataMode';
import { orgHasIftaWorkspace } from '../iftaRouteHelpers';
import { IftaIcon } from './IftaIcon';
import { IftaLockup, IftaMark } from './IftaMark';
import { IftaAvatar } from './IftaModules';
import { initials } from './iftaViewModel';
import './ifta-ui.css';

/** CLIENT OFFICE workspace states for this client (NOT_APPLICABLE is never surfaced to the client). */
const CLIENT_WORKSPACES = [
  { id: 'ifta', label: 'IFTA filing', state: 'ACTIVE' as const },
  { id: 'bookkeeping', label: 'Bookkeeping', state: 'AVAILABLE_NOT_ACTIVATED' as const },
  { id: 'dispatch', label: 'Dispatch', state: 'NOT_APPLICABLE' as const },
];

/** CLIENT OFFICE · IFTA workspace shell — fixed client, light premium Filing Room chrome (no legacy portal chrome). */
export function IftaClientShell() {
  const store = useDemoStore();
  const ctx = resolvePortalContext(store);
  const hasIfta = orgHasIftaWorkspace(store, ctx.organizationId);
  const role = store.portalMemberRole ?? 'owner';
  const workspaces = CLIENT_WORKSPACES.filter((w) => w.state !== 'NOT_APPLICABLE');

  return (
    <div className="ifta-root ifta-root--light ifta-root--client">
      <header className="ifta-topbar">
        <div className="ifta-topbar__inner">
          <IftaMark to={aioPaths.portal} label="My Office home" surface="light" />
          <nav className="ifta-wsbar" aria-label="Workspace switcher">
            {workspaces.map((w) => (
              <span key={w.id} className={`ifta-ws ${w.state === 'ACTIVE' ? 'ifta-ws--active' : 'ifta-ws--available'}`} aria-current={w.state === 'ACTIVE' ? 'page' : undefined}>
                {w.label}
                {w.state === 'AVAILABLE_NOT_ACTIVATED' ? <span className="ifta-ws__state">Available</span> : null}
              </span>
            ))}
          </nav>
          <div className="ifta-topbar__right">
            <Link to={aioPaths.portalMessages} className="ifta-iconlink" aria-label="Messages">
              <IftaIcon name="message" size={20} />
              <span className="ifta-iconlink__label">Messages</span>
            </Link>
            <Link to={aioPaths.portal} className="ifta-iconlink" aria-label="My Office">
              <IftaIcon name="building" size={20} />
              <span className="ifta-iconlink__label">My Office</span>
            </Link>
            <IftaAvatar initials={initials(ctx.companyName)} name={ctx.companyName} role={`Client · ${role}`} />
          </div>
        </div>
      </header>

      <main className="ifta-main">
        {!hasIfta && canEnterDemoOffice() && (
          <div className="ifta-frame">
            <div className="ifta-notice">
              <IftaIcon name="info" size={22} />
              <p>
                Demo IFTA data is on Pioneer Fleet.{' '}
                <button type="button" onClick={() => setPortalOrganization('client-c')}>
                  Switch to Pioneer Fleet
                </button>{' '}
                to view the filing room.
              </p>
            </div>
          </div>
        )}
        {!hasIfta && !canEnterDemoOffice() && (
          <div className="ifta-frame">
            <div className="ifta-notice ifta-notice--block">
              <strong>Workspace not active</strong>
              <p>IFTA filing is not set up for this account yet.</p>
              <Link to={aioPaths.getStartedForService('ifta-filing')} className="ifta-btn ifta-btn--gold">
                Request filing
                <IftaIcon name="arrow" size={16} />
              </Link>
            </div>
          </div>
        )}
        {hasIfta && <Outlet />}
      </main>

      <footer className="ifta-footer ifta-footer--light">
        <IftaLockup surface="light" tagline="Data · Compliance · Real progress" />
      </footer>
    </div>
  );
}
