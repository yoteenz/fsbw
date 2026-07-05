import { useCallback, useEffect, useRef, useState, type CSSProperties, type PointerEvent as ReactPointerEvent } from 'react';

const OVERLAY_POSITION_KEY = 'studioOs_visionOverlayPosition';

type Position = { x: number; y: number };

function readStoredPosition(): Position | null {
  if (typeof sessionStorage === 'undefined') return null;
  try {
    const raw = sessionStorage.getItem(OVERLAY_POSITION_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Position;
    if (typeof parsed.x === 'number' && typeof parsed.y === 'number') return parsed;
  } catch {
    // ignore
  }
  return null;
}

function clampPosition(x: number, y: number, width: number, height: number): Position {
  const margin = 8;
  return {
    x: Math.min(Math.max(margin, x), Math.max(margin, window.innerWidth - width - margin)),
    y: Math.min(Math.max(margin, y), Math.max(margin, window.innerHeight - height - margin)),
  };
}

export function useVisionEngineOverlayDrag(overlayRef: React.RefObject<HTMLDivElement | null>) {
  const [position, setPosition] = useState<Position | null>(() => readStoredPosition());
  const [isDragging, setIsDragging] = useState(false);
  const dragRef = useRef<{ startX: number; startY: number; origX: number; origY: number } | null>(null);

  const resolvePosition = useCallback((): Position | null => {
    const el = overlayRef.current;
    if (!el) return position;
    if (position) return position;
    const rect = el.getBoundingClientRect();
    return { x: rect.left, y: rect.top };
  }, [overlayRef, position]);

  const onDragHandlePointerDown = useCallback(
    (event: ReactPointerEvent<HTMLButtonElement>) => {
      if (event.button !== 0) return;
      const el = overlayRef.current;
      if (!el) return;

      const rect = el.getBoundingClientRect();
      const current = position ?? { x: rect.left, y: rect.top };
      if (!position) setPosition(current);

      dragRef.current = {
        startX: event.clientX,
        startY: event.clientY,
        origX: current.x,
        origY: current.y,
      };
      setIsDragging(true);
      event.currentTarget.setPointerCapture(event.pointerId);
      event.preventDefault();
    },
    [overlayRef, position]
  );

  useEffect(() => {
    const onMove = (event: PointerEvent) => {
      const drag = dragRef.current;
      const el = overlayRef.current;
      if (!drag || !el) return;

      const dx = event.clientX - drag.startX;
      const dy = event.clientY - drag.startY;
      const next = clampPosition(drag.origX + dx, drag.origY + dy, el.offsetWidth, el.offsetHeight);
      setPosition(next);
    };

    const onUp = () => {
      if (!dragRef.current) return;
      dragRef.current = null;
      setIsDragging(false);
    };

    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
    window.addEventListener('pointercancel', onUp);
    return () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
      window.removeEventListener('pointercancel', onUp);
    };
  }, [overlayRef]);

  useEffect(() => {
    if (!position) return;
    try {
      sessionStorage.setItem(OVERLAY_POSITION_KEY, JSON.stringify(position));
    } catch {
      // ignore
    }
  }, [position]);

  useEffect(() => {
    const onResize = () => {
      const el = overlayRef.current;
      const current = resolvePosition();
      if (!el || !current) return;
      setPosition(clampPosition(current.x, current.y, el.offsetWidth, el.offsetHeight));
    };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, [overlayRef, resolvePosition]);

  const positionStyle: CSSProperties | undefined = position
    ? { left: position.x, top: position.y, bottom: 'auto', transform: 'none' }
    : undefined;

  return {
    positionStyle,
    isDragging,
    isPositioned: Boolean(position),
    onDragHandlePointerDown,
  };
}
