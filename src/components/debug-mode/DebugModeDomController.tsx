import { useEffect, useRef } from 'react';
import { useDebugMode } from './DebugModeProvider';
import {
  applyElementOverride,
  ensureDebugElementId,
  findElementByDebugId,
  getHorizontalTabSiblings,
  isDebugEditableTarget,
  readElementOverrideSnapshot,
} from '../../utils/debugModeDomPath';
import { snapDebugPx } from '../../utils/debugMode';

const HIGHLIGHT_CLASS = 'baw-debug-selected';

/** Pointer selection, drag nudge, tab reorder, and override application. */
export function DebugModeDomController() {
  const debug = useDebugMode();
  const dragRef = useRef<{
    kind: 'nudge' | 'tab';
    id: string;
    startX: number;
    startY: number;
    baseX: number;
    baseY: number;
    tabParent?: HTMLElement;
  } | null>(null);

  useEffect(() => {
    if (!debug?.enabled) return;
    const style = document.createElement('style');
    style.setAttribute('data-baw-debug-ui', '1');
    style.textContent = `
      .${HIGHLIGHT_CLASS} {
        outline: 2px dashed #EB1C24 !important;
        outline-offset: 2px;
      }
    `;
    document.documentElement.setAttribute('data-baw-debug-mode', '1');
    document.head.appendChild(style);
    return () => {
      document.documentElement.removeAttribute('data-baw-debug-mode');
      style.remove();
      document.querySelectorAll(`.${HIGHLIGHT_CLASS}`).forEach((el) => el.classList.remove(HIGHLIGHT_CLASS));
    };
  }, [debug?.enabled]);

  useEffect(() => {
    if (!debug?.enabled) return;

    const applyAll = () => {
      for (const [id, override] of Object.entries(debug.draft.elements)) {
        const el = findElementByDebugId(document.body, id);
        if (el instanceof HTMLElement) applyElementOverride(el, override);
      }
    };

    applyAll();
    const t = window.setTimeout(applyAll, 400);
    const t2 = window.setTimeout(applyAll, 1200);
    return () => {
      window.clearTimeout(t);
      window.clearTimeout(t2);
    };
  }, [debug?.draft.elements, debug?.enabled, debug?.pageKey]);

  useEffect(() => {
    if (!debug?.enabled) return;

    const highlightSelected = () => {
      document.querySelectorAll(`.${HIGHLIGHT_CLASS}`).forEach((el) => el.classList.remove(HIGHLIGHT_CLASS));
      if (!debug.selectedId) return;
      const el = findElementByDebugId(document.body, debug.selectedId);
      if (el instanceof HTMLElement) el.classList.add(HIGHLIGHT_CLASS);
    };
    highlightSelected();
  }, [debug?.enabled, debug?.selectedId, debug?.draft.elements]);

  useEffect(() => {
    if (!debug?.enabled) return;

    const onPointerDown = (e: PointerEvent) => {
      if (e.button !== 0) return;
      const target = (e.target as Element | null)?.closest('[data-baw-debug-ui]');
      if (target) return;

      const hit = document.elementFromPoint(e.clientX, e.clientY);
      let el: HTMLElement | null = hit instanceof HTMLElement ? hit : null;
      while (el) {
        if (isDebugEditableTarget(el)) break;
        el = el.parentElement;
      }
      if (!el || !isDebugEditableTarget(el)) return;

      e.preventDefault();
      e.stopPropagation();

      const id = ensureDebugElementId(el);
      const alreadySelected = debug.selectedId === id;

      debug.selectElement(id);

      const current = debug.getElementOverride(id) ?? readElementOverrideSnapshot(el);
      if (!debug.getElementOverride(id)) {
        debug.patchElement(id, current);
      }

      if (!alreadySelected) {
        return;
      }

      const tabs = getHorizontalTabSiblings(el);
      dragRef.current = {
        kind: tabs ? 'tab' : 'nudge',
        id,
        startX: e.clientX,
        startY: e.clientY,
        baseX: current.translateX ?? 0,
        baseY: current.translateY ?? 0,
        tabParent: tabs ? el.parentElement ?? undefined : undefined,
      };

      const onMove = (ev: PointerEvent) => {
        const drag = dragRef.current;
        if (!drag) return;
        const dx = ev.clientX - drag.startX;
        const dy = ev.clientY - drag.startY;

        if (drag.kind === 'tab' && drag.tabParent) {
          const elNow = findElementByDebugId(document.body, drag.id);
          if (!(elNow instanceof HTMLElement)) return;
          const siblings = getHorizontalTabSiblings(elNow);
          if (!siblings) return;
          const idx = siblings.indexOf(elNow);
          if (idx < 0) return;
          if (dx > 40 && idx < siblings.length - 1) {
            const a = ensureDebugElementId(elNow);
            const b = ensureDebugElementId(siblings[idx + 1]);
            const orderA = debug.getElementOverride(a)?.flexOrder ?? idx;
            const orderB = debug.getElementOverride(b)?.flexOrder ?? idx + 1;
            debug.patchElement(a, { flexOrder: orderB });
            debug.patchElement(b, { flexOrder: orderA });
            drag.startX = ev.clientX;
          } else if (dx < -40 && idx > 0) {
            const a = ensureDebugElementId(elNow);
            const b = ensureDebugElementId(siblings[idx - 1]);
            const orderA = debug.getElementOverride(a)?.flexOrder ?? idx;
            const orderB = debug.getElementOverride(b)?.flexOrder ?? idx - 1;
            debug.patchElement(a, { flexOrder: orderB });
            debug.patchElement(b, { flexOrder: orderA });
            drag.startX = ev.clientX;
          }
          return;
        }

        debug.patchElement(drag.id, {
          translateX: snapDebugPx(drag.baseX + dx),
          translateY: snapDebugPx(drag.baseY + dy),
        });
      };

      const onUp = () => {
        dragRef.current = null;
        window.removeEventListener('pointermove', onMove);
        window.removeEventListener('pointerup', onUp);
        window.removeEventListener('pointercancel', onUp);
      };

      window.addEventListener('pointermove', onMove);
      window.addEventListener('pointerup', onUp);
      window.addEventListener('pointercancel', onUp);
    };

    document.addEventListener('pointerdown', onPointerDown, true);
    return () => document.removeEventListener('pointerdown', onPointerDown, true);
  }, [debug]);

  return null;
}
