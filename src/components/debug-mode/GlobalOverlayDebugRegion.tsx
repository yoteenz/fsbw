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
  cssFromDebugElementOverride,
  globalOverlayRegionStyle,
  notifyGlobalOverlayDebugUpdated,
  type GlobalOverlayId,
} from '../../utils/globalOverlayDebug';
import { useGlobalOverlayDebug } from './GlobalOverlayDebugContext';

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
  zIndex: 3,
  boxSizing: 'border-box',
  background: 'rgba(255, 255, 255, 0.92)',
  border: '2px solid rgba(0, 0, 0, 0.75)',
  borderRadius: 2,
};

const EDIT_OUTLINE: CSSProperties = {
  outline: '2px dashed rgba(235, 28, 36, 0.85)',
  outlineOffset: 2,
};

function layoutPatchForCornerResize(
  corner: ResizeCorner,
  dx: number,
  dy: number,
  base: DebugElementOverride,
): Partial<DebugElementOverride> {
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

/** Applies founder-saved global overlay layout; drag/resize when global overlay debug edit is active. */
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
    corner?: ResizeCorner;
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
    (mode: 'move' | 'resize', clientX: number, clientY: number, corner?: ResizeCorner) => {
      if (!editable || !editor) return;
      dragRef.current = {
        mode,
        corner,
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
        } else if (drag.corner) {
          editor.patchRegion(overlayId, regionId, layoutPatchForCornerResize(drag.corner, dx, dy, drag.layout));
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
      if ((e.target as HTMLElement).closest('[data-global-overlay-handle]')) return;
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
        ? CORNER_HANDLES.map(({ corner, cursor, style: handlePos }) => (
            <div
              key={corner}
              role="presentation"
              aria-hidden
              data-global-overlay-handle
              style={{ ...HANDLE_STYLE, ...handlePos, cursor }}
              onPointerDown={onCornerPointerDown(corner)}
            />
          ))
        : null}
    </div>
  );
}
