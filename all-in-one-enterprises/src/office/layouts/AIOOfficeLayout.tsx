import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { AIOLogo } from '../../components/AIOLogo';
import { aioPaths } from '../../utils/paths';
import { useDemoStore } from '../../demo/useDemoStore';
import { createTask } from '../../demo/demoActions';
import { searchBilling } from '../../demo/billingActions';
import { getCrmLeads } from '../../demo/crmActions';
import { setOfficeStaff } from '../../office-core/officeContext';
import { canEnterDemoOffice } from '../../config/dataMode';
import { isStagingDeployment } from '../../infrastructure/environmentModel';

const navGroups = [
  {
    label: 'Home',
    items: [{ label: 'Command Center', to: aioPaths.office }],
  },
  {
    label: 'Work',
    items: [
      { label: 'My Work', to: aioPaths.officeWork },
      { label: 'Queues', to: aioPaths.officeQueues },
      { label: 'Approvals', to: aioPaths.officeApprovals },
      { label: 'Escalations', to: aioPaths.officeEscalations },
    ],
  },
  {
    label: 'Growth',
    items: [
      { label: 'CRM', to: aioPaths.officeCrm },
      { label: 'Leads', to: aioPaths.officeCrmLeads },
      { label: 'Pipeline', to: aioPaths.officeCrmPipeline },
      { label: 'CRM Calendar', to: aioPaths.officeCrmCalendar },
    ],
  },
  {
    label: 'Clients',
    items: [
      { label: 'Customers', to: aioPaths.officeClients },
      { label: 'Road Ready', to: aioPaths.officeRoadReady },
    ],
  },
  {
    label: 'Services',
    items: [
      { label: 'Service Operations', to: aioPaths.officeServices },
      { label: 'Permitting & Compliance', to: aioPaths.officePermitting },
      { label: 'Insurance', to: aioPaths.officeInsurance },
      { label: 'Dispatch', to: aioPaths.officeDispatch },
      { label: 'Factoring', to: aioPaths.officeFactoring },
      { label: 'Bookkeeping', to: aioPaths.officeBookkeeping },
      { label: 'Brokerage', to: aioPaths.officeBrokerage },
    ],
  },
  {
    label: 'Operations',
    items: [
      { label: 'Workflows', to: aioPaths.officeWorkflows },
      { label: 'Workflow Health', to: aioPaths.officeWorkflowHealth },
      { label: 'Automation Exceptions', to: aioPaths.officeAutomationExceptions },
      { label: 'Loads', to: aioPaths.officeDispatchLoads },
      { label: 'Renewals', to: aioPaths.officeRenewals },
      { label: 'Document Review', to: aioPaths.officeDocumentsReview },
      { label: 'Compliance Calendar', to: aioPaths.officeDeadlines },
      { label: 'Legacy Documents', to: aioPaths.officeDocuments },
    ],
  },
  {
    label: 'Finance',
    items: [
      { label: 'Billing Desk', to: aioPaths.officeBilling },
      { label: 'Service Quotes', to: aioPaths.officeQuotes },
      { label: 'Service Invoices', to: aioPaths.officeInvoices },
      { label: 'Payments', to: aioPaths.officePayments },
      { label: 'Brokerage Finance', to: aioPaths.officeBrokerageFinance },
    ],
  },
  {
    label: 'Communication',
    items: [
      { label: 'Communications Hub', to: aioPaths.officeCommunications },
      { label: 'Appointments', to: aioPaths.officeAppointments },
      { label: 'Outbox', to: aioPaths.officeCommunicationsOutbox },
      { label: 'Legacy Inbox', to: aioPaths.officeInbox },
    ],
  },
  {
    label: 'Management',
    items: [
      { label: 'Command Center', to: aioPaths.officeManagement },
      { label: 'Financial', to: aioPaths.officeManagementFinancial },
      { label: 'Sales', to: aioPaths.officeManagementSales },
      { label: 'Services', to: aioPaths.officeManagementServices },
      { label: 'Reports', to: aioPaths.officeReports },
      { label: 'Data Quality', to: aioPaths.officeManagementDataQuality },
      { label: 'Mgmt Settings', to: aioPaths.officeManagementSettings },
      { label: 'Integrations', to: aioPaths.officeIntegrations },
      { label: 'Security Center', to: aioPaths.officeSecurity },
      { label: 'Privacy Center', to: aioPaths.officePrivacy },
      { label: 'Production Readiness', to: aioPaths.officeSecurityProductionReadiness },
      { label: 'Production Config', to: aioPaths.officeSystemProduction },
      { label: 'Launch Control', to: aioPaths.officeManagementLaunch },
      { label: 'Integration Settings', to: aioPaths.officeIntegrationsSettings },
      { label: 'Workflow Templates', to: aioPaths.officeWorkflowSettings },
      { label: 'Automation Rules', to: aioPaths.officeAutomationSettings },
      { label: 'Comm Settings', to: aioPaths.officeCommunicationsSettings },
      { label: 'Appointment Settings', to: aioPaths.officeAppointmentsSettings },
      { label: 'Team', to: aioPaths.officeTeam },
      { label: 'Workload', to: aioPaths.officeWorkload },
      { label: 'Activity', to: aioPaths.officeActivity },
      { label: 'Audit', to: aioPaths.officeAudit },
    ],
  },
];

