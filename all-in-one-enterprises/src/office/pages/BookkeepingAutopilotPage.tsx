import { Link } from 'react-router-dom';
import { useMemo } from 'react';
import { useDemoStore } from '../../demo/useDemoStore';
import {
  buildClientAutopilotSummaries,
  getAllOpenExceptions,
  getAutopilotDashboardMetrics,
} from '../../demo/autopilotActions';
import { DEMO_BOOKKEEPING_LABEL } from '../../bookkeeping/bookkeepingConfig';
import { formatMoney } from '../../billing/money';
import { aioPaths } from '../../utils/paths';

const EXCEPTION_PRIORITY_ORDER = ['CRITICAL', 'HIGH', 'NORMAL', 'LOW'] as const;

export function BookkeepingAutopilotPage() {
  const store = useDemoStore();
  const metrics = useMemo(() => getAutopilotDashboardMetrics(store), [store]);
  const clients = useMemo(() => buildClientAutopilotSummaries(store), [store]);
  const exceptions = useMemo(
    () =>
      getAllOpenExceptions(store).sort(
        (a, b) =>
          EXCEPTION_PRIORITY_ORDER.indexOf(a.priority) - EXCEPTION_PRIORITY_ORDER.indexOf(b.priority),
      ),
    [store],
  );

  return (
    <div className="aio-bk-office aio-bk-autopilot">
      <header className="aio-office-page__header">
        <Link to={aioPaths.officeBookkeeping} className="aio-office-link">← Command Center</Link>
        <h1>Bookkeeping Autopilot Command Center</h1>
        <p>{DEMO_BOOKKEEPING_LABEL}</p>
        <p className="aio-bk-autopilot__tagline">Automated where it should be. Reviewed where it matters.</p>
      </header>

      <div className="aio-factoring-office-metrics aio-bk-autopilot__metrics">
        <div className="aio-office-metric-card">
          <span className="aio-office-metric-card__value">{metrics.activeClients}</span>
          <span className="aio-office-metric-card__label">Active Clients</span>
        </div>
        <div className="aio-office-metric-card">
          <span className="aio-office-metric-card__value">{metrics.readyToClose}</span>
          <span className="aio-office-metric-card__label">Ready to Close</span>
        </div>
        <div className="aio-office-metric-card">
          <span className="aio-office-metric-card__value">{metrics.waitingOnCustomer}</span>
          <span className="aio-office-metric-card__label">Waiting on Customer</span>
        </div>
        <div className="aio-office-metric-card">
          <span className="aio-office-metric-card__value">{metrics.exceptionsFound}</span>
          <span className="aio-office-metric-card__label">Open Exceptions</span>
        </div>
        <div className="aio-office-metric-card">
          <span className="aio-office-metric-card__value">{metrics.autoClassifiedTotal}</span>
          <span className="aio-office-metric-card__label">Auto-Classified</span>
        </div>
        <div className="aio-office-metric-card">
          <span className="aio-office-metric-card__value">{metrics.reviewRequiredTotal}</span>
          <span className="aio-office-metric-card__label">Needs Review</span>
        </div>
      </div>

      <section className="aio-office-panel">
        <h2>What needs human attention?</h2>
        <p className="aio-bk-autopilot__hint">Exception-first view — routine transactions are handled automatically.</p>
        {exceptions.length ? (
          exceptions.map((ex) => {
            const client = store.clients.find((c) => c.id === ex.organizationId);
            return (
              <div key={ex.id} className="aio-bk-autopilot__exception">
                <span className={`aio-bk-autopilot__priority aio-bk-autopilot__priority--${ex.priority.toLowerCase()}`}>
                  {ex.priority}
                </span>
                <div>
                  <strong>{ex.title}</strong>
                  <p>{client?.companyName} · {ex.type.replace(/_/g, ' ')}</p>
                  <p className="aio-bk-autopilot__explanation">{ex.explanation}</p>
                </div>
              </div>
            );
          })
        ) : (
          <p>No open exceptions — all clients on track.</p>
        )}
      </section>

      <section className="aio-office-panel">
        <h2>Client health</h2>
        <div className="aio-bk-autopilot__clients">
          {clients.map((c) => (
            <article key={c.organizationId} className="aio-bk-autopilot__client-card">
              <h3>{c.companyName}</h3>
              <p className="aio-bk-autopilot__plan">{c.plan}</p>
              <dl className="aio-bk-autopilot__client-stats">
                <div><dt>Period</dt><dd>{c.currentPeriodLabel}</dd></div>
                <div><dt>Autopilot</dt><dd>{c.autopilotCoveragePct}% complete</dd></div>
                <div><dt>Auto-categorized</dt><dd>{c.autoClassifiedCount}</dd></div>
                <div><dt>Needs review</dt><dd>{c.needsReviewCount}</dd></div>
                <div><dt>Waiting on customer</dt><dd>{c.waitingOnCustomerCount}</dd></div>
                <div><dt>Reconciliation</dt><dd>{c.reconciliationStatus.replace(/_/g, ' ')}</dd></div>
                <div><dt>Reports</dt><dd>{c.reportStatus.replace(/_/g, ' ')}</dd></div>
              </dl>
              <Link to={aioPaths.officeClient(c.organizationId)} className="aio-btn aio-btn--sm aio-btn--outline">
                Open client
              </Link>
            </article>
          ))}
        </div>
      </section>

      <section className="aio-office-panel">
        <h2>Recent auto-classifications (sample)</h2>
        {(store.bookkeepingTransactions ?? []).slice(0, 4).map((tx) => (
          <div key={tx.id} className="aio-office-list-row">
            <span>{tx.merchantName ?? tx.normalizedDescription ?? 'Transaction'}</span>
            <span>{tx.category ?? '—'}</span>
            <span>{formatMoney(tx.amountMinor)}</span>
            <span>{tx.classificationConfidence ?? '—'}</span>
          </div>
        ))}
      </section>
    </div>
  );
}
