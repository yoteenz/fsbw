import { useCallback, useRef, type CSSProperties, type PointerEvent as ReactPointerEvent, type ReactNode } from 'react';
import type { SceneHitRegionId } from '../../utils/sceneHitRegionDefaults';
import type { SceneHitLayoutOptions } from '../../utils/sceneHitLayout';
import { useSceneHitDebugEnabled, useSceneHitEditEnabled } from '../../utils/sceneHitDebug';
import { useOptionalSceneHitLayoutEditor } from '../lobby/SceneHitLayoutEditorContext';

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

const HANDLE_STYLE: CSSProperties = {
  position: 'absolute',
  width: 14,
  height: 14,
  touchAction: 'none',
  zIndex: 50,
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
  regionId: SceneHitRegionId;
  label: string;
  layout: SceneHitLayoutOptions;
  style?: CSSProperties;
  className?: string;
  debugOutline?: { backgroundColor: string; border: string };
  children: ReactNode;
};

/** Draggable/resizable wrapper for open TV inner regions (media panel, video frame, glass). */
export function LoungeTvInnerLayoutEditor({
  regionId,
  label,
  layout,
  style,
  className,
  debugOutline,
  children,
}: Props) {
  const hitDebug = useSceneHitDebugEnabled();
  const hitEdit = useSceneHitEditEnabled();
  const editor = useOptionalSceneHitLayoutEditor();
  const editable = Boolean(hitEdit && editor?.editEnabled);
  const dragRef = useRef<{
    mode: 'move' | 'resize';
    corner?: ResizeCorner;
    startX: number;
    startY: number;
    layout: SceneHitLayoutOptions;
  } | null>(null);

  const beginGesture = useCallback(
    (mode: 'move' | 'resize', clientX: number, clientY: number, corner?: ResizeCorner) => {
      if (!editable || !editor) return;
      dragRef.current = {
        mode,
        corner,
        startX: clientX,
        startY: clientY,
        layout: {
          ...layout,
          ...(layout.layoutScale ? { layoutScale: { ...layout.layoutScale } } : {}),
        },
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

  const onMoveDown = useCallback(
    (e: ReactPointerEvent<HTMLDivElement>) => {
      if (!editable) return;
      e.preventDefault();
      e.stopPropagation();
      beginGesture('move', e.clientX, e.clientY);
    },
    [beginGesture, editable],
  );

  const onCornerDown = useCallback(
    (corner: ResizeCorner) => (e: ReactPointerEvent<HTMLDivElement>) => {
      if (!editable) return;
      e.preventDefault();
      e.stopPropagation();
      beginGesture('resize', e.clientX, e.clientY, corner);
    },
    [beginGesture, editable],
  );

  const showDebug = hitDebug && debugOutline;

  return (
    <div
      className={className}
      style={{
        position: 'relative',
        boxSizing: 'border-box',
        ...style,
        ...(showDebug ? debugOutline : null),
        ...(editable ? { cursor: 'move', touchAction: 'none' } : null),
      }}
      onPointerDown={editable ? onMoveDown : undefined}
    >
      {showDebug ? (
        <span
          aria-hidden
          style={{
            position: 'absolute',
            left: 2,
            top: 2,
            zIndex: 40,
            fontFamily: 'monospace',
            fontSize: 10,
            lineHeight: 1.2,
            color: '#000',
            background: 'rgba(255, 255, 255, 0.75)',
            padding: '1px 3px',
            pointerEvents: 'none',
            textTransform: 'lowercase',
          }}
        >
          {label}
        </span>
      ) : null}
      {children}
      {editable
        ? CORNER_HANDLES.map(({ corner, cursor, style: handlePos }) => (
            <div
              key={corner}
              role="presentation"
              aria-hidden
              style={{ ...HANDLE_STYLE, ...handlePos, cursor }}
              onPointerDown={onCornerDown(corner)}
            />
          ))
        : null}
    </div>
  );
}
