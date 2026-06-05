import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
} from 'react';
import { canAccessPageDebugMode } from '../../utils/adminAuth';
import { snapDebugPx, type DebugElementOverride } from '../../utils/debugMode';
import {
  layoutPatchForEdgeResize,
  SCENE_HIT_EDGE_HIT_PX,
  type SceneHitResizeEdge,
} from '../../utils/sceneHitLayoutEditorGestures';
import {
  cssFromDebugElementOverride,
  globalOverlayRegionStyle,
  notifyGlobalOverlayDebugUpdated,
  type GlobalOverlayId,
} from '../../utils/globalOverlayDebug';
import { useGlobalOverlayDebug } from './GlobalOverlayDebugContext';

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
  zIndex: 3,
  background: 'transparent',
};

const EDIT_OUTLINE: CSSProperties = {
  outline: '2px dashed rgba(235, 28, 36, 0.85)',
  outlineOffset: 2,
};

type Props = {
  overlayId: GlobalOverlayId;
  regionId: string;
  baseOverride?: DebugElementOverride;
  style?: CSSProperties;
  className?: string;
  children: ReactNode;
  onMouseDown?: (e: ReactPointerEvent<HTMLDivElement>) => void;
  onClick?: (e: React.MouseEvent<HTMLDivElement>) => void;
  /** Extra attributes forwarded to the wrapper (e.g. data-dropdown-content). */
  dataAttrs?: Record<string, string>;
};

/** Applies founder-saved global overlay layout; drag center to move, border edges to resize. */
export function GlobalOverlayDebugRegion({
  overlayId,
  regionId,
  baseOverride = {},
  style,
  className,
  children,
  onMouseDown,
  onClick,
  dataAttrs,
}: Props) {
  const editor = useGlobalOverlayDebug();
  const [localRevision, setLocalRevision] = useState(0);
  const dragRef = useRef<{
    mode: 'move' | 'resize';
    edge?: SceneHitResizeEdge;
    startX: number;
    startY: number;
    layout: DebugElementOverride;
  } | null>(null);

  const founderPreview = canAccessPageDebugMode();
  const editable = Boolean(editor?.editEnabled && editor.editingOverlayId === overlayId);

  useEffect(() => {
    const bump = () => setLocalRevision((v) => v + 1);
    window.addEventListener('bawPageDebugOverridesUpdated', bump);
    return () => window.removeEventListener('bawPageDebugOverridesUpdated', bump);
  }, []);

  const mergedOverride = useMemo(() => {
    void localRevision;
    void editor?.revision;
    const fromEditor = editor?.getRegionOverride(overlayId, regionId);
    return globalOverlayRegionStyle(overlayId, regionId, { ...baseOverride, ...fromEditor });
  }, [baseOverride, editor, editor?.revision, localRevision, overlayId, regionId]);

  const layoutStyle = founderPreview ? cssFromDebugElementOverride(mergedOverride) : {};

  const beginPointerGesture = useCallback(
    (mode: 'move' | 'resize', clientX: number, clientY: number, edge?: SceneHitResizeEdge) => {
      if (!editable || !editor) return;
      dragRef.current = {
        mode,
        edge,
        startX: clientX,
        startY: clientY,
        layout: { ...mergedOverride },
      };

      const onMove = (e: PointerEvent) => {
        const drag = dragRef.current;
        if (!drag || !editor) return;
        const dx = snapDebugPx(e.clientX - drag.startX);
        const dy = snapDebugPx(e.clientY - drag.startY);
        if (drag.mode === 'move') {
          editor.patchRegion(overlayId, regionId, {
            layoutOffsetX: (drag.layout.layoutOffsetX ?? 0) + dx,
            layoutOffsetY: (drag.layout.layoutOffsetY ?? 0) + dy,
          });
          dragRef.current = {
            ...drag,
            startX: e.clientX,
            startY: e.clientY,
            layout: {
              ...drag.layout,
              layoutOffsetX: (drag.layout.layoutOffsetX ?? 0) + dx,
              layoutOffsetY: (drag.layout.layoutOffsetY ?? 0) + dy,
            },
          };
        } else if (drag.edge) {
          editor.patchRegion(
            overlayId,
            regionId,
            layoutPatchForEdgeResize(drag.edge, dx, dy, drag.layout) as Partial<DebugElementOverride>,
          );
        }
      };

      const onUp = () => {
        dragRef.current = null;
        notifyGlobalOverlayDebugUpdated();
        window.removeEventListener('pointermove', onMove);
        window.removeEventListener('pointerup', onUp);
        window.removeEventListener('pointercancel', onUp);
      };

      window.addEventListener('pointermove', onMove);
      window.addEventListener('pointerup', onUp);
      window.addEventListener('pointercancel', onUp);
    },
    [editable, editor, mergedOverride, overlayId, regionId],
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
      {...dataAttrs}
      className={className}
      style={{
        ...style,
        ...layoutStyle,
        position: style?.position ?? layoutStyle.position ?? 'relative',
        ...(editable ? EDIT_OUTLINE : undefined),
        ...(editable ? { cursor: 'move', touchAction: 'none' } : undefined),
      }}
      onPointerDown={(e) => {
        onMovePointerDown(e);
        onMouseDown?.(e);
      }}
      onClick={onClick}
    >
      {editable ? (
        <span
          style={{
            position: 'absolute',
            left: 2,
            top: 2,
            zIndex: 2,
            fontFamily: 'monospace',
            fontSize: 10,
            lineHeight: 1.2,
            color: '#000',
            background: 'rgba(255,255,255,0.85)',
            padding: '1px 4px',
            pointerEvents: 'none',
          }}
        >
          {overlayId}/{regionId}
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
              onPointerDown={onEdgePointerDown(edge)}
            />
          ))
        : null}
    </div>
  );
}
