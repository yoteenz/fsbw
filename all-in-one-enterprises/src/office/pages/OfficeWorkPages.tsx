import { useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useDemoStore } from '../../demo/useDemoStore';
import { assignWorkItem } from '../../demo/officeActions';
import { resolveOfficeStaffContext, hasOfficePermission } from '../../office-core/officeContext';
import {
  enrichWorkItem,
  getUnassignedWork,
  getWorkItemsForStaff,
  isActiveWorkStatus,
} from '../../office-core/officeWorkEngine';
import { filterMyWorkSections } from '../../office-core/officeCommandCenterService';
import { OfficeWorkList } from '../../components/OfficeCommandCenterComponents';
import { aioPaths } from '../../utils/paths';

export function OfficeMyWorkPage() {
  const store = useDemoStore();
  const ctx = resolveOfficeStaffContext(store);
  const [searchParams] = useSearchParams();
  const view = searchParams.get('view');
  const [assignError, setAssignError] = useState<string | null>(null);

  const allWork = useMemo(
    () => (store.officeWorkItems ?? []).map((w) => enrichWorkItem(w, store)),
    [store],
  );

  const myWork = useMemo(
    () => allWork.filter((w) => w.assignedUserId === ctx.staffId && isActiveWorkStatus(w.status)),
    [allWork, ctx.staffId],
  );

  const sections = filterMyWorkSections(myWork);

  if (view === 'waiting-on-us') {
    const items = allWork.filter((w) => w.waitingOn === 'all_in_one' && isActiveWorkStatus(w.status));
    return (
      <div className="aio-office-page">
        <header className="aio-office-page__header">
          <h1>Customers Waiting on Us</h1>
          <p>Work where All In One owes the next action.</p>
        </header>
        <OfficeWorkList title="Action Needed" items={items} />
      </div>
    );
  }

  if (view === 'waiting-on-customer') {
    const items = allWork.filter((w) => w.waitingOn === 'customer' && isActiveWorkStatus(w.status));
    return (
      <div className="aio-office-page">
        <header className="aio-office-page__header">
          <h1>Waiting on Customer</h1>
        </header>
        <OfficeWorkList title="Customer Dependency" items={items} />
      </div>
    );
  }

  if (view === 'waiting-externally') {
    const items = allWork.filter(
      (w) => ['external_provider', 'government', 'insurance_partner', 'factoring_provider', 'carrier', 'shipper'].includes(w.waitingOn) && isActiveWorkStatus(w.status),
    );
    return (
      <div className="aio-office-page">
        <header className="aio-office-page__header">
          <h1>Waiting Externally</h1>
        </header>
        <OfficeWorkList title="External Dependency" items={items} />
      </div>
    );
  }

  if (view === 'overdue') {
    const items = allWork.filter((w) => w.isOverdue);
    return (
      <div className="aio-office-page">
        <header className="aio-office-page__header"><h1>Overdue Work</h1></header>
        <OfficeWorkList title="Overdue" items={items} />
      </div>
    );
  }

  return (
    <div className="aio-office-page">
      <header className="aio-office-page__header">
        <h1>My Work</h1>
        <p>{ctx.staffName} · {myWork.length} open items</p>
      </header>

      {assignError && <p className="aio-oc-error" role="alert">{assignError}</p>}

      <OfficeWorkList title="Due Today" items={sections.dueToday} />
      <OfficeWorkList title="Overdue" items={sections.overdue} />
      <OfficeWorkList title="Upcoming" items={sections.upcoming} />
      <OfficeWorkList title="Waiting on Customer" items={sections.waitingOnCustomer} />
      <OfficeWorkList title="Waiting Externally" items={sections.waitingExternally} />
      <OfficeWorkList title="Ready for Review" items={sections.readyForReview} />

      {ctx.isManager && hasOfficePermission(ctx, 'work.assign') && (
        <section className="aio-oc-panel">
          <h2 className="aio-oc-panel__title">Unassigned</h2>
          <ul className="aio-oc-work-list">
            {getUnassignedWork(store).map((w) => {
              const item = enrichWorkItem(w, store);
              return (
                <li key={w.id} className="aio-oc-work-row">
                  <div>
                    <strong>{item.title}</strong>
                    <p>{item.organizationName} · {item.priority} · {Math.floor((Date.now() - new Date(item.createdAt).getTime()) / 86400000)}d old</p>
                  </div>
                  <button
                    type="button"
                    className="aio-btn aio-btn--gold aio-btn--sm"
                    onClick={() => {
                      const result = assignWorkItem(w.id, ctx.staffId, ctx.staffId, 'Self-assigned from My Work', w.version);
                      setAssignError(result.ok ? null : result.error ?? 'Assignment failed');
                    }}
                  >
                    Assign to me
                  </button>
                </li>
              );
            })}
          </ul>
          <Link to={`${aioPaths.officeQueues}?view=unassigned`} className="aio-office-link">Full unassigned queue →</Link>
        </section>
      )}
    </div>
  );
}

