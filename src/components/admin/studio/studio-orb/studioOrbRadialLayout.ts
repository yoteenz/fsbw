/** Viewport-aware Studio Orb radial menu layout — AssistiveTouch-style, never clipped. */

export const RADIAL_ITEM_WIDTH = 80;
export const RADIAL_ITEM_HEIGHT = 56;
export const RADIAL_MENU_EDGE_PADDING = 12;
export const RADIAL_MENU_STACK_GAP = 10;
export const RADIAL_MENU_ORB_GAP = 14;
export const RADIAL_RADIUS_DEFAULT = 72;
export const RADIAL_RADIUS_MIN = 52;

export type ViewportInsets = {
  top: number;
  right: number;
  bottom: number;
  left: number;
};

export type ViewportRect = {
  width: number;
  height: number;
  offsetLeft: number;
  offsetTop: number;
  insets: ViewportInsets;
};

export type RadialMenuLayoutMode = 'radial' | 'stacked';

export type RadialMenuItemPosition = {
  index: number;
  x: number;
  y: number;
};

export type RadialMenuLayout = {
  mode: RadialMenuLayoutMode;
  anchorX: number;
  anchorY: number;
  items: RadialMenuItemPosition[];
};

export function readSafeAreaInsets(): ViewportInsets {
  if (typeof document === 'undefined') {
    return { top: 0, right: 0, bottom: 0, left: 0 };
  }
  const probe = document.createElement('div');
  probe.style.cssText = [
    'position:fixed',
    'visibility:hidden',
    'pointer-events:none',
    'padding-top:env(safe-area-inset-top,0px)',
    'padding-right:env(safe-area-inset-right,0px)',
    'padding-bottom:env(safe-area-inset-bottom,0px)',
    'padding-left:env(safe-area-inset-left,0px)',
  ].join(';');
  document.body.appendChild(probe);
  const cs = getComputedStyle(probe);
  const px = (v: string) => parseFloat(v) || 0;
  const insets = {
    top: px(cs.paddingTop),
    right: px(cs.paddingRight),
    bottom: px(cs.paddingBottom),
    left: px(cs.paddingLeft),
  };
  document.body.removeChild(probe);
  return insets;
}

export function readViewportRect(): ViewportRect {
  if (typeof window === 'undefined') {
    return { width: 390, height: 844, offsetLeft: 0, offsetTop: 0, insets: { top: 0, right: 0, bottom: 0, left: 0 } };
  }
  const insets = readSafeAreaInsets();
  const vv = window.visualViewport;
  if (vv) {
    return {
      width: vv.width,
      height: vv.height,
      offsetLeft: vv.offsetLeft,
      offsetTop: vv.offsetTop,
      insets,
    };
  }
  return {
    width: window.innerWidth,
    height: window.innerHeight,
    offsetLeft: 0,
    offsetTop: 0,
    insets,
  };
}

function contentBounds(viewport: ViewportRect) {
  const pad = RADIAL_MENU_EDGE_PADDING;
  return {
    minX: viewport.offsetLeft + viewport.insets.left + pad,
    maxX: viewport.offsetLeft + viewport.width - viewport.insets.right - pad,
    minY: viewport.offsetTop + viewport.insets.top + pad,
    maxY: viewport.offsetTop + viewport.height - viewport.insets.bottom - pad,
  };
}

function itemFits(cx: number, cy: number, bounds: ReturnType<typeof contentBounds>): boolean {
  const halfW = RADIAL_ITEM_WIDTH / 2;
  const halfH = RADIAL_ITEM_HEIGHT / 2;
  return (
    cx - halfW >= bounds.minX &&
    cx + halfW <= bounds.maxX &&
    cy - halfH >= bounds.minY &&
    cy + halfH <= bounds.maxY
  );
}

