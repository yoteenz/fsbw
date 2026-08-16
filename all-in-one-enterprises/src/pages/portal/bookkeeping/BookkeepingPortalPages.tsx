import { Link } from 'react-router-dom';
import { useMemo } from 'react';
import { useDemoStore } from '../../../demo/useDemoStore';
import {
  getBookkeepingCycles,
  getBookkeepingReports,
  getBookkeepingSubscription,
  getBooksRescue,
  getOrganizationId,
} from '../../../demo/bookkeepingActions';
import {
  getClarificationDigest,
  getFinancialAccounts,
  getFinancialConnections,
  getBookkeepingPeriods,
  getCustomerClarifications,
} from '../../../demo/autopilotActions';
import { DEMO_BOOKKEEPING_LABEL } from '../../../bookkeeping/bookkeepingConfig';
import { planStartingPriceMinor } from '../../../bookkeeping/bookkeepingPlans';
import { planDisplayName } from '../../../bookkeeping/bookkeepingRecommendation';
import { formatMoney } from '../../../billing/money';
import { aioPaths } from '../../../utils/paths';

function connectionStatusLabel(status: string): string {
  return status.replace(/_/g, ' ');
}

export function BookkeepingHomePage() {
  const store = useDemoStore();
  const orgId = getOrganizationId(store);
  const sub = getBookkeepingSubscription(orgId, store);
  const cycles = useMemo(() => getBookkeepingCycles(orgId, store), [orgId, store]);
  const reports = useMemo(() => getBookkeepingReports(orgId, store), [orgId, store]);
  const rescue = getBooksRescue(orgId, store);
  const connections = useMemo(() => getFinancialConnections(orgId, store), [orgId, store]);
  const accounts = useMemo(() => getFinancialAccounts(orgId, store), [orgId, store]);
  const periods = useMemo(() => getBookkeepingPeriods(orgId, store), [orgId, store]);
  const clarifications = useMemo(() => getCustomerClarifications(orgId, store), [orgId, store]);
  const digest = useMemo(() => getClarificationDigest(orgId, store), [orgId, store]);
  const currentPeriod = periods[0];

  if (!sub) {
    return (
      <div className="aio-bk-portal">
        <header className="aio-bk-portal-hero">
          <h1>Bookkeeping Built For Trucking</h1>
          <p>{DEMO_BOOKKEEPING_LABEL}</p>
        </header>
        <p>Compare plans or get a recommendation based on your operation.</p>
        <div className="aio-bk-portal-actions">
          <Link to={aioPaths.bookkeeping} className="aio-btn aio-btn--gold">View Plans</Link>
          <Link to={aioPaths.bookkeepingAssessment} className="aio-btn aio-btn--outline">Get Recommendation</Link>
        </div>
      </div>
    );
  }

  const price = sub.finalPriceMinor ?? planStartingPriceMinor(sub.plan, sub.billingInterval);
  const pendingClarifications = clarifications.filter((c) => c.status === 'pending');

  return (
    <div className="aio-bk-portal">
      <header className="aio-bk-portal-hero aio-bk-portal-hero--compact">
        <h1>Bookkeeping</h1>
        <p>{planDisplayName(sub.plan)} · {sub.customerStatusLabel ?? sub.status.replace(/_/g, ' ')}</p>
      </header>

      <div className="aio-bk-portal-metrics">
        <div className="aio-bk-portal-metric">
          <span>{sub.billingInterval === 'ANNUAL' ? 'Annual' : 'Monthly'}</span>
          <label>Billing</label>
        </div>
        <div className="aio-bk-portal-metric">
          <span>{formatMoney(price)}</span>
          <label>Starting price</label>
        </div>
        <div className="aio-bk-portal-metric">
          <span>{currentPeriod?.label ?? sub.currentPeriodLabel ?? '—'}</span>
          <label>Current period</label>
        </div>
        <div className="aio-bk-portal-metric">
          <span>{currentPeriod ? `${currentPeriod.autopilotCoveragePct ?? 0}%` : '—'}</span>
          <label>Books progress</label>
        </div>
      </div>

      {digest.count > 0 && (
        <section className="aio-bk-portal-panel aio-bk-portal-panel--warn">
          <h2>{digest.count} {digest.count === 1 ? 'item needs' : 'items need'} your help</h2>
          <p>Complete them in approximately {digest.count * 30} seconds.</p>
          <ul>
            {pendingClarifications.map((c) => (
              <li key={c.id} className="aio-bk-portal-clarification">
                <strong>{c.merchantLabel}</strong> · {formatMoney(c.amountMinor)} · {c.transactionDate}
                <p>{c.question}</p>
                <div className="aio-bk-portal-clarification__options">
                  {c.options.map((opt) => (
                    <button key={opt} type="button" className="aio-btn aio-btn--sm aio-btn--outline">{opt}</button>
                  ))}
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}

      {connections.length > 0 && (
        <section className="aio-bk-portal-panel">
          <h2>Connected accounts</h2>
          {connections.map((conn) => (
            <div key={conn.id} className="aio-bk-portal-connection">
              <strong>{conn.institutionName}</strong>
              <span className={`aio-bk-portal-connection__status aio-bk-portal-connection__status--${conn.status.toLowerCase()}`}>
                {connectionStatusLabel(conn.status)}
              </span>
              {conn.lastSuccessfulSyncAt && (
                <p>Last updated: {conn.lastSuccessfulSyncAt.slice(0, 10)}</p>
              )}
              {conn.requiresCustomerAction && (
                <button type="button" className="aio-btn aio-btn--sm aio-btn--gold">Reconnect account</button>
              )}
            </div>
          ))}
          <ul className="aio-bk-portal-accounts">
            {accounts.map((acct) => (
              <li key={acct.id}>
                {acct.accountName} · ••••{acct.accountMask}
              </li>
            ))}
          </ul>
          <p className="aio-bk-portal-note">All In One never stores your online banking password.</p>
        </section>
      )}

      {rescue && rescue.status !== 'complete' && (
        <section className="aio-bk-portal-panel aio-bk-portal-panel--warn">
          <h2>Books Rescue in progress</h2>
          <p>Status: {rescue.status.replace(/_/g, ' ')}</p>
          {rescue.quoteMinor != null && <p>Quote: {formatMoney(rescue.quoteMinor)}</p>}
        </section>
      )}

      {cycles[0] && (
        <section className="aio-bk-portal-panel">
          <h2>Current cycle — {cycles[0].periodLabel}</h2>
          <p>{cycles[0].status.replace(/_/g, ' ')}</p>
          {currentPeriod && (
            <p>Autopilot: {currentPeriod.autoClassifiedCount} of {currentPeriod.transactionCount} transactions auto-classified</p>
          )}
        </section>
      )}

      <section className="aio-bk-portal-panel">
        <h2>Latest reports</h2>
        {reports.length ? (
          <ul>
            {reports.map((r) => (
              <li key={r.id}>
                {r.periodLabel} · {r.reportType.replace(/_/g, ' ')} · {r.generatedAt.slice(0, 10)}
              </li>
            ))}
          </ul>
        ) : (
          <p>No reports delivered yet.</p>
        )}
      </section>

      <section className="aio-bk-portal-panel">
        <h2>Documents & messages</h2>
        <p>Upload statements and respond to questions through your existing portal tools.</p>
        <Link to={aioPaths.portalVault} className="aio-btn aio-btn--sm aio-btn--outline">Document Vault</Link>
        <Link to={aioPaths.portalMessages} className="aio-btn aio-btn--sm aio-btn--outline">Messages</Link>
      </section>
    </div>
  );
}
