import type { ConstructionModeCompileResult } from '../../../../studio-os-core/construction-mode/compile-orchestrator';

type Props = {
  qualityDisplays: ConstructionModeCompileResult['qualityDisplays'];
};

/** Per-asset inspection results after manufacturing. */
export function InspectionStatus({ qualityDisplays }: Props) {
  if (!qualityDisplays.length) {
    return (
      <div
        data-blueprint-inspection-status
        style={{ fontFamily: 'system-ui, sans-serif', fontSize: '11px', color: '#64748b', padding: 12 }}
      >
        Inspection results appear after manufacturing completes.
      </div>
    );
  }

  return (
    <div
      data-blueprint-inspection-status
      style={{
        fontFamily: 'system-ui, sans-serif',
        fontSize: '11px',
        background: '#fff',
        border: '1px solid #e5e7eb',
        borderRadius: 12,
        padding: 16,
      }}
    >
      <p style={{ margin: '0 0 12px', fontSize: '10px', fontWeight: 800, letterSpacing: '0.1em', color: '#374151' }}>
        INSPECTION STATUS
      </p>
      <div style={{ display: 'grid', gap: 8 }}>
        {qualityDisplays.map((display) => (
          <div
            key={display.assetId}
            style={{
              padding: 10,
              borderRadius: 8,
              background: display.approved ? '#f0fdf4' : '#fef2f2',
              border: `1px solid ${display.approved ? '#bbf7d0' : '#fecaca'}`,
            }}
          >
            <strong>{display.assetId}</strong> — {display.verdict}
            <p style={{ margin: '4px 0 0', color: '#64748b' }}>
              {display.checks.filter((c) => !c.passed).map((c) => c.label).join(', ') || 'All checks passed'}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
