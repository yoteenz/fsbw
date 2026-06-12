import type { CSSProperties } from 'react';
import type { PercentRect, TextSlot } from '../types/hairstyleAnalysis';

export function parsePercent(value: string): number {
  return parseFloat(value.replace('%', '')) || 0;
}

export function toPercent(value: number): string {
  return `${value.toFixed(2)}%`;
}

export function mergeSlotRect(base: PercentRect, override?: Partial<PercentRect>): PercentRect {
  return {
    left: override?.left ?? base.left,
    top: override?.top ?? base.top,
    width: override?.width ?? base.width,
    height: override?.height ?? base.height,
  };
}

export function mergeTextSlot(base: TextSlot, override?: Partial<PercentRect>): TextSlot {
  return {
    left: override?.left ?? base.left,
    top: override?.top ?? base.top,
    width: override?.width ?? base.width,
    height: override?.height ?? base.height,
  };
}

export function rectToCss(rect: PercentRect | TextSlot): CSSProperties {
  return {
    left: rect.left,
    top: rect.top,
    width: rect.width,
    height: rect.height,
  };
}

export function nudgeRectByPixels(
  rect: PercentRect,
  cardWidth: number,
  cardHeight: number,
  dxPx: number,
  dyPx: number
): PercentRect {
  const left = parsePercent(rect.left) + (dxPx / cardWidth) * 100;
  const top = parsePercent(rect.top) + (dyPx / cardHeight) * 100;
  return {
    ...rect,
    left: toPercent(left),
    top: toPercent(top),
  };
}

export type RectResizeEdge = 'left' | 'right' | 'top' | 'bottom';

export function resizeRectByPixels(
  rect: PercentRect,
  cardWidth: number,
  cardHeight: number,
  edge: RectResizeEdge,
  dxPx: number,
  dyPx: number,
  minWidthPct = 1,
  minHeightPct = 1
): PercentRect {
  let left = parsePercent(rect.left);
  let top = parsePercent(rect.top);
  let width = parsePercent(rect.width);
  let height = parsePercent(rect.height);

  if (edge === 'left') {
    const delta = (dxPx / cardWidth) * 100;
    left += delta;
    width -= delta;
  } else if (edge === 'right') {
    width += (dxPx / cardWidth) * 100;
  } else if (edge === 'top') {
    const delta = (dyPx / cardHeight) * 100;
    top += delta;
    height -= delta;
  } else if (edge === 'bottom') {
    height += (dyPx / cardHeight) * 100;
  }

  if (width < minWidthPct) {
    if (edge === 'left') left -= minWidthPct - width;
    width = minWidthPct;
  }
  if (height < minHeightPct) {
    if (edge === 'top') top -= minHeightPct - height;
    height = minHeightPct;
  }

  return {
    left: toPercent(left),
    top: toPercent(top),
    width: toPercent(width),
    height: toPercent(height),
  };
}
