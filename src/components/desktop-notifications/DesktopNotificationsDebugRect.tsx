import {
  useCallback,
  useRef,
  type CSSProperties,
  type PointerEvent as ReactPointerEvent,
  type RefObject,
} from 'react';
import { panelDebugColorStyles } from '../../constants/desktopPanelDebugColors';
import { DESKTOP_NOTIFICATIONS_IMAGE } from '../../constants/desktopNotifications';
import type { DesktopNotificationsDebugPanelDef } from '../../types/desktopNotifications';
import { DesktopRoomCoverRectAnchor } from '../desktop-lobby/DesktopRoomCoverAnchor';
import {
  clampDesktopNotificationsRect,
  desktopNotificationsRectToImageRect,
  roundPanelDebugPercent,
} from '../../utils/desktopNotificationsLayoutMath';
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
import { useDesktopNotificationsDebugRequired } from './DesktopNotificationsDebugProvider';

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
  if (rect.width > 0 && rect.height > 0) return { width: rect.width, height: rect.height };
  return { width: 1, height: 1 };
}

type Props = {
  measureRef: RefObject<HTMLElement | null>;
  panel: DesktopNotificationsDebugPanelDef;
};

export function DesktopNotificationsDebugRect({ measureRef, panel }: Props) {
  const editor = useDesktopNotificationsDebugRequired();
  const rect = editor.layout.rects[panel.id];
  const isSelected = editor.selectedRectId === panel.id;
  const colors = panelDebugColorStyles(panel.colorGroup);

  const dragRef = useRef<{
    mode: 'move' | 'resize-edge' | 'resize-corner';
    edge?: SceneHitResizeEdge;
    corner?: SceneHitResizeCorner;
    startX: number;
    startY: number;
    initialImageRect: ReturnType<typeof desktopNotificationsRectToImageRect>;
  } | null>(null);

  const applyImageRect = useCallback(
    (imageRect: ReturnType<typeof desktopNotificationsRectToImageRect>) => {
      editor.patchRect(
        panel.id,
        clampDesktopNotificationsRect({
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
      const initialImageRect = desktopNotificationsRectToImageRect(rect);
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
        const { width, height } = measureContainer(measureRef.current);
        const dx = e.clientX - drag.startX;
        const dy = e.clientY - drag.startY;

        if (drag.mode === 'move') {
          applyImageRect(rectFromMoveGesture(drag.initialImageRect, dx, dy, width, height));
        } else if (drag.mode === 'resize-edge' && drag.edge) {
          applyImageRect(
            rectFromEdgeResizeGesture(drag.edge, drag.initialImageRect, dx, dy, width, height),
          );
        } else if (drag.mode === 'resize-corner' && drag.corner) {
          applyImageRect(
            rectFromCornerResizeGesture(drag.corner, drag.initialImageRect, dx, dy, width, height),
          );
        }
      };

      const onUp = () => {
        dragRef.current = null;
        window.removeEventListener('pointermove', onMove);
        window.removeEventListener('pointerup', onUp);
      };

      window.addEventListener('pointermove', onMove);
      window.addEventListener('pointerup', onUp);
    },
    [applyImageRect, measureRef, rect],
  );

  const onShellPointerDown = useCallback(
    (event: ReactPointerEvent) => {
      if ((event.target as HTMLElement).dataset.dnDebugHandle) return;
      editor.selectRect(panel.id);
      beginPointerGesture('move', event.clientX, event.clientY);
      event.preventDefault();
    },
    [beginPointerGesture, editor, panel.id],
  );

  if (!rect || !editor.debugEnabled || !editor.overlaysVisible) return null;

  return (
    <DesktopRoomCoverRectAnchor
      measureRef={measureRef}
      image={DESKTOP_NOTIFICATIONS_IMAGE}
      imageRect={desktopNotificationsRectToImageRect(rect)}
      zIndex={40}
      style={{ pointerEvents: 'auto' }}
    >
      <div
        className="dn-debug-rect"
        onPointerDown={onShellPointerDown}
        style={{
          position: 'absolute',
          inset: 0,
          boxSizing: 'border-box',
          border: `2px dashed ${colors.borderColor}`,
          background: colors.background,
          cursor: 'move',
          touchAction: 'none',
          outline: isSelected ? `2px solid ${colors.borderColor}` : undefined,
          outlineOffset: 2,
        }}
      >
        <span className="dn-debug-rect__label" style={{ color: colors.borderColor }}>
          {panel.label}
        </span>

        {isSelected ? (
          <>
            {EDGE_HANDLES.map(({ edge, cursor, style }) => (
              <button
                key={edge}
                type="button"
                data-dn-debug-handle="1"
                aria-label={`Resize ${edge}`}
                style={{ position: 'absolute', cursor, border: 'none', background: 'transparent', ...style }}
                onPointerDown={(e) => {
                  e.stopPropagation();
                  editor.selectRect(panel.id);
                  beginPointerGesture('resize-edge', e.clientX, e.clientY, edge);
                }}
              />
            ))}
            {CORNER_HANDLES.map(({ corner, cursor, style }) => (
              <button
                key={corner}
                type="button"
                data-dn-debug-handle="1"
                aria-label={`Resize ${corner}`}
                className="dn-debug-rect__corner"
                style={{ position: 'absolute', cursor, ...style }}
                onPointerDown={(e) => {
                  e.stopPropagation();
                  editor.selectRect(panel.id);
                  beginPointerGesture('resize-corner', e.clientX, e.clientY, undefined, corner);
                }}
              />
            ))}
          </>
        ) : null}
      </div>
    </DesktopRoomCoverRectAnchor>
  );
}
