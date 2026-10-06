import { Link, Outlet, useNavigate, useParams } from 'react-router-dom';
import { useDemoStore } from '../../demo/useDemoStore';
import { aioPaths } from '../../utils/paths';
import { companyName, orgHasIftaWorkspace, quartersForOrg } from '../iftaRouteHelpers';
import { IftaMark } from './IftaMark';
import './ifta-ui.css';

const STAFF_WORKSPACES = ['IFTA', 'Bookkeeping', 'Dispatch'] as const;

export function IftaStaffShell() {
  const store = useDemoStore();
  const navigate = useNavigate();
  const { clientId } = useParams<{ clientId?: string }>();
  const selectedClient = clientId ?? store.clients.find((c) => orgHasIftaWorkspace(store, c.id))?.id ?? 'client-c';
  const clientLabel = companyName(store, selectedClient);
  const iftaActive = orgHasIftaWorkspace(store, selectedClient);

  return (
    <div className="ifta-root ifta-root--light">
      <header className="ifta-tight-nav">
        <IftaMark to={aioPaths.office} label="AIO Office" />
        <div className="ifta-tight-nav__links">
          <span style={{ fontWeight: 700 }}>IFTA workspace</span>
          <label>
            <span className="visually-hidden">Client</span>
            <select
              className="ifta-select"
              value={selectedClient}
              onChange={(e) => {
                const id = e.target.value;
                const q = quartersForOrg(store, id)[0];
                if (q) navigate(aioPaths.officeWorkspaceIftaCase(id, `${q.year}-Q${q.quarter}`));
                else navigate(aioPaths.officeWorkspaceIfta);
              }}
            >
              {store.clients.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.companyName}
                </option>
              ))}
            </select>
          </label>
          <label>
            <span className="visually-hidden">Workspace</span>
            <select className="ifta-select" defaultValue="IFTA" aria-label="Workspace">
              {STAFF_WORKSPACES.map((w) => (
                <option key={w} value={w}>
                  {w}
                </option>
              ))}
            </select>
          </label>
          <Link to={aioPaths.office}>Office home</Link>
        </div>
      </header>
      <main className="ifta-main">
        {!iftaActive && (
          <div className="ifta-empty">
            <strong>Workspace not active for this client</strong>
            <p>{clientLabel} does not have IFTA filing active.</p>
          </div>
        )}
        {iftaActive && <Outlet context={{ selectedClientId: selectedClient }} />}
      </main>
    </div>
  );
}
