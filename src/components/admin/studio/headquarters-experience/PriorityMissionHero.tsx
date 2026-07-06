import { HQ, hqActionBtn, hqBody, hqGrace, hqLabel } from './hqExperienceTheme';
import { HqGlassSurface } from './HqWingZone';

type Props = {
  title: string;
  headline: string;
  subtitle?: string;
  countdown?: string;
  confidencePct?: number;
  predictedImpact?: string;
  recommendedAction?: string;
  details?: Array<{ label: string; value: string }>;
  ctaLabel?: string;
  onCta?: () => void;
  accentHex?: string;
};

/** Priority of the Day — dominant hero mission panel. */
export function PriorityMissionHero({
  title,
  headline,
  subtitle,
  countdown,
  confidencePct,
  predictedImpact,
  recommendedAction,
  details = [],
  ctaLabel = 'BEGIN MISSION',
  onCta,
  accentHex = HQ.red,
}: Props) {
  return (
    <HqGlassSurface>
      <div
        className="absolute top-0 left-0 right-0 h-1 rounded-t-xl"
        style={{ background: `linear-gradient(90deg, ${accentHex}, rgba(255,255,255,0))` }}
        aria-hidden
      />
      <p style={{ ...hqLabel, color: accentHex, margin: 0 }}>PRIORITY OF THE DAY</p>
      <p style={{ ...hqGrace, fontSize: '20px', color: accentHex, margin: '8px 0 0', lineHeight: 1.1 }}>{headline}</p>
      {subtitle ? <p style={{ ...hqBody, fontFamily: '"Futura PT Medium"', fontSize: '9px', marginTop: 6 }}>{subtitle}</p> : null}

      {countdown ? (
        <p style={{ ...hqGrace, fontSize: '16px', color: HQ.black, margin: '12px 0 0' }}>{countdown}</p>
      ) : null}

      {details.length > 0 ? (
        <div className="grid grid-cols-2 gap-2 mt-4">
          {details.map((d) => (
            <div key={d.label}>
              <p style={{ ...hqLabel, fontSize: '5px' }}>{d.label}</p>
              <p style={{ ...hqBody, fontSize: '7px', fontFamily: '"Futura PT Medium"' }}>{d.value}</p>
            </div>
          ))}
        </div>
      ) : null}

      {predictedImpact ? (
        <p style={{ ...hqBody, fontSize: '7px', color: HQ.gray, marginTop: 12 }}>
          PREDICTED IMPACT · {predictedImpact}
        </p>
      ) : null}

      {typeof confidencePct === 'number' ? (
        <p style={{ ...hqLabel, color: accentHex, marginTop: 8 }}>{confidencePct}% CONFIDENCE</p>
      ) : null}

      {recommendedAction ? (
        <p style={{ ...hqBody, marginTop: 8, fontFamily: '"Futura PT Medium"', fontSize: '8px' }}>{recommendedAction}</p>
      ) : null}

      {onCta ? (
        <button type="button" onClick={onCta} style={{ ...hqActionBtn, marginTop: 16, background: `rgba(235,28,36,0.08)` }}>
          {ctaLabel}
        </button>
      ) : null}
      {!onCta && title ? <p style={{ ...hqLabel, marginTop: 12, fontSize: '5px' }}>{title}</p> : null}
    </HqGlassSurface>
  );
}
