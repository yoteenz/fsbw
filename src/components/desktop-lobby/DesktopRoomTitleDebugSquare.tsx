import {
  useCallback,
  useEffect,
  useRef,
  type CSSProperties,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
  type RefObject,
} from 'react';
import {
  clampDesktopRoomTitleTextScale,
  roundDesktopRoomTitleTextScale,
  resolveDesktopRoomTitleLineTextScale,
} from '../../constants/desktopRoomTitleTextScale';
import {
  ROOM_TITLE_PROFILE_DEBUG_COLOR,
  ROOM_TITLE_PROFILE_DEBUG_FILL,
  ROOM_TITLE_PROFILE_LABEL,
  useDesktopRoomTitleDebugEnabled,
  useDesktopRoomTitleViewportProfile,
} from '../../utils/desktopRoomTitlePlacementDebug';
import {
  mapDesktopRoomContainerPointToImage,
  mapDesktopRoomTitlePlacementToContainer,
} from '../../utils/desktopRoomCoverLayout';
import { measureDesktopRoomCoverBox } from '../../hooks/useDesktopRoomCoverMeasure';
import { useDesktopRoomTitlePlacementEditor } from './DesktopRoomTitlePlacementEditorContext';

type Props = {
  zoneId: string;
  measureRef: RefObject<HTMLElement | null>;
  anchorStyle: CSSProperties;
  textScale: number;
  titleTextScale: number;
  subtitleTextScale: number;
  children: ReactNode;
};

type DragState = {
  pointerId: number;
  startX: number;
  startY: number;
  startLeftPct: number;
  startTopPct: number;
};

type PinchState = {
  startDistance: number;
  startScale: number;
};

function pointerDistance(
  a: { x: number; y: number },
  b: { x: number; y: number },
): number {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  return Math.hypot(dx, dy);
}

