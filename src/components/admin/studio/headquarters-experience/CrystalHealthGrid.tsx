import { HQ, hqLabel } from './hqExperienceTheme';

export type CrystalHealthMetric = {
  id: string;
  label: string;
  score: number;
  trend?: 'up' | 'down' | 'flat';
};

type Props = {
  metrics: CrystalHealthMetric[];
  overallScore?: number;
  overallLabel?: string;
  accentHex?: string;
};

/** Company Pulse™ — crystal health indicators instead of flat bars. */
export function CrystalHealthGrid({ metrics, overallScore, overallLabel = 'ORGANIZATION', accentHex = HQ.red }: Props) {
  return (
    <div>
      {typeof overallScore === 'number' ? (
        <div className="flex items-center gap-4 mb-5">
          <CrystalRing value={overallScore} size={64} accent={accentHex} />
          <div>
            <p style={{ ...hqLabel, margin: 0 }}>{overallLabel}</p>
            <p style={{ fontFamily: '"Futura PT Medium"', fontSize: '14px', color: HQ.black, margin: '4px 0 0' }}>
              {overallScore}% PULSE
            </p>
          </div>
        </div>
      ) : null}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {metrics.map((m) => (
          <CrystalHealthCell key={m.id} metric={m} accentHex={accentHex} />
        ))}
      </div>
    </div>
  );
}

function CrystalHealthCell({ metric, accentHex }: { metric: CrystalHealthMetric; accentHex: string }) {
  return (
    <div
      className="hq-crystal-ring text-center p-3 rounded-lg"
      style={{
        background: 'rgba(255,255,255,0.5)',
        border: '1px solid rgba(255,255,255,0.75)',
        boxShadow: 'inset 0 2px 8px rgba(255,255,255,0.8)',
      }}
    >
      <CrystalRing value={metric.score} size={44} accent={accentHex} />
      <p style={{ ...hqLabel, fontSize: '5px', marginTop: 8 }}>{metric.label}</p>
      {metric.trend ? (
        <p style={{ fontFamily: '"Futura PT Book"', fontSize: '6px', color: HQ.gray, marginTop: 2 }}>
          {metric.trend === 'up' ? '↑' : metric.trend === 'down' ? '↓' : '→'}
        </p>
      ) : null}
    </div>
  );
}

export function CrystalRing({ value, size, accent }: { value: number; size: number; accent: string }) {
  const pct = Math.min(100, Math.max(0, value));
  const r = (size - 6) / 2;
  const c = 2 * Math.PI * r;
  const offset = c - (pct / 100) * c;

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-hidden style={{ display: 'inline-block' }}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(0,0,0,0.06)" strokeWidth={3} />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke={accent}
        strokeWidth={3}
        strokeDasharray={c}
        strokeDashoffset={offset}
        strokeLinecap="round"
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
        style={{ transition: 'stroke-dashoffset 0.8s ease' }}
      />
      <text
        x="50%"
        y="50%"
        dominantBaseline="middle"
        textAnchor="middle"
        style={{ fontFamily: '"Futura PT Medium"', fontSize: size * 0.22, fill: HQ.black }}
      >
        {pct}
      </text>
    </svg>
  );
}
