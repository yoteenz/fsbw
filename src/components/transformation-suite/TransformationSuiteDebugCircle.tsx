import { useCallback, useMemo, useRef, type PointerEvent as ReactPointerEvent, type RefObject } from 'react';
import { panelDebugColorStyles } from '../../constants/desktopPanelDebugColors';
import { TRANSFORMATION_SUITE_IMAGE } from '../../constants/transformationSuite';
import type { TransformationSuiteCircleDebugDef } from '../../types/transformationSuite';
import { DesktopRoomCoverRectAnchor } from '../desktop-lobby/DesktopRoomCoverAnchor';
import { clampTransformationSuiteCircle } from '../../utils/transformationSuiteLayoutMath';
import { roundPanelDebugPercent } from '../../utils/desktopPanelDebugMode';
import { useTransformationSuiteDebugRequired } from './TransformationSuiteDebugProvider';

const ASPECT = TRANSFORMATION_SUITE_IMAGE.width / TRANSFORMATION_SUITE_IMAGE.height;

function circleToImageRect(circle: { centerX: number; centerY: number; radius: number }) {
  const radiusY = circle.radius * ASPECT;
  return {
    left: (circle.centerX - circle.radius) / 100,
    top: (circle.centerY - radiusY) / 100,
    width: (circle.radius * 2) / 100,
    height: (radiusY * 2) / 100,
  };
}

type Props = {
  measureRef: RefObject<HTMLElement | null>;
  panel: TransformationSuiteCircleDebugDef;
};

export function TransformationSuiteDebugCircle({ measureRef, panel }: Props) {
  const editor = useTransformationSuiteDebugRequired();
  const circle = editor.layout.circles[panel.id];
  const isSelected = editor.selectedCircleId === panel.id;
  const colors = panelDebugColorStyles(panel.colorGroup);
  const imageRect = useMemo(() => (circle ? circleToImageRect(circle) : null), [circle]);

  const dragRef = useRef<{
    mode: 'move' | 'radius';
    startX: number;
    startY: number;
    initial: { centerX: number; centerY: number; radius: number };
  } | null>(null);

  const patchCircle = useCallback(
    (next: { centerX: number; centerY: number; radius: number }) => {
      editor.patchCircle(panel.id, clampTransformationSuiteCircle(next));
    },
    [editor, panel.id],
  );

  const beginMove = useCallback(
    (clientX: number, clientY: number) => {
      if (!circle) return;
      dragRef.current = {
        mode: 'move',
        startX: clientX,
        startY: clientY,
        initial: { ...circle },
      };

      const onMove = (e: PointerEvent) => {
        const drag = dragRef.current;
        if (!drag || drag.mode !== 'move') return;
        const el = measureRef.current;
        if (!el) return;
        const dx = ((e.clientX - drag.startX) / el.offsetWidth) * 100;
        const dy = ((e.clientY - drag.startY) / el.offsetHeight) * 100;
        patchCircle({
          centerX: roundPanelDebugPercent(drag.initial.centerX + dx),
          centerY: roundPanelDebugPercent(drag.initial.centerY + dy),
          radius: drag.initial.radius,
        });
      };

      const onUp = () => {
        dragRef.current = null;
        window.removeEventListener('pointermove', onMove);
        window.removeEventListener('pointerup', onUp);
      };

      window.addEventListener('pointermove', onMove);
      window.addEventListener('pointerup', onUp);
    },
    [circle, measureRef, patchCircle],
  );

  const beginRadius = useCallback(
    (clientX: number) => {
      if (!circle) return;
      dragRef.current = {
        mode: 'radius',
        startX: clientX,
        startY: 0,
        initial: { ...circle },
      };

      const onMove = (e: PointerEvent) => {
        const drag = dragRef.current;
        if (!drag || drag.mode !== 'radius') return;
        const el = measureRef.current;
        if (!el) return;
        const dx = ((e.clientX - drag.startX) / el.offsetWidth) * 100;
        patchCircle({
          ...drag.initial,
          radius: roundPanelDebugPercent(Math.max(2, drag.initial.radius + dx)),
        });
      };

      const onUp = () => {
        dragRef.current = null;
        window.removeEventListener('pointermove', onMove);
        window.removeEventListener('pointerup', onUp);
      };

      window.addEventListener('pointermove', onMove);
      window.addEventListener('pointerup', onUp);
    },
    [circle, measureRef, patchCircle],
  );

  if (!circle || !imageRect || !editor.debugEnabled || !editor.overlaysVisible) return null;

  return (
    <DesktopRoomCoverRectAnchor
      measureRef={measureRef}
      image={TRANSFORMATION_SUITE_IMAGE}
      imageRect={imageRect}
      zIndex={38}
      style={{ pointerEvents: 'auto' }}
    >
      <div
        className="ts-debug-circle"
        onPointerDown={(e: ReactPointerEvent) => {
          editor.selectCircle(panel.id);
          beginMove(e.clientX, e.clientY);
          e.preventDefault();
        }}
        style={{
          position: 'absolute',
          inset: 0,
          borderRadius: '50%',
          border: `2px dashed ${colors.borderColor}`,
          background: colors.background,
          cursor: 'move',
          touchAction: 'none',
          outline: isSelected ? `2px solid ${colors.borderColor}` : undefined,
          outlineOffset: 2,
        }}
      >
        <span className="ts-debug-rect__label" style={{ color: colors.borderColor }}>
          {panel.label}
        </span>
        {isSelected ? (
          <button
            type="button"
            className="ts-debug-circle__radius-handle"
            aria-label="Resize circle radius"
            style={{ borderColor: colors.borderColor, background: colors.background }}
            onPointerDown={(e) => {
              e.stopPropagation();
              editor.selectCircle(panel.id);
              beginRadius(e.clientX);
            }}
          />
        ) : null}
      </div>
    </DesktopRoomCoverRectAnchor>
  );
}
