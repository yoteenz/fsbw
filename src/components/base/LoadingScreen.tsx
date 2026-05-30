import React from 'react';
import { createPortal } from 'react-dom';

/** Extra px below measured viewport — mobile chrome, safe area, lounge 105vh slides. */
const LOADING_SCREEN_BLEED_PX = 48;

function readViewportSize(): { width: number; height: number } {
  if (typeof window === 'undefined') return { width: 0, height: 0 };
  const vv = window.visualViewport;
  return {
    width: Math.ceil(vv?.width ?? window.innerWidth),
    height: Math.ceil(vv?.height ?? window.innerHeight),
  };
}

function useViewportCoverSize(active: boolean): { width: number; height: number } {
  const [size, setSize] = React.useState(readViewportSize);

  React.useLayoutEffect(() => {
    if (!active) return;
    const update = () => setSize(readViewportSize());
    update();
    window.addEventListener('resize', update);
    window.visualViewport?.addEventListener('resize', update);
    window.visualViewport?.addEventListener('scroll', update);
    return () => {
      window.removeEventListener('resize', update);
      window.visualViewport?.removeEventListener('resize', update);
      window.visualViewport?.removeEventListener('scroll', update);
    };
  }, [active]);

  return size;
}

function useLockPageScroll(active: boolean) {
  React.useEffect(() => {
    if (!active || typeof document === 'undefined') return;
    const html = document.documentElement;
    const body = document.body;
    const prevHtmlOverflow = html.style.overflow;
    const prevBodyOverflow = body.style.overflow;
    const prevBodyTouchAction = body.style.touchAction;
    html.style.overflow = 'hidden';
    body.style.overflow = 'hidden';
    body.style.touchAction = 'none';
    return () => {
      html.style.overflow = prevHtmlOverflow;
      body.style.overflow = prevBodyOverflow;
      body.style.touchAction = prevBodyTouchAction;
    };
  }, [active]);
}

const loadingGifStyle: React.CSSProperties = {
  width: '405px',
  height: '405px',
  maxWidth: 'min(405px, 92vw)',
  maxHeight: 'min(405px, 70dvh)',
  objectFit: 'contain',
  display: 'block',
  margin: 0,
  padding: 0,
  border: 'none',
  pointerEvents: 'none',
  userSelect: 'none',
};

/** Optional: when true, loading screen auto-hides after 4s (e.g. for initial app load). When false/undefined, stays visible until content loads (e.g. Suspense fallback for checkout). */
export default function LoadingScreen({ autoHideAfterMs }: { autoHideAfterMs?: number } = {}) {
  const [isVisible, setIsVisible] = React.useState(true);
  const viewport = useViewportCoverSize(isVisible);
  useLockPageScroll(isVisible);

  React.useEffect(() => {
    if (autoHideAfterMs == null || autoHideAfterMs <= 0) return;
    const timer = setTimeout(() => setIsVisible(false), autoHideAfterMs);
    return () => clearTimeout(timer);
  }, [autoHideAfterMs]);

  if (!isVisible) return null;

  const coverHeightPx =
    viewport.height > 0 ? viewport.height + LOADING_SCREEN_BLEED_PX : undefined;
  const coverWidthPx = viewport.width > 0 ? viewport.width : undefined;

  const loadingOverlayStyle: React.CSSProperties = {
    position: 'fixed',
    top: 0,
    left: 0,
    zIndex: 99999,
    backgroundColor: '#ffffff',
    width: coverWidthPx ?? '100vw',
    minWidth: '100vw',
    height: coverHeightPx ?? `calc(100dvh + ${LOADING_SCREEN_BLEED_PX}px)`,
    minHeight: coverHeightPx
      ? coverHeightPx
      : `max(105vh, calc(100dvh + ${LOADING_SCREEN_BLEED_PX}px), calc(100vh + ${LOADING_SCREEN_BLEED_PX}px))`,
    margin: 0,
    padding: 0,
    paddingBottom: 'env(safe-area-inset-bottom, 0px)',
    boxSizing: 'border-box',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    touchAction: 'none',
    overscrollBehavior: 'none',
  };

  const overlay = (
    <div role="status" aria-live="polite" aria-label="Loading" style={loadingOverlayStyle}>
      <img
        src="/assets/load-screen.gif"
        alt=""
        width={405}
        height={405}
        style={loadingGifStyle}
        draggable={false}
      />
    </div>
  );

  if (typeof document === 'undefined') return overlay;

  return createPortal(overlay, document.body);
}
