import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import type { ArchitectureScores, ArchitectureViolation } from '../../../../studio-os-core/architecture-auditor';
import { useArchitectureAuditor } from '../../../../hooks/useArchitectureAuditor';
import { ARCHITECTURE_OBSERVATORY_STYLES } from './architectureObservatoryTheme';

type ScoreProjectionProps = {
  label: string;
  value: number;
  align?: 'left' | 'right';
};

function ScoreProjection({ label, value, align = 'left' }: ScoreProjectionProps) {
  const low = value < 45;
  return (
    <div className="arch-obs__projection" style={{ textAlign: align }}>
      <span className="arch-obs__proj-label">{label}</span>
      <span className="arch-obs__proj-val">{value}</span>
      <div className="arch-obs__proj-bar">
        <div
          className={`arch-obs__proj-fill${low ? ' is-low' : ''}`}
          style={{ width: `${Math.min(100, value)}%` }}
        />
      </div>
    </div>
  );
}

function healthClass(score: number): string {
  if (score < 35) return 'is-critical';
  if (score < 55) return 'is-warning';
  return '';
}

const LEFT_SCORES = ['immersion', 'architecture', 'worldContinuity'] as const satisfies readonly (keyof ArchitectureScores)[];
const RIGHT_SCORES = ['navigation', 'sceneStack', 'reuse'] as const satisfies readonly (keyof ArchitectureScores)[];

const SCORE_LABELS: Record<keyof ArchitectureScores, string> = {
  immersion: 'IMMERSION',
  architecture: 'ARCHITECTURE',
  worldContinuity: 'WORLD CONTINUITY',
  reuse: 'REUSE',
  navigation: 'NAVIGATION',
  sceneStack: 'SCENE STACK',
  generationCost: 'GEN COST EFF.',
  overallHeadquartersQuality: 'HQ QUALITY',
};

/**
 * Architecture Observatory™ — Studio Command Center™ guardian room.
 * Mission-control environment — not a dashboard.
 */
export function ArchitectureObservatoryRoom() {
  const navigate = useNavigate();
  const { report, scanning, scan } = useArchitectureAuditor({ autoRefreshMs: 90_000 });

  const scores = report?.scores;
  const overall = scores?.overallHeadquartersQuality ?? 0;

  const tickerText = useMemo(() => {
    if (!report) return 'SCANNING STUDIO WORLD™ ARCHITECTURE…';
    const parts = report.violations.slice(0, 8).map((v: ArchitectureViolation) => v.problem);
    if (parts.length === 0) return 'NO CRITICAL VIOLATIONS — STUDIO WORLD INTEGRITY STABLE';
    return parts.join('  ·  ');
  }, [report]);

  return (
    <>
      <style>{ARCHITECTURE_OBSERVATORY_STYLES}</style>
      <div className="arch-obs" role="application" aria-label="Architecture Observatory">
        <div className="arch-obs__floor-grid" aria-hidden />
        <span className="arch-obs__beacon arch-obs__beacon--tl" aria-hidden />
        <span className="arch-obs__beacon arch-obs__beacon--tr" aria-hidden />

        <header className="arch-obs__hud">
          <button
            type="button"
            className="arch-obs__back"
            onClick={() => navigate('/admin/studio/overview')}
            aria-label="Return to Executive Atrium"
          >
            ←
          </button>
          <div className="arch-obs__title-block">
            <p className="arch-obs__eyebrow">STUDIO COMMAND CENTER™</p>
            <p className="arch-obs__title">ARCHITECTURE OBSERVATORY™</p>
          </div>
          <button
            type="button"
            className="arch-obs__scan-btn"
            onClick={() => void scan()}
            disabled={scanning}
          >
            {scanning ? 'SCANNING…' : 'RESCAN WORLD'}
          </button>
        </header>

        <div className="arch-obs__wall arch-obs__wall--left">
          {LEFT_SCORES.map((key) => (
            <ScoreProjection
              key={key}
              label={SCORE_LABELS[key]}
              value={scores?.[key] ?? 0}
            />
          ))}
        </div>

        <div className="arch-obs__core" aria-live="polite">
          <div className="arch-obs__core-ring" />
          <div className="arch-obs__core-ring arch-obs__core-ring--2" />
          <div className="arch-obs__core-ring arch-obs__core-ring--3" />
          <div className="arch-obs__core-readout">
            <p className={`arch-obs__health-val ${healthClass(overall)}`}>{overall}</p>
            <p className="arch-obs__health-label">ARCHITECTURE HEALTH</p>
            {report && (
              <p className="arch-obs__status-line">
                {report.remainingWebpages} WEBPAGES · {report.violations.length} FLAGS ·{' '}
                {report.immersiveLiveCount} LIVE ROOMS
              </p>
            )}
          </div>
        </div>

        <div className="arch-obs__wall arch-obs__wall--right">
          {RIGHT_SCORES.map((key) => (
            <ScoreProjection
              key={key}
              label={SCORE_LABELS[key]}
              value={scores?.[key] ?? 0}
              align="right"
            />
          ))}
        </div>

        <div className="arch-obs__wall arch-obs__wall--bottom">
          <div className="arch-obs__projection">
            <span className="arch-obs__proj-label">REGISTRY · SCENE REUSE · BUDGET</span>
            <div className="arch-obs__migration-row">
              <span>REGISTRY EFF.</span>
              <span>{report?.registryEfficiencyPct ?? '—'}%</span>
            </div>
            <div className="arch-obs__migration-row">
              <span>SCENE REUSE</span>
              <span>{report?.sceneReusePct ?? '—'}%</span>
            </div>
            <div className="arch-obs__migration-row">
              <span>GEN BUDGET (EST.)</span>
              <span>{report?.estimatedGenerationBudget ?? '—'}</span>
            </div>
            <div className="arch-obs__migration-row">
              <span>OPTIMIZATION SAVINGS</span>
              <span>{report?.estimatedOptimizationSavings ?? '—'}</span>
            </div>
          </div>

          {report?.upcomingMigrations.slice(0, 4).map((m: { route: string; priority: string; room: string }) => (
            <div key={m.route} className="arch-obs__migration-row">
              <span>{m.priority} · {m.room}</span>
              <span style={{ opacity: 0.55, fontSize: '3px' }}>{m.route.replace('/admin/studio/', '')}</span>
            </div>
          ))}

          <div className="arch-obs__ticker" aria-live="polite">
            <span className="arch-obs__ticker-inner">
              {tickerText} &nbsp;&nbsp;&nbsp; {tickerText}
            </span>
          </div>
        </div>
      </div>
    </>
  );
}
