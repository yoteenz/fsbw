import type { CSSProperties } from 'react';

export type LightSweepProps = {
  active?: boolean;
  intensity?: number;
  angleDeg?: number;
  durationMs?: number;
  className?: string;
};

export function LightSweep({
  active = false,
  intensity = 0.55,
  angleDeg = 112,
  durationMs = 900,
  className = '',
}: LightSweepProps) {
  const style: CSSProperties = {
    '--fsms-sweep-angle': `${angleDeg}deg`,
    '--fsms-sweep-intensity': intensity,
    '--fsms-sweep-ms': `${durationMs}ms`,
    '--fsms-sweep-opacity': active ? 1 : 0,
    '--fsms-sweep-x': active ? '120%' : '-120%',
  } as CSSProperties;

  return (
    <span className={`fsms-light-sweep ${className}`.trim()} style={style} aria-hidden>
      <span className="fsms-light-sweep__beam" />
    </span>
  );
}
