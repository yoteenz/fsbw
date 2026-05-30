import { useEffect, useId, useRef, useState } from 'react';

const STATIC_W = 112;
const STATIC_H = 84;
export const LOUNGE_TV_POWER_OFF_MS = 520;

type LoungeTvPowerOffEffectProps = {
  active: boolean;
};

/** CRT “zap off” — static burst + bright line collapses to center. */
export function LoungeTvPowerOffEffect({ active }: LoungeTvPowerOffEffectProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const filterId = useId().replace(/:/g, '');
  const [mounted, setMounted] = useState(active);

  useEffect(() => {
    if (active) {
      setMounted(true);
      return;
    }
    const timer = window.setTimeout(() => setMounted(false), 280);
    return () => window.clearTimeout(timer);
  }, [active]);

  useEffect(() => {
    if (!mounted || !active) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) return;

    canvas.width = STATIC_W;
    canvas.height = STATIC_H;

    let raf = 0;
    const draw = () => {
      const imageData = ctx.createImageData(STATIC_W, STATIC_H);
      const d = imageData.data;
      for (let i = 0; i < d.length; i += 4) {
        const v = (Math.random() * 255) | 0;
        d[i] = v;
        d[i + 1] = v;
        d[i + 2] = v;
        d[i + 3] = 255;
      }
      ctx.putImageData(imageData, 0, 0);
      raf = requestAnimationFrame(draw);
    };

    draw();
    return () => cancelAnimationFrame(raf);
  }, [mounted, active]);

  if (!mounted) return null;

  return (
    <div className="lounge-tv-power-off" aria-hidden>
      <canvas ref={canvasRef} className="lounge-tv-power-off__canvas" />
      <div
        className="lounge-tv-power-off__noise"
        style={{ filter: `url(#${filterId}-off)` }}
      />
      <svg className="lounge-tv-power-off__svg-defs" aria-hidden focusable="false">
        <defs>
          <filter id={`${filterId}-off`} x="0%" y="0%" width="100%" height="100%">
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.9 1.05"
              numOctaves="2"
              stitchTiles="stitch"
            />
            <feColorMatrix type="saturate" values="0" />
          </filter>
        </defs>
      </svg>
      <div className="lounge-tv-power-off__scanlines" />
      <div className="lounge-tv-power-off__beam" />
      <div className="lounge-tv-power-off__flash" />
    </div>
  );
}
