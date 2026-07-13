import type { FounderReviewDiff } from '../../../../studio-os-core/founder-review';

type Props = {
  diff: FounderReviewDiff;
};

/** Live diff — highlight only affected regions. */
export function LiveDiffPanel({ diff }: Props) {
  if (!diff.hasChanges) return null;

  return (
    <div
      data-founder-live-diff
      style={{
        marginTop: 16,
        padding: 14,
        background: '#fffbeb',
        border: '1px solid #fcd34d',
        borderRadius: 10,
        fontFamily: 'system-ui, sans-serif',
        fontSize: '12px',
      }}
    >
      <p style={{ margin: '0 0 10px', fontSize: '10px', fontWeight: 800, letterSpacing: '0.1em', color: '#b45309' }}>
        LIVE DIFF · AFFECTED REGIONS ONLY
      </p>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
        {diff.regions.map((r) => (
          <span
            key={r.regionId}
            style={{
              padding: '6px 10px',
              borderRadius: 6,
              fontSize: '11px',
              fontWeight: 600,
              background: r.status === 'changed' ? '#fef3c7' : '#f0fdf4',
              color: r.status === 'changed' ? '#92400e' : '#166534',
              border: `1px solid ${r.status === 'changed' ? '#fbbf24' : '#86efac'}`,
            }}
          >
            {r.label} · {r.status}
          </span>
        ))}
      </div>
      <p style={{ margin: '10px 0 0', fontSize: '10px', color: '#78716c' }}>
        Only highlighted regions will regenerate. The full room will not rebuild.
      </p>
    </div>
  );
}
