import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { AsstsEnvironmentShell } from '../components/AsstsEnvironmentShell';
import { AsstsMobileNav, AsstsStatusBadge } from '../components/AsstsMobileNav';
import { ASSTS_ENVIRONMENT_SLOTS, ASSTS_LIBRARY_CATEGORIES } from '../config/slots';
import {
  bootstrapAsstsBatch,
  fetchAsstsLibrary,
  generateAsstsBatch,
  type AsstsLibraryResponse,
} from '../services/asstsApi';

export default function AsstsLibraryPage() {
  const [data, setData] = useState<AsstsLibraryResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setError(null);
      const res = await fetchAsstsLibrary();
      setData(res);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load library');
    }
  }, []);

  useEffect(() => {
    void load();
    const t = setInterval(() => void load(), 8000);
    return () => clearInterval(t);
  }, [load]);

  const summary = data?.summary;
  const priority = data?.priorityBatch;

  return (
    <AsstsEnvironmentShell slotKey={ASSTS_ENVIRONMENT_SLOTS.library}>
      <header className="site00-assts-header">
        <p className="site00-label-red">ASSTS</p>
        <h1 className="site00-heading-lg" style={{ fontSize: '1.5rem', margin: 0 }}>
          THE ASSET VAULT.
        </h1>
      </header>

      <div className="site00-assts-admin-bar">
        <button type="button" disabled={!!busy} onClick={() => { setBusy('bootstrap'); void bootstrapAsstsBatch().then(load).finally(() => setBusy(null)); }}>
          Bootstrap Batch
        </button>
        <button type="button" disabled={!!busy} onClick={() => { setBusy('generate'); void generateAsstsBatch().then(load).finally(() => setBusy(null)); }}>
          Run FAL Generation
        </button>
        <button type="button" disabled={!!busy} onClick={() => { setBusy('refresh'); void load().finally(() => setBusy(null)); }}>
          Refresh
        </button>
      </div>

      {error ? <p className="site00-assts-empty" role="alert">{error}</p> : null}

      {summary ? (
        <div className="site00-assts-metrics" aria-label="Library metrics">
          <div className="site00-assts-metric">
            <div className="site00-assts-metric__value">{summary.totalAssets}</div>
            <div className="site00-assts-metric__label">Assets</div>
          </div>
          <div className="site00-assts-metric">
            <div className="site00-assts-metric__value">{summary.batches}</div>
            <div className="site00-assts-metric__label">Batches</div>
          </div>
          <div className="site00-assts-metric">
            <div className="site00-assts-metric__value" style={{ color: 'var(--site-red)' }}>
              {summary.needsReview}
            </div>
            <div className="site00-assts-metric__label">Need Review</div>
          </div>
          <div className="site00-assts-metric">
            <div className="site00-assts-metric__value">{summary.approved}</div>
            <div className="site00-assts-metric__label">Approved</div>
          </div>
        </div>
      ) : null}

      <p className="site00-assts-section-title">NEEDS YOUR REVIEW</p>
      {priority && priority.counts.needsReview > 0 ? (
        <Link to={`/assts/batches/${priority.id}`} className="site00-assts-priority-card site00-assts-panel">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <strong>{priority.batch_key}</strong>
              <p className="site00-body" style={{ fontSize: 11, margin: '4px 0' }}>
                {priority.category}
              </p>
              <p className="site00-label">
                {priority.counts.approved} / {priority.counts.total} reviewed
              </p>
            </div>
            <AsstsStatusBadge status={priority.status} />
          </div>
          <p className="site00-action-link site00-action-link--red" style={{ marginTop: 12 }}>
            CONTINUE REVIEW →
          </p>
        </Link>
      ) : (
        <p className="site00-assts-empty">No items need review right now.</p>
      )}

      <p className="site00-assts-section-title">RECENT BATCHES</p>
      {summary?.batchesList.map((b) => (
        <Link key={b.id} to={`/assts/batches/${b.id}`} className="site00-assts-batch-row">
          <span>{b.batch_key}</span>
          <AsstsStatusBadge status={b.status} />
        </Link>
      ))}

      <p className="site00-assts-section-title">BROWSE LIBRARY</p>
      {ASSTS_LIBRARY_CATEGORIES.map((cat) => (
        <div key={cat.id} className="site00-assts-category-row">
          <span>{cat.label}</span>
          <span className="site00-label">{cat.count} assets</span>
        </div>
      ))}

      <AsstsMobileNav />
    </AsstsEnvironmentShell>
  );
}
