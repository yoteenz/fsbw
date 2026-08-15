import { Link, useParams } from 'react-router-dom';
import { useMemo, useState } from 'react';
import { useDemoStore } from '../../demo/useDemoStore';
import {
  completeWorkflowStepAction,
  getWorkflowDetail,
  getWorkflowHealth,
  listWorkflowsByStatus,
  pauseWorkflowAction,
  recordExternalSubmission,
  resolveAutomationException,
  resumeWorkflowAction,
  toggleAutomationRule,
  toggleWorkflowKillSwitch,
  validateWorkflowTemplate,
} from '../../demo/workflowActions';
import { instanceStatusLabel } from '../../workflow/workflowEngine';
import { WORKFLOW_INSTANCE_STATUS_LABELS } from '../../workflow/workflowTypes';
import { aioPaths } from '../../utils/paths';
import { hasOfficePermission, resolveOfficeStaffContext } from '../../office-core/officeContext';

function StatusBadge({ status }: { status: string }) {
  const tone = ['blocked', 'failed'].includes(status)
    ? 'urgent'
    : ['waiting_on_customer', 'waiting_external'].includes(status)
      ? 'progress'
      : status === 'completed'
        ? 'success'
        : 'neutral';
  return <span className={`aio-badge aio-badge--${tone}`}>{WORKFLOW_INSTANCE_STATUS_LABELS[status as keyof typeof WORKFLOW_INSTANCE_STATUS_LABELS] ?? status}</span>;
}

