import { useCallback, useRef, type CSSProperties, type PointerEvent as ReactPointerEvent, type ReactNode } from 'react';
import type { SceneHitRegionId } from '../../utils/sceneHitRegionDefaults';
import {
  layoutPatchForEdgeResize,
  SCENE_HIT_EDGE_HIT_PX,
  type SceneHitResizeEdge,
} from '../../utils/sceneHitLayoutEditorGestures';
import type { SceneHitLayoutOptions } from '../../utils/sceneHitLayout';
import { useSceneHitDebugEnabled, useSceneHitEditEnabled } from '../../utils/sceneHitDebug';
import { useOptionalSceneHitLayoutEditor } from '../lobby/SceneHitLayoutEditorContext';

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

const EDGE_HANDLE_STYLE: CSSProperties = {
  position: 'absolute',
  touchAction: 'none',
  zIndex: 50,
  background: 'transparent',
};

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
    edge?: SceneHitResizeEdge;
    startX: number;
    startY: number;
    layout: SceneHitLayoutOptions;
  } | null>(null);

  const beginGesture = useCallback(
    (mode: 'move' | 'resize', clientX: number, clientY: number, edge?: SceneHitResizeEdge) => {
      if (!editable || !editor) return;
      dragRef.current = {
        mode,
        edge,
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
        } else if (drag.edge) {
          editor.patchRegionLayout(regionId, layoutPatchForEdgeResize(drag.edge, dx, dy, drag.layout));
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
      if ((e.target as HTMLElement).dataset.sceneHitEdge) return;
      e.preventDefault();
      e.stopPropagation();
      beginGesture('move', e.clientX, e.clientY);
    },
    [beginGesture, editable],
  );

  const onEdgeDown = useCallback(
    (edge: SceneHitResizeEdge) => (e: ReactPointerEvent<HTMLDivElement>) => {
      if (!editable) return;
      e.preventDefault();
      e.stopPropagation();
      beginGesture('resize', e.clientX, e.clientY, edge);
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
        ? EDGE_HANDLES.map(({ edge, cursor, style: handlePos }) => (
            <div
              key={edge}
              role="presentation"
              aria-hidden
              data-scene-hit-edge={edge}
              style={{ ...EDGE_HANDLE_STYLE, ...handlePos, cursor }}
              onPointerDown={onEdgeDown(edge)}
            />
          ))
        : null}
    </div>
  );
}
