import { useLayoutEffect, useRef, type ReactNode } from 'react';
import {
  SITE00_DESKTOP_ARTBOARD_MIN_HEIGHT,
  SITE00_DESKTOP_ARTBOARD_WIDTH,
} from '../../config/desktop-artboard';
import { installDesktopPreviewShellViewportLock } from '../../../utils/desktopPreview';
import { Site00DesktopArtboardProvider } from './Site00DesktopArtboardContext';
import '../../styles/site00-desktop-artboard.css?v=20260818-coord-slot';

type Site00DesktopArtboardShellProps = {
  children: ReactNode;
};

/**
 * Fixed-width SITE 00 desktop artboard scaled to device width.
 * Used by `/origin/desktop` so phone preview always shows the approved desktop composition.
 */
export function Site00DesktopArtboardShell({ children }: Site00DesktopArtboardShellProps) {
  const shellRef = useRef<HTMLDivElement>(null);
  const scalerRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(
    () => installDesktopPreviewShellViewportLock({ background: '#f7f7f5' }),
    [],
  );

  useLayoutEffect(() => {
    const layoutStage = () => {
      const shell = shellRef.current;
      const scaler = scalerRef.current;
      const stage = stageRef.current;
      if (!shell || !scaler || !stage) return;

      const scale = shell.clientWidth / SITE00_DESKTOP_ARTBOARD_WIDTH;
      const scaledWidth = SITE00_DESKTOP_ARTBOARD_WIDTH * scale;
      const contentHeight = SITE00_DESKTOP_ARTBOARD_MIN_HEIGHT;

      stage.style.width = `${SITE00_DESKTOP_ARTBOARD_WIDTH}px`;
      stage.style.height = `${SITE00_DESKTOP_ARTBOARD_MIN_HEIGHT}px`;
      stage.style.minHeight = `${SITE00_DESKTOP_ARTBOARD_MIN_HEIGHT}px`;
      stage.style.setProperty('--site00-desktop-artboard-height', `${SITE00_DESKTOP_ARTBOARD_MIN_HEIGHT}px`);
      stage.style.transformOrigin = 'top left';
      stage.style.transform = `scale(${scale})`;

      scaler.style.width = `${scaledWidth}px`;
      scaler.style.height = `${contentHeight * scale}px`;
      scaler.style.marginLeft = '0';
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
    <Site00DesktopArtboardProvider>
      <div ref={shellRef} className="site00-desktop-artboard-shell">
        <div ref={scalerRef} style={{ position: 'relative' }}>
          <div ref={stageRef} className="site00-desktop-artboard">
            {children}
          </div>
        </div>
      </div>
    </Site00DesktopArtboardProvider>
  );
}
