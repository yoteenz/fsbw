import { Link, useNavigate, useParams } from 'react-router-dom';
import { useEffect } from 'react';
import { useDemoStore } from '../../demo/useDemoStore';
import {
  acceptQuote,
  declineQuote,
  getOrganizationId,
  getQuote,
  getQuoteAcceptanceTerms,
  getQuoteVersion,
  markQuoteViewed,
} from '../../demo/billingActions';
import { BillingFeeSummary, BillingLineItemsTable } from '../../components/BillingDisplay';
import { aioPaths } from '../../utils/paths';

export function QuoteDetailPage() {
  const { quoteId } = useParams<{ quoteId: string }>();
  const navigate = useNavigate();
  const store = useDemoStore();
  const orgId = getOrganizationId(store);
  const quote = quoteId ? getQuote(quoteId) : undefined;

  useEffect(() => {
    if (quoteId && quote?.status === 'sent') markQuoteViewed(quoteId, orgId);
  }, [quoteId, quote?.status, orgId]);

  if (!quote || quote.organizationId !== orgId) {
    return <div className="aio-billing"><p>Quote not found.</p><Link to={aioPaths.portalQuotes}>← Quotes</Link></div>;
  }

  const version = getQuoteVersion(quote);
  if (!version) return null;

  const canRespond = ['sent', 'viewed', 'revised'].includes(quote.status);

  return (
    <div className="aio-billing aio-billing-detail">
      <Link to={aioPaths.portalQuotes} className="aio-rr-link">← Quotes</Link>
      <header>
        <p className="aio-label">{quote.quoteNumber}</p>
        <h1>{quote.serviceTitle}</h1>
        <p>Status: {quote.status.replace(/_/g, ' ')} · Expires {quote.expirationDate ?? '—'}</p>
        {quote.serviceRequestId && <Link to={aioPaths.portalRequest(quote.serviceRequestId)}>Related service request →</Link>}
      </header>

      <section>
        <h2>Line Items</h2>
        <BillingLineItemsTable items={version.lineItems} />
        <BillingFeeSummary version={version} />
      </section>

      {version.customerNotes && <p className="aio-prototype-note">{version.customerNotes}</p>}

      {canRespond && (
        <section className="aio-billing-accept">
          <p>{getQuoteAcceptanceTerms()}</p>
          <div className="aio-billing-actions">
            <button type="button" className="aio-btn aio-btn--gold" onClick={() => { acceptQuote(quote.id, orgId, 'Customer'); navigate(aioPaths.portalBilling); }}>Accept Quote</button>
            <button type="button" className="aio-btn aio-btn--outline" onClick={() => { declineQuote(quote.id, orgId); navigate(aioPaths.portalQuotes); }}>Decline</button>
            <Link to={aioPaths.contact} className="aio-btn aio-btn--outline">Message All In One</Link>
          </div>
        </section>
      )}

      {quote.acceptance && (
        <p className="aio-vault-caught-up">Accepted {new Date(quote.acceptance.acceptedAt).toLocaleString()} — version {quote.versions.find((v) => v.id === quote.acceptance?.versionId)?.versionNumber}</p>
      )}
    </div>
  );
}
