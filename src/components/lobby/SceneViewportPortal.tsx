import { useLayoutEffect, useState, type ReactNode, type RefObject } from 'react';
import { createPortal } from 'react-dom';
import { sceneCarouselViewportOverlayRootStyle } from '../../utils/sceneCarouselBackground';

type SceneViewportPortalProps = {
  /** {@link SceneCarouselViewportStage} root — overlay is `absolute` + `inset: 0` inside this node. */
  measureRef: RefObject<HTMLElement | null>;
  children: ReactNode;
  /** When false, unmount portal (default true). */
  enabled?: boolean;
};

/**
 * Renders children inside the scene viewport stage so overlays track lobby/lounge
 * `contain` backgrounds (same coordinate system as register/phone case props).
 */
export function SceneViewportPortal({
  measureRef,
  children,
  enabled = true,
}: SceneViewportPortalProps) {
  const [mountNode, setMountNode] = useState<HTMLElement | null>(null);

  useLayoutEffect(() => {
    if (!enabled) {
      setMountNode(null);
      return;
    }
    const el = measureRef.current;
    if (!el) {
      setMountNode(null);
      return;
    }
    setMountNode(el);
    const observer = new ResizeObserver(() => {
      setMountNode(measureRef.current);
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, [enabled, measureRef]);

  if (!enabled || !mountNode) return null;

  return createPortal(
    <div style={sceneCarouselViewportOverlayRootStyle()}>{children}</div>,
    mountNode,
  );
}
