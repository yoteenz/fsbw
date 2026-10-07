import { Link, Outlet } from 'react-router-dom';
import { useDemoStore } from '../../demo/useDemoStore';
import { resolvePortalContext, setPortalOrganization } from '../../portal/organizationContext';
import { aioPaths } from '../../utils/paths';
import { canEnterDemoOffice } from '../../config/dataMode';
import { orgHasIftaWorkspace } from '../iftaRouteHelpers';
import { IftaIcon } from './IftaIcon';
import { IftaWorkspaceShell } from './IftaWorkspaceShell';
import { useIftaAuthorityScale } from './iftaScale';
import { shortName } from './iftaViewModel';
import './ifta-ui.css';

/** CLIENT OFFICE workspace states for this client (NOT_APPLICABLE is never surfaced to the client). */
const CLIENT_WORKSPACES = [
  { id: 'ifta', label: 'IFTA filing', state: 'ACTIVE' as const },
  { id: 'bookkeeping', label: 'Bookkeeping', state: 'AVAILABLE_NOT_ACTIVATED' as const },
  { id: 'dispatch', label: 'Dispatch', state: 'NOT_APPLICABLE' as const },
];

/** CLIENT OFFICE · IFTA workspace — the approved client chrome (mark · search · notifications · avatar chip). */
export function IftaClientShell() {
  useIftaAuthorityScale('client');
  const store = useDemoStore();
  const ctx = resolvePortalContext(store);
  const hasIfta = orgHasIftaWorkspace(store, ctx.organizationId);
  const role = store.portalMemberRole ?? 'owner';
  const person = shortName(ctx.contactName ?? ctx.companyName);

  return (
    <div className="ifta-root ifta-root--light ifta-root--client">
      <IftaWorkspaceShell
        actor="client"
        homeTo={aioPaths.portal}
        homeLabel="My Office home"
        person={person}
        role="Client"
        menu={[
          { items: [{ id: 'who', label: ctx.contactName ?? ctx.companyName, detail: `${ctx.companyName} · ${role}` }] },
          {
            title: 'Workspaces',
            items: CLIENT_WORKSPACES.filter((w) => w.state !== 'NOT_APPLICABLE').map((w) =>
              w.state === 'ACTIVE'
                ? { id: w.id, label: w.label, detail: 'Active', to: aioPaths.portalWorkspaceIfta, current: true }
                : { id: w.id, label: w.label, detail: 'Available', disabled: true },
            ),
          },
          {
            items: [
              { id: 'messages', label: 'Messages', to: aioPaths.portalMessages },
              { id: 'office', label: 'My Office', to: aioPaths.portal },
            ],
          },
        ]}
      >
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
      </IftaWorkspaceShell>
    </div>
  );
}
