import {
  useCallback,
  useMemo,
  useRef,
  type PointerEvent as ReactPointerEvent,
  type RefObject,
} from 'react';
import { DESKTOP_SHOPPING_BAG_IMAGE } from '../../constants/desktopShoppingBag';
import { useDesktopRoomCoverMeasure } from '../../hooks/useDesktopRoomCoverMeasure';
import {
  mapDesktopRoomContainerPointToImage,
  mapDesktopRoomImagePointToContainer,
} from '../../utils/desktopRoomCoverLayout';
import { clampQuadPoint, quadCornerList, type QuadCornerId } from '../../utils/quadPerspectiveTransform';
import { useDesktopShoppingBagTabletDebugRequired } from './DesktopShoppingBagTabletDebugProvider';
import './DesktopShoppingBagTabletDebug.css';

const CORNER_LABELS: Record<QuadCornerId, string> = {
  tl: 'TL',
  tr: 'TR',
  br: 'BR',
  bl: 'BL',
};

type Props = {
  measureRef: RefObject<HTMLElement | null>;
};

export function DesktopShoppingBagTabletDebugPolygon({ measureRef }: Props) {
  const editor = useDesktopShoppingBagTabletDebugRequired();
  const { width: cw, height: ch, isMeasured } = useDesktopRoomCoverMeasure(measureRef);
  const dragCornerRef = useRef<QuadCornerId | null>(null);

  const containerQuad = useMemo(() => {
    if (!isMeasured || cw <= 0 || ch <= 0) return null;
    const corners = quadCornerList(editor.quad);
    const mapped = corners.map((p) =>
      mapDesktopRoomImagePointToContainer(p, cw, ch, DESKTOP_SHOPPING_BAG_IMAGE),
    );
    return {
      tl: mapped[0],
      tr: mapped[1],
      br: mapped[2],
      bl: mapped[3],
      pointsPx: mapped.map((m) => ({ x: m.left * cw, y: m.top * ch })),
    };
  }, [editor.quad, cw, ch, isMeasured]);

  const clientToImagePoint = useCallback(
    (clientX: number, clientY: number) => {
      const el = measureRef.current;
      if (!el || cw <= 0 || ch <= 0) return null;
      const rect = el.getBoundingClientRect();
      const left = (clientX - rect.left) / rect.width;
      const top = (clientY - rect.top) / rect.height;
      return clampQuadPoint(
        mapDesktopRoomContainerPointToImage(
          { left, top },
          rect.width,
          rect.height,
          DESKTOP_SHOPPING_BAG_IMAGE,
        ),
      );
    },
    [cw, ch, measureRef],
  );

  const beginCornerDrag = useCallback(
    (cornerId: QuadCornerId, clientX: number, clientY: number) => {
      dragCornerRef.current = cornerId;
      const initial = clientToImagePoint(clientX, clientY);
      if (initial) editor.patchCorner(cornerId, initial);

      const onMove = (e: PointerEvent) => {
        const id = dragCornerRef.current;
        if (!id) return;
        const next = clientToImagePoint(e.clientX, e.clientY);
        if (next) editor.patchCorner(id, next);
      };

      const onUp = () => {
        dragCornerRef.current = null;
        window.removeEventListener('pointermove', onMove);
        window.removeEventListener('pointerup', onUp);
        window.removeEventListener('pointercancel', onUp);
      };

      window.addEventListener('pointermove', onMove);
      window.addEventListener('pointerup', onUp);
      window.addEventListener('pointercancel', onUp);
    },
    [clientToImagePoint, editor],
  );

  const onCornerPointerDown = useCallback(
    (cornerId: QuadCornerId) => (e: ReactPointerEvent<HTMLButtonElement>) => {
      e.preventDefault();
      e.stopPropagation();
      beginCornerDrag(cornerId, e.clientX, e.clientY);
    },
    [beginCornerDrag],
  );

  if (!editor.debugEnabled || !editor.overlayVisible || !containerQuad) return null;

  const polygonPoints = containerQuad.pointsPx.map((p) => `${p.x},${p.y}`).join(' ');

  return (
    <div className="desktop-shopping-bag-tablet-debug-polygon" aria-hidden>
      <svg
        className="desktop-shopping-bag-tablet-debug-polygon__svg"
        viewBox={`0 0 ${cw} ${ch}`}
        preserveAspectRatio="none"
      >
        <polygon
          className="desktop-shopping-bag-tablet-debug-polygon__shape"
          points={polygonPoints}
        />
      </svg>

      {(['tl', 'tr', 'br', 'bl'] as QuadCornerId[]).map((id) => {
        const pt = containerQuad[id];
        return (
          <button
            key={id}
            type="button"
            className="desktop-shopping-bag-tablet-debug-polygon__handle"
            style={{
              left: `${pt.left * 100}%`,
              top: `${pt.top * 100}%`,
            }}
            aria-label={`Drag ${CORNER_LABELS[id]} corner`}
            onPointerDown={onCornerPointerDown(id)}
          >
            {CORNER_LABELS[id]}
          </button>
        );
      })}
    </div>
  );
}
