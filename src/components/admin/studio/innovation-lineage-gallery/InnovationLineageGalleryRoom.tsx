import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useInnovationLineage } from '../../../../hooks/useInnovationLineage';
import { formatIntellectualEquitySummary } from '../../../../studio-os-core/innovation-lineage';
import { INNOVATION_LINEAGE_GALLERY_STYLES } from './innovationLineageGalleryTheme';

/**
 * Innovation Lineage Gallery™ — Museum Wing celebration of collective innovation.
 * Every exhibit shows original vision, forks, collaborators, and living evolution.
 */
export function InnovationLineageGalleryRoom() {
  const navigate = useNavigate();
  const { profile, historianLines, activeExhibit, focusExhibit, focusLegacy } = useInnovationLineage();

  const historianTicker = useMemo(
    () => historianLines.map((l) => l.message).join(' · '),
    [historianLines]
  );

  const listing = profile.marketplaceInventions[0];

  return (
    <>
      <style>{INNOVATION_LINEAGE_GALLERY_STYLES}</style>
      <div className="lineage-gallery" role="application" aria-label="Innovation Lineage Gallery">
        <div className="lineage-gallery__veins" aria-hidden />

        <header className="lineage-gallery__hud">
          <button
            type="button"
            className="lineage-gallery__back"
            onClick={() => navigate('/admin/studio/studio-museum')}
            aria-label="Return to Museum Wing"
          >
            ←
          </button>
          <div className="lineage-gallery__title-block">
            <p className="lineage-gallery__eyebrow">MUSEUM WING™ · STUDIO ARCHIVES™</p>
            <p className="lineage-gallery__title">Innovation Lineage Gallery™</p>
          </div>
          <span className="lineage-gallery__orb-badge">ORB · HISTORIAN</span>
        </header>

        <div className="lineage-gallery__stats" aria-label="Lineage summary">
          <div className="lineage-gallery__stat">
            <span className="lineage-gallery__stat-val">{profile.lineageScore}%</span>
            <span className="lineage-gallery__stat-label">LINEAGE SCORE</span>
          </div>
          <div className="lineage-gallery__stat">
            <span className="lineage-gallery__stat-val">{profile.founderLegacy.innovationScore}</span>
            <span className="lineage-gallery__stat-label">INNOVATION SCORE</span>
          </div>
          <div className="lineage-gallery__stat">
            <span className="lineage-gallery__stat-val">
              {(activeExhibit?.companiesUsing ?? 0).toLocaleString()}
            </span>
            <span className="lineage-gallery__stat-label">COMPANIES USING</span>
          </div>
        </div>

        <main className="lineage-gallery__scroll">
          <p className="lineage-gallery__section-title">EXHIBITS</p>
          {profile.galleryExhibits.map((exhibit) => (
            <button
              key={exhibit.id}
              type="button"
              className={`lineage-gallery__exhibit-btn${activeExhibit?.id === exhibit.id ? ' is-active' : ''}`}
              onClick={() => focusExhibit(exhibit.id)}
            >
              <p className="lineage-gallery__exhibit-title">{exhibit.title}</p>
              <p className="lineage-gallery__exhibit-meta">{exhibit.currentEvolution}</p>
            </button>
          ))}

          {activeExhibit ? (
            <>
              <p className="lineage-gallery__section-title">INNOVATION LINEAGE™</p>
              <div className="lineage-gallery__timeline" aria-label="Evolution timeline">
                {activeExhibit.timeline.map((step) => (
                  <div key={step.id} className="lineage-gallery__timeline-step">
                    <p className="lineage-gallery__step-label">{step.label}</p>
                    <p className="lineage-gallery__step-detail">{step.detail}</p>
                  </div>
                ))}
              </div>

              <p className="lineage-gallery__section-title">INTELLECTUAL EQUITY™</p>
              <p className="lineage-gallery__exhibit-meta" style={{ marginBottom: 6 }}>
                {formatIntellectualEquitySummary(activeExhibit.equity)}
              </p>
              <div className="lineage-gallery__equity-grid">
                <div className="lineage-gallery__equity-cell">
                  <span className="lineage-gallery__equity-val">{activeExhibit.equity.influenceScore}</span>
                  INFLUENCE
                </div>
                <div className="lineage-gallery__equity-cell">
                  <span className="lineage-gallery__equity-val">{activeExhibit.equity.innovationReach}</span>
                  REACH
                </div>
                <div className="lineage-gallery__equity-cell">
                  <span className="lineage-gallery__equity-val">{activeExhibit.equity.forks}</span>
                  FORKS
                </div>
                <div className="lineage-gallery__equity-cell">
                  <span className="lineage-gallery__equity-val">{activeExhibit.equity.creativeEquity}</span>
                  CREATIVE EQUITY
                </div>
              </div>

              {listing ? (
                <>
                  <p className="lineage-gallery__section-title">MARKETPLACE INVENTION™</p>
                  <p className="lineage-gallery__exhibit-meta">{listing.innovationStory}</p>
                  <p className="lineage-gallery__exhibit-meta" style={{ marginTop: 6 }}>
                    {listing.estimatedTimeSavedHours.toLocaleString()}h saved · $
                    {listing.creativeBudgetSavedUsd.toLocaleString()} creative budget saved
                  </p>
                </>
              ) : null}

              <p className="lineage-gallery__section-title">DISCOVERY™</p>
              {profile.discoveryOpportunities.map((d) => (
                <p key={d.id} className="lineage-gallery__exhibit-meta" style={{ marginBottom: 6 }}>
                  {d.headline} {d.rationale}
                </p>
              ))}
            </>
          ) : null}
        </main>

        <div className="lineage-gallery__historian" aria-live="polite">
          {historianTicker}
          <div className="lineage-gallery__footer-actions">
            <button type="button" className="lineage-gallery__action-btn" onClick={focusLegacy}>
              FOUNDER LEGACY™
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
