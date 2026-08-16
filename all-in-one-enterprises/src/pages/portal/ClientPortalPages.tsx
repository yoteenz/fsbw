import { Link } from 'react-router-dom';
import { useMemo, useState } from 'react';
import { useDemoStore } from '../../demo/useDemoStore';
import { useClientCommandCenter } from '../../portal/useClientCommandCenter';
import { getOrganizationMembers, clientTypeDisplay } from '../../portal/clientCommandCenterService';
import { getRoadReadyProfile } from '../../demo/roadReadyActions';
import { getActivePolicy } from '../../demo/insuranceActions';
import { getPortalRequests } from '../../demo/demoActions';
import type { ServiceRequest } from '../../demo/demoTypes';
import { getVaultDocuments } from '../../demo/vaultActions';
import {
  BackToCommandCenter,
  BusinessHealthGrid,
  CommandCenterHeader,
  MoneySummaryCards,
} from '../../components/CommandCenterComponents';
import { aioPaths } from '../../utils/paths';
import { ROAD_READY_PRODUCT_NAME } from '../../road-ready/roadReadyConfig';
import type { ActiveServiceView, OrganizationMemberView } from '../../portal/clientCommandCenterTypes';
import type { VaultDocument } from '../../vault/vaultTypes';
import type { InsurancePolicy } from '../../insurance/insuranceTypes';
import type { Load } from '../../dispatch/dispatchTypes';
import type { ActivityEvent } from '../../demo/demoTypes';