export function OfficeQueuesPage() {
  const store = useDemoStore();
  const ctx = resolveOfficeStaffContext(store);
  const [searchParams] = useSearchParams();
  const view = searchParams.get('view');
  const work = (store.officeWorkItems ?? []).map((w) => enrichWorkItem(w, store));

  const unassigned = work.filter((w) => !w.assignedUserId && isActiveWorkStatus(w.status));

  if (view === 'unassigned') {
    return (
      <div className="aio-office-page">
        <header className="aio-office-page__header">
          <h1>Unassigned Work</h1>
          <p>Items with no owner — assign before they slip through.</p>
        </header>
        <div className="aio-oc-table">
          <div className="aio-oc-table__head">
            <span>Customer</span><span>Task</span><span>Division</span><span>Age</span><span>Priority</span><span>Due</span><span />
          </div>
          {unassigned.map((w) => (
            <div key={w.id} className="aio-oc-table__row">
              <span>{w.organizationName}</span>
              <span>{w.title}</span>
              <span>{w.division.replace('_', ' ')}</span>
              <span>{w.ageDays}d</span>
              <span>{w.priority}</span>
              <span>{w.dueAt?.slice(0, 10) ?? '—'}</span>
              {hasOfficePermission(ctx, 'work.assign') && (
                <button type="button" className="aio-btn aio-btn--sm aio-btn--gold" onClick={() => assignWorkItem(w.id, ctx.staffId, ctx.staffId, 'Assigned from queue', w.version)}>
                  Assign
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  }

  const byQueue = new Map<string, typeof work>();
  for (const w of work.filter((item) => isActiveWorkStatus(item.status))) {
    const q = w.queueId ?? 'general';
    if (!byQueue.has(q)) byQueue.set(q, []);
    byQueue.get(q)!.push(w);
  }

  return (
    <div className="aio-office-page">
      <header className="aio-office-page__header">
        <h1>Operational Queues</h1>
        <p>Counts derive from live work state.</p>
      </header>
      {[...byQueue.entries()].map(([queueId, items]) => (
        <OfficeWorkList key={queueId} title={queueId.replace(/_/g, ' ').toUpperCase()} items={items} />
      ))}
      {ctx.isManager && (
        <Link to={`${aioPaths.officeQueues}?view=unassigned`} className="aio-btn aio-btn--outline-dark">
          Unassigned ({unassigned.length})
        </Link>
      )}
    </div>
  );
}

export function OfficeApprovalsPage() {
  const store = useDemoStore();
  const ctx = resolveOfficeStaffContext(store);
  const approvals = store.officeApprovals ?? [];

  return (
    <div className="aio-office-page">
      <header className="aio-office-page__header">
        <h1>Approvals</h1>
        <p>Protected actions awaiting review.</p>
      </header>
      {approvals.length === 0 ? (
        <p className="aio-empty-state__text">No approval requests.</p>
      ) : (
        approvals.map((a) => (
          <article key={a.id} className="aio-oc-panel">
            <h3>{a.title}</h3>
            <p>{a.reason}</p>
            <p className="aio-oc-meta">Status: {a.status} · Requested {new Date(a.requestedAt).toLocaleDateString()}</p>
            {a.status === 'pending' && hasOfficePermission(ctx, 'approvals.review') && (
              <div className="aio-oc-actions">
                <button type="button" className="aio-btn aio-btn--gold aio-btn--sm" onClick={() => import('../../demo/officeActions').then(({ reviewApproval }) => reviewApproval(a.id, 'approved', ctx.staffId))}>Approve</button>
                <button type="button" className="aio-btn aio-btn--outline-dark aio-btn--sm" onClick={() => import('../../demo/officeActions').then(({ reviewApproval }) => reviewApproval(a.id, 'rejected', ctx.staffId, 'Declined in demo'))}>Reject</button>
              </div>
            )}
          </article>
        ))
      )}
    </div>
  );
}

export function OfficeEscalationsPage() {
  const store = useDemoStore();
  const ctx = resolveOfficeStaffContext(store);
  const active = (store.officeEscalations ?? []).filter((e) => !e.resolvedAt);

  return (
    <div className="aio-office-page">
      <header className="aio-office-page__header">
        <h1>Escalations</h1>
      </header>
      {active.map((e) => {
        const client = store.clients.find((c) => c.id === e.organizationId);
        return (
          <article key={e.id} className={`aio-oc-panel aio-oc-escalation aio-oc-escalation--${e.level}`}>
            <h3>{e.level.toUpperCase()} — {client?.companyName}</h3>
            <p>{e.reason}</p>
            {!e.acknowledgedAt && (
              <button type="button" className="aio-btn aio-btn--gold aio-btn--sm" onClick={() => import('../../demo/officeActions').then(({ acknowledgeEscalation }) => acknowledgeEscalation(e.id, ctx.staffId))}>
                Acknowledge
              </button>
            )}
          </article>
        );
      })}
    </div>
  );
}

import { CANONICAL_SERVICE_CATALOG, SERVICE_DISCOVERY_CATEGORIES } from '../../services/catalog';

export function OfficeServicesPage() {
  const store = useDemoStore();
  const open = store.requests.filter((r) => !['completed', 'cancelled'].includes(r.status));
  const [serviceFilter, setServiceFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');

  const filtered = useMemo(() => {
    return open.filter((r) => {
      const slug = r.services[0]?.slug ?? '';
      if (serviceFilter !== 'all' && slug !== serviceFilter && r.division !== serviceFilter) return false;
      if (categoryFilter !== 'all') {
        const catalog = CANONICAL_SERVICE_CATALOG.find((c) => c.slug === slug);
        if (catalog && catalog.category !== categoryFilter && !catalog.discoveryCategories?.includes(categoryFilter as typeof catalog.category)) {
          return false;
        }
      }
      return true;
    });
  }, [open, serviceFilter, categoryFilter]);

  const sections: Record<string, typeof filtered> = {
    NEW: filtered.filter((r) => r.status === 'new_request'),
    'IN PROGRESS': filtered.filter((r) => ['in_progress', 'under_review', 'submitted'].includes(r.status)),
    'WAITING ON CUSTOMER': filtered.filter((r) => ['documents_needed', 'information_needed'].includes(r.status)),
    'WAITING EXTERNALLY': filtered.filter((r) => r.status === 'awaiting_agency'),
  };

  const serviceSlugs = [...new Set(CANONICAL_SERVICE_CATALOG.filter((s) => s.officeVisible).map((s) => s.slug))];

  return (
    <div className="aio-office-page">
      <header className="aio-office-page__header">
        <h1>Service Operations</h1>
        <p>Universal service queue — filter by service, category, status, and customer.</p>
      </header>
      <div className="aio-cc-filters" style={{ marginBottom: '1.5rem' }}>
        <select className="aio-input" value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} aria-label="Category filter">
          <option value="all">All categories</option>
          {SERVICE_DISCOVERY_CATEGORIES.map((c) => (
            <option key={c.id} value={c.id}>{c.title}</option>
          ))}
        </select>
        <select className="aio-input" value={serviceFilter} onChange={(e) => setServiceFilter(e.target.value)} aria-label="Service filter" style={{ marginLeft: '0.5rem' }}>
          <option value="all">All services</option>
          {serviceSlugs.map((slug) => (
            <option key={slug} value={slug}>{slug}</option>
          ))}
        </select>
      </div>
      {Object.entries(sections).map(([title, items]) => (
        <section key={title} className="aio-oc-panel">
          <h2 className="aio-oc-panel__title">{title} ({items.length})</h2>
          {items.map((r) => {
            const client = store.clients.find((c) => c.id === r.clientId);
            const staff = store.staff.find((s) => s.id === r.assignedStaffId);
            return (
              <Link key={r.id} to={aioPaths.officeRequest(r.id)} className="aio-office-list-row">
                <span>{client?.companyName} — {r.services[0]?.title ?? r.division}</span>
                <span>{staff?.name ?? 'Unassigned'} · {r.statusLabel}</span>
              </Link>
            );
          })}
        </section>
      ))}
    </div>
  );
}

export function OfficeDocumentReviewPage() {
  const store = useDemoStore();
  const queues = {
    'NEW UPLOADS': store.documents.filter((d) => d.status === 'uploaded'),
    'NEEDS REVIEW': store.documents.filter((d) => ['uploaded', 'under_review'].includes(d.status)),
    'NEEDS CUSTOMER CORRECTION': store.documents.filter((d) => d.status === 'rejected'),
    REQUESTED: store.documents.filter((d) => d.status === 'requested'),
  };

  return (
    <div className="aio-office-page">
      <header className="aio-office-page__header">
        <h1>Document Review Desk</h1>
      </header>
      {Object.entries(queues).map(([title, docs]) => (
        <section key={title} className="aio-oc-panel">
          <h2 className="aio-oc-panel__title">{title} ({docs.length})</h2>
          {docs.map((d) => {
            const client = store.clients.find((c) => c.id === (d.organizationId ?? d.clientId));
            return (
              <div key={d.id} className="aio-office-list-row">
                <span>{d.title ?? d.name} — {client?.companyName}</span>
                <span>{d.status} · {d.verificationStatus}</span>
              </div>
            );
          })}
        </section>
      ))}
    </div>
  );
}

export function OfficeInboxPage() {
  const store = useDemoStore();
  const conversations = store.messages.filter((m) => m.visibility === 'customer');

  return (
    <div className="aio-office-page">
      <header className="aio-office-page__header">
        <h1>Inbox</h1>
        <p>Customer conversations — reuse canonical messaging.</p>
      </header>
      {conversations.map((m) => {
        const client = store.clients.find((c) => c.id === m.clientId);
        return (
          <article key={m.id} className={`aio-oc-panel ${!m.read && m.from === 'customer' ? 'aio-oc-panel--unread' : ''}`}>
            <header className="aio-oc-inbox-header">
              <strong>{client?.companyName}</strong>
              <span>{m.from === 'customer' ? 'Customer' : 'Staff'} · {new Date(m.createdAt).toLocaleString()}</span>
            </header>
            <p>{m.body}</p>
            {!m.read && m.from === 'customer' && <span className="aio-badge aio-badge--alert">Unread</span>}
          </article>
        );
      })}
      <Link to={aioPaths.officeMessages} className="aio-office-link">Legacy messages view →</Link>
    </div>
  );
}

export function OfficeWorkloadPage() {
  const store = useDemoStore();
  const ctx = resolveOfficeStaffContext(store);
  if (!hasOfficePermission(ctx, 'workload.read')) {
    return <p className="aio-oc-error">You do not have permission to view workload.</p>;
  }

  return (
    <div className="aio-office-page">
      <header className="aio-office-page__header">
        <h1>Team Workload</h1>
        <p>Operational visibility — not productivity scoring.</p>
      </header>
      <div className="aio-oc-table">
        <div className="aio-oc-table__head">
          <span>Staff</span><span>Role</span><span>Open</span><span>Due Today</span><span>Overdue</span><span>Waiting</span><span>Status</span>
        </div>
        {store.staff.map((s) => {
          const items = getWorkItemsForStaff(store, s.id).map((w) => enrichWorkItem(w, store));
          return (
            <div key={s.id} className="aio-oc-table__row">
              <span>{s.name}</span>
              <span>{s.role}</span>
              <span>{items.length}</span>
              <span>{items.filter((w) => w.dueAt?.slice(0, 10) === new Date().toISOString().slice(0, 10)).length}</span>
              <span>{items.filter((w) => w.isOverdue).length}</span>
              <span>{items.filter((w) => w.waitingOn === 'customer').length}</span>
              <span>{s.status}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function OfficeActivityPage() {
  const store = useDemoStore();
  return (
    <div className="aio-office-page">
      <header className="aio-office-page__header"><h1>Activity</h1><p>Operational history — distinct from security audit.</p></header>
      <ul className="aio-office-activity">
        {store.activity.filter((a) => a.visibility === 'internal').map((a) => (
          <li key={a.id}><time>{new Date(a.createdAt).toLocaleString()}</time><span>{a.title}</span></li>
        ))}
      </ul>
    </div>
  );
}

export function OfficeAuditPage() {
  const store = useDemoStore();
  const ctx = resolveOfficeStaffContext(store);
  if (!hasOfficePermission(ctx, 'audit.read')) {
    return <p className="aio-oc-error">Audit view requires admin authorization.</p>;
  }
  const events = store.activity.filter((a) =>
    ['REQUEST_ASSIGNED', 'PAYMENT_SUCCEEDED', 'REFUND_REQUESTED', 'FACTORING_PROVIDER_CHANGED', 'INSURANCE_POLICY_UPDATED'].includes(a.kind),
  );
  return (
    <div className="aio-office-page">
      <header className="aio-office-page__header"><h1>Security Audit</h1><p>Immutable high-value events.</p></header>
      <ul className="aio-office-activity">
        {events.map((a) => (
          <li key={a.id}><time>{new Date(a.createdAt).toLocaleString()}</time><span>{a.kind}: {a.title}</span></li>
        ))}
      </ul>
    </div>
  );
}
