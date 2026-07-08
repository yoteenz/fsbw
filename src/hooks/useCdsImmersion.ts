import { useCallback, useEffect, useRef, useState, type CSSProperties } from 'react';

export type CdsParallax = {
  px: number;
  py: number;
  breath: number;
};

/**
 * Cinematic camera breath + subtle pointer parallax for CDS zones.
 * Values are normalized -1..1 (pointer) and 0..1 (breath phase).
 */
export function useCdsImmersion(enabled: boolean) {
  const [parallax, setParallax] = useState<CdsParallax>({ px: 0, py: 0, breath: 0 });
  const frameRef = useRef<number | null>(null);
  const startRef = useRef<number>(typeof performance !== 'undefined' ? performance.now() : 0);

  const onPointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!enabled) return;
      const nx = (e.clientX / window.innerWidth - 0.5) * 2;
      const ny = (e.clientY / window.innerHeight - 0.5) * 2;
      setParallax((prev) => ({
        ...prev,
        px: Math.max(-1, Math.min(1, nx)),
        py: Math.max(-1, Math.min(1, ny)),
      }));
    },
    [enabled]
  );

  useEffect(() => {
    if (!enabled) return undefined;
    const tick = (now: number) => {
      const t = (now - startRef.current) / 1000;
      const breath = (Math.sin(t * 0.35) + 1) / 2;
      setParallax((prev) => ({ ...prev, breath }));
      frameRef.current = requestAnimationFrame(tick);
    };
    frameRef.current = requestAnimationFrame(tick);
    return () => {
      if (frameRef.current !== null) cancelAnimationFrame(frameRef.current);
    };
  }, [enabled]);

  const parallaxStyle = {
    '--cds-px': String(parallax.px),
    '--cds-py': String(parallax.py),
    '--cds-breath': String(parallax.breath),
  } as CSSProperties;

  return { parallax, parallaxStyle, onPointerMove };
}
