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
