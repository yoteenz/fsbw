import React from 'react';
import { createPortal } from 'react-dom';

/** Extra px below viewport — covers mobile browser chrome / 100vh gaps. */
const LOADING_SCREEN_BOTTOM_BLEED_PX = 32;

const loadingOverlayStyle: React.CSSProperties = {
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  zIndex: 99999,
  backgroundColor: '#ffffff',
  width: '100%',
  minHeight: `calc(100dvh + ${LOADING_SCREEN_BOTTOM_BLEED_PX}px)`,
  height: `calc(100% + ${LOADING_SCREEN_BOTTOM_BLEED_PX}px)`,
  paddingBottom: `calc(env(safe-area-inset-bottom, 0px) + ${LOADING_SCREEN_BOTTOM_BLEED_PX}px)`,
  margin: 0,
  boxSizing: 'border-box',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  overflow: 'hidden',
  touchAction: 'none',
};

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

  React.useEffect(() => {
    if (autoHideAfterMs == null || autoHideAfterMs <= 0) return;
    const timer = setTimeout(() => setIsVisible(false), autoHideAfterMs);
    return () => clearTimeout(timer);
  }, [autoHideAfterMs]);

  if (!isVisible) return null;

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
