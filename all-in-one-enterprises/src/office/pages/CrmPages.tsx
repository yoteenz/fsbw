import { Link, useParams } from 'react-router-dom';
import { useMemo, useState } from 'react';
import { useDemoStore } from '../../demo/useDemoStore';
import {
  addLeadNote,
  completeFollowUp,
  convertLead,
  createOpportunity,
  createQuoteFromOpportunity,
  findDuplicateMatches,
  getConversionPreview,
  getCrmMetrics,
  getDueFollowUps,
  getLead,
  getLeadActivities,
  getLeadInterests,
  getLeadOpportunities,
  getCrmLeads,
  logCall,
  mergeLeads,
  moveOpportunityStage,
  recordQuoteSent,
  updateLeadStatus,
} from '../../demo/crmActions';
import { CRM_LEAD_STATUS_LABELS } from '../../crm/crmTypes';
import { formatMoney } from '../../billing/money';
import { getQuote, getQuoteVersion } from '../../demo/billingActions';
import { getUpcomingAppointments } from '../../demo/appointmentActions';
import { aioPaths } from '../../utils/paths';
import { hasOfficePermission, resolveOfficeStaffContext } from '../../office-core/officeContext';

export function CrmHomePage() {
  const metrics = getCrmMetrics();
  const followUps = getDueFollowUps();

  return (
    <div className="aio-office-page">
      <header className="aio-office-page__header">
        <h1>CRM</h1>
        <p>Lead pipeline and sales — front door to the operating system (DEMO).</p>
      </header>
      <div className="aio-metrics-grid">
        {Object.entries(metrics).map(([k, v]) => (
          <div key={k} className="aio-metric-card">
            <div className="aio-metric-card__value">{v}</div>
            <div className="aio-metric-card__label">{k.replace(/([A-Z])/g, ' $1')}</div>
          </div>
        ))}
      </div>
      <div className="aio-two-col">
        <div className="aio-portal-panel">
          <h2 className="aio-portal-panel__title">Follow Up Today</h2>
          <ul className="aio-list">
            {followUps.map((f) => (
              <li key={f.id}>
                <Link to={aioPaths.officeCrmLead(f.leadId)}>{f.purpose}</Link>
                <button type="button" className="aio-btn aio-btn--sm" onClick={() => completeFollowUp(f.id)}>Done</button>
              </li>
            ))}
            {followUps.length === 0 && <li className="aio-muted">No follow-ups due.</li>}
          </ul>
        </div>
        <div className="aio-portal-panel">
          <h2 className="aio-portal-panel__title">Quick Links</h2>
          <div className="aio-inline-actions">
            <Link to={aioPaths.officeCrmLeads} className="aio-btn aio-btn--outline">All Leads</Link>
            <Link to={aioPaths.officeCrmPipeline} className="aio-btn aio-btn--outline">Pipeline</Link>
            <Link to={aioPaths.officeCrmReports} className="aio-btn aio-btn--outline">Reports</Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export function CrmLeadsListPage() {
  const [filter, setFilter] = useState('all');
  const leads = useMemo(() => {
    const all = getCrmLeads();
    if (filter === 'all') return all;
    return all.filter((l) => l.status === filter);
  }, [filter]);

  return (
    <div className="aio-office-page">
      <header className="aio-office-page__header">
        <h1>Leads</h1>
        <Link to={aioPaths.officeCrm} className="aio-portal-back">← CRM</Link>
      </header>
      <div className="aio-filter-row">
        {['all', 'new', 'qualifying', 'qualified', 'nurturing', 'converted', 'lost', 'do_not_contact'].map((f) => (
          <button key={f} type="button" className={`aio-chip ${filter === f ? 'aio-chip--active' : ''}`} onClick={() => setFilter(f)}>
            {f === 'all' ? 'All' : CRM_LEAD_STATUS_LABELS[f as keyof typeof CRM_LEAD_STATUS_LABELS] ?? f}
          </button>
        ))}
      </div>
      <div className="aio-table-wrap">
        <table className="aio-table">
          <thead><tr><th>Name</th><th>Business</th><th>Status</th><th>Source</th><th>Assigned</th><th /></tr></thead>
          <tbody>
            {leads.map((l) => (
              <tr key={l.id}>
                <td>{l.firstName} {l.lastName}</td>
                <td>{l.businessName ?? '—'}</td>
                <td>{CRM_LEAD_STATUS_LABELS[l.status]}</td>
                <td>{l.leadSourceId}</td>
                <td>{l.assignedUserId ?? '—'}</td>
                <td><Link to={aioPaths.officeCrmLead(l.id)}>Open</Link></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function CrmLeadDetailPage() {
  const { leadId } = useParams<{ leadId: string }>();
  const store = useDemoStore();
  const ctx = resolveOfficeStaffContext(store);
  const lead = leadId ? getLead(leadId, store) : undefined;
  const [note, setNote] = useState('');
  const [convertMsg, setConvertMsg] = useState<string | null>(null);

  if (!lead) {
    return <div className="aio-office-page"><h1>Lead not found</h1></div>;
  }

  const interests = getLeadInterests(lead.id, store);
  const opps = getLeadOpportunities(lead.id, store);
  const activities = getLeadActivities(lead.id, store);
  const dupes = findDuplicateMatches(store, { email: lead.email, phone: lead.phone, businessName: lead.businessName, excludeLeadId: lead.id });
  const readyOpp = opps.find((o) => o.status === 'open' && store.quotes.find((q) => q.id === o.quoteId)?.status === 'accepted');
  const preview = readyOpp ? getConversionPreview(lead.id, readyOpp.id) : null;

  return (
    <div className="aio-office-page">
      <header className="aio-office-page__header">
        <Link to={aioPaths.officeCrmLeads} className="aio-portal-back">← Leads</Link>
        <h1>{lead.businessName ?? `${lead.firstName} ${lead.lastName}`}</h1>
        <p>{CRM_LEAD_STATUS_LABELS[lead.status]} · {lead.email} · {lead.phone}</p>
        {lead.doNotContact && <span className="aio-badge aio-badge--urgent">DO NOT CONTACT</span>}
      </header>

      {dupes.length > 0 && (
        <div className="aio-portal-panel aio-crm-dupe-warning">
          <strong>Possible existing record:</strong> {dupes.map((d) => `${d.label} (${d.reason})`).join('; ')}
        </div>
      )}

      <div className="aio-two-col">
        <div className="aio-portal-panel">
          <h2 className="aio-portal-panel__title">Service Interests</h2>
          <ul className="aio-list">{interests.map((i) => <li key={i.id}>{i.serviceTitle} — {i.state}</li>)}</ul>
        </div>
        <div className="aio-portal-panel">
          <h2 className="aio-portal-panel__title">Opportunities</h2>
          <ul className="aio-list">
            {opps.map((o) => (
              <li key={o.id}>
                <Link to={aioPaths.officeCrmOpportunity(o.id)}>{o.name}</Link>
                {o.quoteId && ` · Quote ${store.quotes.find((q) => q.id === o.quoteId)?.quoteNumber ?? ''}`}
              </li>
            ))}
          </ul>
          {hasOfficePermission(ctx, 'crm.opportunities.manage') && (
            <button type="button" className="aio-btn aio-btn--sm aio-btn--outline" onClick={() => createOpportunity(lead.id, `${lead.businessName ?? 'Opportunity'} Package`)}>Create Opportunity</button>
          )}
        </div>
      </div>

      {preview && hasOfficePermission(ctx, 'crm.convert') && (
        <div className="aio-portal-panel">
          <h2 className="aio-portal-panel__title">Conversion Preview</h2>
          <p>Will {preview.willLinkExistingOrganization ? 'link' : 'create'} organization: <strong>{preview.organizationName}</strong></p>
          <p>Services: {preview.serviceSlugs.join(', ')}</p>
          <button type="button" className="aio-btn aio-btn--gold" onClick={() => {
            convertLead(lead.id, readyOpp!.id, ctx.staffId);
            setConvertMsg('Converted — service requests and workflows created.');
          }}>Convert to Customer</button>
          {convertMsg && <p className="aio-muted">{convertMsg}</p>}
        </div>
      )}

      <div className="aio-portal-panel">
        <h2 className="aio-portal-panel__title">Staff Actions</h2>
        <div className="aio-inline-actions">
          <button type="button" className="aio-btn aio-btn--outline aio-btn--sm" onClick={() => logCall(lead.id, 'connected', undefined, ctx.staffId)}>Log Call</button>
          <button type="button" className="aio-btn aio-btn--outline aio-btn--sm" onClick={() => updateLeadStatus(lead.id, 'qualified', ctx.staffId)}>Mark Qualified</button>
          {hasOfficePermission(ctx, 'crm.leads.merge') && dupes[0]?.kind === 'lead' && (
            <button type="button" className="aio-btn aio-btn--outline aio-btn--sm" onClick={() => mergeLeads(lead.id, dupes[0].id, ctx.staffId)}>Merge Duplicate</button>
          )}
        </div>
        <textarea value={note} onChange={(e) => setNote(e.target.value)} placeholder="Internal note…" rows={2} style={{ width: '100%', marginTop: '0.5rem' }} />
        <button type="button" className="aio-btn aio-btn--sm" onClick={() => { addLeadNote(lead.id, note, ctx.staffId); setNote(''); }}>Add Note</button>
      </div>

      <div className="aio-portal-panel">
        <h2 className="aio-portal-panel__title">Activity</h2>
        <ul className="aio-list">{activities.map((a) => <li key={a.id}>{a.title} — {new Date(a.createdAt).toLocaleString()}</li>)}</ul>
      </div>
    </div>
  );
}

export function CrmPipelinePage() {
  const store = useDemoStore();
  const [pipelineId, setPipelineId] = useState('pipeline-carrier-services');
  const stages = (store.crmPipelineStages ?? []).filter((s) => s.pipelineId === pipelineId).sort((a, b) => a.sortOrder - b.sortOrder);
  const opps = (store.crmOpportunities ?? []).filter((o) => o.pipelineId === pipelineId && o.status === 'open');

  return (
    <div className="aio-office-page">
      <header className="aio-office-page__header">
        <h1>Pipeline</h1>
        <div className="aio-filter-row">
          {(store.crmPipelines ?? []).map((p) => (
            <button key={p.id} type="button" className={`aio-chip ${pipelineId === p.id ? 'aio-chip--active' : ''}`} onClick={() => setPipelineId(p.id)}>{p.name}</button>
          ))}
        </div>
      </header>
      <div className="aio-crm-pipeline-board">
        {stages.filter((s) => !s.isTerminal).map((stage) => (
          <div key={stage.id} className="aio-crm-pipeline-column">
            <h3>{stage.name}</h3>
            {opps.filter((o) => o.pipelineStageId === stage.id).map((o) => {
              const lead = store.crmLeads?.find((l) => l.id === o.leadId);
              return (
                <div key={o.id} className="aio-crm-pipeline-card">
                  <strong>{o.name}</strong>
                  <p>{lead?.businessName ?? lead?.firstName}</p>
                  <Link to={aioPaths.officeCrmOpportunity(o.id)}>Open</Link>
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}

export function CrmOpportunityDetailPage() {
  const { opportunityId } = useParams<{ opportunityId: string }>();
  const store = useDemoStore();
  const ctx = resolveOfficeStaffContext(store);
  const opp = opportunityId ? getOpportunity(opportunityId, store) : undefined;
  const lead = opp ? getLead(opp.leadId, store) : undefined;
  const quote = opp?.quoteId ? getQuote(opp.quoteId, store) : undefined;
  const version = quote ? getQuoteVersion(quote) : undefined;

  if (!opp || !lead) return <div className="aio-office-page"><h1>Not found</h1></div>;

  const stages = (store.crmPipelineStages ?? []).filter((s) => s.pipelineId === opp.pipelineId);

  return (
    <div className="aio-office-page">
      <header className="aio-office-page__header">
        <Link to={aioPaths.officeCrmLead(lead.id)} className="aio-portal-back">← {lead.businessName ?? 'Lead'}</Link>
        <h1>{opp.name}</h1>
        <p>{lead.businessName} · {opp.status}</p>
      </header>
      <div className="aio-portal-panel">
        <h2 className="aio-portal-panel__title">Stage</h2>
        <select value={opp.pipelineStageId} onChange={(e) => moveOpportunityStage(opp.id, e.target.value, ctx.staffId)}>
          {stages.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
        </select>
      </div>
      <div className="aio-portal-panel">
        <h2 className="aio-portal-panel__title">Quote</h2>
        {!quote && hasOfficePermission(ctx, 'crm.quotes.prepare') && (
          <button type="button" className="aio-btn aio-btn--gold" onClick={() => createQuoteFromOpportunity(opp.id, ctx.staffId)}>Prepare Quote</button>
        )}
        {quote && version && (
          <>
            <p>{quote.quoteNumber} — {quote.status} — {formatMoney(version.totalKnownMinor)}</p>
            {quote.secureToken && <p>Secure link: <Link to={aioPaths.publicQuote(quote.secureToken)}>{aioPaths.publicQuote(quote.secureToken)}</Link></p>}
            {quote.status === 'draft' && (
              <button type="button" className="aio-btn aio-btn--outline" onClick={() => recordQuoteSent(quote.id, ctx.staffId)}>Record Sent</button>
            )}
            <Link to={aioPaths.officeQuote(quote.id)} className="aio-btn aio-btn--sm">Office Quote</Link>
          </>
        )}
      </div>
    </div>
  );
}

function getOpportunity(id: string, store: ReturnType<typeof useDemoStore>) {
  return store.crmOpportunities?.find((o) => o.id === id);
}

export function CrmCalendarPage() {
  const store = useDemoStore();
  const followUps = store.crmFollowUps ?? [];
  const expiringQuotes = store.quotes.filter((q) => q.expirationDate && q.status === 'sent');
  const appts = getUpcomingAppointments(store).slice(0, 10);

  return (
    <div className="aio-office-page">
      <header className="aio-office-page__header"><h1>CRM Calendar</h1><p>Sales follow-ups, consultations, and quote expirations — not compliance calendar.</p></header>
      <div className="aio-two-col">
        <div className="aio-portal-panel">
          <h2 className="aio-portal-panel__title">Consultations</h2>
          <ul className="aio-list">
            {appts.map((a) => {
              const type = store.appointmentTypes?.find((t) => t.id === a.appointmentTypeId);
              return (
                <li key={a.id}>
                  <Link to={aioPaths.officeAppointment(a.id)}>{new Date(a.scheduledStart).toLocaleDateString()} — {a.customerName} ({type?.name})</Link>
                </li>
              );
            })}
            {appts.length === 0 && <li className="aio-muted">No upcoming consultations.</li>}
          </ul>
          <Link to={aioPaths.officeAppointments} className="aio-btn aio-btn--sm aio-btn--outline">All Appointments</Link>
        </div>
        <div className="aio-portal-panel">
          <h2 className="aio-portal-panel__title">Follow-Ups</h2>
          <ul className="aio-list">{followUps.map((f) => <li key={f.id}>{new Date(f.scheduledFor).toLocaleDateString()} — {f.purpose}</li>)}</ul>
        </div>
      </div>
      <div className="aio-portal-panel">
        <h2 className="aio-portal-panel__title">Quote Expirations</h2>
        <ul className="aio-list">{expiringQuotes.map((q) => <li key={q.id}>{q.quoteNumber} — {q.expirationDate}</li>)}</ul>
      </div>
    </div>
  );
}

export function CrmReportsPage() {
  const store = useDemoStore();
  const metrics = getCrmMetrics(store);
  const bySource = (store.crmLeadSources ?? []).map((src) => ({
    source: src.name,
    count: (store.crmLeads ?? []).filter((l) => l.leadSourceId === src.id).length,
  }));

  return (
    <div className="aio-office-page">
      <header className="aio-office-page__header"><h1>CRM Reports</h1><p>Foundational metrics — not executive BI.</p></header>
      <div className="aio-metrics-grid">
        {Object.entries(metrics).map(([k, v]) => (
          <div key={k} className="aio-metric-card"><div className="aio-metric-card__value">{v}</div><div className="aio-metric-card__label">{k}</div></div>
        ))}
      </div>
      <div className="aio-portal-panel">
        <h2 className="aio-portal-panel__title">Leads by Source</h2>
        <ul className="aio-list">{bySource.map((r) => <li key={r.source}>{r.source}: {r.count}</li>)}</ul>
      </div>
    </div>
  );
}

export function CrmSettingsPage() {
  const store = useDemoStore();
  return (
    <div className="aio-office-page">
      <header className="aio-office-page__header"><h1>CRM Settings</h1></header>
      <div className="aio-portal-panel">
        <p>Stale qualified threshold: {store.crmSettings?.staleQualifiedDays ?? 7} days</p>
        <p>Stale quote sent threshold: {store.crmSettings?.staleQuoteSentDays ?? 5} days</p>
        <p className="aio-demo-note">Pipeline stages and lead sources configured in demo seed.</p>
      </div>
    </div>
  );
}
