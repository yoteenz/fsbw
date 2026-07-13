import { useMemo, useState } from 'react';
import type { CSSProperties } from 'react';
import {
  listCanonicalDepartmentTree,
  planCanonicalDepartmentGeneration,
  type CanonicalMainDepartmentId,
} from '../../../../studio-os-core/canonical-studio-world';

const rowStyle: CSSProperties = {
  display: 'flex',
  flexWrap: 'wrap',
  alignItems: 'center',
  gap: 8,
  padding: '8px 0',
  borderBottom: '1px solid #eee',
  fontSize: '11px',
};

const badgeStyle: CSSProperties = {
  fontSize: '9px',
  fontWeight: 800,
  letterSpacing: '0.06em',
  padding: '2px 6px',
  borderRadius: 4,
  background: '#111',
  color: '#fff',
};

type Props = {
  selectedDepartmentId: CanonicalMainDepartmentId | null;
  onSelect: (id: CanonicalMainDepartmentId) => void;
  renderStatusByDepartment?: Map<CanonicalMainDepartmentId, string>;
};

/** Canonical Main Department Registry tree — dynamic from registry, not hardcoded. */
export function CanonicalDepartmentTree({ selectedDepartmentId, onSelect, renderStatusByDepartment }: Props) {
  const tree = useMemo(() => listCanonicalDepartmentTree(), []);
  const [expanded, setExpanded] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(tree.map((t) => [t.category.categoryId, true]))
  );

  const selectedPlan = useMemo(
    () => (selectedDepartmentId ? planCanonicalDepartmentGeneration(selectedDepartmentId) : null),
    [selectedDepartmentId]
  );

  return (
    <section style={{ padding: '16px' }} data-canonical-department-tree>
      <p style={{ margin: '0 0 8px', fontSize: '10px', fontWeight: 800, letterSpacing: '0.1em', color: '#eb1c24' }}>
        STUDIO WORLD MAIN DEPARTMENTS
      </p>
      <p style={{ margin: '0 0 12px', fontSize: '11px', color: '#555' }}>
        Canonical Studio World infrastructure — global, not founder HQ templates.
      </p>

      {tree.map(({ category, departments }) => {
        const open = expanded[category.categoryId] !== false;
        return (
          <div key={category.categoryId} style={{ marginBottom: 12 }}>
            <button
              type="button"
              onClick={() => setExpanded((e) => ({ ...e, [category.categoryId]: !open }))}
              style={{
                border: 'none',
                background: 'transparent',
                cursor: 'pointer',
                fontWeight: 800,
                fontSize: '11px',
                padding: '4px 0',
              }}
            >
              {open ? '▼' : '▶'} {category.displayName}
            </button>
            {open
              ? departments.map((dept) => (
                  <div key={dept.departmentId} style={rowStyle}>
                    <button
                      type="button"
                      onClick={() => onSelect(dept.departmentId)}
                      style={{
                        border: 'none',
                        background: 'transparent',
                        cursor: 'pointer',
                        fontWeight: selectedDepartmentId === dept.departmentId ? 800 : 500,
                        color: selectedDepartmentId === dept.departmentId ? '#eb1c24' : '#111',
                        textAlign: 'left',
                        flex: '1 1 160px',
                      }}
                    >
                      {dept.name}
                    </button>
                    <span style={badgeStyle}>CANONICAL / GLOBAL</span>
                    <span style={{ color: '#666' }}>{dept.lifecycleState}</span>
                    <span style={{ color: '#666' }}>BP r{dept.blueprintRevision}</span>
                    <span style={{ color: '#666' }}>
                      {renderStatusByDepartment?.get(dept.departmentId)
                        ? renderStatusByDepartment.get(dept.departmentId)!.toUpperCase()
                        : dept.founderRenderId
                          ? 'RENDER'
                          : 'NO RENDER'}
                    </span>
                  </div>
                ))
              : null}
          </div>
        );
      })}

      {selectedPlan?.ok ? (
        <div style={{ marginTop: 16, padding: 12, background: '#f3f4f6', borderRadius: 8, fontSize: '11px' }}>
          <p style={{ margin: '0 0 8px', fontWeight: 800 }}>{selectedPlan.record.name} — Generation Plan</p>
          <p style={{ margin: '0 0 4px' }}>Model route: {selectedPlan.modelRoute} (NBP full-scene)</p>
          <p style={{ margin: '0 0 4px' }}>Sockets: {selectedPlan.uiSockets.sockets.length}</p>
          <p style={{ margin: '0 0 4px' }}>Est. cost: {selectedPlan.cost.totalEstimatedCostUnits} units</p>
          <p style={{ margin: 0, color: '#666' }}>Ownership: {selectedPlan.ownership}</p>
        </div>
      ) : null}
    </section>
  );
}
