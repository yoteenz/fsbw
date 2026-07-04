import type { EmailLayoutLayerId, EmailLayerStyle, EmailTemplateCopyOverrides } from './emailLayoutDebug';

const HERO_OVERLAY_LAYERS: EmailLayoutLayerId[] = ['scriptAccent', 'headline', 'cta'];
const PREVIEW_SCROLL_ROOT_ID = 'email-preview-scroll-root';

/** Movement before a mouse drag reposition starts (touch never drags — scroll only). */
const MOUSE_DRAG_THRESHOLD_PX = 10;

function isHeroOverlayLayer(layerId: EmailLayoutLayerId): boolean {
  return HERO_OVERLAY_LAYERS.includes(layerId);
}

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
  productPromoTitle: 'productPromoTitle',
  productPromoCta: 'productPromoCtaLabel',
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

function readOverlayPosition(el: HTMLElement): { top: number; left: number; right: number } {
  const top = parseFloat(el.style.top);
  const left = parseFloat(el.style.left);
  const right = parseFloat(el.style.right);
  if (Number.isFinite(top) || Number.isFinite(left) || Number.isFinite(right)) {
    return {
      top: Number.isFinite(top) ? top : 0,
      left: Number.isFinite(left) ? left : 0,
      right: Number.isFinite(right) ? right : 0,
    };
  }
  const pad = readPadding(el);
  return { top: pad.top, left: pad.left, right: pad.right };
}

