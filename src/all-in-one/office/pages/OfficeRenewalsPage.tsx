import { Link } from 'react-router-dom';
import { useMemo, useState } from 'react';
import { useDemoStore } from '../../demo/useDemoStore';
import { daysUntil, formatDaysRemaining } from '../../calendar/calendarService';
import { aioPaths } from '../../utils/paths';

export function OfficeRenewalsPage() {
  const store = useDemoStore();
  const [statusFilter, setStatusFilter] = useState('');

  const renewals = useMemo(() => {
    let list = [...store.renewals].sort((a, b) => a.expirationDate.localeCompare(b.expirationDate));
    if (statusFilter) list = list.filter((r) => r.status === statusFilter);
    return list;
  }, [store.renewals, statusFilter]);

  const batch = useMemo(() => {
    const irpNextMonth = store.renewals.filter((r) => r.renewalType === 'irp' && daysUntil(r.expirationDate) <= 45 && r.status !== 'completed').length;
    const insurance30 = store.renewals.filter((r) => r.renewalType === 'insurance' && daysUntil(r.expirationDate) <= 30 && r.status !== 'completed').length;
    const missingReg = store.documents.filter((d) => d.status === 'requested' && d.category === 'registration').length;
    return { irpNextMonth, insurance30, missingReg };
  }, [store.renewals, store.documents]);

  return (
    <div className="aio-office-page">
      <header className="aio-office-page__header">
        <h1>Renewal Center</h1>
        <p>Operational renewal pipeline · demo data</p>
      </header>

      <section className="aio-office-panel aio-office-batch">
        <h2>Batch View</h2>
        <ul className="aio-office-priority-list">
          <li><span>{batch.irpNextMonth} IRP renewals due within ~45 days</span></li>
          <li><span>{batch.insurance30} insurance expirations within 30 days</span></li>
          <li><span>{batch.missingReg} clients missing updated registrations (requested)</span></li>
        </ul>
      </section>

      <div className="aio-office-toolbar">
        <select className="aio-intake-input" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} aria-label="Filter by status">
          <option value="">All statuses</option>
          <option value="available">Available</option>
          <option value="in_progress">In Progress</option>
          <option value="self_managed">Self-Managed</option>
          <option value="completed">Completed</option>
        </select>
      </div>

      <div className="aio-office-table-wrap">
        <table className="aio-office-table">
          <thead>
            <tr>
              <th>Client</th>
              <th>Renewal</th>
              <th>Expiration</th>
              <th>Days</th>
              <th>Status</th>
              <th>Request</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {renewals.map((r) => {
              const client = store.clients.find((c) => c.id === r.organizationId);
              return (
                <tr key={r.id}>
                  <td>{client ? <Link to={aioPaths.officeClient(client.id)}>{client.companyName}</Link> : r.organizationId}</td>
                  <td>{r.title}{r.vehicleLabel ? ` · ${r.vehicleLabel}` : ''}</td>
                  <td>{r.expirationDate}</td>
                  <td>{formatDaysRemaining(r.expirationDate)}</td>
                  <td><span className="aio-badge aio-badge--progress">{r.status.replace(/_/g, ' ')}</span></td>
                  <td>{r.serviceRequestId ? <Link to={aioPaths.officeRequest(r.serviceRequestId)}>View</Link> : '—'}</td>
                  <td><Link to={aioPaths.officeClient(r.organizationId)}>Client 360</Link></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
