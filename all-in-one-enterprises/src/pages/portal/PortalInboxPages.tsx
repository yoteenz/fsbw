import { Link, Outlet, useLocation } from 'react-router-dom';
import { aioPaths } from '../../utils/paths';

const INBOX_TABS = [
  { label: 'Messages', href: aioPaths.portalInboxMessages },
  { label: 'Notifications', href: aioPaths.portalInboxNotifications },
  { label: 'Appointments', href: aioPaths.portalInboxAppointments },
];

export function PortalInboxLayout() {
  const location = useLocation();

  return (
    <div className="aio-cc-page">
      <header className="aio-cc-panel">
        <h1>INBOX</h1>
        <p className="aio-cc-page__lead">Messages, notifications, and appointments — one container (F17).</p>
        <nav className="aio-portal-inbox-tabs" aria-label="Inbox sections">
          {INBOX_TABS.map((tab) => (
            <Link
              key={tab.href}
              to={tab.href}
              className={location.pathname.startsWith(tab.href) ? 'is-active' : ''}
            >
              {tab.label}
            </Link>
          ))}
        </nav>
      </header>
      <Outlet />
    </div>
  );
}

export function PortalInboxHubPage() {
  return (
    <div className="aio-cc-page">
      <h1>INBOX</h1>
      <p>Select a section: Messages, Notifications, or Appointments.</p>
      <ul>
        <li><Link to={aioPaths.portalInboxMessages}>Messages</Link></li>
        <li><Link to={aioPaths.portalInboxNotifications}>Notifications</Link></li>
        <li><Link to={aioPaths.portalInboxAppointments}>Appointments</Link></li>
      </ul>
    </div>
  );
}