export function OfficeWorkflowsListPage() {
  const store = useDemoStore();
  const [filter, setFilter] = useState<string>('all');
  const instances = useMemo(() => {
    const all = store.workflowInstances ?? [];
    if (filter === 'all') return all;
    return all.filter((w) => w.status === filter);
  }, [store, filter]);

  return (
    <div className="aio-office-page">
      <header className="aio-office-page__header">
        <h1>Workflows</h1>
        <p>Active service orchestration — Sprint 14 workflow engine (DEMO).</p>
      </header>
      <div className="aio-filter-row">
        {['all', 'active', 'waiting_on_customer', 'waiting_external', 'blocked', 'ready_for_review', 'completed', 'paused'].map((f) => (
          <button key={f} type="button" className={`aio-chip ${filter === f ? 'aio-chip--active' : ''}`} onClick={() => setFilter(f)}>
            {f === 'all' ? 'All' : WORKFLOW_INSTANCE_STATUS_LABELS[f as keyof typeof WORKFLOW_INSTANCE_STATUS_LABELS] ?? f}
          </button>
        ))}
      </div>
      <div className="aio-table-wrap">
        <table className="aio-table">
          <thead>
            <tr>
              <th>Customer</th>
              <th>Service</th>
              <th>Version</th>
              <th>Phase</th>
              <th>Progress</th>
              <th>Status</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {instances.map((w) => {
              const detail = getWorkflowDetail(w.id, store);
              const phase = detail?.version?.phases.find((p) => p.id === w.currentPhaseId);
              return (
                <tr key={w.id}>
                  <td>{detail?.client?.companyName ?? w.organizationId}</td>
                  <td>{detail?.template?.name ?? w.templateId}</td>
                  <td>v{detail?.version?.version ?? '?'}</td>
                  <td>{phase?.customerLabel ?? '—'}</td>
                  <td>{w.progress}%</td>
                  <td><StatusBadge status={w.status} /></td>
                  <td><Link to={aioPaths.officeWorkflow(w.id)}>Open</Link></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function OfficeWorkflowDetailPage() {
  const { workflowId } = useParams<{ workflowId: string }>();
  const store = useDemoStore();
  const ctx = resolveOfficeStaffContext(store);
  const detail = workflowId ? getWorkflowDetail(workflowId, store) : null;

  if (!detail?.instance) {
    return (
      <div className="aio-office-page">
        <h1>Workflow not found</h1>
        <Link to={aioPaths.officeWorkflows}>← Back</Link>
      </div>
    );
  }

  const { instance, version, template, steps, client } = detail;
  const canOverride = hasOfficePermission(ctx, 'workflows.override');

  const activeSteps = steps.filter((s) => !['completed', 'skipped', 'cancelled'].includes(s.status));
  const completedSteps = steps.filter((s) => ['completed', 'skipped'].includes(s.status));

  return (
    <div className="aio-office-page">
      <header className="aio-office-page__header">
        <Link to={aioPaths.officeWorkflows} className="aio-portal-back">← Workflows</Link>
        <h1>{template?.name ?? 'Workflow'}</h1>
        <p>{client?.companyName} · Template v{version?.version} · {instanceStatusLabel(instance.status)}</p>
        <div className="aio-inline-actions">
          <StatusBadge status={instance.status} />
          <span className="aio-muted">{instance.progress}% complete</span>
          {instance.serviceRequestId && (
            <Link to={aioPaths.officeRequest(instance.serviceRequestId)} className="aio-btn aio-btn--outline aio-btn--sm">Service Request</Link>
          )}
        </div>
      </header>

      <div className="aio-two-col">
        <div className="aio-portal-panel">
          <h2 className="aio-portal-panel__title">Timeline</h2>
          <div className="aio-workflow-timeline">
            {version?.phases.sort((a, b) => a.sortOrder - b.sortOrder).map((phase) => {
              const phaseSteps = version.steps.filter((s) => s.phaseId === phase.id);
              const phaseInst = steps.filter((s) => s.phaseId === phase.id);
              const done = phaseInst.every((s) => ['completed', 'skipped'].includes(s.status));
              const current = phaseInst.some((s) => !['completed', 'skipped', 'pending', 'cancelled'].includes(s.status));
              return (
                <div key={phase.id} className={`aio-workflow-phase ${done ? 'is-complete' : current ? 'is-current' : ''}`}>
                  <div className="aio-workflow-phase__label">{phase.customerLabel}</div>
                  <ul className="aio-workflow-steps">
                    {phaseSteps.map((st) => {
                      const si = steps.find((x) => x.stepTemplateId === st.id);
                      const internal = st.visibility === 'internal_only';
                      return (
                        <li key={st.id} className={`aio-workflow-step aio-workflow-step--${si?.status ?? 'pending'}`}>
                          <span>{internal ? `[Internal] ${st.name}` : st.customerLabel}</span>
                          {si && !['completed', 'skipped'].includes(si.status) && st.completionMethod !== 'automatic' && canOverride && (
                            <button type="button" className="aio-btn aio-btn--sm aio-btn--gold" onClick={() => completeWorkflowStepAction(si.id, ctx.staffId)}>
                              Complete
                            </button>
                          )}
                        </li>
                      );
                    })}
                  </ul>
                </div>
              );
            })}
          </div>
        </div>

        <div className="aio-portal-panel">
          <h2 className="aio-portal-panel__title">Active Steps ({activeSteps.length})</h2>
          <ul className="aio-list">
            {activeSteps.map((si) => {
              const st = version?.steps.find((s) => s.id === si.stepTemplateId);
              return (
                <li key={si.id}>
                  <strong>{st?.name}</strong> — {si.status.replace(/_/g, ' ')}
                  {si.blockedReason && <p className="aio-muted">{si.blockedReason}</p>}
                </li>
              );
            })}
          </ul>
          <h3 className="aio-portal-panel__subtitle">Completed ({completedSteps.length})</h3>
          <ul className="aio-list aio-list--compact">
            {completedSteps.slice(0, 6).map((si) => {
              const st = version?.steps.find((s) => s.id === si.stepTemplateId);
              return <li key={si.id}>{st?.name}</li>;
            })}
          </ul>
        </div>
      </div>

      <div className="aio-portal-panel">
        <h2 className="aio-portal-panel__title">Staff Actions</h2>
        <div className="aio-inline-actions">
          {instance.status !== 'paused' ? (
            <button type="button" className="aio-btn aio-btn--outline" onClick={() => pauseWorkflowAction(instance.id, 'Staff pause (demo)')}>Pause Workflow</button>
          ) : (
            <button type="button" className="aio-btn aio-btn--gold" onClick={() => resumeWorkflowAction(instance.id)}>Resume Workflow</button>
          )}
          {canOverride && (
            <button type="button" className="aio-btn aio-btn--outline" onClick={() => recordExternalSubmission(instance.id, 'MC-DEMO-12345')}>
              Record External Submission
            </button>
          )}
        </div>
      </div>

      <div className="aio-portal-panel">
        <h2 className="aio-portal-panel__title">Activity</h2>
        <ul className="aio-list">
          {(store.workflowEvents ?? []).filter((e) => e.workflowInstanceId === instance.id).slice(0, 10).map((e) => (
            <li key={e.id}>{e.eventType} · {new Date(e.createdAt).toLocaleString()} {e.reason && `— ${e.reason}`}</li>
          ))}
          {(store.workflowEvents ?? []).filter((e) => e.workflowInstanceId === instance.id).length === 0 && (
            <li className="aio-muted">Workflow events will appear as steps progress.</li>
          )}
        </ul>
      </div>
    </div>
  );
}

export function OfficeWorkflowSettingsPage() {
  const store = useDemoStore();
  const templates = store.workflowTemplates ?? [];

  return (
    <div className="aio-office-page">
      <header className="aio-office-page__header">
        <h1>Workflow Templates</h1>
        <p>Published templates are immutable — clone to draft for changes (DEMO).</p>
      </header>
      <div className="aio-table-wrap">
        <table className="aio-table">
          <thead>
            <tr><th>Name</th><th>Service</th><th>Published Version</th><th>Jurisdiction</th><th /></tr>
          </thead>
          <tbody>
            {templates.map((t) => {
              const ver = store.workflowTemplateVersions?.find((v) => v.id === t.currentPublishedVersionId);
              return (
                <tr key={t.id}>
                  <td>{t.name}</td>
                  <td>{t.serviceType}</td>
                  <td>{ver ? `v${ver.version} (${ver.status})` : 'Draft only'}</td>
                  <td>{t.jurisdiction ?? '—'}</td>
                  <td><Link to={aioPaths.officeWorkflowTemplate(t.id)}>Manage</Link></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <p className="aio-demo-note">DEMO — representative permitting, insurance, dispatch, and journey templates seeded in Sprint 14.</p>
    </div>
  );
}

export function OfficeWorkflowTemplateDetailPage() {
  const { templateId } = useParams<{ templateId: string }>();
  const store = useDemoStore();
  const template = store.workflowTemplates?.find((t) => t.id === templateId);
  const versions = (store.workflowTemplateVersions ?? []).filter((v) => v.templateId === templateId);

  if (!template) {
    return <div className="aio-office-page"><h1>Template not found</h1></div>;
  }

  return (
    <div className="aio-office-page">
      <header className="aio-office-page__header">
        <Link to={aioPaths.officeWorkflowSettings} className="aio-portal-back">← Templates</Link>
        <h1>{template.name}</h1>
        <p>{template.description}</p>
      </header>
      {versions.map((v) => {
        const validation = validateWorkflowTemplate(v.id);
        return (
          <div key={v.id} className="aio-portal-panel">
            <h2 className="aio-portal-panel__title">Version {v.version} — {v.status}</h2>
            <p>{v.steps.length} steps · {v.phases.length} phases · {v.dependencies.length} dependencies</p>
            <p>Validation: {validation.valid ? '✓ Valid' : `✗ ${validation.issues.length} issue(s)`}</p>
            {!validation.valid && (
              <ul className="aio-list">{validation.issues.map((i) => <li key={i.code}>{i.message}</li>)}</ul>
            )}
            <h3>Customer phases</h3>
            <ol>{v.phases.sort((a, b) => a.sortOrder - b.sortOrder).map((p) => <li key={p.id}>{p.customerLabel}</li>)}</ol>
          </div>
        );
      })}
    </div>
  );
}

export function OfficeAutomationSettingsPage() {
  const store = useDemoStore();
  const killSwitch = store.workflowKillSwitch;

  return (
    <div className="aio-office-page">
      <header className="aio-office-page__header">
        <h1>Automation Rules</h1>
        <p>Deterministic WHEN / THEN rules — idempotent execution (DEMO).</p>
      </header>
      <div className="aio-portal-panel">
        <label className="aio-checkbox-row">
          <input
            type="checkbox"
            checked={killSwitch?.allNonEssentialDisabled ?? false}
            onChange={(e) => toggleWorkflowKillSwitch(e.target.checked)}
          />
          Kill switch — disable all non-essential automation
        </label>
      </div>
      <div className="aio-table-wrap">
        <table className="aio-table">
          <thead><tr><th>Rule</th><th>Event</th><th>Safety</th><th>Enabled</th></tr></thead>
          <tbody>
            {(store.automationRules ?? []).map((r) => (
              <tr key={r.id}>
                <td>{r.name}</td>
                <td>{r.whenEvent}</td>
                <td>{r.safetyClass}</td>
                <td>
                  <input type="checkbox" checked={r.enabled} onChange={(e) => toggleAutomationRule(r.id, e.target.checked)} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function OfficeAutomationExceptionsPage() {
  const store = useDemoStore();
  const ctx = resolveOfficeStaffContext(store);
  const open = (store.automationExceptions ?? []).filter((e) => !e.resolvedAt);

  return (
    <div className="aio-office-page">
      <header className="aio-office-page__header">
        <h1>Automation Exceptions</h1>
        <p>Failed automations requiring staff intervention.</p>
      </header>
      {open.length === 0 ? (
        <p className="aio-empty-state__text">No open automation exceptions.</p>
      ) : (
        <ul className="aio-list">
          {open.map((e) => (
            <li key={e.id}>
              {e.message}
              <button type="button" className="aio-btn aio-btn--sm aio-btn--gold" onClick={() => resolveAutomationException(e.id, ctx.staffId)}>Resolve</button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export function OfficeWorkflowHealthPage() {
  const health = getWorkflowHealth();
  const blocked = listWorkflowsByStatus('blocked');
  const waitingCustomer = listWorkflowsByStatus('waiting_on_customer');
  const waitingExternal = listWorkflowsByStatus('waiting_external');

  return (
    <div className="aio-office-page">
      <header className="aio-office-page__header">
        <h1>Workflow Health</h1>
        <p>Operational bottleneck foundation — deterministic counts (DEMO).</p>
      </header>
      <div className="aio-metrics-grid">
        {Object.entries(health).map(([k, v]) => (
          <div key={k} className="aio-metric-card">
            <div className="aio-metric-card__value">{v}</div>
            <div className="aio-metric-card__label">{k.replace(/([A-Z])/g, ' $1')}</div>
          </div>
        ))}
      </div>
      <div className="aio-two-col">
        <div className="aio-portal-panel">
          <h2 className="aio-portal-panel__title">Waiting on Customer ({waitingCustomer.length})</h2>
          <ul className="aio-list">{waitingCustomer.map((w) => <li key={w.id}>{w.id.slice(0, 8)}… — {w.progress}%</li>)}</ul>
        </div>
        <div className="aio-portal-panel">
          <h2 className="aio-portal-panel__title">Waiting Externally ({waitingExternal.length})</h2>
          <ul className="aio-list">{waitingExternal.map((w) => <li key={w.id}>{w.id.slice(0, 8)}… — {w.progress}%</li>)}</ul>
        </div>
      </div>
      {blocked.length > 0 && (
        <div className="aio-portal-panel">
          <h2 className="aio-portal-panel__title">Blocked ({blocked.length})</h2>
          <ul className="aio-list">{blocked.map((w) => <li key={w.id}>{w.id}</li>)}</ul>
        </div>
      )}
    </div>
  );
}
