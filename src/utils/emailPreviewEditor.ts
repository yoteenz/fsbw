import type { EmailLayoutLayerId, EmailLayerStyle, EmailTemplateCopyOverrides } from './emailLayoutDebug';

export type EmailPreviewEditorCallbacks = {
  onSelectLayer: (layerId: EmailLayoutLayerId) => void;
  onPaddingChange: (layerId: EmailLayoutLayerId, patch: Partial<EmailLayerStyle>) => void;
  onCopyChange: (field: keyof EmailTemplateCopyOverrides, value: string | string[]) => void;
};

export const EMAIL_LAYER_COPY_FIELD: Partial<
  Record<EmailLayoutLayerId, keyof EmailTemplateCopyOverrides>
> = {
  scriptAccent: 'scriptAccent',
  headline: 'headline',
  body: 'bodyParagraphs',
  cta: 'ctaLabel',
  tagline: 'tagline',
  closing: 'closing',
  supportFooter: 'supportFooterCopy',
  supportCta: 'supportCtaLabel',
};

const EDITOR_STYLE_ID = 'email-preview-editor-styles';

function parsePaddingPx(raw: string): { top: number; right: number; bottom: number; left: number } {
  const parts = raw.trim().split(/\s+/).map((p) => parseFloat(p) || 0);
  if (parts.length === 1) return { top: parts[0], right: parts[0], bottom: parts[0], left: parts[0] };
  if (parts.length === 2) return { top: parts[0], right: parts[1], bottom: parts[0], left: parts[1] };
  if (parts.length === 3) return { top: parts[0], right: parts[1], bottom: parts[2], left: parts[1] };
  return { top: parts[0], right: parts[1], bottom: parts[2], left: parts[3] };
}

function readPadding(el: HTMLElement): { top: number; right: number; bottom: number; left: number } {
  const inline = el.style.padding;
  if (inline) return parsePaddingPx(inline);
  const computed = el.ownerDocument.defaultView?.getComputedStyle(el).padding;
  if (computed) return parsePaddingPx(computed);
  return { top: 0, right: 0, bottom: 0, left: 0 };
}

function applyActiveHighlight(doc: Document, activeLayer: EmailLayoutLayerId | null): void {
  doc.querySelectorAll('[data-email-layer]').forEach((node) => {
    node.classList.remove('email-layer-active');
  });
  if (!activeLayer) return;
  doc.querySelectorAll(`[data-email-layer="${activeLayer}"]`).forEach((node) => {
    node.classList.add('email-layer-active');
  });
}

function resolveLayerFromTarget(target: EventTarget | null): EmailLayoutLayerId | null {
  const el = target as HTMLElement | null;
  if (!el?.closest) return null;
  const hit = el.closest('[data-email-layer]') as HTMLElement | null;
  const layer = hit?.getAttribute('data-email-layer');
  return layer as EmailLayoutLayerId | null;
}

function resolveCopyTarget(el: HTMLElement): HTMLElement | null {
  if (el.hasAttribute('data-email-copy')) return el;
  return el.querySelector('[data-email-copy]') as HTMLElement | null;
}

function readCopyValue(layerId: EmailLayoutLayerId, el: HTMLElement): string | string[] {
  const copyEl = el.hasAttribute('data-email-copy') ? el : resolveCopyTarget(el);
  if (!copyEl) return '';
  const field = copyEl.getAttribute('data-email-copy');
  if (field === 'bodyParagraphs' || layerId === 'body') {
    const td = el.closest('[data-email-layer="body"]') ?? el;
    const paragraphs = Array.from(td.querySelectorAll('p'))
      .map((p) => p.textContent?.trim() ?? '')
      .filter(Boolean);
    return paragraphs.length ? paragraphs : [copyEl.textContent?.trim() ?? ''];
  }
  return (copyEl.textContent ?? '').trim();
}

function injectEditorStyles(doc: Document): void {
  if (doc.getElementById(EDITOR_STYLE_ID)) return;
  const style = doc.createElement('style');
  style.id = EDITOR_STYLE_ID;
  style.textContent = `
    [data-email-layer] { cursor: pointer; touch-action: none; }
    [data-email-layer].email-layer-hover:hover:not(.email-layer-active) {
      outline: 1px dashed rgba(235, 28, 36, 0.55);
      outline-offset: 2px;
    }
    [data-email-layer].email-layer-active {
      outline: 2px solid #EB1C24;
      outline-offset: 2px;
      box-shadow: inset 0 0 0 1px rgba(235, 28, 36, 0.15);
    }
    [data-email-editing="true"] {
      outline: 2px solid #EB1C24 !important;
      cursor: text !important;
      touch-action: auto;
    }
  `;
  doc.head.appendChild(style);
}

