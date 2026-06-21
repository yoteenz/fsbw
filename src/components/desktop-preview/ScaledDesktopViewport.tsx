import { useLayoutEffect, useRef, type ReactNode } from 'react';
import {
  DESKTOP_PREVIEW_VIEWPORT_HEIGHT,
  DESKTOP_PREVIEW_VIEWPORT_WIDTH,
  installDesktopPreviewShellViewportLock,
} from '../../utils/desktopPreview';

type Props = {
  children: ReactNode;
};

/**
 * Phone preview: one 1920×1080 desktop viewport fills the screen height (zoomed in),
 * sides crop if needed. Scroll vertically through lobby → lounge.
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

      // Fill phone height with one 1080p desktop screen (zoom in), not shrink whole page.
      const scale = shell.clientHeight / DESKTOP_PREVIEW_VIEWPORT_HEIGHT;
      const scaledWidth = DESKTOP_PREVIEW_VIEWPORT_WIDTH * scale;
      const contentHeight = stage.scrollHeight;

      stage.style.width = `${DESKTOP_PREVIEW_VIEWPORT_WIDTH}px`;
      stage.style.transformOrigin = 'top left';
      stage.style.transform = `scale(${scale})`;

      scaler.style.width = `${scaledWidth}px`;
      scaler.style.height = `${contentHeight * scale}px`;
      scaler.style.marginLeft = `${(shell.clientWidth - scaledWidth) / 2}px`;
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
      <div ref={scalerRef} style={{ position: 'relative' }}>
        <div ref={stageRef}>{children}</div>
      </div>
    </div>
  );
}
