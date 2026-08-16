import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useDemoStore } from '../../demo/useDemoStore';
import { aioPaths } from '../../utils/paths';

const TYPE_LABELS: Record<string, string> = {
  owner_operator: 'Owner Operator',
  carrier: 'Carrier',
  fleet: 'Fleet',
  shipper: 'Shipper',
};

export function ClientsListPage() {
  const store = useDemoStore();
  const [query, setQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('');

  const filtered = useMemo(() => {
    return store.clients.filter((c) => {
      if (typeFilter && c.clientType !== typeFilter) return false;
      if (!query) return true;
      const q = query.toLowerCase();
      return c.companyName.toLowerCase().includes(q) || c.contactName.toLowerCase().includes(q);
    });
  }, [store.clients, query, typeFilter]);

  return (
    <div className="aio-office-page">
      <header className="aio-office-page__header">
        <h1>Clients</h1>
        <p>CRM · {filtered.length} clients</p>
      </header>

      <div className="aio-office-filters">
        <input type="search" placeholder="Search clients…" value={query} onChange={(e) => setQuery(e.target.value)} aria-label="Search clients" />
        <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} aria-label="Filter by type">
          <option value="">All types</option>
          <option value="owner_operator">Owner Operator</option>
          <option value="carrier">Carrier</option>
          <option value="fleet">Fleet</option>
          <option value="shipper">Shipper</option>
        </select>
      </div>

      <div className="aio-office-table-wrap">
        <table className="aio-office-table">
          <thead>
            <tr>
              <th>Client / Company</th>
              <th>Contact</th>
              <th>Type</th>
              <th>State</th>
              <th>Roadmap</th>
              <th>Requests</th>
              <th>Docs</th>
              <th>Staff</th>
              <th>Last Activity</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((c) => {
              const staff = store.staff.find((s) => s.id === c.assignedStaffId);
              return (
                <tr key={c.id}>
                  <td><Link to={aioPaths.officeClient(c.id)}>{c.companyName}</Link></td>
                  <td>{c.contactName}</td>
                  <td>{TYPE_LABELS[c.clientType]}</td>
                  <td>{c.primaryState}</td>
                  <td>{c.roadmapProgress}%</td>
                  <td>{c.activeRequestCount}</td>
                  <td>{c.documentsNeededCount}</td>
                  <td>{staff?.initials ?? '—'}</td>
                  <td>{new Date(c.lastActivityAt).toLocaleDateString()}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