export function attachEmailPreviewEditor(
  doc: Document,
  callbacks: EmailPreviewEditorCallbacks,
  activeLayer: EmailLayoutLayerId | null
): () => void {
  injectEditorStyles(doc);

  doc.querySelectorAll('[data-email-layer]').forEach((node) => {
    node.classList.add('email-layer-hover');
  });
  applyActiveHighlight(doc, activeLayer);

  let dragLayer: EmailLayoutLayerId | null = null;
  let dragEl: HTMLElement | null = null;
  let dragStartX = 0;
  let dragStartY = 0;
  let dragStartPadding = { top: 0, right: 0, bottom: 0, left: 0 };
  let dragMoved = false;

  const onClick = (e: MouseEvent) => {
    if ((e.target as HTMLElement)?.getAttribute('data-email-editing') === 'true') return;
    const layerId = resolveLayerFromTarget(e.target);
    if (!layerId) return;
    e.preventDefault();
    e.stopPropagation();
    callbacks.onSelectLayer(layerId);
    applyActiveHighlight(doc, layerId);
  };

  const onDoubleClick = (e: MouseEvent) => {
    const layerId = resolveLayerFromTarget(e.target);
    if (!layerId) return;
    const layerEl = (e.target as HTMLElement).closest('[data-email-layer]') as HTMLElement | null;
    if (!layerEl) return;
    const copyField = EMAIL_LAYER_COPY_FIELD[layerId];
    if (!copyField) return;

    e.preventDefault();
    e.stopPropagation();

    let editEl: HTMLElement | null = null;
    if (layerId === 'body') {
      editEl = layerEl;
      layerEl.querySelectorAll('p').forEach((p) => {
        p.setAttribute('contenteditable', 'true');
        p.setAttribute('data-email-editing', 'true');
      });
    } else if (layerId === 'cta' || layerId === 'supportCta') {
      editEl = layerEl.querySelector('[data-email-copy]') as HTMLElement | null;
    } else if (layerId === 'supportFooter') {
      editEl = layerEl.querySelector('[data-email-copy]') as HTMLElement | null;
    } else {
      editEl = layerEl.querySelector('[data-email-copy]') ?? layerEl.querySelector('div, p, a');
    }

    if (!editEl) editEl = layerEl;
    editEl.setAttribute('contenteditable', 'true');
    editEl.setAttribute('data-email-editing', 'true');
    editEl.focus();

    const commit = () => {
      editEl?.removeAttribute('contenteditable');
      editEl?.removeAttribute('data-email-editing');
      layerEl.querySelectorAll('[data-email-editing]').forEach((n) => {
        n.removeAttribute('contenteditable');
        n.removeAttribute('data-email-editing');
      });
      const value = readCopyValue(layerId, layerEl);
      callbacks.onCopyChange(copyField, value);
      editEl?.removeEventListener('blur', commit);
    };
    editEl.addEventListener('blur', commit);
  };

  const onPointerDown = (e: PointerEvent) => {
    if (e.button !== 0 && e.pointerType === 'mouse') return;
    if ((e.target as HTMLElement)?.getAttribute('data-email-editing') === 'true') return;
    const layerId = resolveLayerFromTarget(e.target);
    if (!layerId) return;
    const layerEl = (e.target as HTMLElement).closest('[data-email-layer]') as HTMLElement | null;
    if (!layerEl?.classList.contains('email-layer-active')) return;

    dragLayer = layerId;
    dragEl = layerEl;
    dragStartX = e.clientX;
    dragStartY = e.clientY;
    dragStartPadding = readPadding(layerEl);
    dragMoved = false;
    layerEl.setPointerCapture?.(e.pointerId);
  };

  const onPointerMove = (e: PointerEvent) => {
    if (!dragEl || !dragLayer) return;
    const dx = e.clientX - dragStartX;
    const dy = e.clientY - dragStartY;
    if (Math.abs(dx) < 2 && Math.abs(dy) < 2) return;
    dragMoved = true;
    e.preventDefault();
    const next = {
      top: Math.max(0, Math.round(dragStartPadding.top + dy)),
      right: Math.max(0, Math.round(dragStartPadding.right + dx / 2)),
      bottom: Math.max(0, Math.round(dragStartPadding.bottom - dy / 2)),
      left: Math.max(0, Math.round(dragStartPadding.left + dx)),
    };
    dragEl.style.padding = `${next.top}px ${next.right}px ${next.bottom}px ${next.left}px`;
  };

  const onPointerUp = (e: PointerEvent) => {
    if (dragEl?.hasPointerCapture?.(e.pointerId)) {
      dragEl.releasePointerCapture(e.pointerId);
    }
    if (!dragEl || !dragLayer || !dragMoved) {
      dragEl = null;
      dragLayer = null;
      dragMoved = false;
      return;
    }
    const pad = readPadding(dragEl);
    callbacks.onPaddingChange(dragLayer, {
      paddingTop: pad.top,
      paddingRight: pad.right,
      paddingBottom: pad.bottom,
      paddingLeft: pad.left,
    });
    dragEl = null;
    dragLayer = null;
    dragMoved = false;
  };

  doc.addEventListener('click', onClick, true);
  doc.addEventListener('dblclick', onDoubleClick, true);
  doc.addEventListener('pointerdown', onPointerDown, true);
  doc.addEventListener('pointermove', onPointerMove, true);
  doc.addEventListener('pointerup', onPointerUp, true);
  doc.addEventListener('pointercancel', onPointerUp, true);

  return () => {
    doc.removeEventListener('click', onClick, true);
    doc.removeEventListener('dblclick', onDoubleClick, true);
    doc.removeEventListener('pointerdown', onPointerDown, true);
    doc.removeEventListener('pointermove', onPointerMove, true);
    doc.removeEventListener('pointerup', onPointerUp, true);
    doc.removeEventListener('pointercancel', onPointerUp, true);
  };
}

export function syncEmailPreviewActiveLayer(doc: Document | null | undefined, activeLayer: EmailLayoutLayerId | null): void {
  if (!doc) return;
  applyActiveHighlight(doc, activeLayer);
}