function applyOverlayPosition(el: HTMLElement, pos: { top: number; left: number; right: number }): void {
  el.style.position = 'absolute';
  el.style.top = `${pos.top}px`;
  el.style.left = `${pos.left}px`;
  el.style.right = `${pos.right}px`;
  el.style.zIndex = '2';
  el.style.boxSizing = 'border-box';
  el.style.margin = '0';
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

/** Single overflow container so touch/wheel scroll works reliably inside the preview iframe. */
function ensurePreviewScrollRoot(doc: Document): HTMLElement {
  const existing = doc.getElementById(PREVIEW_SCROLL_ROOT_ID);
  if (existing) return existing;
  const root = doc.createElement('div');
  root.id = PREVIEW_SCROLL_ROOT_ID;
  const body = doc.body;
  while (body.firstChild) {
    root.appendChild(body.firstChild);
  }
  body.appendChild(root);
  return root;
}

function injectEditorStyles(doc: Document): void {
  if (doc.getElementById(EDITOR_STYLE_ID)) return;
  const style = doc.createElement('style');
  style.id = EDITOR_STYLE_ID;
  style.textContent = `
    html, body {
      height: 100%;
      margin: 0;
      overflow: hidden;
    }
    #${PREVIEW_SCROLL_ROOT_ID} {
      height: 100%;
      overflow-x: hidden;
      overflow-y: auto;
      -webkit-overflow-scrolling: touch;
      overscroll-behavior: contain;
      touch-action: pan-y;
    }
    [data-email-layer] { cursor: pointer; }
    [data-email-layer].email-layer-dragging { touch-action: none; cursor: grabbing; }
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
    }
    [data-collection-prev],
    [data-collection-next] {
      display: inline-block !important;
    }
    [data-collection-thumb] {
      opacity: 0.48 !important;
      transition: opacity 0.2s ease, box-shadow 0.2s ease;
    }
    [data-collection-thumb].collection-thumb-active {
      opacity: 1 !important;
      border-color: #EB1C24 !important;
      box-shadow: 0 0 16px rgba(235, 28, 36, 0.28), 0 8px 24px rgba(0, 0, 0, 0.08), inset 0 1px 0 rgba(255, 255, 255, 0.95) !important;
    }
  `;
  doc.head.appendChild(style);
}

function attachCollectionCarousel(doc: Document): () => void {
  const cleanups: Array<() => void> = [];

  doc.querySelectorAll('[data-email-collection="signature-units"]').forEach((root) => {
    const container = root as HTMLElement;
    const slides = Array.from(container.querySelectorAll('[data-collection-slide]')) as HTMLElement[];
    if (!slides.length) return;

    const count = slides.length;
    let activeIndex = slides.findIndex((slide) => slide.style.display !== 'none');
    if (activeIndex < 0) activeIndex = 0;

    const indicator = doc.querySelector('[data-collection-indicator="signature-units"]');
    const thumbs = Array.from(doc.querySelectorAll('[data-collection-thumb]')) as HTMLElement[];
    const prevBtn = doc.querySelector('[data-collection-prev="signature-units"]') as HTMLButtonElement | null;
    const nextBtn = doc.querySelector('[data-collection-next="signature-units"]') as HTMLButtonElement | null;

    const syncThumbHighlight = () => {
      thumbs.forEach((thumb) => {
        const idx = Number(thumb.getAttribute('data-collection-thumb'));
        const active = idx === activeIndex;
        thumb.classList.toggle('collection-thumb-active', active);
        thumb.style.opacity = active ? '1' : '0.48';
      });
    };

    const showSlide = (index: number) => {
      activeIndex = ((index % count) + count) % count;
      slides.forEach((slide, i) => {
        slide.style.display = i === activeIndex ? 'block' : 'none';
      });
      if (indicator) indicator.textContent = `${activeIndex + 1} / ${count}`;
      syncThumbHighlight();
    };

    const onPrev = (e: Event) => {
      e.preventDefault();
      e.stopPropagation();
      showSlide(activeIndex - 1);
    };

    const onNext = (e: Event) => {
      e.preventDefault();
      e.stopPropagation();
      showSlide(activeIndex + 1);
    };

    const onThumbClick = (e: Event) => {
      const target = e.currentTarget as HTMLElement;
      const idx = Number(target.getAttribute('data-collection-thumb'));
      if (!Number.isFinite(idx)) return;
      e.preventDefault();
      e.stopPropagation();
      showSlide(idx);
    };

    prevBtn?.addEventListener('click', onPrev);
    nextBtn?.addEventListener('click', onNext);
    thumbs.forEach((thumb) => thumb.addEventListener('click', onThumbClick));

    showSlide(activeIndex);

    cleanups.push(() => {
      prevBtn?.removeEventListener('click', onPrev);
      nextBtn?.removeEventListener('click', onNext);
      thumbs.forEach((thumb) => thumb.removeEventListener('click', onThumbClick));
    });
  });

  return () => cleanups.forEach((fn) => fn());
}

export function attachEmailPreviewEditor(
  doc: Document,
  callbacks: EmailPreviewEditorCallbacks,
  activeLayer: EmailLayoutLayerId | null
): () => void {
  ensurePreviewScrollRoot(doc);
  injectEditorStyles(doc);

  doc.querySelectorAll('[data-email-layer]').forEach((node) => {
    node.classList.add('email-layer-hover');
  });
  applyActiveHighlight(doc, activeLayer);

  const cleanupCarousel = attachCollectionCarousel(doc);

  let dragLayer: EmailLayoutLayerId | null = null;
  let dragEl: HTMLElement | null = null;
  let dragStartX = 0;
  let dragStartY = 0;
  let dragStartPadding = { top: 0, right: 0, bottom: 0, left: 0 };
  let dragStartOverlay = { top: 0, left: 0, right: 0 };
  let dragMoved = false;

  const endMouseDrag = () => {
    dragEl?.classList.remove('email-layer-dragging');
    dragEl = null;
    dragLayer = null;
    dragMoved = false;
    doc.removeEventListener('pointermove', onPointerMove);
    doc.removeEventListener('pointerup', onPointerUp);
    doc.removeEventListener('pointercancel', onPointerUp);
  };

  const onClick = (e: MouseEvent) => {
    if (dragMoved) return;
    if ((e.target as HTMLElement)?.getAttribute('data-email-editing') === 'true') return;
    const layerId = resolveLayerFromTarget(e.target);
    if (!layerId) return;
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

  const onPointerMove = (e: PointerEvent) => {
    if (!dragEl || !dragLayer) return;
    const dx = e.clientX - dragStartX;
    const dy = e.clientY - dragStartY;
    if (!dragMoved) {
      if (Math.hypot(dx, dy) < MOUSE_DRAG_THRESHOLD_PX) return;
      dragMoved = true;
      dragEl.classList.add('email-layer-dragging');
    }
    e.preventDefault();

    if (isHeroOverlayLayer(dragLayer)) {
      const nextOverlay = {
        top: Math.max(0, Math.round(dragStartOverlay.top + dy)),
        left: Math.max(0, Math.round(dragStartOverlay.left + dx)),
        right: dragStartOverlay.right,
      };
      applyOverlayPosition(dragEl, nextOverlay);
      return;
    }

    const next = {
      top: Math.max(0, Math.round(dragStartPadding.top + dy)),
      right: Math.max(0, Math.round(dragStartPadding.right + dx / 2)),
      bottom: Math.max(0, Math.round(dragStartPadding.bottom - dy / 2)),
      left: Math.max(0, Math.round(dragStartPadding.left + dx)),
    };
    dragEl.style.padding = `${next.top}px ${next.right}px ${next.bottom}px ${next.left}px`;
  };

  const onPointerUp = () => {
    if (!dragEl || !dragLayer) {
      endMouseDrag();
      return;
    }

    if (dragMoved) {
      if (isHeroOverlayLayer(dragLayer)) {
        const pos = readOverlayPosition(dragEl);
        callbacks.onPaddingChange(dragLayer, {
          paddingTop: pos.top,
          paddingLeft: pos.left,
          paddingRight: pos.right,
        });
      } else {
        const pad = readPadding(dragEl);
        callbacks.onPaddingChange(dragLayer, {
          paddingTop: pad.top,
          paddingRight: pad.right,
          paddingBottom: pad.bottom,
          paddingLeft: pad.left,
        });
      }
    }
    endMouseDrag();
  };

  const onPointerDown = (e: PointerEvent) => {
    if (e.pointerType === 'touch') return;
    if (e.button !== 0) return;
    if ((e.target as HTMLElement)?.getAttribute('data-email-editing') === 'true') return;

    const layerId = resolveLayerFromTarget(e.target);
    if (!layerId) return;
    const layerEl = (e.target as HTMLElement).closest('[data-email-layer]') as HTMLElement | null;
    if (!layerEl?.classList.contains('email-layer-active')) return;

    dragLayer = layerId;
    dragEl = layerEl;
    dragStartX = e.clientX;
    dragStartY = e.clientY;
    dragMoved = false;
    if (isHeroOverlayLayer(layerId)) {
      dragStartOverlay = readOverlayPosition(layerEl);
    } else {
      dragStartPadding = readPadding(layerEl);
    }

    doc.addEventListener('pointermove', onPointerMove);
    doc.addEventListener('pointerup', onPointerUp);
    doc.addEventListener('pointercancel', onPointerUp);
  };

  doc.addEventListener('click', onClick, true);
  doc.addEventListener('dblclick', onDoubleClick, true);
  doc.addEventListener('pointerdown', onPointerDown, true);

  return () => {
    cleanupCarousel();
    endMouseDrag();
    doc.removeEventListener('click', onClick, true);
    doc.removeEventListener('dblclick', onDoubleClick, true);
    doc.removeEventListener('pointerdown', onPointerDown, true);
  };
}

export function syncEmailPreviewActiveLayer(doc: Document | null | undefined, activeLayer: EmailLayoutLayerId | null): void {
  if (!doc) return;
  applyActiveHighlight(doc, activeLayer);
}
