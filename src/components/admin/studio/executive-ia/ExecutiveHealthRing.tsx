import { EIA } from './executiveIaTheme';

type ExecutiveHealthRingProps = {
  value: number;
  size?: number;
  label?: string;
  accent?: string;
};

/** Organization / department health — visual before text. */
export function ExecutiveHealthRing({ value, size = 44, label, accent = EIA.red }: ExecutiveHealthRingProps) {
  const clamped = Math.max(0, Math.min(100, value));
  const stroke = 3;
  const radius = (size - stroke * 2) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (clamped / 100) * circumference;

  return (
    <div className="executive-ia-health-ring flex flex-col items-center" style={{ width: size }}>
      <svg width={size} height={size} aria-hidden>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="rgba(0,0,0,0.08)"
          strokeWidth={stroke}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={accent}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
        <text
          x="50%"
          y="50%"
          dominantBaseline="central"
          textAnchor="middle"
          style={{ fontFamily: '"Futura PT Medium"', fontSize: size * 0.22, fill: EIA.black }}
        >
          {clamped}
        </text>
      </svg>
      {label ? (
        <p
          style={{
            fontFamily: '"Futura PT Book"',
            fontSize: '7px',
            color: EIA.gray,
            marginTop: 4,
            textAlign: 'center',
          }}
        >
          {label}
        </p>
      ) : null}
    </div>
  );
}
