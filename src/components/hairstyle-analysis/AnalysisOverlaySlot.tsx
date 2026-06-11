import {
  useCallback,
  useRef,
  type CSSProperties,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
  type RefObject,
} from 'react';
import type { PercentRect } from '../../types/hairstyleAnalysis';
import { nudgeRectByPixels } from '../../utils/hairstyleAnalysisSlotCoords';
import styles from './HairstyleAnalysisCard.module.css';

type AnalysisOverlaySlotProps = {
  slotId: string;
  rect: PercentRect;
  debug?: boolean;
  label?: string;
  cardRef: RefObject<HTMLElement | null>;
  onRectChange?: (slotId: string, rect: PercentRect) => void;
  className?: string;
  style?: CSSProperties;
  children: ReactNode;
};

export default function AnalysisOverlaySlot({
  slotId,
  rect,
  debug = false,
  label,
  cardRef,
  onRectChange,
  className = '',
  style,
  children,
}: AnalysisOverlaySlotProps) {
  const dragOrigin = useRef<{ x: number; y: number; rect: PercentRect } | null>(null);

  const onPointerDown = useCallback(
    (event: ReactPointerEvent<HTMLDivElement>) => {
      if (!debug || !onRectChange) return;
      event.preventDefault();
      event.stopPropagation();
      dragOrigin.current = { x: event.clientX, y: event.clientY, rect: { ...rect } };
      event.currentTarget.setPointerCapture(event.pointerId);
    },
    [debug, onRectChange, rect]
  );

  const onPointerMove = useCallback(
    (event: ReactPointerEvent<HTMLDivElement>) => {
      if (!debug || !onRectChange || !dragOrigin.current || !cardRef.current) return;
      const cardBox = cardRef.current.getBoundingClientRect();
      const dx = event.clientX - dragOrigin.current.x;
      const dy = event.clientY - dragOrigin.current.y;
      const next = nudgeRectByPixels(dragOrigin.current.rect, cardBox.width, cardBox.height, dx, dy);
      onRectChange(slotId, next);
    },
    [cardRef, debug, onRectChange, slotId]
  );

  const onPointerUp = useCallback((event: ReactPointerEvent<HTMLDivElement>) => {
    dragOrigin.current = null;
    try {
      event.currentTarget.releasePointerCapture(event.pointerId);
    } catch {
      /* ignore */
    }
  }, []);

  return (
    <div
      className={`${styles.slot} ${debug ? styles.slotDebug : ''} ${className}`.trim()}
      style={{
        left: rect.left,
        top: rect.top,
        width: rect.width,
        height: rect.height,
        ...style,
      }}
      data-slot-id={slotId}
    >
      {debug ? (
        <div
          className={styles.slotDragHandle}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          title={`Drag ${label ?? slotId}`}
        >
          {label ?? slotId}
        </div>
      ) : null}
      {children}
    </div>
  );
}
