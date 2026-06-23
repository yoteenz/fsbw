import {
  useCallback,
  useRef,
  type CSSProperties,
  type PointerEvent as ReactPointerEvent,
  type RefObject,
} from 'react';
import type { DesktopRoomCoverImageSpace } from '../../utils/desktopRoomCoverLayout';
import { panelDebugColorStyles } from '../../constants/desktopPanelDebugColors';
import type { PanelDebugPanelDef } from '../../types/desktopPanelDebug';
import {
  clampPanelDebugPercentRect,
  percentRectToImageRect,
  roundPanelDebugPercent,
} from '../../utils/desktopPanelDebugMode';
import {
  rectFromCornerResizeGesture,
  rectFromEdgeResizeGesture,
  rectFromMoveGesture,
} from '../../utils/desktopLoungeTvFrameEditorGestures';
import {
  SCENE_HIT_EDGE_HIT_PX,
  type SceneHitResizeCorner,
  type SceneHitResizeEdge,
} from '../../utils/sceneHitLayoutEditorGestures';
import { DesktopRoomCoverRectAnchor } from '../desktop-lobby/DesktopRoomCoverAnchor';
import { useDesktopPanelDebugRequired } from './DesktopPanelDebugProvider';

const EDGE_HANDLES: {
  edge: SceneHitResizeEdge;
  cursor: CSSProperties['cursor'];
  style: CSSProperties;
}[] = [
  { edge: 'n', cursor: 'ns-resize', style: { left: 0, right: 0, top: 0, height: SCENE_HIT_EDGE_HIT_PX } },
  { edge: 's', cursor: 'ns-resize', style: { left: 0, right: 0, bottom: 0, height: SCENE_HIT_EDGE_HIT_PX } },
  { edge: 'w', cursor: 'ew-resize', style: { top: 0, bottom: 0, left: 0, width: SCENE_HIT_EDGE_HIT_PX } },
  { edge: 'e', cursor: 'ew-resize', style: { top: 0, bottom: 0, right: 0, width: SCENE_HIT_EDGE_HIT_PX } },
];

const CORNER_HANDLES: {
  corner: SceneHitResizeCorner;
  cursor: CSSProperties['cursor'];
  style: CSSProperties;
}[] = [
  { corner: 'nw', cursor: 'nwse-resize', style: { left: 0, top: 0 } },
  { corner: 'ne', cursor: 'nesw-resize', style: { right: 0, top: 0 } },
  { corner: 'sw', cursor: 'nesw-resize', style: { left: 0, bottom: 0 } },
  { corner: 'se', cursor: 'nwse-resize', style: { right: 0, bottom: 0 } },
];

function measureContainer(el: HTMLElement | null): { width: number; height: number } {
  if (!el) return { width: 1, height: 1 };
  const width = el.offsetWidth;
  const height = el.offsetHeight;
  if (width > 0 && height > 0) return { width, height };
  const rect = el.getBoundingClientRect();
  if (rect.width > 0 && rect.height > 0) {
    return { width: rect.width, height: rect.height };
  }
  return { width: 1, height: 1 };
}

type Props = {
  measureRef: RefObject<HTMLElement | null>;
  image: DesktopRoomCoverImageSpace;
  panel: PanelDebugPanelDef;
};

