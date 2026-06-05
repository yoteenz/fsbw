import { useCallback, useRef, type CSSProperties, type PointerEvent as ReactPointerEvent } from 'react';
import type { FinalSceneHitRect } from '../../constants/finalLobbySceneAssets';
import type { SceneHitRegionId } from '../../utils/sceneHitRegionDefaults';
import { sceneHitLayoutBoxStyle, type SceneHitLayoutOptions } from '../../utils/sceneHitLayout';
import { useOptionalSceneHitLayoutEditor } from './SceneHitLayoutEditorContext';

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

type ResizeCorner = 'nw' | 'ne' | 'sw' | 'se';

const CORNER_HANDLES: {
  corner: ResizeCorner;
  cursor: CSSProperties['cursor'];
  style: CSSProperties;
}[] = [
  { corner: 'nw', cursor: 'nwse-resize', style: { left: -5, top: -5 } },
  { corner: 'ne', cursor: 'nesw-resize', style: { right: -5, top: -5 } },
  { corner: 'sw', cursor: 'nesw-resize', style: { left: -5, bottom: -5 } },
  { corner: 'se', cursor: 'nwse-resize', style: { right: -5, bottom: -5 } },
];

const CORNER_HANDLE_STYLE: CSSProperties = {
  position: 'absolute',
  width: 14,
  height: 14,
  touchAction: 'none',
  zIndex: 2,
  boxSizing: 'border-box',
  background: 'rgba(255, 255, 255, 0.92)',
  border: '2px solid rgba(0, 0, 0, 0.75)',
  borderRadius: 2,
};

function layoutPatchForCornerResize(
  corner: ResizeCorner,
  dx: number,
  dy: number,
  base: SceneHitLayoutOptions,
): Partial<SceneHitLayoutOptions> {
  const offsetX = base.layoutOffsetX ?? 0;
  const offsetY = base.layoutOffsetY ?? 0;
  const widthExtra = base.layoutWidthExtraPx ?? 0;
  const heightExtra = base.layoutHeightExtraPx ?? 0;

  switch (corner) {
    case 'se':
      return {
        layoutWidthExtraPx: widthExtra + dx,
        layoutHeightExtraPx: heightExtra + dy,
      };
    case 'sw':
      return {
        layoutOffsetX: offsetX + dx,
        layoutWidthExtraPx: widthExtra - dx,
        layoutHeightExtraPx: heightExtra + dy,
      };
    case 'ne':
      return {
        layoutOffsetY: offsetY + dy,
        layoutWidthExtraPx: widthExtra + dx,
        layoutHeightExtraPx: heightExtra - dy,
      };
    case 'nw':
      return {
        layoutOffsetX: offsetX + dx,
        layoutOffsetY: offsetY + dy,
        layoutWidthExtraPx: widthExtra - dx,
        layoutHeightExtraPx: heightExtra - dy,
      };
  }
}

type Props = {
  rect: FinalSceneHitRect;
  label: string;
  zIndex?: number;
  overlayStyle?: CSSProperties;
  screenOffsetX?: number;
  screenOffsetY?: number;
  layout?: SceneHitLayoutOptions;
  showLabel?: boolean;
  /** Enables drag/resize when `?sceneHitEdit=1` is active. */
  regionId?: SceneHitRegionId;
};

/** QA colored box — draggable/resizable when scene hit edit mode is on. */
export function SceneHitDebugOverlay({
  rect,
  label,
  zIndex = 25,
  overlayStyle,
  screenOffsetX = 0,
  screenOffsetY = 0,
  layout,
  showLabel = true,
  regionId,
}: Props) {
  const editor = useOptionalSceneHitLayoutEditor();
  const editable = Boolean(regionId && editor?.editEnabled);
  const dragRef = useRef<{
    mode: 'move' | 'resize';
    corner?: ResizeCorner;
    startX: number;
    startY: number;
    layout: SceneHitLayoutOptions;
  } | null>(null);

  const beginPointerGesture = useCallback(
    (mode: 'move' | 'resize', clientX: number, clientY: number, corner?: ResizeCorner) => {
      if (!editable || !regionId || !editor || !layout) return;
      dragRef.current = {
        mode,
        corner,
        startX: clientX,
        startY: clientY,
        layout: { ...layout, ...(layout.layoutScale ? { layoutScale: { ...layout.layoutScale } } : {}) },
      };

      const onMove = (e: PointerEvent) => {
        const drag = dragRef.current;
        if (!drag) return;
        const dx = e.clientX - drag.startX;
        const dy = e.clientY - drag.startY;
        if (drag.mode === 'move') {
          editor.patchRegionLayout(regionId, {
            layoutOffsetX: (drag.layout.layoutOffsetX ?? 0) + dx,
            layoutOffsetY: (drag.layout.layoutOffsetY ?? 0) + dy,
          });
        } else if (drag.corner) {
          editor.patchRegionLayout(regionId, layoutPatchForCornerResize(drag.corner, dx, dy, drag.layout));
        }
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
    [editable, editor, layout, regionId],
  );

  const onMovePointerDown = useCallback(
    (e: ReactPointerEvent<HTMLDivElement>) => {
      if (!editable) return;
      e.preventDefault();
      e.stopPropagation();
      beginPointerGesture('move', e.clientX, e.clientY);
    },
    [beginPointerGesture, editable],
  );

  const onCornerPointerDown = useCallback(
    (corner: ResizeCorner) => (e: ReactPointerEvent<HTMLDivElement>) => {
      if (!editable) return;
      e.preventDefault();
      e.stopPropagation();
      beginPointerGesture('resize', e.clientX, e.clientY, corner);
    },
    [beginPointerGesture, editable],
  );

  return (
    <div
      style={{
        ...sceneHitLayoutBoxStyle(rect, screenOffsetX, screenOffsetY, layout),
        zIndex,
        pointerEvents: editable ? 'auto' : 'none',
        cursor: editable ? 'move' : undefined,
        touchAction: editable ? 'none' : undefined,
        backgroundColor: 'rgba(255, 193, 7, 0.42)',
        border: '2px solid rgba(255, 152, 0, 0.95)',
        ...overlayStyle,
      }}
      onPointerDown={onMovePointerDown}
    >
      {showLabel ? <span style={DEBUG_LABEL_STYLE}>{label}</span> : null}
      {editable
        ? CORNER_HANDLES.map(({ corner, cursor, style }) => (
            <div
              key={corner}
              role="presentation"
              aria-hidden
              style={{ ...CORNER_HANDLE_STYLE, ...style, cursor }}
              onPointerDown={onCornerPointerDown(corner)}
            />
          ))
        : null}
    </div>
  );
}
