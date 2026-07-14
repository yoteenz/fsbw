import { useEffect } from 'react';

const MAX_PARALLAX_PX = 6;

function clampParallax(value: number): number {
  return Math.max(-MAX_PARALLAX_PX, Math.min(MAX_PARALLAX_PX, value));
}

/** Subtle HUD parallax — 2–6px offset from pointer or device tilt (visual only). */
export function useExperienceLabHudParallax(
  container: HTMLElement | null,
  enabled = true
): void {
  useEffect(() => {
    if (!enabled || !container || typeof window === 'undefined') return;

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reducedMotion) {
      container.style.setProperty('--elab-parallax-x', '0px');
      container.style.setProperty('--elab-parallax-y', '0px');
      return;
    }

    let raf = 0;
    let targetX = 0;
    let targetY = 0;

    const apply = () => {
      raf = 0;
      container.style.setProperty('--elab-parallax-x', `${targetX}px`);
      container.style.setProperty('--elab-parallax-y', `${targetY}px`);
    };

    const schedule = () => {
      if (raf) return;
      raf = window.requestAnimationFrame(apply);
    };

    const onPointerMove = (event: PointerEvent) => {
      const rect = container.getBoundingClientRect();
      if (!rect.width || !rect.height) return;
      const nx = (event.clientX - rect.left) / rect.width - 0.5;
      const ny = (event.clientY - rect.top) / rect.height - 0.5;
      targetX = clampParallax(nx * 12);
      targetY = clampParallax(ny * 10);
      schedule();
    };

    const onPointerLeave = () => {
      targetX = 0;
      targetY = 0;
      schedule();
    };

    const onOrientation = (event: DeviceOrientationEvent) => {
      const gamma = event.gamma ?? 0;
      const beta = event.beta ?? 0;
      targetX = clampParallax(gamma * 0.12);
      targetY = clampParallax((beta - 45) * 0.08);
      schedule();
    };

    container.addEventListener('pointermove', onPointerMove, { passive: true });
    container.addEventListener('pointerleave', onPointerLeave, { passive: true });

    if ('DeviceOrientationEvent' in window) {
      window.addEventListener('deviceorientation', onOrientation, { passive: true });
    }

    return () => {
      container.removeEventListener('pointermove', onPointerMove);
      container.removeEventListener('pointerleave', onPointerLeave);
      window.removeEventListener('deviceorientation', onOrientation);
      if (raf) window.cancelAnimationFrame(raf);
      container.style.removeProperty('--elab-parallax-x');
      container.style.removeProperty('--elab-parallax-y');
    };
  }, [container, enabled]);
}
