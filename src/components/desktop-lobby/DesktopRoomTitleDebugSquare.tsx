import {
  useCallback,
  useRef,
  type CSSProperties,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
  type RefObject,
} from 'react';
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
  children: ReactNode;
};

type DragState = {
  startX: number;
  startY: number;
  startLeftPct: number;
  startTopPct: number;
};

/** Temporary QA square wrapping title + subtitle — drag moves both in cover-mapped space. */
export function DesktopRoomTitleDebugSquare({ zoneId, measureRef, anchorStyle, children }: Props) {
  const editor = useDesktopRoomTitlePlacementEditor();
  const debugEnabled = useDesktopRoomTitleDebugEnabled();
  const profileHook = useDesktopRoomTitleViewportProfile();
  const profile = editor?.profile ?? profileHook;
  const rootRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<DragState | null>(null);

  const editEnabled = Boolean(editor?.editEnabled && profile);
  const showSquare = Boolean(debugEnabled && profile);
  const isSelected = editor?.activeZoneId === zoneId;

  const onPointerDown = useCallback(
    (event: ReactPointerEvent<HTMLDivElement>) => {
      if (!editor?.editEnabled || !profile) return;
      event.preventDefault();
      event.stopPropagation();

      if (!isSelected) {
        editor.setActiveZoneId(zoneId);
        return;
      }

      const layer = measureRef.current ?? (rootRef.current?.offsetParent as HTMLElement | null);
      const { width, height } = measureDesktopRoomCoverBox(layer);
      if (width <= 0 || height <= 0) return;

      const placement = editor.getPlacement(zoneId);
      const mapped = mapDesktopRoomTitlePlacementToContainer(placement, width, height);
      dragRef.current = {
        startX: event.clientX,
        startY: event.clientY,
        startLeftPct: mapped.leftPct,
        startTopPct: mapped.topPct,
      };

      const onMove = (e: PointerEvent) => {
        const drag = dragRef.current;
        if (!drag || !editor) return;

        const liveLayer = measureRef.current ?? (rootRef.current?.offsetParent as HTMLElement | null);
        const { width: w, height: h } = measureDesktopRoomCoverBox(liveLayer);
        if (w <= 0 || h <= 0) return;

        const dxPct = ((e.clientX - drag.startX) / w) * 100;
        const dyPct = ((e.clientY - drag.startY) / h) * 100;
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
    [editor, isSelected, measureRef, profile, zoneId],
  );

  if (!showSquare || !profile) {
    return (
      <div className="desktop-room-title" style={anchorStyle}>
        {children}
      </div>
    );
  }

  const outline = ROOM_TITLE_PROFILE_DEBUG_COLOR[profile];
  const fill = ROOM_TITLE_PROFILE_DEBUG_FILL[profile];

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
      </span>
      {children}
    </div>
  );
}
