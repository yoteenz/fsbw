import { useCallback, useEffect, useRef, useState, type CSSProperties, type RefObject } from 'react';
import { isMobileDesktopBypassActive } from '../../utils/desktopPreview';
import {
  readMansionDebugPanelPosition,
  writeMansionDebugPanelPosition,
  type MansionDebugPanelPosition,
} from '../../utils/desktopMansionDebug';

const DEFAULT_POSITION: MansionDebugPanelPosition = { x: 8, y: 8 };

function clampPanelPosition(
  position: MansionDebugPanelPosition,
  panel: HTMLElement | null,
): MansionDebugPanelPosition {
  const margin = 4;
  const width = panel?.offsetWidth ?? 220;
  const height = panel?.offsetHeight ?? 72;
  const maxX = Math.max(margin, window.innerWidth - width - margin);
  const maxY = Math.max(margin, window.innerHeight - height - margin);
  return {
    x: Math.min(maxX, Math.max(margin, position.x)),
    y: Math.min(maxY, Math.max(margin, position.y)),
  };
}

export function useMansionDebugPanelDrag(panelRef: RefObject<HTMLDivElement | null>) {
  const [isDraggable, setIsDraggable] = useState(() => isMobileDesktopBypassActive());
  const [position, setPosition] = useState<MansionDebugPanelPosition>(
    () => readMansionDebugPanelPosition() ?? DEFAULT_POSITION,
  );
  const [dragging, setDragging] = useState(false);
  const dragRef = useRef<{
    pointerId: number;
    startX: number;
    startY: number;
    originX: number;
    originY: number;
  } | null>(null);

  useEffect(() => {
    const sync = () => setIsDraggable(isMobileDesktopBypassActive());
    sync();
    window.addEventListener('resize', sync);
    return () => window.removeEventListener('resize', sync);
  }, []);

  useEffect(() => {
    if (!isDraggable) return;
    const saved = readMansionDebugPanelPosition();
    if (saved) {
      setPosition(clampPanelPosition(saved, panelRef.current));
    }
  }, [isDraggable, panelRef]);

  const onDragHandlePointerDown = useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      if (!isDraggable) return;
      event.preventDefault();
      event.currentTarget.setPointerCapture(event.pointerId);
      dragRef.current = {
        pointerId: event.pointerId,
        startX: event.clientX,
        startY: event.clientY,
        originX: position.x,
        originY: position.y,
      };
      setDragging(true);

      const onMove = (e: PointerEvent) => {
        const drag = dragRef.current;
        if (!drag || e.pointerId !== drag.pointerId) return;
        const next = clampPanelPosition(
          {
            x: drag.originX + (e.clientX - drag.startX),
            y: drag.originY + (e.clientY - drag.startY),
          },
          panelRef.current,
        );
        setPosition(next);
      };

      const onUp = (e: PointerEvent) => {
        const drag = dragRef.current;
        if (!drag || e.pointerId !== drag.pointerId) return;
        dragRef.current = null;
        setDragging(false);
        setPosition((current: MansionDebugPanelPosition) => {
          const clamped = clampPanelPosition(current, panelRef.current);
          writeMansionDebugPanelPosition(clamped);
          return clamped;
        });
        window.removeEventListener('pointermove', onMove);
        window.removeEventListener('pointerup', onUp);
        window.removeEventListener('pointercancel', onUp);
      };

      window.addEventListener('pointermove', onMove);
      window.addEventListener('pointerup', onUp);
      window.addEventListener('pointercancel', onUp);
    },
    [isDraggable, panelRef, position.x, position.y],
  );

  const panelStyle: CSSProperties | undefined = isDraggable
    ? {
        left: position.x,
        top: position.y,
        right: 'auto',
        bottom: 'auto',
      }
    : undefined;

  return {
    isDraggable,
    dragging,
    panelStyle,
    onDragHandlePointerDown,
  };
}
