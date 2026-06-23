import {
  useCallback,
  useRef,
  type CSSProperties,
  type PointerEvent as ReactPointerEvent,
  type RefObject,
} from 'react';
import type { FinalSceneHitRect } from '../../constants/finalLobbySceneAssets';
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
import { sceneHitLayoutBoxStyle, type SceneHitLayoutOptions } from '../../utils/sceneHitLayout';
import { LoungeTvCloseButton } from '../lounge/loungeTvFrame';
import { useDesktopLoungeTvFrameEditor } from './DesktopLoungeTvFrameEditorContext';

const DEBUG_LABEL_STYLE: CSSProperties = {
  position: 'absolute',
  left: 2,
  top: 2,
  fontFamily: 'monospace',
  fontSize: 11,
  lineHeight: 1.2,
  color: '#000',
  background: 'rgba(255, 255, 255, 0.75)',
  padding: '1px 3px',
  pointerEvents: 'none',
  textTransform: 'lowercase',
};

const EDGE_HANDLES: {
  edge: SceneHitResizeEdge;
  cursor: CSSProperties['cursor'];
  style: CSSProperties;
}[] = [
  {
    edge: 'n',
    cursor: 'ns-resize',
    style: { left: 0, right: 0, top: 0, height: SCENE_HIT_EDGE_HIT_PX },
  },
  {
    edge: 's',
    cursor: 'ns-resize',
    style: { left: 0, right: 0, bottom: 0, height: SCENE_HIT_EDGE_HIT_PX },
  },
  {
    edge: 'w',
    cursor: 'ew-resize',
    style: { top: 0, bottom: 0, left: 0, width: SCENE_HIT_EDGE_HIT_PX },
  },
  {
    edge: 'e',
    cursor: 'ew-resize',
    style: { top: 0, bottom: 0, right: 0, width: SCENE_HIT_EDGE_HIT_PX },
  },
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

const HANDLE_STYLE: CSSProperties = {
  position: 'absolute',
  width: SCENE_HIT_EDGE_HIT_PX,
  height: SCENE_HIT_EDGE_HIT_PX,
  touchAction: 'none',
  zIndex: 2,
  background: 'transparent',
};

const EDGE_HANDLE_STYLE: CSSProperties = {
  position: 'absolute',
  touchAction: 'none',
  zIndex: 2,
  background: 'transparent',
};

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
  mappedRect: FinalSceneHitRect;
  screenOffsetX: number;
  screenOffsetY: number;
  layout: SceneHitLayoutOptions;
  zIndex?: number;
  showClosePreview?: boolean;
  onClose?: () => void;
};

