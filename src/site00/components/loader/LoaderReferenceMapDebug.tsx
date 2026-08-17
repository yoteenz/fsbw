import { useEffect, useState } from 'react';
import {
  ASSTS_LOADER_CENTER_X,
  ASSTS_LOADER_PRIMARY_REGIONS,
  ASSTS_LOADER_REGIONS,
  ASSTS_LOADER_Y_LANDMARKS,
  scaleLoaderRect,
  type LoaderRegionId,
} from './loader-composition-map';
import { useLoaderComposition } from './LoaderCompositionContext';

type RegionMeasurement = {
  id: LoaderRegionId;
  expected: { x: number; y: number; w: number; h: number };
  actual: { x: number; y: number; w: number; h: number };
  delta: { x: number; y: number; w: number; h: number };
};

export function LoaderReferenceMapDebug() {
  const { refMapMode, setRefMapMode, scale, regionElements } = useLoaderComposition();
  const [measurements, setMeasurements] = useState<RegionMeasurement[]>([]);

  useEffect(() => {
    if (!refMapMode) return;
    const stage = document.querySelector('.site00-loader-stage');
    if (!stage) return;

    const measure = () => {
      const stageRect = stage.getBoundingClientRect();
      const next: RegionMeasurement[] = [];

      for (const id of ASSTS_LOADER_PRIMARY_REGIONS) {
        const el = regionElements.get(id);
        if (!el) continue;
        const ref = ASSTS_LOADER_REGIONS[id];
        const expected = scaleLoaderRect(ref, scale);
        const r = el.getBoundingClientRect();
        const actual = {
          x: r.left - stageRect.left,
          y: r.top - stageRect.top,
          w: r.width,
          h: r.height,
        };
        next.push({
          id,
          expected,
          actual,
          delta: {
            x: Math.round(actual.x - expected.x),
            y: Math.round(actual.y - expected.y),
            w: Math.round(actual.w - expected.w),
            h: Math.round(actual.h - expected.h),
          },
        });
      }
      setMeasurements(next);
    };

    measure();
    const t = window.setInterval(measure, 500);
    window.addEventListener('resize', measure);
    return () => {
      window.clearInterval(t);
      window.removeEventListener('resize', measure);
    };
  }, [refMapMode, scale, regionElements]);

  if (!refMapMode) {
    return (
      <button
        type="button"
        className="site00-loader-refmap-toggle"
        onClick={() => setRefMapMode(true)}
        aria-label="Show loader reference map"
      >
        LOADER REF MAP
      </button>
    );
  }

  return (
    <div className="site00-loader-refmap" aria-hidden="true">
      <button type="button" className="site00-loader-refmap-toggle site00-loader-refmap-toggle--on" onClick={() => setRefMapMode(false)}>
        HIDE REF MAP
      </button>

      <div
        className="site00-loader-refmap__axis-v"
        style={{ left: `calc(${ASSTS_LOADER_CENTER_X} * var(--loader-scale) * 1px)` }}
      />

      {ASSTS_LOADER_Y_LANDMARKS.map(({ label, y }) => (
        <div
          key={label}
          className="site00-loader-refmap__guide-h"
          style={{ top: `calc(${y} * var(--loader-scale) * 1px)` }}
        >
          <span>{label}</span>
        </div>
      ))}

      {ASSTS_LOADER_PRIMARY_REGIONS.map((id) => {
        const r = ASSTS_LOADER_REGIONS[id];
        return (
          <div
            key={id}
            className="site00-loader-refmap__box"
            style={{
              left: `calc(${r.x} * var(--loader-scale) * 1px)`,
              top: `calc(${r.y} * var(--loader-scale) * 1px)`,
              width: `calc(${r.w} * var(--loader-scale) * 1px)`,
              height: `calc(${r.h} * var(--loader-scale) * 1px)`,
            }}
          >
            <span className="site00-loader-refmap__box-label">{id.toUpperCase()}</span>
          </div>
        );
      })}

      <div className="site00-loader-refmap__report">
        <div className="site00-loader-refmap__report-head">LOADER REFERENCE MAP · scale {scale.toFixed(4)}</div>
        {measurements.map((m) => (
          <div key={m.id} className="site00-loader-refmap__report-row">
            <strong>{m.id}</strong>
            <div>
              EXPECTED: x {Math.round(m.expected.x)} y {Math.round(m.expected.y)}
            </div>
            <div>
              ACTUAL: x {Math.round(m.actual.x)} y {Math.round(m.actual.y)}
            </div>
            <div className={Math.abs(m.delta.x) > 5 || Math.abs(m.delta.y) > 5 ? 'site00-loader-refmap__warn' : ''}>
              DELTA: {m.delta.x >= 0 ? '+' : ''}
              {m.delta.x} x · {m.delta.y >= 0 ? '+' : ''}
              {m.delta.y} y
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
