import { Link } from 'react-router-dom';
import { useMemo } from 'react';
import { useDemoStore } from '../../demo/useDemoStore';
import { getOrganizationId, getQuotes } from '../../demo/billingActions';
import { formatMoney } from '../../billing/money';
import { aioPaths } from '../../utils/paths';

export function QuotesPage() {
  const store = useDemoStore();
  const orgId = getOrganizationId(store);
  const quotes = useMemo(() => getQuotes(orgId, store), [orgId, store.quotes]);

  return (
    <div className="aio-billing">
      <header><h1>Quotes &amp; Estimates</h1><p>Service estimates from All In One — review before work begins.</p></header>
      {quotes.length === 0 ? (
        <p className="aio-empty-state__text">No quotes yet.</p>
      ) : (
        <ul className="aio-billing-list">
          {quotes.map((q) => {
            const v = q.versions.find((x) => x.id === q.currentVersionId);
            return (
              <li key={q.id}>
                <Link to={aioPaths.portalQuote(q.id)} className="aio-billing-card">
                  <strong>{q.serviceTitle}</strong>
                  <span>{q.quoteNumber} · {q.status.replace(/_/g, ' ')}</span>
                  <span>{v ? formatMoney(v.totalKnownMinor) : '—'}{v?.hasPendingExternalFees ? ' + pending fees' : ''}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
      <Link to={aioPaths.portalBilling} className="aio-rr-link">Billing Center →</Link>
    </div>
  );
}
