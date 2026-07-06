import { EIA, eiaCaption } from './executiveIaTheme';

type ExecutiveTrendSparklineProps = {
  values: number[];
  label?: string;
  accent?: string;
  height?: number;
};

/** Revenue / metric trend — visual before text. */
export function ExecutiveTrendSparkline({
  values,
  label,
  accent = EIA.red,
  height = 48,
}: ExecutiveTrendSparklineProps) {
  if (values.length < 2) return null;

  const width = 160;
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  const points = values
    .map((v, i) => {
      const x = (i / (values.length - 1)) * width;
      const y = height - ((v - min) / range) * (height - 8) - 4;
      return `${x},${y}`;
    })
    .join(' ');

  return (
    <div>
      {label ? <p style={{ ...eiaCaption, marginBottom: 6 }}>{label}</p> : null}
      <svg width="100%" viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none" style={{ maxHeight: height }}>
        <polyline
          className="executive-ia-sparkline-path"
          fill="none"
          stroke={accent}
          strokeWidth="2"
          points={points}
        />
      </svg>
    </div>
  );
}