/** QA square on desktop lounge TV glass — drag + corner/edge resize with save. */
export function DesktopLoungeTvFrameDebugOverlay({
  measureRef,
  mappedRect,
  screenOffsetX,
  screenOffsetY,
  layout,
  zIndex = 30,
  showClosePreview = false,
  onClose,
}: Props) {
  const editor = useDesktopLoungeTvFrameEditor();
  const editSessionActive = Boolean(editor?.editEnabled);
  const isSelected = Boolean(editor?.selected);
  const canGesture = editSessionActive && isSelected;

  const dragRef = useRef<{
    mode: 'move' | 'resize-edge' | 'resize-corner';
    edge?: SceneHitResizeEdge;
    corner?: SceneHitResizeCorner;
    startX: number;
    startY: number;
    initialRect: FinalSceneHitRect;
  } | null>(null);

  const beginPointerGesture = useCallback(
    (
      mode: 'move' | 'resize-edge' | 'resize-corner',
      clientX: number,
      clientY: number,
      edge?: SceneHitResizeEdge,
      corner?: SceneHitResizeCorner,
    ) => {
      if (!canGesture || !editor) return;
      dragRef.current = {
        mode,
        edge,
        corner,
        startX: clientX,
        startY: clientY,
        initialRect: { ...editor.config.rect },
      };

      const onMove = (e: PointerEvent) => {
        const drag = dragRef.current;
        if (!drag || !editor) return;
        const dx = e.clientX - drag.startX;
        const dy = e.clientY - drag.startY;
        const { width, height } = measureContainer(measureRef.current);

        let nextRect: FinalSceneHitRect;
        if (drag.mode === 'move') {
          nextRect = rectFromMoveGesture(drag.initialRect, dx, dy, width, height);
        } else if (drag.mode === 'resize-edge' && drag.edge) {
          nextRect = rectFromEdgeResizeGesture(drag.edge, drag.initialRect, dx, dy, width, height);
        } else if (drag.mode === 'resize-corner' && drag.corner) {
          nextRect = rectFromCornerResizeGesture(drag.corner, drag.initialRect, dx, dy, width, height);
        } else {
          return;
        }

        editor.patchRect(nextRect);
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
    [canGesture, editor, measureRef],
  );

  const onOverlayPointerDown = useCallback(
    (e: ReactPointerEvent<HTMLDivElement>) => {
      if (!editSessionActive || !editor) return;
      e.preventDefault();
      e.stopPropagation();

      if (!isSelected) {
        editor.select();
        return;
      }

      const target = e.target as HTMLElement;
      if (target.dataset.desktopLoungeTvEdge || target.dataset.desktopLoungeTvCorner) return;
      beginPointerGesture('move', e.clientX, e.clientY);
    },
    [beginPointerGesture, editSessionActive, editor, isSelected],
  );

  const onEdgePointerDown = useCallback(
    (edge: SceneHitResizeEdge) => (e: ReactPointerEvent<HTMLDivElement>) => {
      if (!canGesture) return;
      e.preventDefault();
      e.stopPropagation();
      beginPointerGesture('resize-edge', e.clientX, e.clientY, edge);
    },
    [beginPointerGesture, canGesture],
  );

  const onCornerPointerDown = useCallback(
    (corner: SceneHitResizeCorner) => (e: ReactPointerEvent<HTMLDivElement>) => {
      if (!canGesture) return;
      e.preventDefault();
      e.stopPropagation();
      beginPointerGesture('resize-corner', e.clientX, e.clientY, undefined, corner);
    },
    [beginPointerGesture, canGesture],
  );

  return (
    <div
      data-desktop-lounge-tv-frame-debug
      style={{
        ...sceneHitLayoutBoxStyle(mappedRect, screenOffsetX, screenOffsetY, layout),
        zIndex,
        pointerEvents: editSessionActive ? 'auto' : 'none',
        cursor: canGesture ? 'move' : editSessionActive ? 'pointer' : undefined,
        touchAction: canGesture ? 'none' : undefined,
        backgroundColor: 'rgba(255, 193, 7, 0.42)',
        border: '2px solid rgba(255, 152, 0, 0.95)',
        ...(isSelected
          ? { outline: '2px dashed #EB1C24', outlineOffset: 2 }
          : editSessionActive
            ? { opacity: 0.72 }
            : null),
      }}
      onPointerDown={onOverlayPointerDown}
    >
      {showClosePreview ? (
        <LoungeTvCloseButton
          visible
          position={{ top: 0, right: 0 }}
          size={22}
          iconSize={12}
          onClick={(e) => {
            e.stopPropagation();
            onClose?.();
          }}
        />
      ) : null}
      <span style={DEBUG_LABEL_STYLE}>desktop lounge tv</span>
      {canGesture
        ? EDGE_HANDLES.map(({ edge, cursor, style }) => (
            <div
              key={edge}
              role="presentation"
              aria-hidden
              data-desktop-lounge-tv-edge={edge}
              style={{ ...EDGE_HANDLE_STYLE, ...style, cursor }}
              onPointerDown={onEdgePointerDown(edge)}
            />
          ))
        : null}
      {canGesture
        ? CORNER_HANDLES.map(({ corner, cursor, style }) => (
            <div
              key={corner}
              role="presentation"
              aria-hidden
              data-desktop-lounge-tv-corner={corner}
              style={{ ...HANDLE_STYLE, ...style, cursor }}
              onPointerDown={onCornerPointerDown(corner)}
            />
          ))
        : null}
    </div>
  );
}
