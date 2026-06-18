import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import {
  CREATIVE_PREVIEW_CHANGED_EVENT,
  isCreativePreviewMode,
} from '../utils/creativePreviewMode';

/**
 * Slim fixed banner shown only in designer creative preview mode.
 */
export default function CreativePreviewBanner() {
  const [active, setActive] = useState(() => isCreativePreviewMode());

  useEffect(() => {
    const sync = () => setActive(isCreativePreviewMode());
    sync();
    window.addEventListener(CREATIVE_PREVIEW_CHANGED_EVENT, sync);
    window.addEventListener('signInStateChanged', sync);
    return () => {
      window.removeEventListener(CREATIVE_PREVIEW_CHANGED_EVENT, sync);
      window.removeEventListener('signInStateChanged', sync);
    };
  }, []);

  if (!active || typeof document === 'undefined') return null;

  return createPortal(
    <div
      role="status"
      aria-live="polite"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 100000,
        backgroundColor: '#EB1C24',
        color: '#FFFFFF',
        textAlign: 'center',
        padding: '6px 12px',
        fontFamily: '"Futura PT Medium", futuristic-pt, Futura, Inter, sans-serif',
        fontSize: '10px',
        letterSpacing: '0.06em',
        textTransform: 'uppercase',
        pointerEvents: 'none',
      }}
    >
      Creative preview — sample data only · payments disabled
    </div>,
    document.body
  );
}
