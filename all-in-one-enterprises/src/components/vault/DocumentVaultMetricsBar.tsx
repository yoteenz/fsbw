import type { DocumentVaultMetrics } from '../../vault/documentVaultMetrics';

type Props = {
  metrics: DocumentVaultMetrics;
};

export function DocumentVaultMetricsBar({ metrics }: Props) {
  return (
    <div className="aio-doc-vault-metrics" aria-label="Document vault summary">
      <div className="aio-doc-vault-metrics__item">
        <span className="aio-doc-vault-metrics__value">{metrics.total}</span>
        <span className="aio-doc-vault-metrics__label">Total Documents</span>
      </div>
      <div className="aio-doc-vault-metrics__item">
        <span className="aio-doc-vault-metrics__value">{metrics.current}</span>
        <span className="aio-doc-vault-metrics__label">Current</span>
      </div>
      <div className="aio-doc-vault-metrics__item">
        <span className="aio-doc-vault-metrics__value">{metrics.expiringSoon}</span>
        <span className="aio-doc-vault-metrics__label">Expiring / Renewal</span>
      </div>
      <div className="aio-doc-vault-metrics__item">
        <span className="aio-doc-vault-metrics__value">{metrics.needsReview}</span>
        <span className="aio-doc-vault-metrics__label">Needs Review</span>
      </div>
    </div>
  );
}