/** Temporary QA square — drag to move; pinch / wheel to scale title + subtitle. */
export function DesktopRoomTitleDebugSquare({
  zoneId,
  measureRef,
  anchorStyle,
  textScale,
  titleTextScale,
  subtitleTextScale,
  children,
}: Props) {
  const editor = useDesktopRoomTitlePlacementEditor();
  const debugEnabled = useDesktopRoomTitleDebugEnabled();
  const profileHook = useDesktopRoomTitleViewportProfile();
  const profile = editor?.profile ?? profileHook;
  const rootRef = useRef<HTMLDivElement>(null);
  const pointersRef = useRef<Map<number, { x: number; y: number }>>(new Map());
  const dragRef = useRef<DragState | null>(null);
  const pinchRef = useRef<PinchState | null>(null);

  const editEnabled = Boolean(editor?.editEnabled && profile);
  const showSquare = Boolean(debugEnabled && profile);
  const isSelected = editor?.activeZoneId === zoneId;

  const patchTextScale = useCallback(
    (nextScale: number) => {
      if (!editor) return;
      editor.patchPlacement(zoneId, {
        textScale: roundDesktopRoomTitleTextScale(nextScale),
      });
    },
    [editor, zoneId],
  );

  const patchTitleTextScale = useCallback(
    (nextScale: number) => {
      if (!editor) return;
      const placement = editor.getPlacement(zoneId);
      const master = placement.textScale ?? 1;
      const clampedEffective = clampDesktopRoomTitleTextScale(nextScale);
      const lineScale = master > 0 ? clampedEffective / master : clampedEffective;
      editor.patchPlacement(zoneId, {
        titleTextScale: roundDesktopRoomTitleTextScale(lineScale),
      });
    },
    [editor, zoneId],
  );

  const patchSubtitleTextScale = useCallback(
    (nextScale: number) => {
      if (!editor) return;
      const placement = editor.getPlacement(zoneId);
      const master = placement.textScale ?? 1;
      const clampedEffective = clampDesktopRoomTitleTextScale(nextScale);
      const lineScale = master > 0 ? clampedEffective / master : clampedEffective;
      editor.patchPlacement(zoneId, {
        subtitleTextScale: roundDesktopRoomTitleTextScale(lineScale),
      });
    },
    [editor, zoneId],
  );

  const beginDrag = useCallback(
    (pointerId: number, clientX: number, clientY: number) => {
      if (!editor) return;

      const layer = measureRef.current ?? (rootRef.current?.offsetParent as HTMLElement | null);
      const { width, height } = measureDesktopRoomCoverBox(layer);
      if (width <= 0 || height <= 0) return;

      const placement = editor.getPlacement(zoneId);
      const mapped = mapDesktopRoomTitlePlacementToContainer(placement, width, height);
      dragRef.current = {
        pointerId,
        startX: clientX,
        startY: clientY,
        startLeftPct: mapped.leftPct,
        startTopPct: mapped.topPct,
      };
      pinchRef.current = null;
    },
    [editor, measureRef, zoneId],
  );

  const beginPinch = useCallback(() => {
    if (!editor || pointersRef.current.size < 2) return;
    const points = [...pointersRef.current.values()];
    dragRef.current = null;
    pinchRef.current = {
      startDistance: Math.max(24, pointerDistance(points[0], points[1])),
      startScale: editor.getPlacement(zoneId).textScale ?? 1,
    };
  }, [editor, zoneId]);

  const onPointerDown = useCallback(
    (event: ReactPointerEvent<HTMLDivElement>) => {
      if (!editor?.editEnabled || !profile) return;
      event.preventDefault();
      event.stopPropagation();

      rootRef.current?.setPointerCapture(event.pointerId);
      pointersRef.current.set(event.pointerId, { x: event.clientX, y: event.clientY });

      if (!isSelected) {
        editor.setActiveZoneId(zoneId);
        return;
      }

      if (pointersRef.current.size === 1) {
        beginDrag(event.pointerId, event.clientX, event.clientY);
      } else if (pointersRef.current.size === 2) {
        beginPinch();
      }
    },
    [beginDrag, beginPinch, editor, isSelected, profile, zoneId],
  );

  const onPointerMove = useCallback(
    (event: ReactPointerEvent<HTMLDivElement>) => {
      if (!editor?.editEnabled || !profile || !isSelected) return;
      if (!pointersRef.current.has(event.pointerId)) return;

      pointersRef.current.set(event.pointerId, { x: event.clientX, y: event.clientY });

      if (pointersRef.current.size >= 2 && pinchRef.current) {
        const points = [...pointersRef.current.values()];
        if (points.length < 2) return;
        const distance = pointerDistance(points[0], points[1]);
        const ratio = distance / pinchRef.current.startDistance;
        patchTextScale(pinchRef.current.startScale * ratio);
        return;
      }

      const drag = dragRef.current;
      if (!drag || drag.pointerId !== event.pointerId) return;

      const liveLayer = measureRef.current ?? (rootRef.current?.offsetParent as HTMLElement | null);
      const { width: w, height: h } = measureDesktopRoomCoverBox(liveLayer);
      if (w <= 0 || h <= 0) return;

      const dxPct = ((event.clientX - drag.startX) / w) * 100;
      const dyPct = ((event.clientY - drag.startY) / h) * 100;
      const imagePoint = mapDesktopRoomContainerPointToImage(
        {
          left: (drag.startLeftPct + dxPct) / 100,
          top: (drag.startTopPct + dyPct) / 100,
        },
        w,
        h,
      );

      editor.patchPlacement(zoneId, {
        titleTopPct: Math.round(imagePoint.y * 10000) / 100,
        centerOffsetPct: Math.round((imagePoint.x - 0.5) * 10000) / 100,
      });
    },
    [editor, isSelected, measureRef, patchTextScale, profile, zoneId],
  );

  const endPointer = useCallback((pointerId: number) => {
    pointersRef.current.delete(pointerId);
    if (dragRef.current?.pointerId === pointerId) {
      dragRef.current = null;
    }
    if (pointersRef.current.size < 2) {
      pinchRef.current = null;
    }
    if (pointersRef.current.size === 1) {
      const [remainingId, point] = [...pointersRef.current.entries()][0];
      beginDrag(remainingId, point.x, point.y);
    }
  }, [beginDrag]);

  const onPointerUp = useCallback(
    (event: ReactPointerEvent<HTMLDivElement>) => {
      if (rootRef.current?.hasPointerCapture(event.pointerId)) {
        rootRef.current.releasePointerCapture(event.pointerId);
      }
      endPointer(event.pointerId);
    },
    [endPointer],
  );

  const onPointerCancel = useCallback(
    (event: ReactPointerEvent<HTMLDivElement>) => {
      if (rootRef.current?.hasPointerCapture(event.pointerId)) {
        rootRef.current.releasePointerCapture(event.pointerId);
      }
      endPointer(event.pointerId);
    },
    [endPointer],
  );

  useEffect(() => {
    const el = rootRef.current;
    if (!el || !editEnabled || !isSelected || !editor) return;

    const onWheel = (event: WheelEvent) => {
      event.preventDefault();
      const factor = event.deltaY < 0 ? 1.04 : 0.96;
      const placement = editor.getPlacement(zoneId);
      const master = placement.textScale ?? 1;

      if (event.shiftKey) {
        patchTitleTextScale(resolveDesktopRoomTitleLineTextScale(placement, 'title') * factor);
        return;
      }
      if (event.altKey) {
        patchSubtitleTextScale(resolveDesktopRoomTitleLineTextScale(placement, 'subtitle') * factor);
        return;
      }

      patchTextScale(master * factor);
    };

    el.addEventListener('wheel', onWheel, { passive: false });
    return () => el.removeEventListener('wheel', onWheel);
  }, [editEnabled, editor, isSelected, patchSubtitleTextScale, patchTextScale, patchTitleTextScale, zoneId]);

  if (!showSquare || !profile) {
    return (
      <div className="desktop-room-title" style={anchorStyle}>
        {children}
      </div>
    );
  }

  const outline = ROOM_TITLE_PROFILE_DEBUG_COLOR[profile];
  const fill = ROOM_TITLE_PROFILE_DEBUG_FILL[profile];
  const scaleLabel =
    textScale === 1 && titleTextScale === 1 && subtitleTextScale === 1
      ? ''
      : ` · ${titleTextScale.toFixed(2)} / ${subtitleTextScale.toFixed(2)}×`;

  const debugStyle: CSSProperties = {
    outline: `${isSelected ? 2 : 1}px dashed ${outline}`,
    outlineOffset: 4,
    background: fill,
    borderRadius: 2,
    cursor: editEnabled ? (isSelected ? 'move' : 'pointer') : 'default',
    touchAction: editEnabled ? 'none' : 'auto',
    boxShadow: isSelected ? `0 0 0 1px ${outline}` : undefined,
  };

  return (
    <div
      ref={rootRef}
      className="desktop-room-title desktop-room-title-debug-square"
      style={{ ...anchorStyle, ...debugStyle }}
      onPointerDown={editEnabled ? onPointerDown : undefined}
      onPointerMove={editEnabled ? onPointerMove : undefined}
      onPointerUp={editEnabled ? onPointerUp : undefined}
      onPointerCancel={editEnabled ? onPointerCancel : undefined}
    >
      <span
        aria-hidden
        style={{
          position: 'absolute',
          left: 0,
          top: -18,
          zIndex: 2,
          fontFamily: 'monospace',
          fontSize: 9,
          lineHeight: 1.2,
          letterSpacing: '0.08em',
          color: '#000',
          background: 'rgba(255,255,255,0.92)',
          border: `1px solid ${outline}`,
          padding: '1px 4px',
          pointerEvents: 'none',
          whiteSpace: 'nowrap',
        }}
      >
        {ROOM_TITLE_PROFILE_LABEL[profile]} · {zoneId}
        {scaleLabel}
      </span>
      {children}
    </div>
  );
}
