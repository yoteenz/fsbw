import { useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { acceptQuoteByToken, declineQuoteByToken, getQuoteBySecureToken } from '../demo/crmActions';
import { getQuoteVersion } from '../demo/billingActions';
import { formatMoney } from '../billing/money';
import { useDemoStore } from '../demo/useDemoStore';
import { AIOButton } from '../components/AIOButton';
import { aioPaths } from '../utils/paths';

export function PublicQuotePage() {
  const { secureToken } = useParams<{ secureToken: string }>();
  const store = useDemoStore();
  const quote = useMemo(
    () => (secureToken ? getQuoteBySecureToken(secureToken, store) : undefined),
    [secureToken, store],
  );
  const version = quote ? getQuoteVersion(quote) : undefined;
  const [accepted, setAccepted] = useState(false);
  const [declined, setDeclined] = useState(false);
  const [declineReason, setDeclineReason] = useState('');

  if (!secureToken || !quote || !version) {
    return (
      <div className="aio-page-content">
        <div className="aio-container">
          <h1>Quote Not Found</h1>
          <p>This secure quote link is invalid or has expired.</p>
          <Link to={aioPaths.contact}>Contact All In One</Link>
        </div>
      </div>
    );
  }

  const expired = quote.expirationDate && quote.expirationDate < new Date().toISOString().slice(0, 10);
  const canRespond = !expired && ['sent', 'viewed', 'revised'].includes(quote.status);

  const handleAccept = () => {
    if (acceptQuoteByToken(secureToken, 'Prospect (secure link)')) setAccepted(true);
  };

  const handleDecline = () => {
    if (declineQuoteByToken(secureToken, declineReason || undefined)) setDeclined(true);
  };

  return (
    <>
      <div className="aio-page-hero">
        <div className="aio-container">
          <p className="aio-page-hero__breadcrumb">Service Quote</p>
          <h1 className="aio-page-hero__title">{quote.serviceTitle ?? quote.quoteNumber}</h1>
          <p className="aio-page-hero__desc">
            Quote {quote.quoteNumber} · Valid through {quote.expirationDate ?? '—'}
          </p>
        </div>
      </div>
      <div className="aio-page-content">
        <div className="aio-container aio-quote-public">
          {expired && (
            <div className="aio-portal-panel aio-crm-dupe-warning">
              This quote has expired. Contact All In One to request a revised quote.
            </div>
          )}
          {accepted && (
            <div className="aio-portal-panel">
              <h2>Thank you — quote accepted</h2>
              <p>All In One will follow up to begin your services. Acceptance is not payment.</p>
            </div>
          )}
          {declined && (
            <div className="aio-portal-panel">
              <h2>Quote declined</h2>
              <p>We appreciate your response. You may contact us anytime if your plans change.</p>
            </div>
          )}
          {!accepted && !declined && (
            <>
              <div className="aio-portal-panel">
                <h2 className="aio-portal-panel__title">Services & Pricing</h2>
                <div className="aio-table-wrap">
                  <table className="aio-table">
                    <thead>
                      <tr>
                        <th>Description</th>
                        <th>Category</th>
                        <th>Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      {version.lineItems.map((li) => (
                        <tr key={li.id}>
                          <td>{li.description}</td>
                          <td>{li.feeCategory === 'service_fee' ? 'All In One Service Fee' : li.feeCategory === 'government_fee' ? 'Government Fee' : 'Third-Party / Pass-Through'}</td>
                          <td>{formatMoney(li.lineAmountMinor)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <p className="aio-quote-public__total">
                  <strong>Total (known fees):</strong> {formatMoney(version.totalKnownMinor)}
                </p>
                {version.hasPendingExternalFees && (
                  <p className="aio-prototype-note">Some government or third-party fees are estimated and may vary.</p>
                )}
              </div>
              {canRespond && (
                <div className="aio-portal-panel">
                  <h2 className="aio-portal-panel__title">Your Decision</h2>
                  <p className="aio-prototype-note">Acceptance confirms agreement to quoted services — not payment.</p>
                  <div className="aio-inline-actions">
                    <AIOButton variant="gold" onClick={handleAccept}>Accept Quote</AIOButton>
                  </div>
                  <div style={{ marginTop: '1.5rem' }}>
                    <label htmlFor="decline-reason">Decline (optional reason)</label>
                    <select id="decline-reason" value={declineReason} onChange={(e) => setDeclineReason(e.target.value)} className="aio-form-preview__input" style={{ display: 'block', width: '100%', marginTop: '0.35rem' }}>
                      <option value="">Select…</option>
                      <option value="price">Price</option>
                      <option value="timing">Timing</option>
                      <option value="not_ready">Not Ready</option>
                      <option value="changed_plans">Changed Plans</option>
                      <option value="other_provider">Chose Another Provider</option>
                      <option value="other">Other</option>
                    </select>
                    <div style={{ marginTop: '0.75rem' }}>
                      <AIOButton variant="outline-dark" size="sm" onClick={handleDecline}>Decline Quote</AIOButton>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
          <p className="aio-demo-note" style={{ marginTop: '2rem' }}>
            Secure quote view (DEMO) — no sequential IDs exposed.
          </p>
        </div>
      </div>
    </>
  );
}
