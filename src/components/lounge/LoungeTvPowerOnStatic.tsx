import { useEffect, useId, useRef, useState } from 'react';

const STATIC_W = 112;
const STATIC_H = 84;

type LoungeTvPowerOnStaticProps = {
  active: boolean;
};

/** CRT TV static + vertical “power on” reveal before lounge TV UI appears. */
export function LoungeTvPowerOnStatic({ active }: LoungeTvPowerOnStaticProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const filterId = useId().replace(/:/g, '');
  const [mounted, setMounted] = useState(active);

  useEffect(() => {
    if (active) {
      setMounted(true);
      return;
    }
    const timer = window.setTimeout(() => setMounted(false), 320);
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
    <div
      className={`lounge-tv-power-on-static${active ? '' : ' lounge-tv-power-on-static--out'}`}
      aria-hidden
    >
      <canvas ref={canvasRef} className="lounge-tv-power-on-static__canvas" />
      <div
        className="lounge-tv-power-on-static__noise"
        style={{ filter: `url(#${filterId})` }}
      />
      <svg className="lounge-tv-power-on-static__svg-defs" aria-hidden focusable="false">
        <defs>
          <filter id={filterId} x="0%" y="0%" width="100%" height="100%">
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.85 0.95"
              numOctaves="3"
              stitchTiles="stitch"
              result="noise"
            />
            <feColorMatrix type="saturate" values="0" in="noise" result="mono" />
            <feComponentTransfer in="mono">
              <feFuncR type="linear" slope="1.4" intercept="-0.2" />
              <feFuncG type="linear" slope="1.4" intercept="-0.2" />
              <feFuncB type="linear" slope="1.4" intercept="-0.2" />
            </feComponentTransfer>
          </filter>
        </defs>
      </svg>
      <div className="lounge-tv-power-on-static__scanlines" />
      <div className="lounge-tv-power-on-static__vignette" />
    </div>
  );
}
