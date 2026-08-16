import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useDemoStore } from '../../demo/useDemoStore';
import { aioPaths } from '../../utils/paths';
import { BOARD_COLUMNS, boardColumnForStep } from '../workflows/workflowEngine';
import { updateRequestStatus } from '../../demo/demoActions';

export function RequestsListPage() {
  const store = useDemoStore();
  const [view, setView] = useState<'table' | 'board'>('table');
  const [division, setDivision] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const filtered = useMemo(
    () =>
      store.requests.filter((r) => {
        if (division && r.division !== division) return false;
        if (statusFilter && r.status !== statusFilter) return false;
        return true;
      }),
    [store.requests, division, statusFilter],
  );

  return (
    <div className="aio-office-page">
      <header className="aio-office-page__header">
        <h1>Service Requests</h1>
        <p>Operations center · {filtered.length} requests</p>
      </header>

      <div className="aio-office-filters">
        <select value={division} onChange={(e) => setDivision(e.target.value)} aria-label="Division filter">
          <option value="">All divisions</option>
          <option value="permitting">Permitting</option>
          <option value="business-formation">Formation</option>
          <option value="insurance">Insurance</option>
          <option value="dispatching">Dispatch</option>
          <option value="factoring">Factoring</option>
          <option value="brokerage">Brokerage</option>
        </select>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} aria-label="Status filter">
          <option value="">All statuses</option>
          <option value="new_request">New</option>
          <option value="documents_needed">Documents Needed</option>
          <option value="in_progress">In Progress</option>
        </select>
        <div className="aio-office-view-toggle">
          <button type="button" className={view === 'table' ? 'active' : ''} onClick={() => setView('table')}>Table</button>
          <button type="button" className={view === 'board' ? 'active' : ''} onClick={() => setView('board')}>Board</button>
        </div>
      </div>

      {view === 'table' ? (
        <div className="aio-office-table-wrap">
          <table className="aio-office-table">
            <thead>
              <tr>
                <th>Request #</th>
                <th>Client</th>
                <th>Service</th>
                <th>Division</th>
                <th>Status</th>
                <th>Priority</th>
                <th>Assigned</th>
                <th>Created</th>
                <th>Next Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((r) => {
                const client = store.clients.find((c) => c.id === r.clientId);
                const staff = store.staff.find((s) => s.id === r.assignedStaffId);
                return (
                  <tr key={r.id}>
                    <td><Link to={aioPaths.officeRequest(r.id)}>{r.requestNumber}</Link></td>
                    <td>{client?.companyName}</td>
                    <td>{r.services.map((s) => s.title).join(' + ')}</td>
                    <td>{r.division}</td>
                    <td><span className="aio-badge aio-badge--progress">{r.statusLabel}</span></td>
                    <td>{r.priority}</td>
                    <td>{staff?.initials ?? '—'}</td>
                    <td>{new Date(r.createdAt).toLocaleDateString()}</td>
                    <td>{r.nextStep}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="aio-office-board">
          {BOARD_COLUMNS.map((col) => (
            <div key={col} className="aio-office-board__col">
              <h3>{col}</h3>
              {filtered
                .filter((r) => boardColumnForStep(r.division, r.workflowStep) === col)
                .map((r) => (
                  <div key={r.id} className="aio-office-board__card">
                    <Link to={aioPaths.officeRequest(r.id)}>{r.requestNumber}</Link>
                    <p>{r.services[0]?.title}</p>
                    <select
                      aria-label="Change status"
                      value={r.workflowStep}
                      onChange={(e) => updateRequestStatus(r.id, e.target.value, 'staff-2')}
                    >
                      {['new_request', 'documents_needed', 'under_review', 'in_progress', 'submitted', 'completed'].map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </div>
                ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
