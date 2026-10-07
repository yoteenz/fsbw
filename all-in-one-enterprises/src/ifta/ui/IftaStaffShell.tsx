import { Link, Outlet, useParams } from 'react-router-dom';
import { useDemoStore } from '../../demo/useDemoStore';
import { aioPaths } from '../../utils/paths';
import { companyName, orgHasIftaWorkspace, quartersForOrg } from '../iftaRouteHelpers';
import { IftaWorkspaceShell } from './IftaWorkspaceShell';
import { useIftaAuthorityScale } from './iftaScale';
import { shortName } from './iftaViewModel';
import './ifta-ui.css';

const STAFF_WORKSPACES = ['IFTA', 'Bookkeeping', 'Dispatch'] as const;

/** AIO OFFICE · IFTA workspace — the approved staff chrome; client + workspace switching live in the avatar menu. */
export function IftaStaffShell() {
  useIftaAuthorityScale('staff');
  const store = useDemoStore();
  const { clientId } = useParams<{ clientId?: string }>();
  // On the cross-client queue no client is selected; inside a case the case's client is.
  const selectedClient = clientId ?? store.clients.find((c) => orgHasIftaWorkspace(store, c.id))?.id ?? 'client-c';
  const clientLabel = companyName(store, selectedClient);
  const iftaActive = orgHasIftaWorkspace(store, selectedClient);
  const staffId = store.officeStaffId ?? store.staff[0]?.id;
  const staff = store.staff.find((s) => s.id === staffId);
  const iftaClients = store.clients.filter((c) => orgHasIftaWorkspace(store, c.id));

  return (
    <div className="ifta-root ifta-root--light ifta-root--staff">
      <IftaWorkspaceShell
        actor="staff"
        homeTo={aioPaths.office}
        homeLabel="AIO Office"
        person={shortName(staff?.name ?? 'AIO Staff')}
        role="AIO Staff"
        menu={[
          { items: [{ id: 'who', label: staff?.name ?? 'AIO staff', detail: 'AIO Office · IFTA workspace' }] },
          {
            title: 'Client',
            items: [
              { id: 'queue', label: 'All clients · fuel tax queue', to: aioPaths.officeWorkspaceIfta, current: !clientId },
              ...iftaClients.map((c) => {
                const q = quartersForOrg(store, c.id)[0];
                return { id: c.id, label: c.companyName, to: q ? aioPaths.officeWorkspaceIftaCase(c.id, `${q.year}-Q${q.quarter}`) : aioPaths.officeWorkspaceIfta, current: c.id === clientId };
              }),
            ],
          },
          { title: 'Workspace', items: STAFF_WORKSPACES.map((w) => ({ id: w, label: w, current: w === 'IFTA', disabled: w !== 'IFTA', to: w === 'IFTA' ? aioPaths.officeWorkspaceIfta : undefined })) },
          { items: [{ id: 'office', label: 'Office home', to: aioPaths.office }] },
        ]}
      >
        <main className="ifta-main">
          {!iftaActive && (
            <div className="ifta-frame">
              <div className="ifta-notice ifta-notice--block">
                <strong>Workspace not active for this client</strong>
                <p>{clientLabel} does not have IFTA filing active.</p>
                <Link to={aioPaths.officeWorkspaceIfta} className="ifta-btn ifta-btn--ghost">
                  Return to fuel tax queue
                </Link>
              </div>
            </div>
          )}
          {iftaActive && <Outlet context={{ selectedClientId: selectedClient }} />}
        </main>
      </IftaWorkspaceShell>
    </div>
  );
}
