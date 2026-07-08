import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useInnovationConstellations } from '../../../../hooks/useInnovationConstellations';
import {
  summarizeOpportunities,
  summarizePathways,
} from '../../../../studio-os-core/innovation-constellations';
import type { StarInfluenceTier } from '../../../../studio-os-core/innovation-constellations';
import { INNOVATION_CONSTELLATIONS_STYLES } from './innovationConstellationsTheme';

function tierClass(tier: StarInfluenceTier, isSun: boolean): string {
  if (isSun) return 'is-sun';
  switch (tier) {
    case 'blue-star':
      return 'is-blue';
    case 'white-star':
      return 'is-white';
    case 'gold-star':
      return 'is-gold';
    case 'red-giant':
      return 'is-red';
    case 'constellation-anchor':
      return 'is-anchor';
    default:
      return 'is-blue';
  }
}

/**
 * Innovation Constellations™ Observatory — living knowledge universe.
 * Founders explore galaxies, constellations, and stars — not lists.
 */
export function InnovationConstellationsObservatory() {
  const navigate = useNavigate();
  const {
    profile,
    cosmicLines,
    activeConstellation,
    visibleStars,
    focusConstellation,
    focusFounderStar,
  } = useInnovationConstellations();

  const cosmicTicker = useMemo(
    () => cosmicLines.map((l) => l.message).join(' · '),
    [cosmicLines]
  );

  const marketplaceCtx = profile.marketplaceContexts[0];
  const academicView = profile.academicViews[0];
  const opportunities = profile.universe.opportunities;
  const pathways = profile.universe.pathways;

  return (
    <>
      <style>{INNOVATION_CONSTELLATIONS_STYLES}</style>
      <div className="ic-observatory" role="application" aria-label="Innovation Constellations Observatory">
        <div className="ic-observatory__stars-bg" aria-hidden />

        <header className="ic-observatory__hud">
          <button
            type="button"
            className="ic-observatory__back"
            onClick={() => navigate('/admin/studio/innovation-lineage-gallery')}
            aria-label="Return to Innovation Lineage Gallery"
          >
            ←
          </button>
          <div className="ic-observatory__title-block">
            <p className="ic-observatory__eyebrow">STUDIO ARCHIVES™ · LIVING UNIVERSE</p>
            <p className="ic-observatory__title">Innovation Constellations™</p>
          </div>
          <span className="ic-observatory__orb-badge">ORB · COSMIC GUIDE</span>
        </header>

        <div className="ic-observatory__nav" aria-label="Constellation navigation">
          {profile.universe.constellations.map((c) => (
            <button
              key={c.id}
              type="button"
              className={`ic-observatory__nav-pill${activeConstellation?.id === c.id ? ' is-active' : ''}`}
              onClick={() => focusConstellation(c.id)}
            >
              {c.title}
            </button>
          ))}
        </div>

        <div className="ic-observatory__sky" aria-label="Celestial star map">
          {visibleStars.map((star) => {
            const size = 4 + Math.round(star.brightness / 12);
            const cls = tierClass(star.influenceTier, star.level === 'sun');
            return (
              <button
                key={star.id}
                type="button"
                className="ic-observatory__celestial"
                style={{ left: `${star.mapX}%`, top: `${star.mapY}%` }}
                title={`${star.title} — ${star.influenceLabel}`}
              >
                <span
                  className={`ic-observatory__celestial-dot ${cls}`}
                  style={{ width: size, height: size }}
                />
                <span className="ic-observatory__celestial-label">{star.title}</span>
              </button>
            );
          })}

          {pathways
            .filter((p) => p.glowing)
            .slice(0, 3)
            .map((pathway, i) => (
              <div
                key={pathway.id}
                className="ic-observatory__pathway is-glow"
                style={{
                  left: `${20 + i * 22}%`,
                  top: `${65 + i * 4}%`,
                  width: `${18 + pathway.strength * 0.15}%`,
                  transform: `rotate(${-12 + i * 18}deg)`,
                }}
                aria-hidden
              />
            ))}
        </div>

        <div className="ic-observatory__panel" aria-label="Constellation intelligence">
          {activeConstellation ? (
            <>
              <p className="ic-observatory__panel-title">
                {activeConstellation.title} · {activeConstellation.evolutionVelocity.toUpperCase()} EVOLUTION
              </p>
              <p className="ic-observatory__panel-body">
                {activeConstellation.starCount} stars · Influential:{' '}
                {activeConstellation.influentialStars.join(', ') || 'forming'} · Emerging:{' '}
                {activeConstellation.emergingStars.join(', ') || 'none yet'}
              </p>
            </>
          ) : null}

          <p className="ic-observatory__panel-title" style={{ marginTop: 6 }}>
            OPPORTUNITY MAP™
          </p>
          <p className="ic-observatory__panel-body">{summarizeOpportunities(opportunities)}</p>
          {opportunities.slice(0, 2).map((opp) => (
            <p key={opp.id} className="ic-observatory__opp">
              {opp.label} — {opp.reason}
            </p>
          ))}

          <p className="ic-observatory__panel-title" style={{ marginTop: 6 }}>
            COLLABORATION PATHWAYS™
          </p>
          <p className="ic-observatory__panel-body">{summarizePathways(pathways)}</p>

          {marketplaceCtx ? (
            <>
              <p className="ic-observatory__panel-title" style={{ marginTop: 6 }}>
                MARKETPLACE CONSTELLATION™
              </p>
              <p className="ic-observatory__panel-body">
                {marketplaceCtx.title} in {marketplaceCtx.constellationTitle} · {marketplaceCtx.descendants}{' '}
                descendants · Creative Equity {marketplaceCtx.creativeEquity} ·{' '}
                {marketplaceCtx.estimatedBusinessImpact}
              </p>
            </>
          ) : null}

          {academicView ? (
            <>
              <p className="ic-observatory__panel-title" style={{ marginTop: 6 }}>
                ACADEMIC MODE™
              </p>
              <p className="ic-observatory__panel-body">
                {academicView.originalInspiration} · {academicView.forks} forks · {academicView.merges} merges ·{' '}
                {academicView.marketplaceAdoption}
              </p>
            </>
          ) : null}

          <div className="ic-observatory__actions">
            <button type="button" className="ic-observatory__action-btn" onClick={focusFounderStar}>
              FOUNDER&apos;S STAR™
            </button>
            <button
              type="button"
              className="ic-observatory__action-btn"
              onClick={() => navigate('/admin/studio/innovation-district')}
            >
              COLLABORATION PATHWAYS
            </button>
          </div>

          <p className="ic-observatory__panel-body" style={{ marginTop: 6 }} aria-live="polite">
            {cosmicTicker}
          </p>
        </div>
      </div>
    </>
  );
}
