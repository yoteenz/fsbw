import { memo, useLayoutEffect, useMemo, useRef } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import {
  DESKTOP_PREVIEW_VIEWPORT_HEIGHT,
  DESKTOP_PREVIEW_VIEWPORT_WIDTH,
  buildDesktopEmbedIframeSrc,
  installDesktopPreviewShellViewportLock,
  isDesktopPreviewEnvironment,
  measureDesktopPreviewScaleBox,
  resolveDesktopIframePath,
} from '../../utils/desktopPreview';

/**
 * Temporary dev shell: scales a 1920×1080 desktop viewport to fit a phone browser.
 * Staging only — open `https://fsbw.vercel.app/desktop-preview`.
 *
 * Iframe is mounted imperatively (not via React `src`) so parent re-renders never
 * reload Safari. Scale is applied once (+ orientation change), never on pinch zoom.
 */
function DesktopPreviewPage() {
  const location = useLocation();
  const previewAllowed = isDesktopPreviewEnvironment();
  const desktopPath = useMemo(
    () => resolveDesktopIframePath(location.pathname),
    [location.pathname],
  );
  const iframeTarget = useMemo(
    () => buildDesktopEmbedIframeSrc(desktopPath, location.search, location.hash),
    [desktopPath, location.hash, location.search],
  );

  const shellRef = useRef<HTMLDivElement>(null);
  const clipRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const mountRef = useRef<HTMLDivElement>(null);
  const badgeRef = useRef<HTMLDivElement>(null);
  const iframeTargetRef = useRef('');

  useLayoutEffect(() => {
    if (!previewAllowed) return;
    return installDesktopPreviewShellViewportLock();
  }, [previewAllowed]);

  useLayoutEffect(() => {
    if (!previewAllowed) return;

    const applyScale = () => {
      const shell = shellRef.current;
      const clip = clipRef.current;
      const stage = stageRef.current;
      const badge = badgeRef.current;
      if (!shell || !clip || !stage) return;

      const box = measureDesktopPreviewScaleBox(shell.clientWidth, shell.clientHeight);
      clip.style.width = `${box.width}px`;
      clip.style.height = `${box.height}px`;
      stage.style.width = `${DESKTOP_PREVIEW_VIEWPORT_WIDTH}px`;
      stage.style.height = `${DESKTOP_PREVIEW_VIEWPORT_HEIGHT}px`;
      stage.style.transform = `scale(${box.scale})`;
      if (badge) {
        badge.textContent = `Desktop preview · ${desktopPath} · ${Math.round(box.scale * 100)}%`;
      }
    };

    applyScale();
    const onOrientation = () => {
      window.setTimeout(applyScale, 150);
    };
    window.addEventListener('orientationchange', onOrientation);
    return () => window.removeEventListener('orientationchange', onOrientation);
  }, [desktopPath, previewAllowed]);

  useLayoutEffect(() => {
    if (!previewAllowed) return;
    if (iframeTargetRef.current === iframeTarget) return;

    const mount = mountRef.current;
    if (!mount) return;

    iframeTargetRef.current = iframeTarget;
    mount.replaceChildren();

    const iframe = document.createElement('iframe');
    iframe.setAttribute('title', 'Desktop preview');
    iframe.setAttribute('width', String(DESKTOP_PREVIEW_VIEWPORT_WIDTH));
    iframe.setAttribute('height', String(DESKTOP_PREVIEW_VIEWPORT_HEIGHT));
    iframe.setAttribute('loading', 'eager');
    iframe.style.cssText = [
      'display:block',
      'border:0',
      'background:#080808',
      `width:${DESKTOP_PREVIEW_VIEWPORT_WIDTH}px`,
      `height:${DESKTOP_PREVIEW_VIEWPORT_HEIGHT}px`,
    ].join(';');
    iframe.src = iframeTarget;
    mount.appendChild(iframe);
  }, [iframeTarget, previewAllowed]);

  if (!previewAllowed) {
    return <Navigate to="/home/shop" replace />;
  }

  return (
    <div
      ref={shellRef}
      style={{
        position: 'fixed',
        inset: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#050505',
        overflow: 'hidden',
        touchAction: 'manipulation',
      }}
    >
      <div
        ref={clipRef}
        style={{
          overflow: 'hidden',
          flexShrink: 0,
          boxShadow: '0 24px 80px rgba(0,0,0,0.55)',
        }}
      >
        <div
          ref={stageRef}
          style={{
            transformOrigin: 'top left',
          }}
        >
          <div ref={mountRef} />
        </div>
      </div>

      <div
        aria-hidden
        style={{
          position: 'fixed',
          left: 0,
          right: 0,
          bottom: 0,
          padding: '10px 14px calc(10px + env(safe-area-inset-bottom, 0px))',
          pointerEvents: 'none',
          display: 'flex',
          justifyContent: 'center',
        }}
      >
        <div
          ref={badgeRef}
          style={{
            fontFamily: '"Futura PT Medium", system-ui, sans-serif',
            fontSize: '9px',
            letterSpacing: '0.22em',
            textTransform: 'uppercase',
            color: 'rgba(255,255,255,0.42)',
            background: 'rgba(0,0,0,0.45)',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: '999px',
            padding: '6px 12px',
            maxWidth: 'calc(100vw - 28px)',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          Desktop preview · {desktopPath}
        </div>
      </div>
    </div>
  );
}

export default memo(DesktopPreviewPage);
