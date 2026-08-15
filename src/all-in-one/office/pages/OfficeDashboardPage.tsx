import { getOfficeMetrics } from '../../demo/demoActions';
import { useDemoStore } from '../../demo/useDemoStore';
import { Link } from 'react-router-dom';
import { aioPaths } from '../../utils/paths';

export function OfficeDashboardPage() {
  const store = useDemoStore();
  const metrics = getOfficeMetrics();

  const docsToReview = store.documents.filter((d) => ['uploaded', 'under_review'].includes(d.status)).length;
  const renewalsDue = store.renewals.filter((r) => r.status !== 'completed' && r.status !== 'declined').length;
  const expiredItems = store.documents.filter((d) => d.isCurrent && d.expiresAt && new Date(d.expiresAt) < new Date()).length;
  const clientAction = store.documents.filter((d) => d.status === 'requested' || d.status === 'rejected').length;
  const todayDeadlines = store.deadlines.filter((d) => !d.complete && d.dueDate === new Date().toISOString().slice(0, 10)).length;

  const cards = [
    { label: 'Documents to Review', value: docsToReview, href: aioPaths.officeDocuments },
    { label: 'Renewals Due Soon', value: renewalsDue, href: aioPaths.officeRenewals },
    { label: 'Expired Items', value: expiredItems, href: aioPaths.officeDocuments },
    { label: 'Client Action Needed', value: clientAction, href: aioPaths.officeDocuments },
    { label: "Today's Deadlines", value: todayDeadlines, href: aioPaths.officeDeadlines },
    { label: 'New Requests', value: metrics.newRequests, href: aioPaths.officeRequests },
    { label: 'In Progress', value: metrics.inProgress, href: aioPaths.officeRequests },
    { label: 'Waiting on Client', value: metrics.waitingOnClient, href: aioPaths.officeRequests },
  ];

  const myTasks = store.tasks.filter((t) => t.assignedStaffId === 'staff-2' && t.status !== 'complete').slice(0, 5);

  return (
    <div className="aio-office-page">
      <header className="aio-office-page__header">
        <h1>TODAY AT ALL IN ONE</h1>
        <p>Vault · Calendar · Renewals · Notifications operational layer</p>
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
          <h2>Documents Awaiting Review</h2>
          {store.documents.filter((d) => ['uploaded', 'under_review'].includes(d.status)).slice(0, 5).map((d) => {
            const client = store.clients.find((c) => c.id === d.organizationId);
            return (
              <div key={d.id} className="aio-office-list-row">
                <span>{d.title} — {client?.companyName}</span>
                <Link to={aioPaths.officeDocuments}>Review</Link>
              </div>
            );
          })}
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
