import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useDemoStore } from '../../demo/useDemoStore';
import { getOfficeRoadReadyQueue } from '../../demo/roadReadyActions';
import { aioPaths } from '../../utils/paths';

type Filter = 'all' | 'needs_review' | 'expiring' | 'incomplete' | 'high_attention';

export function OfficeRoadReadyQueuePage() {
  const store = useDemoStore();
  const [filter, setFilter] = useState<Filter>('all');
  const queue = useMemo(() => getOfficeRoadReadyQueue(store), [store]);

  const filtered = queue.filter((row) => {
    if (filter === 'needs_review') return row.needsReview > 0;
    if (filter === 'expiring') return row.expiring > 0;
    if (filter === 'incomplete') return row.incompleteOnboarding;
    if (filter === 'high_attention') return row.actionNeeded >= 2;
    return true;
  });

  return (
    <div className="aio-office-page aio-office-road-ready">
      <header className="aio-office-page-header">
        <h1>Road Ready Queue</h1>
        <p>Clients with setup progress, verification needs, and onboarding status.</p>
      </header>

      <div className="aio-office-filters" role="tablist" aria-label="Queue filters">
        {([
          ['all', 'All Clients'],
          ['needs_review', 'Needs Review'],
          ['expiring', 'Expiring Soon'],
          ['incomplete', 'Incomplete Onboarding'],
          ['high_attention', 'High Attention'],
        ] as const).map(([key, label]) => (
          <button
            key={key}
            type="button"
            role="tab"
            aria-selected={filter === key}
            className={filter === key ? 'aio-office-filters__active' : ''}
            onClick={() => setFilter(key)}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="aio-office-table-wrap">
        <table className="aio-office-table">
          <thead>
            <tr>
              <th>Client</th>
              <th>Setup</th>
              <th>Verified</th>
              <th>Review</th>
              <th>Attention</th>
              <th>Requests</th>
              <th>Specialist</th>
              <th>Last Updated</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {filtered.map((row) => {
              const staff = store.staff.find((s) => s.id === row.assignedStaffId);
              return (
                <tr key={row.client.id}>
                  <td>
                    <strong>{row.client.companyName}</strong>
                    {row.incompleteOnboarding && (
                      <span className="aio-badge aio-badge--needed">Onboarding {row.onboardingProgress}%</span>
                    )}
                  </td>
                  <td>{row.setupProgress}%</td>
                  <td>{row.verifiedProgress}%</td>
                  <td>{row.needsReview}</td>
                  <td>{row.actionNeeded}</td>
                  <td>{row.openRequests}</td>
                  <td>{staff?.name ?? '—'}</td>
                  <td>{new Date(row.lastUpdated).toLocaleDateString()}</td>
                  <td>
                    <Link to={aioPaths.officeClientRoadReady(row.client.id)} className="aio-office-link">
                      Review →
                    </Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
