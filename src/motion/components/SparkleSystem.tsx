import type { FsmsSparkleSpec } from '../tokens/types';

export type SparkleSystemProps = {
  sparkles: FsmsSparkleSpec[];
  active?: boolean;
  className?: string;
};

export function SparkleSystem({ sparkles, active = true, className = '' }: SparkleSystemProps) {
  if (!active) return null;

  return (
    <span className={`fsms-sparkle-system ${className}`.trim()} aria-hidden>
      {sparkles.map((s) => (
        <span
          key={s.id}
          className="fsms-sparkle"
          style={{
            left: `${s.x}%`,
            top: `${s.y}%`,
            width: s.size,
            height: s.size,
            ['--fsms-sparkle-delay' as string]: `${s.delayMs}ms`,
            ['--fsms-sparkle-duration' as string]: `${s.durationMs}ms`,
            ['--fsms-sparkle-opacity' as string]: s.opacity,
          }}
        />
      ))}
    </span>
  );
}
