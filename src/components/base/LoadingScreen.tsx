import React from 'react';
import { createPortal } from 'react-dom';

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
  position: 'relative',
  zIndex: 1,
};

type LoadingScreenProps = {
  autoHideAfterMs?: number;
};

function useLockPageScroll(active: boolean) {
  React.useEffect(() => {
    if (!active || typeof document === 'undefined') return;
    const html = document.documentElement;
    const body = document.body;
    const root = document.getElementById('root');
    const prevHtmlOverflow = html.style.overflow;
    const prevBodyOverflow = body.style.overflow;
    const prevBodyTouchAction = body.style.touchAction;
    const prevBodyBg = body.style.backgroundColor;
    const prevRootOverflow = root?.style.overflow ?? '';
    const prevHtmlDataLoading = html.getAttribute('data-loading-screen');

    html.setAttribute('data-loading-screen', 'true');
    html.style.overflow = 'hidden';
    html.style.backgroundColor = '#ffffff';
    body.style.overflow = 'hidden';
    body.style.touchAction = 'none';
    body.style.backgroundColor = '#ffffff';
    if (root) root.style.overflow = 'hidden';

    return () => {
      if (prevHtmlDataLoading == null) html.removeAttribute('data-loading-screen');
      else html.setAttribute('data-loading-screen', prevHtmlDataLoading);
      html.style.overflow = prevHtmlOverflow;
      html.style.backgroundColor = '';
      body.style.overflow = prevBodyOverflow;
      body.style.touchAction = prevBodyTouchAction;
      body.style.backgroundColor = prevBodyBg;
      if (root) root.style.overflow = prevRootOverflow;
    };
  }, [active]);
}

/** Full-screen white overlay (portaled to document.body). */
export default function LoadingScreen({ autoHideAfterMs }: LoadingScreenProps = {}) {
  const [isVisible, setIsVisible] = React.useState(true);
  useLockPageScroll(isVisible);

  React.useEffect(() => {
    if (autoHideAfterMs == null || autoHideAfterMs <= 0) return;
    const timer = setTimeout(() => setIsVisible(false), autoHideAfterMs);
    return () => clearTimeout(timer);
  }, [autoHideAfterMs]);

  if (!isVisible) return null;

  const overlay = (
    <div className="loading-screen-root" role="status" aria-live="polite" aria-label="Loading">
      <div className="loading-screen-root__backdrop" aria-hidden />
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
