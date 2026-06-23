import {
  useCallback,
  useMemo,
  useRef,
  type PointerEvent as ReactPointerEvent,
  type RefObject,
} from 'react';
import { createPortal } from 'react-dom';
import type { PerspectivePanelCornerId, PerspectivePanelId, PerspectivePanelQuad } from '../../types/perspectivePanel';
import { useDesktopRoomCoverMeasure } from '../../hooks/useDesktopRoomCoverMeasure';
import { useElementScreenRect } from '../../hooks/useElementScreenRect';
import {
  mapDesktopRoomContainerPointToImage,
  mapDesktopRoomImagePointToContainer,
  type DesktopRoomCoverImageSpace,
} from '../../utils/desktopRoomCoverLayout';
import { clampPerspectivePanelPoint, perspectivePanelQuadToQuad4 } from '../../utils/perspectivePanelQuad';
import { quadCornerList } from '../../utils/quadPerspectiveTransform';
import { usePerspectivePanelDebug } from './PerspectivePanelDebugProvider';

const CORNER_ORDER: PerspectivePanelCornerId[] = [
  'topLeft',
  'topRight',
  'bottomRight',
  'bottomLeft',
];

const CORNER_LABELS: Record<PerspectivePanelCornerId, string> = {
  topLeft: 'TL',
  topRight: 'TR',
  bottomRight: 'BR',
  bottomLeft: 'BL',
};

type Props = {
  id: PerspectivePanelId;
  label: string;
  measureRef: RefObject<HTMLElement | null>;
  image: DesktopRoomCoverImageSpace;
  quad: PerspectivePanelQuad;
};

export function PerspectivePanelDebugPolygon({
  id,
  label,
  measureRef,
  image,
  quad,
}: Props) {
  const editor = usePerspectivePanelDebug();
  const { width: cw, height: ch, isMeasured } = useDesktopRoomCoverMeasure(measureRef);
  const screenBox = useElementScreenRect(measureRef);
  const dragCornerRef = useRef<PerspectivePanelCornerId | null>(null);

  const highlighted = editor?.isPanelHighlighted(id) ?? false;
  const editable = editor?.isPanelEditable(id) ?? false;
  const dimmed = editor?.debugEnabled && editor.overlaysVisible && !highlighted;

  const containerQuad = useMemo(() => {
    if (!isMeasured || cw <= 0 || ch <= 0) return null;
    const corners = quadCornerList(perspectivePanelQuadToQuad4(quad));
    const mapped = corners.map((p) => mapDesktopRoomImagePointToContainer(p, cw, ch, image));
    return {
      topLeft: mapped[0],
      topRight: mapped[1],
      bottomRight: mapped[2],
      bottomLeft: mapped[3],
      pointsPx: mapped.map((m) => ({ x: m.left * cw, y: m.top * ch })),
    };
  }, [quad, cw, ch, image, isMeasured]);

  const clientToImagePoint = useCallback(
    (clientX: number, clientY: number) => {
      const el = measureRef.current;
      if (!el || cw <= 0 || ch <= 0) return null;
      const rect = el.getBoundingClientRect();
      if (rect.width <= 0 || rect.height <= 0) return null;
      const left = (clientX - rect.left) / rect.width;
      const top = (clientY - rect.top) / rect.height;
      return clampPerspectivePanelPoint(
        mapDesktopRoomContainerPointToImage({ left, top }, rect.width, rect.height, image),
      );
    },
    [cw, ch, image, measureRef],
  );

  const beginCornerDrag = useCallback(
    (cornerId: PerspectivePanelCornerId, clientX: number, clientY: number) => {
      if (!editor || !editable) return;
      dragCornerRef.current = cornerId;
      const initial = clientToImagePoint(clientX, clientY);
      if (initial) editor.patchCorner(id, cornerId, initial);

      const onMove = (e: PointerEvent) => {
        const active = dragCornerRef.current;
        if (!active || !editor) return;
        const next = clientToImagePoint(e.clientX, e.clientY);
        if (next) editor.patchCorner(id, active, next);
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
    [clientToImagePoint, editor, editable, id],
  );

  const onCornerPointerDown = useCallback(
    (cornerId: PerspectivePanelCornerId) => (e: ReactPointerEvent<HTMLButtonElement>) => {
      if (!editable) return;
      e.preventDefault();
      e.stopPropagation();
      e.currentTarget.setPointerCapture(e.pointerId);
      beginCornerDrag(cornerId, e.clientX, e.clientY);
    },
    [beginCornerDrag, editable],
  );

  if (!editor?.debugEnabled || !editor.overlaysVisible || !containerQuad || !screenBox) return null;

  const polygonPoints = containerQuad.pointsPx.map((p) => `${p.x},${p.y}`).join(' ');
  const centerX =
    containerQuad.pointsPx.reduce((sum, p) => sum + p.x, 0) / containerQuad.pointsPx.length;
  const centerY =
    containerQuad.pointsPx.reduce((sum, p) => sum + p.y, 0) / containerQuad.pointsPx.length;

  const overlay = (
    <div
      className={[
        'perspective-panel-debug-polygon',
        'perspective-panel-debug-polygon--screen',
        highlighted ? 'perspective-panel-debug-polygon--selected' : '',
        dimmed ? 'perspective-panel-debug-polygon--dimmed' : '',
      ]
        .filter(Boolean)
        .join(' ')}
      style={{
        left: `${screenBox.left}px`,
        top: `${screenBox.top}px`,
        width: `${screenBox.width}px`,
        height: `${screenBox.height}px`,
        zIndex: highlighted ? 322 : 321,
      }}
      aria-hidden
    >
      <svg
        className="perspective-panel-debug-polygon__svg"
        viewBox={`0 0 ${cw} ${ch}`}
        preserveAspectRatio="none"
      >
        <polygon className="perspective-panel-debug-polygon__shape" points={polygonPoints} />
      </svg>

      <div
        className="perspective-panel-debug-polygon__label"
        style={{ left: `${(centerX / cw) * 100}%`, top: `${(centerY / ch) * 100}%` }}
      >
        <span className="perspective-panel-debug-polygon__label-id">{id}</span>
        {highlighted ? (
          <span className="perspective-panel-debug-polygon__label-coords">
            TL {quad.topLeft.x.toFixed(3)}, {quad.topLeft.y.toFixed(3)}
          </span>
        ) : null}
      </div>

      {CORNER_ORDER.map((cornerId) => {
        const pt = containerQuad[cornerId];
        return (
          <button
            key={cornerId}
            type="button"
            className="perspective-panel-debug-polygon__handle"
            style={{
              left: `${pt.left * 100}%`,
              top: `${pt.top * 100}%`,
              pointerEvents: editable ? 'auto' : 'none',
              opacity: editable ? 1 : 0.35,
            }}
            aria-label={`Drag ${label} ${CORNER_LABELS[cornerId]} corner`}
            onPointerDown={onCornerPointerDown(cornerId)}
          >
            {CORNER_LABELS[cornerId]}
          </button>
        );
      })}
    </div>
  );

  return createPortal(overlay, document.body);
}
