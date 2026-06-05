import { useCallback, useRef, type CSSProperties, type PointerEvent as ReactPointerEvent } from 'react';
import type { FinalSceneHitRect } from '../../constants/finalLobbySceneAssets';
import type { SceneHitRegionId } from '../../utils/sceneHitRegionDefaults';
import {
  layoutPatchForEdgeResize,
  SCENE_HIT_EDGE_HIT_PX,
  type SceneHitResizeEdge,
} from '../../utils/sceneHitLayoutEditorGestures';
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
  zIndex: 2,
  background: 'transparent',
};

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

/** QA colored box — drag center to move; drag border edges to resize when scene hit edit mode is on. */
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
    edge?: SceneHitResizeEdge;
    startX: number;
    startY: number;
    layout: SceneHitLayoutOptions;
  } | null>(null);

  const beginPointerGesture = useCallback(
    (mode: 'move' | 'resize', clientX: number, clientY: number, edge?: SceneHitResizeEdge) => {
      if (!editable || !regionId || !editor || !layout) return;
      dragRef.current = {
        mode,
        edge,
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

  const onMovePointerDown = useCallback(
    (e: ReactPointerEvent<HTMLDivElement>) => {
      if (!editable) return;
      if ((e.target as HTMLElement).dataset.sceneHitEdge) return;
      e.preventDefault();
      e.stopPropagation();
      beginPointerGesture('move', e.clientX, e.clientY);
    },
    [beginPointerGesture, editable],
  );

  const onEdgePointerDown = useCallback(
    (edge: SceneHitResizeEdge) => (e: ReactPointerEvent<HTMLDivElement>) => {
      if (!editable) return;
      e.preventDefault();
      e.stopPropagation();
      beginPointerGesture('resize', e.clientX, e.clientY, edge);
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
        ? EDGE_HANDLES.map(({ edge, cursor, style }) => (
            <div
              key={edge}
              role="presentation"
              aria-hidden
              data-scene-hit-edge={edge}
              style={{ ...EDGE_HANDLE_STYLE, ...style, cursor }}
              onPointerDown={onEdgePointerDown(edge)}
            />
          ))
        : null}
    </div>
  );
}
