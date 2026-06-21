import { useLayoutEffect, useRef, type ReactNode } from 'react';
import {
  DESKTOP_PREVIEW_VIEWPORT_WIDTH,
  installDesktopPreviewShellViewportLock,
} from '../../utils/desktopPreview';

type Props = {
  children: ReactNode;
};

/**
 * Fits a 1920px-wide desktop page on a phone: scale via transform, scroll in this shell.
 * No iframe — one document, no Safari iframe reload on pinch/zoom.
 */
export function ScaledDesktopViewport({ children }: Props) {
  const shellRef = useRef<HTMLDivElement>(null);
  const scalerRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => installDesktopPreviewShellViewportLock(), []);

  useLayoutEffect(() => {
    const layoutStage = () => {
      const shell = shellRef.current;
      const scaler = scalerRef.current;
      const stage = stageRef.current;
      if (!shell || !scaler || !stage) return;

      const scale = shell.clientWidth / DESKTOP_PREVIEW_VIEWPORT_WIDTH;
      stage.style.width = `${DESKTOP_PREVIEW_VIEWPORT_WIDTH}px`;
      stage.style.transform = `scale(${scale})`;
      stage.style.transformOrigin = 'top left';

      const contentHeight = stage.scrollHeight;
      scaler.style.width = `${DESKTOP_PREVIEW_VIEWPORT_WIDTH * scale}px`;
      scaler.style.height = `${contentHeight * scale}px`;
    };

    layoutStage();

    const onOrientation = () => {
      window.setTimeout(layoutStage, 150);
    };
    window.addEventListener('orientationchange', onOrientation);

    const stageEl = stageRef.current;
    const resizeObserver =
      typeof ResizeObserver !== 'undefined' && stageEl
        ? new ResizeObserver(() => layoutStage())
        : undefined;
    if (stageEl) resizeObserver?.observe(stageEl);

    return () => {
      window.removeEventListener('orientationchange', onOrientation);
      resizeObserver?.disconnect();
    };
  }, []);

  return (
    <div
      ref={shellRef}
      style={{
        position: 'fixed',
        inset: 0,
        overflowY: 'auto',
        overflowX: 'hidden',
        WebkitOverflowScrolling: 'touch',
        overscrollBehaviorY: 'none',
        background: '#050505',
        touchAction: 'pan-y',
      }}
    >
      <div ref={scalerRef} style={{ position: 'relative', margin: '0 auto' }}>
        <div ref={stageRef}>{children}</div>
      </div>
    </div>
  );
}