export function AIOOfficeLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [quickOpen, setQuickOpen] = useState(false);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const store = useDemoStore();
  const navigate = useNavigate();
  const unread = store.notifications.filter((n) => !n.read).length;
  const staffId = store.officeStaffId ?? store.staff[0]?.id ?? 'staff-1';

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setPaletteOpen((o) => !o);
      }
      if (e.key === 'Escape') setPaletteOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const onSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const q = search.trim().toLowerCase();
    if (!q) return;
    const req = store.requests.find((r) => r.requestNumber.toLowerCase().includes(q));
    if (req) return navigate(aioPaths.officeRequest(req.id));
    const client = store.clients.find((c) => c.companyName.toLowerCase().includes(q) || c.contactEmail.toLowerCase().includes(q));
    if (client) return navigate(aioPaths.officeClient(client.id));
    const lead = getCrmLeads(store).find(
      (l) =>
        l.email?.toLowerCase().includes(q) ||
        l.phone?.includes(q) ||
        l.businessName?.toLowerCase().includes(q) ||
        `${l.firstName ?? ''} ${l.lastName ?? ''}`.toLowerCase().includes(q),
    );
    if (lead) return navigate(aioPaths.officeCrmLead(lead.id));
    const doc = store.documents.find((d) => d.id === q || (d.title ?? d.name ?? '').toLowerCase().includes(q));
    if (doc) return navigate(aioPaths.officeDocumentsReview);
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
      <a href="#aio-main-content" className="aio-skip-link">Skip to main content</a>
      <div className="aio-office-preview-bar" role="status">
        <span>
          {isStagingDeployment() ? 'STAGING · ' : ''}
          {canEnterDemoOffice() ? 'INTERNAL PREVIEW · ALL IN ONE OFFICE 2.0 · DEMO ONLY' : 'ALL IN ONE OFFICE · STAFF'}
        </span>
        {canEnterDemoOffice() && (
          <>
            <select
              className="aio-debug-banner__select"
              aria-label="Office staff identity"
              value={staffId}
              onChange={(e) => setOfficeStaff(e.target.value)}
            >
              {store.staff.map((s) => (
                <option key={s.id} value={s.id}>{s.name} — {s.role}</option>
              ))}
            </select>
            <Link to={aioPaths.home}>← Public Site</Link>
          </>
        )}
      </div>

      <div className="aio-office__shell">
        <aside className={`aio-office__sidebar ${sidebarOpen ? 'aio-office__sidebar--open' : ''}`} aria-label="Office navigation">
          <div className="aio-office__sidebar-brand">
            <AIOLogo />
            <span className="aio-office__sidebar-title">Office 2.0</span>
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

        <div className="aio-office__main" id="aio-main-content">
          <header className="aio-office__topbar">
            <button type="button" className="aio-office__menu-btn" onClick={() => setSidebarOpen((o) => !o)} aria-label="Toggle menu">
              Menu
            </button>
            <form className="aio-office__search" onSubmit={onSearch}>
              <label htmlFor="office-search" className="aio-sr-only">Search</label>
              <input
                id="office-search"
                type="search"
                placeholder="Search customers, USDOT, requests… (⌘K palette)"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </form>
            <div className="aio-office__topbar-actions">
              <button type="button" className="aio-office__notif-btn" aria-label={`${unread} notifications`} onClick={() => navigate(aioPaths.officeInbox)}>
                Inbox {unread > 0 && <span className="aio-office__notif-count">{unread}</span>}
              </button>
              <div className="aio-office__quick-create">
                <button type="button" className="aio-btn aio-btn--gold aio-btn--sm" onClick={() => setQuickOpen((o) => !o)}>+ New</button>
                {quickOpen && (
                  <div className="aio-office__quick-menu" role="menu">
                    <button type="button" onClick={() => { setQuickOpen(false); navigate(aioPaths.officeCrmLeads); }}>New Lead</button>
                    <button type="button" onClick={() => { setQuickOpen(false); navigate(aioPaths.officeCrm); }}>Log Call / Follow-Up</button>
                    <button type="button" onClick={() => { setQuickOpen(false); navigate(aioPaths.officeQuotes); }}>Prepare Quote</button>
                    <button type="button" onClick={() => { createTask({ title: 'Internal follow-up', priority: 'normal', status: 'open', category: 'General', assignedStaffId: staffId }); setQuickOpen(false); navigate(aioPaths.officeWork); }}>Internal Task</button>
                    <button type="button" onClick={() => { setQuickOpen(false); navigate(aioPaths.officeClients); }}>Customer</button>
                    <button type="button" onClick={() => { setQuickOpen(false); navigate(aioPaths.officeInbox); }}>Message</button>
                    <button type="button" onClick={() => { setQuickOpen(false); navigate(aioPaths.getStarted); }}>Service Request</button>
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

      {paletteOpen && (
        <div className="aio-oc-palette" role="dialog" aria-label="Command palette">
          <div className="aio-oc-palette__backdrop" onClick={() => setPaletteOpen(false)} />
          <div className="aio-oc-palette__panel">
            <input autoFocus type="search" placeholder="Jump to…" value={search} onChange={(e) => setSearch(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') { onSearch(e); setPaletteOpen(false); } }} />
            <nav>
              <button type="button" onClick={() => { navigate(aioPaths.officeCrm); setPaletteOpen(false); }}>CRM</button>
              <button type="button" onClick={() => { navigate(aioPaths.officeWork); setPaletteOpen(false); }}>My Work</button>
              <button type="button" onClick={() => { navigate(aioPaths.officeQueues); setPaletteOpen(false); }}>Queues</button>
              <button type="button" onClick={() => { navigate(aioPaths.officeClients); setPaletteOpen(false); }}>Clients</button>
              <button type="button" onClick={() => { navigate(aioPaths.officeInbox); setPaletteOpen(false); }}>Inbox</button>
            </nav>
          </div>
        </div>
      )}
    </div>
  );
}
