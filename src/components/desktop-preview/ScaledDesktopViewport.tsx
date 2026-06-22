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
 * Phone / mobile desktop: fill the screen height with the 1920×1080 artboard (zoom in).
 * Sides crop when needed; scroll vertically for taller floors.
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

      const scale = shell.clientHeight / DESKTOP_PREVIEW_VIEWPORT_HEIGHT;
      const scaledWidth = DESKTOP_PREVIEW_VIEWPORT_WIDTH * scale;
      const contentHeight = stage.scrollHeight;

      stage.style.width = `${DESKTOP_PREVIEW_VIEWPORT_WIDTH}px`;
      stage.style.transformOrigin = 'top left';
      stage.style.transform = `scale(${scale})`;

      scaler.style.width = `${scaledWidth}px`;
      scaler.style.height = `${contentHeight * scale}px`;
      scaler.style.marginLeft = `${(shell.clientWidth - scaledWidth) / 2}px`;
      scaler.style.marginTop = '0';
    };

    layoutStage();

    const onOrientation = () => {
      window.setTimeout(layoutStage, 150);
    };
    window.addEventListener('orientationchange', onOrientation);
    window.addEventListener('resize', layoutStage);

    const shellEl = shellRef.current;
    const stageEl = stageRef.current;
    const resizeObserver =
      typeof ResizeObserver !== 'undefined'
        ? new ResizeObserver(() => layoutStage())
        : undefined;
    if (shellEl) resizeObserver?.observe(shellEl);
    if (stageEl) resizeObserver?.observe(stageEl);

    return () => {
      window.removeEventListener('orientationchange', onOrientation);
      window.removeEventListener('resize', layoutStage);
      resizeObserver?.disconnect();
    };
  }, []);

  return (
    <div
      ref={shellRef}
      className="desktop-preview-scroll-shell"
      style={{
        position: 'fixed',
        inset: 0,
        overflowY: 'auto',
        overflowX: 'hidden',
        WebkitOverflowScrolling: 'touch',
        overscrollBehaviorY: 'contain',
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
