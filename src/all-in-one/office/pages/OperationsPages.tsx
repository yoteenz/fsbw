import { Link } from 'react-router-dom';
import { useDemoStore } from '../../demo/useDemoStore';
import { completeTask } from '../../demo/demoActions';
import { aioPaths } from '../../utils/paths';

export function TasksPage() {
  const store = useDemoStore();
  return (
    <div className="aio-office-page">
      <header className="aio-office-page__header"><h1>Tasks</h1></header>
      <div className="aio-office-table-wrap">
        <table className="aio-office-table">
          <thead>
            <tr><th>Task</th><th>Client</th><th>Assigned</th><th>Priority</th><th>Due</th><th>Status</th><th></th></tr>
          </thead>
          <tbody>
            {store.tasks.map((t) => {
              const client = store.clients.find((c) => c.id === t.clientId);
              const staff = store.staff.find((s) => s.id === t.assignedStaffId);
              return (
                <tr key={t.id}>
                  <td>{t.title}</td>
                  <td>{client ? <Link to={aioPaths.officeClient(client.id)}>{client.companyName}</Link> : '—'}</td>
                  <td>{staff?.name ?? '—'}</td>
                  <td>{t.priority}</td>
                  <td>{t.dueDate ?? '—'}</td>
                  <td>{t.status}</td>
                  <td>{t.status !== 'complete' && <button type="button" className="aio-btn aio-btn--sm aio-btn--gold" onClick={() => completeTask(t.id)}>Complete</button>}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function DeadlinesPage() {
  const store = useDemoStore();
  return (
    <div className="aio-office-page">
      <header className="aio-office-page__header"><h1>Deadlines</h1><p>Prototype compliance calendar · not legally authoritative</p></header>
      <div className="aio-office-table-wrap">
        <table className="aio-office-table">
          <thead><tr><th>Deadline</th><th>Client</th><th>Due</th><th>Severity</th><th>Category</th></tr></thead>
          <tbody>
            {store.deadlines.map((d) => {
              const client = store.clients.find((c) => c.id === d.clientId);
              return (
                <tr key={d.id}>
                  <td>{d.label}</td>
                  <td>{client?.companyName}</td>
                  <td>{d.dueDate}</td>
                  <td><span className={`aio-badge aio-badge--${d.severity.includes('overdue') || d.severity === 'due_today' ? 'alert' : 'progress'}`}>{d.severity.replace('_', ' ')}</span></td>
                  <td>{d.category}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function DocumentsPage() {
  const store = useDemoStore();
  return (
    <div className="aio-office-page">
      <header className="aio-office-page__header"><h1>Documents</h1><p>Metadata prototype — no file storage</p></header>
      <div className="aio-office-table-wrap">
        <table className="aio-office-table">
          <thead><tr><th>Document</th><th>Client</th><th>Category</th><th>Status</th><th>Requested</th><th>Received</th></tr></thead>
          <tbody>
            {store.documents.map((d) => {
              const client = store.clients.find((c) => c.id === d.clientId);
              return (
                <tr key={d.id}>
                  <td>{d.name}</td>
                  <td>{client?.companyName}</td>
                  <td>{d.category}</td>
                  <td>{d.status}</td>
                  <td>{d.requestedAt ? new Date(d.requestedAt).toLocaleDateString() : '—'}</td>
                  <td>{d.receivedAt ? new Date(d.receivedAt).toLocaleDateString() : '—'}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function MessagesPage() {
  const store = useDemoStore();
  const threads = store.clients.map((c) => {
    const msgs = store.messages.filter((m) => m.clientId === c.id);
    const last = msgs[0];
    return { client: c, last, unread: msgs.filter((m) => !m.read && m.from === 'customer').length };
  }).filter((t) => t.last);

  return (
    <div className="aio-office-page">
      <header className="aio-office-page__header"><h1>Messages</h1></header>
      {threads.map(({ client, last, unread }) => (
        <Link key={client.id} to={aioPaths.officeClient(client.id)} className="aio-office-list-row">
          <span>{client.companyName}</span>
          <span>{last?.body.slice(0, 60)}…</span>
          {unread > 0 && <span className="aio-badge aio-badge--alert">{unread} unread</span>}
        </Link>
      ))}
    </div>
  );
}
