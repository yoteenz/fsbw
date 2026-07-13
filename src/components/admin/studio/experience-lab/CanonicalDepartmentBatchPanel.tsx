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
};

/** Admin batch generation with cost governance — requires explicit confirmation. */
export function CanonicalDepartmentBatchPanel({ selectedDepartmentId }: Props) {
  const [confirmed, setConfirmed] = useState(false);
  const missing = useMemo(() => listMissingCanonicalDepartments(), []);
  const stale = useMemo(() => listStaleCanonicalDepartments(), []);

  const batchPlan = useMemo(() => {
    const ids = selectedDepartmentId
      ? [selectedDepartmentId]
      : missing.map((d) => d.departmentId);
    return planCanonicalBatchGeneration({ departmentIds: ids, confirmed });
  }, [selectedDepartmentId, missing, confirmed]);

  const blocked = 'ok' in batchPlan && batchPlan.ok === false;

  return (
    <section style={{ padding: '16px', borderTop: '1px solid #e5e7eb' }} data-canonical-batch-panel>
      <p style={{ margin: '0 0 8px', fontSize: '10px', fontWeight: 800, letterSpacing: '0.1em', color: '#eb1c24' }}>
        ADMIN BATCH GENERATION
      </p>
      <p style={{ margin: '0 0 12px', fontSize: '11px', color: '#555' }}>
        Missing: {missing.length} · Stale: {stale.length} · Queue capacity: 4
      </p>

      {!blocked && 'departmentCount' in batchPlan ? (
        <div style={{ fontSize: '11px', marginBottom: 12 }}>
          <p style={{ margin: '0 0 4px' }}>Departments: {batchPlan.departmentCount}</p>
          <p style={{ margin: '0 0 4px' }}>Expected renders: {batchPlan.expectedRenderCount}</p>
          <p style={{ margin: '0 0 4px' }}>Est. cost: {batchPlan.cost.totalEstimatedCostUnits} units</p>
          <p style={{ margin: '0 0 4px' }}>Est. duration: {Math.round(batchPlan.cost.estimatedDurationMs / 1000)}s</p>
          <p style={{ margin: 0 }}>Reuse shell patterns: {batchPlan.cost.reuseShellPatterns ? 'yes' : 'no'}</p>
        </div>
      ) : null}

      <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '11px', marginBottom: 12 }}>
        <input type="checkbox" checked={confirmed} onChange={(e) => setConfirmed(e.target.checked)} />
        I confirm controlled canonical generation (no uncontrolled burst)
      </label>

      <button type="button" style={btnStyle} disabled={!confirmed || blocked}>
        Queue {selectedDepartmentId ? 'selected department' : 'missing departments'}
      </button>
      {blocked ? (
        <p style={{ marginTop: 8, fontSize: '10px', color: '#eb1c24' }}>
          {(batchPlan as { message?: string }).message ?? 'Confirmation required'}
        </p>
      ) : null}
    </section>
  );
}
