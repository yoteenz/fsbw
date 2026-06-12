import {
  useCallback,
  useRef,
  type CSSProperties,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
  type RefObject,
} from 'react';
import type { PercentRect } from '../../types/hairstyleAnalysis';
import {
  nudgeRectByPixels,
  resizeRectByPixels,
  type RectResizeEdge,
} from '../../utils/hairstyleAnalysisSlotCoords';
import styles from './HairstyleAnalysisCard.module.css';

type ResizeAxes = 'horizontal' | 'vertical' | 'both';

type AnalysisOverlaySlotProps = {
  slotId: string;
  rect: PercentRect;
  debug?: boolean;
  label?: string;
  cardRef: RefObject<HTMLElement | null>;
  onRectChange?: (slotId: string, rect: PercentRect) => void;
  resizeAxes?: ResizeAxes;
  className?: string;
  style?: CSSProperties;
  children: ReactNode;
};

type DragOrigin = {
  x: number;
  y: number;
  rect: PercentRect;
  mode: 'move' | RectResizeEdge;
};

export default function AnalysisOverlaySlot({
  slotId,
  rect,
  debug = false,
  label,
  cardRef,
  onRectChange,
  resizeAxes,
  className = '',
  style,
  children,
}: AnalysisOverlaySlotProps) {
  const dragOrigin = useRef<DragOrigin | null>(null);

  const startInteraction = useCallback(
    (event: ReactPointerEvent<HTMLDivElement>, mode: DragOrigin['mode']) => {
      if (!debug || !onRectChange) return;
      event.preventDefault();
      event.stopPropagation();
      dragOrigin.current = { x: event.clientX, y: event.clientY, rect: { ...rect }, mode };
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
      const next =
        dragOrigin.current.mode === 'move'
          ? nudgeRectByPixels(
              dragOrigin.current.rect,
              cardBox.width,
              cardBox.height,
              dx,
              dy
            )
          : resizeRectByPixels(
              dragOrigin.current.rect,
              cardBox.width,
              cardBox.height,
              dragOrigin.current.mode,
              dx,
              dy
            );
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

  const showHorizontal = resizeAxes === 'horizontal' || resizeAxes === 'both';
  const showVertical = resizeAxes === 'vertical' || resizeAxes === 'both';

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
        <>
          <div
            className={styles.slotDragHandle}
            onPointerDown={(event) => startInteraction(event, 'move')}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            title={`Drag ${label ?? slotId}`}
          >
            {label ?? slotId}
          </div>
          {showHorizontal ? (
            <>
              <div
                className={`${styles.slotResizeHandle} ${styles.slotResizeHandleLeft}`}
                onPointerDown={(event) => startInteraction(event, 'left')}
                onPointerMove={onPointerMove}
                onPointerUp={onPointerUp}
                title={`Resize ${label ?? slotId} from left`}
                aria-label={`Resize ${label ?? slotId} from left`}
              />
              <div
                className={`${styles.slotResizeHandle} ${styles.slotResizeHandleRight}`}
                onPointerDown={(event) => startInteraction(event, 'right')}
                onPointerMove={onPointerMove}
                onPointerUp={onPointerUp}
                title={`Resize ${label ?? slotId} from right`}
                aria-label={`Resize ${label ?? slotId} from right`}
              />
            </>
          ) : null}
          {showVertical ? (
            <>
              <div
                className={`${styles.slotResizeHandle} ${styles.slotResizeHandleTop}`}
                onPointerDown={(event) => startInteraction(event, 'top')}
                onPointerMove={onPointerMove}
                onPointerUp={onPointerUp}
                title={`Resize ${label ?? slotId} from top`}
                aria-label={`Resize ${label ?? slotId} from top`}
              />
              <div
                className={`${styles.slotResizeHandle} ${styles.slotResizeHandleBottom}`}
                onPointerDown={(event) => startInteraction(event, 'bottom')}
                onPointerMove={onPointerMove}
                onPointerUp={onPointerUp}
                title={`Resize ${label ?? slotId} from bottom`}
                aria-label={`Resize ${label ?? slotId} from bottom`}
              />
            </>
          ) : null}
        </>
      ) : null}
      {children}
    </div>
  );
}
