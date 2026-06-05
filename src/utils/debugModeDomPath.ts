import type { DebugElementOverride } from './debugMode';

const DEBUG_ATTR = 'data-baw-debug-id';

/** Stable element id from tag + sibling index chain (per page). */
export function computeDebugElementId(el: Element): string {
  const parts: string[] = [];
  let node: Element | null = el;
  while (node && node !== document.body) {
    const parent: Element | null = node.parentElement;
    if (!parent) break;
    const idx = Array.from(parent.children).indexOf(node);
    const tag = node.tagName.toLowerCase();
    parts.unshift(`${tag}[${idx}]`);
    node = parent;
  }
  return parts.join('/');
}

export function ensureDebugElementId(el: Element): string {
  const existing = el.getAttribute(DEBUG_ATTR);
  if (existing) return existing;
  const id = computeDebugElementId(el);
  el.setAttribute(DEBUG_ATTR, id);
  return id;
}

export function findElementByDebugId(root: ParentNode, id: string): Element | null {
  const hit = root.querySelector(`[${DEBUG_ATTR}="${CSS.escape(id)}"]`);
  if (hit) return hit;
  const all = root.querySelectorAll('*');
  for (const el of all) {
    if (computeDebugElementId(el) === id) {
      el.setAttribute(DEBUG_ATTR, id);
      return el;
    }
  }
  return null;
}

export function isDebugEditableTarget(el: Element | null): boolean {
  if (!el || !(el instanceof HTMLElement)) return false;
  if (el.closest('[data-baw-debug-ui]')) return false;
  if (el.tagName === 'SCRIPT' || el.tagName === 'STYLE' || el.tagName === 'SVG') return false;
  const tag = el.tagName;
  if (tag === 'IMG' || tag === 'P' || tag === 'SPAN' || tag === 'H1' || tag === 'H2' || tag === 'H3' || tag === 'BUTTON' || tag === 'A' || tag === 'LABEL' || tag === 'LI' || tag === 'TD' || tag === 'TH') {
    return true;
  }
  if (el.classList.contains('menu-toggle-card') || el.classList.contains('bg-white') || el.classList.contains('backdrop-blur-sm')) {
    return true;
  }
  if (el.getAttribute('role') === 'tab') return true;
  return el.children.length <= 12 && el.offsetWidth > 24 && el.offsetHeight > 16;
}

export function readElementOverrideSnapshot(el: HTMLElement): DebugElementOverride {
  const style = window.getComputedStyle(el);
  const snap: DebugElementOverride = {
    color: rgbToHex(style.color) ?? undefined,
    fontSize: parseFloat(style.fontSize) || undefined,
    fontWeight: style.fontWeight,
    fontFamily: style.fontFamily,
    textTransform: style.textTransform,
    backgroundColor: style.backgroundColor === 'rgba(0, 0, 0, 0)' ? undefined : rgbToHex(style.backgroundColor) ?? style.backgroundColor,
    paddingTop: parseFloat(style.paddingTop) || undefined,
    paddingRight: parseFloat(style.paddingRight) || undefined,
    paddingBottom: parseFloat(style.paddingBottom) || undefined,
    paddingLeft: parseFloat(style.paddingLeft) || undefined,
    minHeight: parseFloat(style.minHeight) || undefined,
    borderRadius: parseFloat(style.borderRadius) || undefined,
    flexOrder: style.order !== '0' ? parseInt(style.order, 10) : undefined,
  };
  if (el.tagName === 'IMG') {
    snap.imageSrc = (el as HTMLImageElement).src;
  }
  const text = (el.innerText ?? '').trim();
  if (text && el.children.length === 0) {
    snap.text = text;
  } else if (text && el.tagName === 'BUTTON') {
    snap.text = text;
  }
  const transform = style.transform;
  if (transform && transform !== 'none') {
    const match = transform.match(/matrix\([^,]+,[^,]+,[^,]+,[^,]+,\s*([^,]+),\s*([^)]+)\)/);
    if (match) {
      snap.translateX = parseFloat(match[1]);
      snap.translateY = parseFloat(match[2]);
    }
  }
  return snap;
}

export function applyElementOverride(el: HTMLElement, override: DebugElementOverride): void {
  if (override.text != null && (el.children.length === 0 || el.tagName === 'BUTTON' || el.tagName === 'A')) {
    el.textContent = override.text;
  }
  if (override.color) el.style.color = override.color;
  if (override.fontSize != null) el.style.fontSize = `${override.fontSize}px`;
  if (override.fontWeight != null) el.style.fontWeight = String(override.fontWeight);
  if (override.fontFamily) el.style.fontFamily = override.fontFamily;
  if (override.textTransform) el.style.textTransform = override.textTransform;
  if (override.backgroundColor) el.style.backgroundColor = override.backgroundColor;
  if (override.paddingTop != null) el.style.paddingTop = `${override.paddingTop}px`;
  if (override.paddingRight != null) el.style.paddingRight = `${override.paddingRight}px`;
  if (override.paddingBottom != null) el.style.paddingBottom = `${override.paddingBottom}px`;
  if (override.paddingLeft != null) el.style.paddingLeft = `${override.paddingLeft}px`;
  if (override.minHeight != null) el.style.minHeight = `${override.minHeight}px`;
  if (override.borderRadius != null) el.style.borderRadius = `${override.borderRadius}px`;
  if (override.flexOrder != null) el.style.order = String(override.flexOrder);
  if (override.imageSrc && el.tagName === 'IMG') {
    (el as HTMLImageElement).src = override.imageSrc;
  }
  const tx = override.translateX ?? 0;
  const ty = override.translateY ?? 0;
  if (override.translateX != null || override.translateY != null) {
    el.style.transform = `translate(${tx}px, ${ty}px)`;
  }
}

function rgbToHex(input: string): string | null {
  const m = input.match(/^rgba?\((\d+),\s*(\d+),\s*(\d+)/);
  if (!m) return null;
  const r = Number(m[1]).toString(16).padStart(2, '0');
  const g = Number(m[2]).toString(16).padStart(2, '0');
  const b = Number(m[3]).toString(16).padStart(2, '0');
  return `#${r}${g}${b}`.toUpperCase();
}

/** Horizontal tab row — swap order when dragged past neighbor midpoint. */
export function getHorizontalTabSiblings(el: HTMLElement): HTMLElement[] | null {
  const parent = el.parentElement;
  if (!parent) return null;
  const style = window.getComputedStyle(parent);
  if (style.display !== 'flex' && style.display !== 'inline-flex') return null;
  const children = Array.from(parent.children).filter(
    (c): c is HTMLElement => c instanceof HTMLElement && c.offsetWidth > 0,
  );
  if (children.length < 2) return null;
  const allTabs =
    children.every((c) => c.getAttribute('role') === 'tab') ||
    children.every((c) => c.tagName === 'BUTTON') ||
    parent.getAttribute('role') === 'tablist';
  return allTabs ? children : null;
}