export function BusinessProfilePage() {
  const view = useClientCommandCenter();
  const store = useDemoStore();
  const orgId = view.context.organizationId;
  const profile = getRoadReadyProfile(orgId, store);
  const policy = getActivePolicy(orgId, store);

  return (
    <div className="aio-cc-page">
      <BackToCommandCenter />
      <h1>My Business</h1>
      <p className="aio-cc-page__lead">Consolidated company profile — {clientTypeDisplay(view.context)}</p>

      <section className="aio-cc-panel">
        <h2>Company Profile</h2>
        <dl className="aio-dl-grid">
          <dt>Legal Name</dt><dd>{profile?.business.legalName ?? view.context.companyName}</dd>
          <dt>DBA</dt><dd>{profile?.business.dba ?? '—'}</dd>
          <dt>Entity Type</dt><dd>{profile?.business.structure ?? '—'}</dd>
          <dt>Primary State</dt><dd>{profile?.business.primaryOperatingState ?? '—'}</dd>
          <dt>USDOT</dt><dd>{profile?.authority.usdotNumber ?? '—'} {profile?.authority.usdot === 'yes' ? '· SELF REPORTED' : ''}</dd>
          <dt>MC</dt><dd>{profile?.authority.mcNumber ?? '—'}</dd>
          <dt>Contact</dt><dd>{profile?.business.phone ?? '—'} · {profile?.business.email ?? '—'}</dd>
          <dt>Road Ready</dt><dd>{view.roadReady ? `${view.roadReady.setupProgress}% setup` : 'N/A'}</dd>
          <dt>Insurance</dt><dd>{policy ? `${policy.carrierName} · ${policy.status}` : 'No policy on file'}</dd>
        </dl>
        <Link to={aioPaths.roadReady} className="aio-btn aio-btn--outline aio-btn--sm">Edit via {ROAD_READY_PRODUCT_NAME}</Link>
      </section>

      <section className="aio-cc-panel">
        <h2>My All In One Services</h2>
        <ul className="aio-cc-services-list">
          {view.activeServices.map((s: ActiveServiceView) => (
            <li key={s.id}>
              <strong>{s.name}</strong>
              <span className={`aio-badge aio-badge--${s.tone === 'active' ? 'complete' : 'progress'}`}>{s.statusLabel}</span>
              {s.href && <Link to={s.href}>Open →</Link>}
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

export function BusinessSummaryPage() {
  const view = useClientCommandCenter();
  return (
    <div className="aio-cc-page aio-cc-page--print">
      <BackToCommandCenter />
      <h1>Business Summary</h1>
      <p>For your records — not a certificate of compliance.</p>
      <CommandCenterHeader view={view} />
      <BusinessHealthGrid view={view} />
      <MoneySummaryCards view={view} />
      <section className="aio-cc-panel">
        <h2>Open Requests</h2>
        <p>{view.activeRequestCount} active service request(s)</p>
      </section>
    </div>
  );
}

export function OperationsCenterPage() {
  const view = useClientCommandCenter();
  const ops = view.operations;

  if (view.context.isShipper) {
    return (
      <div className="aio-cc-page">
        <BackToCommandCenter />
        <h1>Operations</h1>
        <p>Shipper operations are managed in the Shipper Portal.</p>
        <Link to={aioPaths.shipper} className="aio-btn aio-btn--gold">Open Shipper Portal</Link>
      </div>
    );
  }

  return (
    <div className="aio-cc-page">
      <BackToCommandCenter />
      <h1>Operations</h1>
      {!ops?.hasDispatch ? (
        <p className="aio-empty-state__text">Dispatch is available when enrolled. <Link to={aioPaths.portalDispatch}>Learn about Dispatch →</Link></p>
      ) : (
        <>
          {ops.currentLoad && (
            <section className="aio-cc-load-hero">
              <h2>{ops.currentLoad.origin} → {ops.currentLoad.destination}</h2>
              <p>{ops.currentLoad.statusLabel} · {ops.currentLoad.deliveryLabel}</p>
              <Link to={ops.currentLoad.href} className="aio-btn aio-btn--gold">View Load</Link>
            </section>
          )}
          <div className="aio-cc-health-grid">
            <div className="aio-cc-health-card"><span>Active Loads</span><strong>{ops.activeLoadCount}</strong></div>
            <div className="aio-cc-health-card"><span>Needs Attention</span><strong>{ops.loadsNeedingAttention}</strong></div>
            <div className="aio-cc-health-card"><span>Factoring Ready</span><strong>{ops.factoringHandoffReady}</strong></div>
          </div>
          <Link to={aioPaths.portalDispatch} className="aio-btn aio-btn--outline">Dispatch Home →</Link>
          <Link to={aioPaths.portalBrokerage} className="aio-btn aio-btn--outline">Brokerage →</Link>
        </>
      )}
    </div>
  );
}

export function MoneyCenterPage() {
  const view = useClientCommandCenter();

  if (!view.context.canViewFullMoney && view.context.memberRole === 'driver') {
    return (
      <div className="aio-cc-page">
        <BackToCommandCenter />
        <h1>Money</h1>
        <p>Financial summaries are not available for your role.</p>
      </div>
    );
  }

  return (
    <div className="aio-cc-page">
      <BackToCommandCenter />
      <h1>Money</h1>
      <p className="aio-cc-page__lead">Financial domains are shown separately — totals are never combined.</p>
      <MoneySummaryCards view={view} />
      <section className="aio-cc-panel">
        <h2>All In One Billing</h2>
        <Link to={aioPaths.portalBilling}>Invoices &amp; Payments →</Link>
        <Link to={aioPaths.portalQuotes}>Quotes →</Link>
      </section>
      {view.money?.showFreightReceivables && (
        <section className="aio-cc-panel">
          <h2>Freight Receivables</h2>
          <Link to={aioPaths.portalFactoring}>Factoring &amp; Freight Invoices →</Link>
        </section>
      )}
      {view.money?.showBrokeragePayables && (
        <section className="aio-cc-panel">
          <h2>Brokerage Payments</h2>
          <Link to={aioPaths.portalBrokeragePayments}>Carrier Payables →</Link>
        </section>
      )}
    </div>
  );
}

export function DocumentCenterPage() {
  const view = useClientCommandCenter();
  const d = view.documents;
  return (
    <div className="aio-cc-page">
      <BackToCommandCenter />
      <h1>Documents</h1>
      <div className="aio-cc-health-grid">
        <div className="aio-cc-health-card"><span>Needed</span><strong>{d.needed}</strong></div>
        <div className="aio-cc-health-card"><span>Under Review</span><strong>{d.underReview}</strong></div>
        <div className="aio-cc-health-card"><span>Verified</span><strong>{d.verified}</strong></div>
        <div className="aio-cc-health-card"><span>Expiring</span><strong>{d.expiring}</strong></div>
      </div>
      {d.requestedItems.length > 0 && (
        <section className="aio-cc-panel">
          <h2>Requested Documents</h2>
          {d.requestedItems.map((item: { id: string; title: string; neededFor: string[]; href: string }) => (
            <div key={item.id} className="aio-portal-list__item">
              <span>{item.title}<br /><small>Needed for: {item.neededFor.join(', ')}</small></span>
              <Link to={item.href} className="aio-btn aio-btn--sm aio-btn--gold">Upload</Link>
            </div>
          ))}
        </section>
      )}
      <Link to={aioPaths.portalVault} className="aio-btn aio-btn--gold">Open Vault</Link>
    </div>
  );
}

export function CommunicationHubPage() {
  const view = useClientCommandCenter();
  const c = view.communication;
  return (
    <div className="aio-cc-page">
      <BackToCommandCenter />
      <h1>Communication</h1>
      <div className="aio-cc-health-grid">
        <div className="aio-cc-health-card"><span>Unread Messages</span><strong>{c.unreadMessages}</strong></div>
        <div className="aio-cc-health-card"><span>Notifications</span><strong>{c.unreadNotifications}</strong></div>
      </div>
      <section className="aio-cc-panel">
        <h2>Recent Conversations</h2>
        {c.recentThreads.length === 0 ? (
          <p className="aio-empty-state__text">No active conversation threads.</p>
        ) : (
          c.recentThreads.map((t: { id: string; title: string; context: string; href: string }) => (
            <Link key={t.id} to={t.href} className="aio-portal-request-card">
              <div><strong>{t.title}</strong><br /><small>{t.context}</small></div>
            </Link>
          ))
        )}
      </section>
      <Link to={aioPaths.portalMessages} className="aio-btn aio-btn--gold">Open Messages</Link>
      <Link to={aioPaths.portalAppointments} className="aio-btn aio-btn--outline">Appointments</Link>
    </div>
  );
}

export function ServiceRequestsCenterPage() {
  const view = useClientCommandCenter();
  const requests: ServiceRequest[] = getPortalRequests(view.context.organizationId);
  const groups = {
    new: requests.filter((r) => r.status === 'new_request'),
    inProgress: requests.filter((r) => ['in_progress', 'under_review'].includes(r.status)),
    waitingYou: requests.filter((r) => r.status === 'documents_needed'),
    waitingAio: requests.filter((r) => ['assigned', 'pending_review'].includes(r.status)),
    completed: requests.filter((r) => r.status === 'completed'),
  };

  return (
    <div className="aio-cc-page">
      <BackToCommandCenter />
      <h1>Service Requests</h1>
      {(['new', 'inProgress', 'waitingYou', 'waitingAio', 'completed'] as const).map((key) => {
        const list = groups[key];
        if (!list.length) return null;
        const title = { new: 'New', inProgress: 'In Progress', waitingYou: 'Waiting On You', waitingAio: 'Waiting On All In One', completed: 'Completed' }[key];
        return (
          <section key={key} className="aio-cc-panel">
            <h2>{title}</h2>
            {list.map((req: ServiceRequest) => (
              <Link key={req.id} to={aioPaths.portalRequest(req.id)} className="aio-portal-request-card">
                <div><strong>{req.services.map((s: { title: string }) => s.title).join(' + ')}</strong><br /><small>{req.requestNumber}</small></div>
                <span className="aio-badge aio-badge--progress">{req.statusLabel}</span>
              </Link>
            ))}
          </section>
        );
      })}
      <Link to={aioPaths.servicePlan} className="aio-btn aio-btn--gold">Request Service</Link>
    </div>
  );
}

export function ServicesCenterPage() {
  const view = useClientCommandCenter();
  const grouped = {
    'Road Ready': view.activeServices.filter((s) => s.id.includes('road') || s.name.toLowerCase().includes('road')),
    Compliance: view.activeServices.filter((s) => s.name.toLowerCase().includes('permit') || s.name.toLowerCase().includes('compliance')),
    Operations: view.activeServices.filter((s) => ['dispatch', 'insurance', 'factoring', 'brokerage'].includes(s.id)),
    Financial: view.activeServices.filter((s) => s.id === 'bookkeeping' || s.name.toLowerCase().includes('bookkeeping')),
  };
  const shown = view.activeServices;

  return (
    <div className="aio-cc-page">
      <BackToCommandCenter />
      <h1>My Services</h1>
      <section className="aio-cc-panel">
        <h2>Active &amp; In Progress</h2>
        <ul className="aio-cc-services-list">
          {shown.map((s: ActiveServiceView) => (
            <li key={s.id}>
              <strong>{s.name}</strong>
              <span className={`aio-badge aio-badge--${s.tone === 'active' ? 'complete' : 'progress'}`}>{s.statusLabel}</span>
              {s.href && <Link to={s.href}>Open →</Link>}
            </li>
          ))}
        </ul>
      </section>
      {Object.entries(grouped).map(([label, items]) =>
        items.length > 0 ? (
          <section key={label} className="aio-cc-panel">
            <h2>{label}</h2>
            <ul className="aio-cc-services-list">
              {items.map((s) => (
                <li key={s.id}>
                  <strong>{s.name}</strong>
                  <span className={`aio-badge aio-badge--${s.tone === 'active' ? 'complete' : 'progress'}`}>{s.statusLabel}</span>
                </li>
              ))}
            </ul>
          </section>
        ) : null,
      )}
      <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginTop: '1rem' }}>
        <Link to={aioPaths.services} className="aio-btn aio-btn--outline">Browse All Services →</Link>
        <Link to={aioPaths.servicesFind} className="aio-btn aio-btn--gold">Find a Service</Link>
      </div>
    </div>
  );
}

export function ActivityTimelinePage() {
  const view = useClientCommandCenter();
  const store = useDemoStore();
  const [filter, setFilter] = useState('all');
  const events = useMemo(() => {
    const all = store.activity.filter((a: ActivityEvent) => a.visibility === 'customer' || a.clientId === view.context.organizationId);
    if (filter === 'all') return all;
    return all.filter((a: ActivityEvent) => a.kind.toLowerCase().includes(filter));
  }, [store.activity, view.context.organizationId, filter]);

  return (
    <div className="aio-cc-page">
      <BackToCommandCenter />
      <h1>Business Activity</h1>
      <div className="aio-cc-filters">
        {['all', 'document', 'insurance', 'dispatch', 'invoice', 'road'].map((f) => (
          <button key={f} type="button" className={`aio-btn aio-btn--sm ${filter === f ? 'aio-btn--gold' : 'aio-btn--outline'}`} onClick={() => setFilter(f)}>
            {f === 'all' ? 'All' : f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>
      {events.map((a: ActivityEvent) => (
        <div key={a.id} className="aio-portal-list__item">
          <span>{a.title}</span>
          <small>{new Date(a.createdAt).toLocaleString()}</small>
        </div>
      ))}
    </div>
  );
}

export function TeamPage() {
  const view = useClientCommandCenter();
  const store = useDemoStore();
  const members = getOrganizationMembers(view.context.organizationId, store);
  return (
    <div className="aio-cc-page">
      <BackToCommandCenter />
      <h1>Team</h1>
      <table className="aio-office-table">
        <thead><tr><th>Name</th><th>Role</th><th>Status</th><th>Email</th></tr></thead>
        <tbody>
          {members.map((m: OrganizationMemberView) => (
            <tr key={m.id}>
              <td>{m.name}</td>
              <td>{m.roleLabel}</td>
              <td>{m.status}</td>
              <td>{m.email}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function PortalSearchPage() {
  const view = useClientCommandCenter();
  const store = useDemoStore();
  const orgId = view.context.organizationId;
  const [q, setQ] = useState('');
  const results = useMemo(() => {
    if (!q.trim()) return [];
    const term = q.toLowerCase();
    const out: { group: string; title: string; href: string }[] = [];
    getVaultDocuments(orgId, store).forEach((d: VaultDocument) => {
      if (d.title.toLowerCase().includes(term)) out.push({ group: 'Documents', title: d.title, href: aioPaths.portalVaultDocument(d.id) });
    });
    store.loads.filter((l: Load) => l.organizationId === orgId).forEach((l: Load) => {
      if (l.loadNumber.toLowerCase().includes(term) || l.originCity.toLowerCase().includes(term)) {
        out.push({ group: 'Loads', title: l.loadNumber, href: aioPaths.portalDispatchLoad(l.id) });
      }
    });
    store.insurancePolicies.filter((p: InsurancePolicy) => p.organizationId === orgId).forEach((p: InsurancePolicy) => {
      if (p.carrierName.toLowerCase().includes(term)) out.push({ group: 'Insurance', title: p.carrierName, href: aioPaths.portalInsurancePolicy(p.id) });
    });
    return out;
  }, [q, orgId, store]);

  return (
    <div className="aio-cc-page">
      <BackToCommandCenter />
      <h1>Search</h1>
      <input className="aio-input" placeholder="Search documents, loads, insurance…" value={q} onChange={(e) => setQ(e.target.value)} />
      {results.map((r, i) => (
        <Link key={i} to={r.href} className="aio-portal-list__item">{r.group}: {r.title}</Link>
      ))}
    </div>
  );
}
