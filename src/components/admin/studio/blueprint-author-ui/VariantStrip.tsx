import type { CSSProperties } from 'react';
import type { FounderRenderVariant, FounderRenderVariantId } from '../../../../studio-os-core/founder-review';

const stripStyle: CSSProperties = {
  display: 'flex',
  gap: 8,
  overflowX: 'auto',
  padding: '12px 0',
  marginTop: 8,
};

const pillBase: CSSProperties = {
  flex: '0 0 auto',
  padding: '10px 16px',
  fontSize: '11px',
  fontWeight: 700,
  letterSpacing: '0.06em',
  textTransform: 'uppercase',
  borderRadius: 999,
  border: '1px solid #e2e8f0',
  background: '#fff',
  cursor: 'pointer',
  transition: 'all 0.2s ease',
};

type Props = {
  variants: FounderRenderVariant[];
  activeVariantId: FounderRenderVariantId;
  onSelect: (id: FounderRenderVariantId) => void;
};

/** Lightweight Blueprint Preview variations — not separate AI builds. */
export function VariantStrip({ variants, activeVariantId, onSelect }: Props) {
  return (
    <div data-founder-variant-strip style={{ fontFamily: 'system-ui, sans-serif' }}>
      <p style={{ margin: 0, fontSize: '10px', fontWeight: 800, letterSpacing: '0.1em', color: '#64748b' }}>
        VISUAL DIRECTION
      </p>
      <div style={stripStyle}>
        {variants.map((v) => {
          const active = v.id === activeVariantId;
          return (
            <button
              key={v.id}
              type="button"
              onClick={() => onSelect(v.id)}
              style={{
                ...pillBase,
                borderColor: active ? v.colorGrade.accent : '#e2e8f0',
                background: active ? `${v.colorGrade.accent}18` : '#fff',
                color: active ? '#0f172a' : '#64748b',
                boxShadow: active ? `0 4px 16px ${v.colorGrade.accent}33` : undefined,
              }}
            >
              {v.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
