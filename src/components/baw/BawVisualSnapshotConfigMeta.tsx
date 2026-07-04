import type { CSSProperties } from 'react';
import {
  bawCompactColorLabel,
  bawVisualSnapshotFallbackNotice,
  buildBawConfigurationLabelLines,
  isBawVisualSnapshotFallback,
} from '../../utils/bawVisualSnapshot';

const labelStyle: CSSProperties = {
  fontFamily: '"Futura PT Book", futuristic-pt, Futura, Inter, sans-serif',
  fontSize: '8px',
  color: '#000000',
  textTransform: 'uppercase',
  margin: 0,
  lineHeight: 1.35,
};

const fallbackStyle: CSSProperties = {
  ...labelStyle,
  color: '#808080',
  fontSize: '7px',
};

const swatchStyle = (hex: string): CSSProperties => ({
  display: 'inline-block',
  width: 8,
  height: 8,
  borderRadius: '50%',
  backgroundColor: hex,
  border: '1px solid rgba(0,0,0,0.2)',
  marginRight: 4,
  verticalAlign: 'middle',
});

/** Configuration text for cart / wishlist / order — complements snapshot image. */
export function BawVisualSnapshotConfigMeta({
  item,
  compact = false,
  showFallbackNotice = false,
}: {
  item: Record<string, unknown>;
  compact?: boolean;
  showFallbackNotice?: boolean;
}) {
  const colorLine = bawCompactColorLabel(item as Parameters<typeof bawCompactColorLabel>[0]);
  if (!colorLine && !showFallbackNotice) return null;

  const hex =
    typeof item.selectedColorHex === 'string'
      ? item.selectedColorHex
      : (item.visualSnapshot as { colorHex?: string } | undefined)?.colorHex;

  if (compact) {
    return (
      <div>
        {colorLine ? (
          <p style={labelStyle}>
            {hex ? <span style={swatchStyle(hex)} aria-hidden /> : null}
            {colorLine}
          </p>
        ) : null}
        {showFallbackNotice && isBawVisualSnapshotFallback(item as { visualSnapshotStatus?: 'FALLBACK_USED' }) ? (
          <p style={fallbackStyle}>{bawVisualSnapshotFallbackNotice()}</p>
        ) : null}
      </div>
    );
  }

  const lines = buildBawConfigurationLabelLines(item as Parameters<typeof buildBawConfigurationLabelLines>[0]);
  if (lines.length === 0 && !showFallbackNotice) return null;

  return (
    <div>
      {lines.map((line) => (
        <p key={line.label} style={labelStyle}>
          {line.label === 'Color' && hex ? <span style={swatchStyle(hex)} aria-hidden /> : null}
          {line.label}: {line.value}
        </p>
      ))}
      {showFallbackNotice && isBawVisualSnapshotFallback(item as { visualSnapshotStatus?: 'FALLBACK_USED' }) ? (
        <p style={fallbackStyle}>{bawVisualSnapshotFallbackNotice()}</p>
      ) : null}
    </div>
  );
}
