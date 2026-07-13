import { useMemo, useState } from 'react';
import type { CSSProperties } from 'react';
import {
  listMissingCanonicalDepartments,
  listStaleCanonicalDepartments,
  planCanonicalBatchGeneration,
  type CanonicalMainDepartmentId,
} from '../../../../studio-os-core/canonical-studio-world';

const btnStyle: CSSProperties = {
  padding: '8px 12px',
  margin: '4px 4px 4px 0',
  border: '1px solid #333',
  background: '#fff',
  borderRadius: 6,
  cursor: 'pointer',
  fontSize: '11px',
};

type Props = {
  selectedDepartmentId: CanonicalMainDepartmentId | null;
  onQueue: (input: { departmentIds: CanonicalMainDepartmentId[]; confirmed: boolean }) => Promise<unknown>;
  submitting: boolean;
  submitError: string | null;
};

/** Admin batch generation with cost governance — dispatches to canonical render queue. */
export function CanonicalDepartmentBatchPanel({ selectedDepartmentId, onQueue, submitting, submitError }: Props) {
  const [confirmed, setConfirmed] = useState(false);
  const [lastMessage, setLastMessage] = useState<string | null>(null);
  const missing = useMemo(() => listMissingCanonicalDepartments(), []);
  const stale = useMemo(() => listStaleCanonicalDepartments(), []);

  const batchPlan = useMemo(() => {
    const ids = selectedDepartmentId
      ? [selectedDepartmentId]
      : missing.map((d) => d.departmentId);
    return planCanonicalBatchGeneration({ departmentIds: ids, confirmed });
  }, [selectedDepartmentId, missing, confirmed]);

  const blocked = 'ok' in batchPlan && batchPlan.ok === false;

  const handleQueue = async () => {
    const ids = selectedDepartmentId
      ? [selectedDepartmentId]
      : missing.map((d) => d.departmentId);
    setLastMessage(null);
    const result = (await onQueue({ departmentIds: ids, confirmed: true })) as {
      ok?: boolean;
      batchId?: string;
      queuedJobIds?: string[];
      message?: string;
      error?: string;
    };
    if (result?.ok) {
      setLastMessage(
        `Queued ${result.queuedJobIds?.length ?? 0} landscape job(s)${result.batchId ? ` · batch ${result.batchId.slice(0, 14)}…` : ''}`
      );
    }
  };

  return (
    <section style={{ padding: '16px', borderTop: '1px solid #e5e7eb' }} data-canonical-batch-panel>
      <p style={{ margin: '0 0 8px', fontSize: '10px', fontWeight: 800, letterSpacing: '0.1em', color: '#eb1c24' }}>
        ADMIN BATCH GENERATION
      </p>
      <p style={{ margin: '0 0 12px', fontSize: '11px', color: '#555' }}>
        Missing: {missing.length} · Stale: {stale.length} · Queue capacity: 4 concurrent
      </p>

      {!blocked && 'departmentCount' in batchPlan ? (
        <div style={{ fontSize: '11px', marginBottom: 12 }}>
          <p style={{ margin: '0 0 4px' }}>Departments: {batchPlan.departmentCount}</p>
          <p style={{ margin: '0 0 4px' }}>Expected renders: {batchPlan.expectedRenderCount} (landscape + portrait)</p>
          <p style={{ margin: '0 0 4px' }}>Est. cost: {batchPlan.cost.totalEstimatedCostUnits} units</p>
          <p style={{ margin: '0 0 4px' }}>Est. duration: {Math.round(batchPlan.cost.estimatedDurationMs / 1000)}s</p>
          <p style={{ margin: 0 }}>Reuse shell patterns: {batchPlan.cost.reuseShellPatterns ? 'yes' : 'no'}</p>
        </div>
      ) : null}

      <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '11px', marginBottom: 12 }}>
        <input type="checkbox" checked={confirmed} onChange={(e) => setConfirmed(e.target.checked)} />
        I confirm controlled canonical generation (no uncontrolled burst)
      </label>

      <button
        type="button"
        style={{ ...btnStyle, opacity: submitting ? 0.6 : 1 }}
        disabled={!confirmed || blocked || submitting}
        onClick={() => void handleQueue()}
      >
        {submitting ? 'Queueing…' : `Queue ${selectedDepartmentId ? 'selected department' : 'missing departments'}`}
      </button>

      {blocked ? (
        <p style={{ marginTop: 8, fontSize: '10px', color: '#eb1c24' }}>
          {(batchPlan as { message?: string }).message ?? 'Confirmation required'}
        </p>
      ) : null}
      {submitError ? (
        <p style={{ marginTop: 8, fontSize: '10px', color: '#dc2626' }} role="alert">
          {submitError}
        </p>
      ) : null}
      {lastMessage ? (
        <p style={{ marginTop: 8, fontSize: '10px', color: '#059669' }}>{lastMessage}</p>
      ) : null}
    </section>
  );
}
