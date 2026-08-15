import { getOfficeMetrics } from '../../demo/demoActions';
import { useDemoStore } from '../../demo/useDemoStore';
import { Link } from 'react-router-dom';
import { aioPaths } from '../../utils/paths';

export function OfficeDashboardPage() {
  const store = useDemoStore();
  const metrics = getOfficeMetrics();

  const cards = [
    { label: 'New Requests', value: metrics.newRequests, href: aioPaths.officeRequests },
    { label: 'In Progress', value: metrics.inProgress, href: aioPaths.officeRequests },
    { label: 'Waiting on Client', value: metrics.waitingOnClient, href: aioPaths.officeRequests },
    { label: 'Deadlines This Week', value: metrics.deadlinesThisWeek, href: aioPaths.officeDeadlines },
    { label: 'Documents Needed', value: metrics.documentsNeeded, href: aioPaths.officeDocuments },
    { label: 'Active Dispatch Loads', value: metrics.activeDispatchLoads, href: aioPaths.officeDispatch },
    { label: 'Factoring Reviews', value: metrics.factoringReviews, href: aioPaths.officeFactoring },
    { label: 'Brokerage Quotes', value: metrics.brokerageQuotes, href: aioPaths.officeBrokerage },
  ];

  const myTasks = store.tasks.filter((t) => t.assignedStaffId === 'staff-2' && t.status !== 'complete').slice(0, 5);

  const priorities = [
    { text: '3 permit requests approaching deadlines', action: 'View', href: aioPaths.officePermitting },
    { text: '2 clients still need insurance documents', action: 'Follow Up', href: aioPaths.officeDocuments },
    { text: '4 service requests waiting for staff assignment', action: 'Assign', href: aioPaths.officeRequests },
    { text: '1 factoring submission needs additional documents', action: 'View', href: aioPaths.officeFactoring },
    { text: '2 brokerage quote requests awaiting review', action: 'Review', href: aioPaths.officeBrokerage },
  ];

  return (
    <div className="aio-office-page">
      <header className="aio-office-page__header">
        <h1>TODAY AT ALL IN ONE</h1>
        <p>Operational command center · mock data</p>
      </header>

      <div className="aio-office-metrics">
        {cards.map((c) => (
          <Link key={c.label} to={c.href} className="aio-office-metric-card">
            <span className="aio-office-metric-card__value">{c.value}</span>
            <span className="aio-office-metric-card__label">{c.label}</span>
          </Link>
        ))}
      </div>

      <div className="aio-office-two-col">
        <section className="aio-office-panel">
          <h2>Today&apos;s Priorities</h2>
          <ul className="aio-office-priority-list">
            {priorities.map((p) => (
              <li key={p.text}>
                <span>{p.text}</span>
                <Link to={p.href}>{p.action}</Link>
              </li>
            ))}
          </ul>
        </section>

        <section className="aio-office-panel">
          <h2>My Tasks</h2>
          {myTasks.length === 0 ? (
            <p className="aio-empty-state__text">No open tasks assigned.</p>
          ) : (
            myTasks.map((t) => (
              <div key={t.id} className="aio-office-list-row">
                <span>{t.title}</span>
                <span className={`aio-badge aio-badge--${t.priority === 'urgent' ? 'alert' : 'progress'}`}>{t.priority}</span>
              </div>
            ))
          )}
          <Link to={aioPaths.officeTasks} className="aio-office-link">All tasks →</Link>
        </section>
      </div>

      <section className="aio-office-panel">
        <h2>Recent Activity</h2>
        <ul className="aio-office-activity">
          {store.activity.slice(0, 12).map((a) => (
            <li key={a.id}>
              <time>{new Date(a.createdAt).toLocaleString()}</time>
              <span>{a.title}</span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
