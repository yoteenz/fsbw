import { getApprovedColorMeta } from './colorPalette';
import { isSignatureUnitCommerceLine } from './unitSlug';
import type { BawVisualSnapshotStatus } from './types';

export type BawConfigurationLabelLine = {
  label: string;
  value: string;
};

function titleCaseColor(value: string): string {
  return value
    .toLowerCase()
    .split(' ')
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

/** Human-readable configuration lines — never rely on image alone. */
export function buildBawConfigurationLabelLines(item: {
  name?: string;
  productName?: string;
  type?: string;
  color?: string;
  length?: string;
  density?: string;
  lace?: string;
  capSize?: string;
  texture?: string;
  hairline?: string;
  styling?: string;
  partSelection?: string;
  addOns?: string[];
  visualSnapshotStatus?: BawVisualSnapshotStatus;
}): BawConfigurationLabelLine[] {
  if (!isSignatureUnitCommerceLine(item)) return [];

  const lines: BawConfigurationLabelLine[] = [];
  const colorRaw = item.color || 'OFF BLACK';
  const colorMeta = getApprovedColorMeta(colorRaw);
  lines.push({ label: 'Color', value: titleCaseColor(colorMeta.name) });

  if (item.length) lines.push({ label: 'Length', value: item.length });
  if (item.density) lines.push({ label: 'Density', value: item.density });
  if (item.lace) lines.push({ label: 'Lace', value: item.lace });
  if (item.capSize) lines.push({ label: 'Cap Size', value: item.capSize });
  if (item.texture) lines.push({ label: 'Texture', value: item.texture });
  if (item.hairline && item.hairline.toUpperCase() !== 'NATURAL') {
    lines.push({ label: 'Hairline', value: item.hairline });
  }
  if (item.styling && item.styling.toUpperCase() !== 'NONE') {
    lines.push({ label: 'Styling', value: item.styling });
  }
  if (item.partSelection && item.partSelection.toUpperCase() !== 'MIDDLE') {
    lines.push({ label: 'Parting', value: item.partSelection });
  }
  if (item.addOns && item.addOns.length > 0) {
    lines.push({ label: 'Add-ons', value: item.addOns.join(' · ') });
  }

  return lines;
}

export function bawConfigurationSummaryHeadline(item: { name?: string; productName?: string; type?: string }): string {
  if (!isSignatureUnitCommerceLine(item)) return '';
  return String(item.productName || item.name || '').trim().toUpperCase();
}

export function isBawVisualSnapshotFallback(item: {
  visualSnapshotStatus?: BawVisualSnapshotStatus;
}): boolean {
  return item.visualSnapshotStatus === 'FALLBACK_USED';
}

export function bawVisualSnapshotFallbackNotice(): string {
  return 'Visual snapshot fallback used. Exact configured image not generated yet.';
}

/** Compact single-line color label for tight cart rows. */
export function bawCompactColorLabel(item: { color?: string; name?: string; productName?: string; type?: string }): string | null {
  if (!isSignatureUnitCommerceLine(item)) return null;
  const meta = getApprovedColorMeta(item.color);
  return `Color: ${titleCaseColor(meta.name)}`;
}
