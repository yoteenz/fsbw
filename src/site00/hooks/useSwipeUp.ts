import { useCallback, useRef } from 'react';

type SwipeUpOptions = {
  thresholdPx?: number;
  maxAngleDeg?: number;
  onSwipeUp: () => void;
  disabled?: boolean;
};

/**
 * Touch/pointer swipe-up recognition for Screen 00 → Screen 01 transition.
 * Respects prefers-reduced-motion via caller (instant navigate).
 */
export function useSwipeUp({ thresholdPx = 72, maxAngleDeg = 35, onSwipeUp, disabled = false }: SwipeUpOptions) {
  const startRef = useRef<{ x: number; y: number } | null>(null);

  const onPointerDown = useCallback(
    (event: React.PointerEvent) => {
      if (disabled) return;
      startRef.current = { x: event.clientX, y: event.clientY };
      event.currentTarget.setPointerCapture(event.pointerId);
    },
    [disabled],
  );

  const onPointerUp = useCallback(
    (event: React.PointerEvent) => {
      if (disabled || !startRef.current) return;
      const dx = event.clientX - startRef.current.x;
      const dy = event.clientY - startRef.current.y;
      startRef.current = null;

      if (dy >= -thresholdPx) return;

      const angle = Math.abs((Math.atan2(dy, dx) * 180) / Math.PI);
      if (angle < 90 - maxAngleDeg || angle > 90 + maxAngleDeg) return;

      onSwipeUp();
    },
    [disabled, maxAngleDeg, onSwipeUp, thresholdPx],
  );

  const onPointerCancel = useCallback(() => {
    startRef.current = null;
  }, []);

  return { onPointerDown, onPointerUp, onPointerCancel };
}

export function prefersReducedSite00Motion(): boolean {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}
