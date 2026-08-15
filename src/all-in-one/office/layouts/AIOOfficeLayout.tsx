import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { AIOLogo } from '../../components/AIOLogo';
import { aioPaths } from '../../utils/paths';
import { useDemoStore } from '../../demo/useDemoStore';
import { createTask } from '../../demo/demoActions';
import { searchBilling } from '../../demo/billingActions';

const navGroups = [
  {
    label: 'Home',
    items: [{ label: 'Overview', to: aioPaths.office }],
  },
  {
    label: 'Clients',
    items: [
      { label: 'Clients', to: aioPaths.officeClients },
      { label: 'Road Ready Queue', to: aioPaths.officeRoadReady },
    ],
  },
  {
    label: 'Service Operations',
    items: [
      { label: 'Requests', to: aioPaths.officeRequests },
      { label: 'Permitting & Compliance', to: aioPaths.officePermitting },
      { label: 'Business Formation', to: aioPaths.officeFormation },
      { label: 'Insurance', to: aioPaths.officeInsurance },
      { label: 'Dispatching', to: aioPaths.officeDispatch },
      { label: 'Factoring', to: aioPaths.officeFactoring },
      { label: 'Brokerage', to: aioPaths.officeBrokerage },
    ],
  },
  {
    label: 'Operations',
    items: [
      { label: 'Tasks', to: aioPaths.officeTasks },
      { label: 'Documents', to: aioPaths.officeDocuments },
      { label: 'Deadlines', to: aioPaths.officeDeadlines },
      { label: 'Renewals', to: aioPaths.officeRenewals },
      { label: 'Messages', to: aioPaths.officeMessages },
    ],
  },
  {
    label: 'Financial',
    items: [
      { label: 'Billing Center', to: aioPaths.officeBilling },
      { label: 'Quotes', to: aioPaths.officeQuotes },
      { label: 'Invoices', to: aioPaths.officeInvoices },
      { label: 'Payments', to: aioPaths.officePayments },
      { label: 'Pricing Settings', to: aioPaths.officePricingSettings },
    ],
  },
  {
    label: 'Management',
    items: [
      { label: 'Team', to: aioPaths.officeTeam },
      { label: 'Reports', to: aioPaths.officeReports },
    ],
  },
];

export function AIOOfficeLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [quickOpen, setQuickOpen] = useState(false);
  const store = useDemoStore();
  const navigate = useNavigate();
  const unread = store.notifications.filter((n) => !n.read).length;

  const onSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const q = search.trim().toLowerCase();
    if (!q) return;
    const req = store.requests.find((r) => r.requestNumber.toLowerCase().includes(q));
    if (req) return navigate(aioPaths.officeRequest(req.id));
    const client = store.clients.find((c) => c.companyName.toLowerCase().includes(q));
    if (client) return navigate(aioPaths.officeClient(client.id));
    const doc = store.documents.find((d) => d.id === q || (d.title ?? d.name ?? '').toLowerCase().includes(q));
    if (doc) return navigate(aioPaths.officeDocuments);
    const renewal = store.renewals.find((r) => r.id.toLowerCase().includes(q) || r.title.toLowerCase().includes(q));
    if (renewal) return navigate(aioPaths.officeRenewals);
    const load = store.loads.find((l) => l.loadNumber.toLowerCase().includes(q));
    if (load) return navigate(aioPaths.officeLoad(load.id));
    for (const hit of searchBilling(q, store)) {
      if (hit.type === 'quote') return navigate(aioPaths.officeQuote(hit.id));
      if (hit.type === 'invoice') return navigate(aioPaths.officeInvoice(hit.id));
      if (hit.type === 'receipt') return navigate(aioPaths.officeBilling);
    }
  };

  return (
    <div className="aio-app aio-office">
      <div className="aio-office-preview-bar" role="status">
        <span>INTERNAL PREVIEW · ALL IN ONE OFFICE · DEMO ONLY</span>
        <Link to={aioPaths.home}>← Public Site</Link>
      </div>

      <div className="aio-office__shell">
        <aside className={`aio-office__sidebar ${sidebarOpen ? 'aio-office__sidebar--open' : ''}`} aria-label="Office navigation">
          <div className="aio-office__sidebar-brand">
            <AIOLogo />
            <span className="aio-office__sidebar-title">Office</span>
          </div>
          <nav>
            {navGroups.map((group) => (
              <div key={group.label} className="aio-office__nav-group">
                <p className="aio-office__nav-group-label">{group.label}</p>
                {group.items.map((item) => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    end={item.to === aioPaths.office}
                    className={({ isActive }) => `aio-office__nav-link ${isActive ? 'aio-office__nav-link--active' : ''}`}
                    onClick={() => setSidebarOpen(false)}
                  >
                    {item.label}
                  </NavLink>
                ))}
              </div>
            ))}
          </nav>
        </aside>

        <div className="aio-office__main">
          <header className="aio-office__topbar">
            <button type="button" className="aio-office__menu-btn" onClick={() => setSidebarOpen((o) => !o)} aria-label="Toggle menu">
              Menu
            </button>
            <form className="aio-office__search" onSubmit={onSearch}>
              <label htmlFor="office-search" className="aio-sr-only">
                Search
              </label>
              <input
                id="office-search"
                type="search"
                placeholder="Search clients, requests, quotes, invoices…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </form>
            <div className="aio-office__topbar-actions">
              <button type="button" className="aio-office__notif-btn" aria-label={`${unread} notifications`}>
                Notifications {unread > 0 && <span className="aio-office__notif-count">{unread}</span>}
              </button>
              <div className="aio-office__quick-create">
                <button type="button" className="aio-btn aio-btn--gold aio-btn--sm" onClick={() => setQuickOpen((o) => !o)}>
                  + New
                </button>
                {quickOpen && (
                  <div className="aio-office__quick-menu" role="menu">
                    <button type="button" onClick={() => { createTask({ title: 'New follow-up task', priority: 'normal', status: 'open', category: 'General' }); setQuickOpen(false); navigate(aioPaths.officeTasks); }}>New Task</button>
                    <button type="button" onClick={() => { setQuickOpen(false); navigate(aioPaths.officeClients); }}>New Client</button>
                    <button type="button" onClick={() => { setQuickOpen(false); navigate(aioPaths.getStarted); }}>New Service Request (via intake)</button>
                  </div>
                )}
              </div>
            </div>
          </header>
          <div className="aio-office__content">
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  );
}
