import { useEffect, useMemo, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import {
  DESKTOP_PREVIEW_VIEWPORT_HEIGHT,
  DESKTOP_PREVIEW_VIEWPORT_WIDTH,
  isDesktopPreviewEnvironment,
  resolveDesktopIframePath,
} from '../../utils/desktopPreview';

type ScaleBox = {
  scale: number;
  width: number;
  height: number;
};

function measureScaleBox(): ScaleBox {
  if (typeof window === 'undefined') {
    return { scale: 1, width: DESKTOP_PREVIEW_VIEWPORT_WIDTH, height: DESKTOP_PREVIEW_VIEWPORT_HEIGHT };
  }

  const scaleX = window.innerWidth / DESKTOP_PREVIEW_VIEWPORT_WIDTH;
  const scaleY = window.innerHeight / DESKTOP_PREVIEW_VIEWPORT_HEIGHT;
  const scale = Math.min(scaleX, scaleY);

  return {
    scale,
    width: DESKTOP_PREVIEW_VIEWPORT_WIDTH * scale,
    height: DESKTOP_PREVIEW_VIEWPORT_HEIGHT * scale,
  };
}

/**
 * Temporary dev shell: scales a 1920×1080 desktop viewport to fit a phone browser.
 * Staging only — open `https://fsbw.vercel.app/desktop-preview` (or `/desktop-preview/lounge`).
 */
export default function DesktopPreviewPage() {
  const location = useLocation();
  const previewAllowed = isDesktopPreviewEnvironment();
  const desktopPath = useMemo(
    () => resolveDesktopIframePath(location.pathname),
    [location.pathname],
  );
  const iframeSrc = `${desktopPath}${location.search}${location.hash}`;

  const [scaleBox, setScaleBox] = useState<ScaleBox>(() => measureScaleBox());

  useEffect(() => {
    if (!previewAllowed) return;
    const update = () => setScaleBox(measureScaleBox());
    update();
    window.addEventListener('resize', update);
    window.addEventListener('orientationchange', update);
    return () => {
      window.removeEventListener('resize', update);
      window.removeEventListener('orientationchange', update);
    };
  }, [previewAllowed]);

  useEffect(() => {
    if (!previewAllowed) return;
    document.documentElement.style.overflow = 'hidden';
    document.body.style.overflow = 'hidden';
    document.body.style.margin = '0';
    document.body.style.background = '#050505';

    return () => {
      document.documentElement.style.overflow = '';
      document.body.style.overflow = '';
      document.body.style.margin = '';
      document.body.style.background = '';
    };
  }, [previewAllowed]);

  if (!previewAllowed) {
    return <Navigate to="/home/shop" replace />;
  }

  return (
    <div
      style={{
        minHeight: '100dvh',
        width: '100vw',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#050505',
        overflow: 'hidden',
        position: 'relative',
      }}
    >
      <div
        style={{
          width: scaleBox.width,
          height: scaleBox.height,
          overflow: 'hidden',
          flexShrink: 0,
          boxShadow: '0 24px 80px rgba(0,0,0,0.55)',
        }}
      >
        <div
          style={{
            width: DESKTOP_PREVIEW_VIEWPORT_WIDTH,
            height: DESKTOP_PREVIEW_VIEWPORT_HEIGHT,
            transform: `scale(${scaleBox.scale})`,
            transformOrigin: 'top left',
          }}
        >
          <iframe
            title="Desktop preview"
            src={iframeSrc}
            width={DESKTOP_PREVIEW_VIEWPORT_WIDTH}
            height={DESKTOP_PREVIEW_VIEWPORT_HEIGHT}
            style={{
              display: 'block',
              border: 0,
              background: '#080808',
            }}
          />
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
          Desktop preview · {desktopPath} · {Math.round(scaleBox.scale * 100)}%
        </div>
      </div>
    </div>
  );
}
