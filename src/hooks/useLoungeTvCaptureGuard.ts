import { useCallback, useEffect, useRef, useState, type DragEvent, type SyntheticEvent } from 'react';

const SHIELD_HOLD_MS = 900;

function isPrintScreenKey(e: KeyboardEvent): boolean {
  return (
    e.key === 'PrintScreen' ||
    e.code === 'PrintScreen' ||
    (e.metaKey && e.shiftKey && (e.key === '3' || e.key === '4' || e.key === '5'))
  );
}

/** Heuristic: iOS/Android may shrink visual viewport when system screen capture is active. */
function viewportSuggestsExternalCapture(): boolean {
  if (typeof window === 'undefined') return false;
  const vv = window.visualViewport;
  if (!vv) return false;
  const heightGap = window.innerHeight - vv.height - (vv.offsetTop ?? 0);
  return heightGap > 48;
}

/**
 * Best-effort capture/recording guard for lounge TV (web). Shows a black shield over content
 * when capture is suspected. True Netflix-style black captures require DRM (EME), not plain MP4.
 */
export function useLoungeTvCaptureGuard(active: boolean) {
  const [shieldActive, setShieldActive] = useState(false);
  const holdTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const clearHoldTimer = useCallback(() => {
    if (holdTimerRef.current) {
      clearTimeout(holdTimerRef.current);
      holdTimerRef.current = null;
    }
  }, []);

  const showShield = useCallback(
    (holdMs = SHIELD_HOLD_MS) => {
      setShieldActive(true);
      clearHoldTimer();
      if (holdMs <= 0) return;
      holdTimerRef.current = setTimeout(() => {
        holdTimerRef.current = null;
        if (document.visibilityState === 'visible' && !viewportSuggestsExternalCapture()) {
          setShieldActive(false);
        }
      }, holdMs);
    },
    [clearHoldTimer]
  );

  const showShieldUntilVisible = useCallback(() => {
    setShieldActive(true);
    clearHoldTimer();
  }, [clearHoldTimer]);

  useEffect(() => {
    if (!active) {
      setShieldActive(false);
      clearHoldTimer();
      return;
    }

    const onVisibility = () => {
      if (document.visibilityState === 'hidden') {
        showShieldUntilVisible();
      } else if (!viewportSuggestsExternalCapture()) {
        showShield(600);
      }
    };

    const onBlur = () => showShield(1200);
    const onPageHide = () => showShieldUntilVisible();
    const onKeyUp = (e: KeyboardEvent) => {
      if (isPrintScreenKey(e)) showShield(1500);
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (isPrintScreenKey(e)) showShieldUntilVisible();
    };
    const onCopy = () => showShield(1200);
    const onCut = () => showShield(1200);
    const onBeforePrint = () => showShieldUntilVisible();

    document.addEventListener('visibilitychange', onVisibility);
    window.addEventListener('blur', onBlur);
    window.addEventListener('pagehide', onPageHide);
    window.addEventListener('keyup', onKeyUp, true);
    window.addEventListener('keydown', onKeyDown, true);
    document.addEventListener('copy', onCopy, true);
    document.addEventListener('cut', onCut, true);
    window.addEventListener('beforeprint', onBeforePrint);

    const vv = window.visualViewport;
    const onViewportChange = () => {
      if (viewportSuggestsExternalCapture()) {
        showShieldUntilVisible();
      }
    };
    vv?.addEventListener('resize', onViewportChange);
    vv?.addEventListener('scroll', onViewportChange);

    pollRef.current = setInterval(() => {
      if (viewportSuggestsExternalCapture()) showShieldUntilVisible();
    }, 400);

    return () => {
      document.removeEventListener('visibilitychange', onVisibility);
      window.removeEventListener('blur', onBlur);
      window.removeEventListener('pagehide', onPageHide);
      window.removeEventListener('keyup', onKeyUp, true);
      window.removeEventListener('keydown', onKeyDown, true);
      document.removeEventListener('copy', onCopy, true);
      document.removeEventListener('cut', onCut, true);
      window.removeEventListener('beforeprint', onBeforePrint);
      vv?.removeEventListener('resize', onViewportChange);
      vv?.removeEventListener('scroll', onViewportChange);
      if (pollRef.current) {
        clearInterval(pollRef.current);
        pollRef.current = null;
      }
      clearHoldTimer();
      setShieldActive(false);
    };
  }, [active, clearHoldTimer, showShield, showShieldUntilVisible]);

  const blockContextMenu = useCallback(
    (e: SyntheticEvent) => {
      e.preventDefault();
      e.stopPropagation();
      showShield(800);
    },
    [showShield]
  );

  const blockDragStart = useCallback((e: DragEvent) => {
    e.preventDefault();
  }, []);

  return {
    shieldActive,
    blockContextMenu,
    blockDragStart,
  };
}
