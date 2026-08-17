import React from 'react';
import { createPortal } from 'react-dom';
import { acquireLoadingScreenDocumentLock } from '../../platform-stabilization/loadingScreenLock';
import {
  DEFAULT_MAX_LOADING_MS,
  forceLoadingTerminalRecovery,
  getActiveLoadingSources,
  registerLoadingTerminal,
} from '../../platform-stabilization/loadingTerminalRegistry';

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
  /** Diagnostic label — required for terminal trace (defaults to callsite hint). */
  source?: string;
  maxDurationMs?: number;
};

function useLockPageScroll(active: boolean) {
  React.useEffect(() => {
    if (!active || typeof document === 'undefined') return;
    return acquireLoadingScreenDocumentLock();
  }, [active]);
}

/** Frontal Slayer full-screen loader (portaled to document.body). Uses original load-screen.gif — not SITE 00. */
export default function LoadingScreen({
  autoHideAfterMs,
  source = 'LoadingScreen',
  maxDurationMs = DEFAULT_MAX_LOADING_MS,
}: LoadingScreenProps = {}) {
  const [isVisible, setIsVisible] = React.useState(true);
  useLockPageScroll(isVisible);

  React.useEffect(() => {
    const unregister = registerLoadingTerminal(source, maxDurationMs);
    const timer = window.setTimeout(() => {
      const stuck = getActiveLoadingSources();
      void forceLoadingTerminalRecovery(
        stuck.length > 0 ? stuck : [{ id: source, label: source, since: Date.now() - maxDurationMs }],
        `LoadingScreen:${source}`,
      );
      setIsVisible(false);
    }, maxDurationMs);
    return () => {
      window.clearTimeout(timer);
      unregister();
    };
  }, [source, maxDurationMs]);

  React.useEffect(() => {
    if (autoHideAfterMs == null || autoHideAfterMs <= 0) return;
    const timer = setTimeout(() => setIsVisible(false), autoHideAfterMs);
    return () => clearTimeout(timer);
  }, [autoHideAfterMs]);

  if (!isVisible) return null;

  const overlay = (
    <div
      className="loading-screen-root"
      data-loading-source={source}
      role="status"
      aria-live="polite"
      aria-label="Loading"
    >
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
