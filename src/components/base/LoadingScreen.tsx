import React from 'react';
import { createPortal } from 'react-dom';

/** Extra px below measured viewport — mobile chrome, safe area, lounge 105vh slides. */
const LOADING_SCREEN_BLEED_PX = 80;

function readCoverViewport(): { width: number; height: number } {
  if (typeof window === 'undefined') return { width: 0, height: 0 };
  const vv = window.visualViewport;
  const width = Math.ceil(
    Math.max(window.innerWidth, document.documentElement.clientWidth, vv?.width ?? 0)
  );
  const height = Math.ceil(
    Math.max(window.innerHeight, document.documentElement.clientHeight, vv?.height ?? 0)
  );
  return { width, height };
}

function useViewportCoverSize(active: boolean): { width: number; height: number } {
  const [size, setSize] = React.useState(readCoverViewport);

  React.useLayoutEffect(() => {
    if (!active) return;
    const update = () => setSize(readCoverViewport());
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
    const root = document.getElementById('root');
    const prevHtmlOverflow = html.style.overflow;
    const prevBodyOverflow = body.style.overflow;
    const prevBodyTouchAction = body.style.touchAction;
    const prevRootOverflow = root?.style.overflow ?? '';
    const prevHtmlDataLoading = html.getAttribute('data-loading-screen');

    html.setAttribute('data-loading-screen', 'true');
    html.style.overflow = 'hidden';
    body.style.overflow = 'hidden';
    body.style.touchAction = 'none';
    if (root) root.style.overflow = 'hidden';

    return () => {
      if (prevHtmlDataLoading == null) html.removeAttribute('data-loading-screen');
      else html.setAttribute('data-loading-screen', prevHtmlDataLoading);
      html.style.overflow = prevHtmlOverflow;
      body.style.overflow = prevBodyOverflow;
      body.style.touchAction = prevBodyTouchAction;
      if (root) root.style.overflow = prevRootOverflow;
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

type LoadingScreenProps = {
  autoHideAfterMs?: number;
  /** Additional height below viewport (default uses LOADING_SCREEN_BLEED_PX). */
  bleedPx?: number;
};

/** Optional: when true, loading screen auto-hides after 4s (e.g. for initial app load). When false/undefined, stays visible until content loads (e.g. Suspense fallback for checkout). */
export default function LoadingScreen({ autoHideAfterMs, bleedPx }: LoadingScreenProps = {}) {
  const [isVisible, setIsVisible] = React.useState(true);
  const viewport = useViewportCoverSize(isVisible);
  useLockPageScroll(isVisible);

  const bleed = bleedPx ?? LOADING_SCREEN_BLEED_PX;

  React.useEffect(() => {
    if (autoHideAfterMs == null || autoHideAfterMs <= 0) return;
    const timer = setTimeout(() => setIsVisible(false), autoHideAfterMs);
    return () => clearTimeout(timer);
  }, [autoHideAfterMs]);

  if (!isVisible) return null;

  const coverHeightPx = viewport.height > 0 ? viewport.height + bleed : undefined;
  const coverWidthPx = viewport.width > 0 ? viewport.width : undefined;

  const loadingOverlayStyle: React.CSSProperties = {
    ...(coverHeightPx != null
      ? { height: coverHeightPx, minHeight: coverHeightPx }
      : undefined),
    ...(coverWidthPx != null ? { width: coverWidthPx, minWidth: coverWidthPx } : undefined),
  };

  const overlay = (
    <div
      className="loading-screen-root"
      role="status"
      aria-live="polite"
      aria-label="Loading"
      style={loadingOverlayStyle}
    >
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
