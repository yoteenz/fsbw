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
 * Scale the 1920×1080 desktop artboard to fit phones (uniform scale, no stretch).
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

      const scaleX = shell.clientWidth / DESKTOP_PREVIEW_VIEWPORT_WIDTH;
      const scaleY = shell.clientHeight / DESKTOP_PREVIEW_VIEWPORT_HEIGHT;
      const scale = Math.min(scaleX, scaleY);

      const scaledWidth = DESKTOP_PREVIEW_VIEWPORT_WIDTH * scale;
      const contentHeight = stage.scrollHeight;
      const scaledHeight = contentHeight * scale;

      stage.style.width = `${DESKTOP_PREVIEW_VIEWPORT_WIDTH}px`;
      stage.style.transformOrigin = 'top left';
      stage.style.transform = `scale(${scale})`;

      scaler.style.width = `${scaledWidth}px`;
      scaler.style.height = `${scaledHeight}px`;
      scaler.style.marginLeft = `${Math.max(0, (shell.clientWidth - scaledWidth) / 2)}px`;
      scaler.style.marginTop =
        scaledHeight <= shell.clientHeight ? `${Math.max(0, (shell.clientHeight - scaledHeight) / 2)}px` : '0';
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
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        height: '100%',
        maxHeight: '100dvh',
        overflowY: 'auto',
        overflowX: 'hidden',
        WebkitOverflowScrolling: 'touch',
        overscrollBehaviorY: 'contain',
        background: '#050505',
        touchAction: 'auto',
      }}
    >
      <div ref={scalerRef} style={{ position: 'relative' }}>
        <div ref={stageRef}>{children}</div>
      </div>
    </div>
  );
}
