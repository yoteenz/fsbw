import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import type { ExperienceObservatoryMetrics } from '../../../../studio-os-core/experience-intelligence-engine';
import { useExperienceIntelligence } from '../../../../hooks/useExperienceIntelligence';
import { EXPERIENCE_OBSERVATORY_STYLES } from './experienceObservatoryTheme';

type InstallationProps = {
  label: string;
  value: number;
  warm?: boolean;
};

function Installation({ label, value, warm }: InstallationProps) {
  return (
    <div className="exp-obs__installation">
      <span className="exp-obs__inst-label">{label}</span>
      <span className="exp-obs__inst-val">{value}</span>
      <div className="exp-obs__inst-beam">
        <div
          className={`exp-obs__inst-beam-fill${warm ? ' is-warm' : ''}`}
          style={{ width: `${Math.min(100, value)}%` }}
        />
      </div>
    </div>
  );
}

function magicClass(score: number): string {
  if (score >= 60) return 'is-glow';
  if (score < 35) return 'is-dim';
  return '';
}

const LEFT_METRICS: (keyof ExperienceObservatoryMetrics)[] = [
  'immersionHealth',
  'wonderIndex',
  'luxuryScore',
  'discoveryDensity',
  'sceneVariety',
];

const RIGHT_METRICS: (keyof ExperienceObservatoryMetrics)[] = [
  'environmentalDepth',
  'emotionalImpact',
  'interactionQuality',
  'navigationFlow',
  'founderDelight',
];

const METRIC_LABELS: Record<keyof ExperienceObservatoryMetrics, string> = {
  immersionHealth: 'IMMERSION HEALTH',
  wonderIndex: 'WONDER INDEX™',
  luxuryScore: 'LUXURY SCORE™',
  discoveryDensity: 'DISCOVERY DENSITY™',
  sceneVariety: 'SCENE VARIETY™',
  environmentalDepth: 'ENVIRONMENTAL DEPTH™',
  emotionalImpact: 'EMOTIONAL IMPACT™',
  interactionQuality: 'INTERACTION QUALITY™',
  navigationFlow: 'NAVIGATION FLOW™',
  founderDelight: 'FOUNDER DELIGHT™',
};

/**
 * Experience Observatory™ — Studio World's Creative Director room.
 * Living observatory — installations, not graphs.
 */
export function ExperienceObservatoryRoom() {
  const navigate = useNavigate();
  const { report, evaluating, evaluate } = useExperienceIntelligence({ autoRefreshMs: 90_000 });

  const metrics = report?.observatory;
  const magic = report?.scores.overallMagic ?? 0;

  const whisper = useMemo(() => {
    if (!report) return 'The Creative Director is sensing Studio World™…';
    if (report.scores.overallMagic >= 55) {
      return 'Moments of magic detected — deepen discovery and arrival payoffs to astonish first-time visitors.';
    }
    return 'Too many destinations still feel like software. Wonder lives in movement, atmosphere, and hidden rewards.';
  }, [report]);

  return (
    <>
      <style>{EXPERIENCE_OBSERVATORY_STYLES}</style>
      <div className="exp-obs" role="application" aria-label="Experience Observatory">
        <div className="exp-obs__aurora" aria-hidden />

        <header className="exp-obs__hud">
          <button
            type="button"
            className="exp-obs__back"
            onClick={() => navigate('/admin/studio/overview')}
            aria-label="Return to Executive Atrium"
          >
            ←
          </button>
          <div className="exp-obs__title-block">
            <p className="exp-obs__eyebrow">STUDIO COMMAND CENTER™ · CREATIVE DIRECTOR</p>
            <p className="exp-obs__title">EXPERIENCE OBSERVATORY™</p>
          </div>
          <button
            type="button"
            className="exp-obs__sense-btn"
            onClick={() => void evaluate()}
            disabled={evaluating}
          >
            {evaluating ? 'SENSING…' : 'SENSE EXPERIENCE'}
          </button>
        </header>

        <div className="exp-obs__column exp-obs__column--left">
          {LEFT_METRICS.map((key) => (
            <Installation
              key={key}
              label={METRIC_LABELS[key]}
              value={metrics?.[key] ?? 0}
              warm={key === 'luxuryScore' || key === 'wonderIndex'}
            />
          ))}
        </div>

        <div className="exp-obs__magic-core" aria-live="polite">
          <div className="exp-obs__magic-orbit" />
          <div className="exp-obs__magic-orbit exp-obs__magic-orbit--b" />
          <div className="exp-obs__magic-orbit exp-obs__magic-orbit--c" />
          <div className="exp-obs__magic-readout">
            <p className={`exp-obs__magic-val ${magicClass(magic)}`}>{magic}</p>
            <p className="exp-obs__magic-label">OVERALL MAGIC™</p>
            {report && (
              <p className="exp-obs__magic-sub">
                {report.issues.length} EXPERIENCE FLAGS · {report.discoveryOpportunities.length} DISCOVERIES WAITING
              </p>
            )}
          </div>
        </div>

        <div className="exp-obs__column exp-obs__column--right">
          {RIGHT_METRICS.map((key) => (
            <Installation
              key={key}
              label={METRIC_LABELS[key]}
              value={metrics?.[key] ?? 0}
              warm={key === 'founderDelight' || key === 'emotionalImpact'}
            />
          ))}
        </div>

        <div className="exp-obs__deck">
          {report?.recommendedUpgrades.slice(0, 5).map((line) => (
            <p key={line} className="exp-obs__upgrade-line">
              ↑ {line}
            </p>
          ))}
          <p className="exp-obs__whisper">{whisper}</p>
        </div>
      </div>
    </>
  );
}
