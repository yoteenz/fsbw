import { useLayoutEffect, useState, type RefObject } from 'react';
import { defaultSceneSlideMetricsFromViewport } from '../utils/sceneCarouselBackground';

export type SceneCarouselMeasureBox = { width: number; height: number };

export function measureSceneCarouselBox(el: HTMLElement | null): SceneCarouselMeasureBox {
  if (!el) return defaultSceneSlideMetricsFromViewport();
  const width = el.offsetWidth;
  const height = el.offsetHeight;
  if (width > 0 && height > 0) return { width, height };
  const rect = el.getBoundingClientRect();
  if (rect.width > 0 && rect.height > 0) {
    return { width: rect.width, height: rect.height };
  }
  return defaultSceneSlideMetricsFromViewport();
}

/**
 * Live width/height of {@link SceneCarouselViewportStage} — same box as `cover` slide backgrounds.
 */
export function useSceneCarouselMeasureBox(
  measureRef: RefObject<HTMLElement | null>,
): SceneCarouselMeasureBox {
  const [box, setBox] = useState<SceneCarouselMeasureBox>(() =>
    measureSceneCarouselBox(measureRef.current),
  );

  useLayoutEffect(() => {
    const el = measureRef.current;
    const update = () => setBox(measureSceneCarouselBox(measureRef.current));
    update();
    if (!el) return;
    const observer = new ResizeObserver(update);
    observer.observe(el);
    window.addEventListener('resize', update);
    const vv = window.visualViewport;
    vv?.addEventListener('resize', update);
    return () => {
      observer.disconnect();
      window.removeEventListener('resize', update);
      vv?.removeEventListener('resize', update);
    };
  }, [measureRef]);

  return box;
}
