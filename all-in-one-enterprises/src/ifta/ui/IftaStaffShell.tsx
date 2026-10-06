import { Link, Outlet, useNavigate, useParams } from 'react-router-dom';
import { useDemoStore } from '../../demo/useDemoStore';
import { aioPaths } from '../../utils/paths';
import { companyName, orgHasIftaWorkspace, quartersForOrg } from '../iftaRouteHelpers';
import { IftaIcon } from './IftaIcon';
import { IftaLockup, IftaMark } from './IftaMark';
import { IftaAvatar } from './IftaModules';
import './ifta-ui.css';

const STAFF_WORKSPACES = ['IFTA', 'Bookkeeping', 'Dispatch'] as const;
const ALL_CLIENTS = '__queue__';

/** AIO OFFICE · IFTA workspace shell — client and workspace switch independently; light internal command chrome. */
export function IftaStaffShell() {
  const store = useDemoStore();
  const navigate = useNavigate();
  const { clientId } = useParams<{ clientId?: string }>();
  // On the cross-client queue no client is selected; inside a case the case's client is.
  const selectedClient = clientId ?? store.clients.find((c) => orgHasIftaWorkspace(store, c.id))?.id ?? 'client-c';
  const clientLabel = companyName(store, selectedClient);
  const iftaActive = orgHasIftaWorkspace(store, selectedClient);

  return (
    <div className="ifta-root ifta-root--light ifta-root--staff">
      <header className="ifta-topbar ifta-topbar--staff">
        <div className="ifta-topbar__inner">
          <IftaMark to={aioPaths.office} label="AIO Office" surface="light" />
          <span className="ifta-topbar__place">
            <span className="ifta-topbar__env">AIO Office</span>
            <span className="ifta-topbar__ws">IFTA workspace</span>
          </span>
          <div className="ifta-switchers">
            <label className="ifta-switch">
              <span className="ifta-switch__label">Client</span>
              <select
                className="ifta-switch__select"
                value={clientId ?? ALL_CLIENTS}
                onChange={(e) => {
                  const id = e.target.value;
                  if (id === ALL_CLIENTS) return navigate(aioPaths.officeWorkspaceIfta);
                  const q = quartersForOrg(store, id)[0];
                  if (q) navigate(aioPaths.officeWorkspaceIftaCase(id, `${q.year}-Q${q.quarter}`));
                  else navigate(aioPaths.officeWorkspaceIfta);
                }}
              >
                <option value={ALL_CLIENTS}>All clients · fuel tax queue</option>
                {store.clients.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.companyName}
                  </option>
                ))}
              </select>
            </label>
            <label className="ifta-switch">
              <span className="ifta-switch__label">Workspace</span>
              <select className="ifta-switch__select" defaultValue="IFTA" aria-label="Workspace">
                {STAFF_WORKSPACES.map((w) => (
                  <option key={w} value={w}>
                    {w}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <div className="ifta-topbar__right">
            <Link to={aioPaths.office} className="ifta-iconlink" aria-label="Office home">
              <IftaIcon name="building" size={20} />
              <span className="ifta-iconlink__label">Office home</span>
            </Link>
            <IftaAvatar initials="AIO" name="AIO team" role="AIO staff" />
          </div>
        </div>
      </header>
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
      <footer className="ifta-footer ifta-footer--light">
        <IftaLockup surface="light" tagline="Operations · Compliance · Client success" />
      </footer>
    </div>
  );
}