function radialPositions(
  anchorX: number,
  anchorY: number,
  count: number,
  radius: number,
  viewport: ViewportRect
): RadialMenuItemPosition[] {
  const bounds = contentBounds(viewport);
  const midX = (bounds.minX + bounds.maxX) / 2;
  const midY = (bounds.minY + bounds.maxY) / 2;
  const nearRight = anchorX > midX;
  const nearBottom = anchorY > midY;

  let arcStart: number;
  let arcEnd: number;

  if (nearRight && nearBottom) {
    arcStart = Math.PI * 1.1;
    arcEnd = Math.PI * 1.42;
  } else if (nearRight && !nearBottom) {
    arcStart = Math.PI * 1.08;
    arcEnd = Math.PI * 1.42;
  } else if (!nearRight && nearBottom) {
    arcStart = Math.PI * 1.58;
    arcEnd = Math.PI * 1.92;
  } else {
    arcStart = Math.PI * 0.58;
    arcEnd = Math.PI * 0.92;
  }

  if (count <= 1) {
    const angle = (arcStart + arcEnd) / 2;
    return [{ index: 0, x: anchorX + Math.cos(angle) * radius, y: anchorY + Math.sin(angle) * radius }];
  }

  return Array.from({ length: count }, (_, index) => {
    const t = index / (count - 1);
    const angle = arcStart + t * (arcEnd - arcStart);
    return {
      index,
      x: anchorX + Math.cos(angle) * radius,
      y: anchorY + Math.sin(angle) * radius,
    };
  });
}

function radialFits(items: RadialMenuItemPosition[], bounds: ReturnType<typeof contentBounds>): boolean {
  return items.every((item) => itemFits(item.x, item.y, bounds));
}

function stackedPositions(
  anchorX: number,
  anchorY: number,
  count: number,
  viewport: ViewportRect
): RadialMenuItemPosition[] {
  const bounds = contentBounds(viewport);
  const halfW = RADIAL_ITEM_WIDTH / 2;
  const halfH = RADIAL_ITEM_HEIGHT / 2;
  const step = RADIAL_ITEM_HEIGHT + RADIAL_MENU_STACK_GAP;

  let cx = anchorX;
  if (cx + halfW > bounds.maxX) cx = bounds.maxX - halfW;
  if (cx - halfW < bounds.minX) cx = bounds.minX + halfW;

  const firstCenterY = anchorY - RADIAL_MENU_ORB_GAP - halfH;
  const items: RadialMenuItemPosition[] = [];

  for (let i = 0; i < count; i++) {
    let cy = firstCenterY - i * step;
    items.push({ index: i, x: cx, y: cy });
  }

  const top = items[items.length - 1].y - halfH;
  if (top < bounds.minY) {
    const shift = bounds.minY - top;
    for (const item of items) item.y += shift;
  }

  const bottom = items[0].y + halfH;
  if (bottom > bounds.maxY) {
    const shift = bottom - bounds.maxY;
    for (const item of items) item.y -= shift;
  }

  return items;
}

function stackedFits(items: RadialMenuItemPosition[], bounds: ReturnType<typeof contentBounds>): boolean {
  return items.every((item) => itemFits(item.x, item.y, bounds));
}

/** Compute fully in-viewport positions for radial menu items. */
export function computeRadialMenuLayout(
  anchorX: number,
  anchorY: number,
  itemCount: number,
  viewport: ViewportRect = readViewportRect()
): RadialMenuLayout {
  const count = Math.max(0, itemCount);
  if (count === 0) {
    return { mode: 'radial', anchorX, anchorY, items: [] };
  }

  const bounds = contentBounds(viewport);

  for (let radius = RADIAL_RADIUS_DEFAULT; radius >= RADIAL_RADIUS_MIN; radius -= 8) {
    const items = radialPositions(anchorX, anchorY, count, radius, viewport);
    if (radialFits(items, bounds)) {
      return { mode: 'radial', anchorX, anchorY, items };
    }
  }

  const stacked = stackedPositions(anchorX, anchorY, count, viewport);
  if (stackedFits(stacked, bounds)) {
    return { mode: 'stacked', anchorX, anchorY, items: stacked };
  }

  const clamped = stacked.map((item) => ({
    ...item,
    x: Math.min(bounds.maxX - RADIAL_ITEM_WIDTH / 2, Math.max(bounds.minX + RADIAL_ITEM_WIDTH / 2, item.x)),
    y: Math.min(bounds.maxY - RADIAL_ITEM_HEIGHT / 2, Math.max(bounds.minY + RADIAL_ITEM_HEIGHT / 2, item.y)),
  }));

  return { mode: 'stacked', anchorX, anchorY, items: clamped };
}

export function measureOrbCenterFromDom(): { x: number; y: number } | null {
  if (typeof document === 'undefined') return null;
  const orb = document.querySelector<HTMLElement>('[data-studio-orb="true"]');
  if (!orb) return null;
  const rect = orb.getBoundingClientRect();
  return { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
}