export function DesktopPanelDebugRect({ measureRef, image, panel }: Props) {
  const editor = useDesktopPanelDebugRequired();
  const rect = editor.panelMap[panel.id];
  const isSelected = editor.selectedPanelId === panel.id;
  const colors = panelDebugColorStyles(panel.colorGroup);

  const dragRef = useRef<{
    mode: 'move' | 'resize-edge' | 'resize-corner';
    edge?: SceneHitResizeEdge;
    corner?: SceneHitResizeCorner;
    startX: number;
    startY: number;
    initialImageRect: ReturnType<typeof percentRectToImageRect>;
  } | null>(null);

  const applyImageRect = useCallback(
    (imageRect: ReturnType<typeof percentRectToImageRect>) => {
      editor.patchPanel(
        panel.id,
        clampPanelDebugPercentRect({
          x: roundPanelDebugPercent(imageRect.left * 100),
          y: roundPanelDebugPercent(imageRect.top * 100),
          width: roundPanelDebugPercent(imageRect.width * 100),
          height: roundPanelDebugPercent(imageRect.height * 100),
        }),
      );
    },
    [editor, panel.id],
  );

  const beginPointerGesture = useCallback(
    (
      mode: 'move' | 'resize-edge' | 'resize-corner',
      clientX: number,
      clientY: number,
      edge?: SceneHitResizeEdge,
      corner?: SceneHitResizeCorner,
    ) => {
      if (!rect) return;
      const initialImageRect = percentRectToImageRect(rect);
      dragRef.current = {
        mode,
        edge,
        corner,
        startX: clientX,
        startY: clientY,
        initialImageRect,
      };

      const onMove = (e: PointerEvent) => {
        const drag = dragRef.current;
        if (!drag) return;
        const dx = e.clientX - drag.startX;
        const dy = e.clientY - drag.startY;
        const { width, height } = measureContainer(measureRef.current);

        let nextRect;
        if (drag.mode === 'move') {
          nextRect = rectFromMoveGesture(drag.initialImageRect, dx, dy, width, height);
        } else if (drag.mode === 'resize-edge' && drag.edge) {
          nextRect = rectFromEdgeResizeGesture(
            drag.edge,
            drag.initialImageRect,
            dx,
            dy,
            width,
            height,
          );
        } else if (drag.mode === 'resize-corner' && drag.corner) {
          nextRect = rectFromCornerResizeGesture(
            drag.corner,
            drag.initialImageRect,
            dx,
            dy,
            width,
            height,
          );
        } else {
          return;
        }

        applyImageRect(nextRect);
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
    },
    [applyImageRect, measureRef, rect],
  );

  const onOverlayPointerDown = useCallback(
    (e: ReactPointerEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();
      editor.selectPanel(panel.id);

      const target = e.target as HTMLElement;
      if (target.dataset.panelDebugEdge || target.dataset.panelDebugCorner) return;

      beginPointerGesture('move', e.clientX, e.clientY);
    },
    [beginPointerGesture, editor, panel.id],
  );

  const onEdgePointerDown = useCallback(
    (edge: SceneHitResizeEdge) => (e: ReactPointerEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();
      editor.selectPanel(panel.id);
      beginPointerGesture('resize-edge', e.clientX, e.clientY, edge);
    },
    [beginPointerGesture, editor, panel.id],
  );

  const onCornerPointerDown = useCallback(
    (corner: SceneHitResizeCorner) => (e: ReactPointerEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();
      editor.selectPanel(panel.id);
      beginPointerGesture('resize-corner', e.clientX, e.clientY, undefined, corner);
    },
    [beginPointerGesture, editor, panel.id],
  );

  if (!rect || !editor.overlaysVisible) return null;

  const imageRect = percentRectToImageRect(rect);

  return (
    <DesktopRoomCoverRectAnchor
      measureRef={measureRef}
      imageRect={imageRect}
      image={image}
      zIndex={isSelected ? 52 : 51}
    >
      <div
        className={[
          'desktop-panel-debug-rect',
          isSelected ? 'desktop-panel-debug-rect--selected' : '',
        ]
          .filter(Boolean)
          .join(' ')}
        style={{
          width: '100%',
          height: '100%',
          background: colors.background,
          border: `2px solid ${colors.borderColor}`,
        }}
        onPointerDown={onOverlayPointerDown}
      >
        <p className="desktop-panel-debug-rect__label">
          <span className="desktop-panel-debug-rect__tag">[{colors.tag}]</span>
          {panel.label}
        </p>
        {isSelected
          ? EDGE_HANDLES.map(({ edge, cursor, style }) => (
              <div
                key={edge}
                role="presentation"
                aria-hidden
                data-panel-debug-edge={edge}
                className="desktop-panel-debug-handle"
                style={{ ...style, cursor, position: 'absolute' }}
                onPointerDown={onEdgePointerDown(edge)}
              />
            ))
          : null}
        {isSelected
          ? CORNER_HANDLES.map(({ corner, cursor, style }) => (
              <div
                key={corner}
                role="presentation"
                aria-hidden
                data-panel-debug-corner={corner}
                className="desktop-panel-debug-handle desktop-panel-debug-handle--corner"
                style={{ ...style, cursor, position: 'absolute' }}
                onPointerDown={onCornerPointerDown(corner)}
              />
            ))
          : null}
      </div>
    </DesktopRoomCoverRectAnchor>
  );
}
