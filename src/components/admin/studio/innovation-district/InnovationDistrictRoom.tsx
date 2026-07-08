import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCollaborativeInnovationNetwork } from '../../../../hooks/useCollaborativeInnovationNetwork';
import {
  PUBLICATION_VISIBILITY_LABELS,
  PUBLICATION_VISIBILITY_OPTIONS,
  summarizeContributions,
} from '../../../../studio-os-core/collaborative-innovation-network';
import { INNOVATION_DISTRICT_STYLES } from './innovationDistrictTheme';

const CONTRIB_COLORS = ['#7c5cff', '#5b8cff', '#4ade80', '#fbbf24', '#f472b6'];

/**
 * Innovation District™ — living campus for collaborative invention.
 * Silicon Valley of Studio World™ — meet, prototype, co-invent, publish.
 */
export function InnovationDistrictRoom() {
  const navigate = useNavigate();
  const { profile, curatorLines, pendingInnovation, publishing, publishInnovation, focusRecommendations } =
    useCollaborativeInnovationNetwork();

  const genome = profile.collaborationGenomes[0];
  const curatorTicker = useMemo(
    () => curatorLines.map((l) => l.message).join(' · '),
    [curatorLines]
  );

  return (
    <>
      <style>{INNOVATION_DISTRICT_STYLES}</style>
      <div className="inno-district" role="application" aria-label="Innovation District">
        <div className="inno-district__grid" aria-hidden />

        <header className="inno-district__hud">
          <button
            type="button"
            className="inno-district__back"
            onClick={() => navigate('/admin/studio/overview')}
            aria-label="Return to Executive Atrium"
          >
            ←
          </button>
          <div className="inno-district__title-block">
            <p className="inno-district__eyebrow">STUDIO ARCHIVES™ · INNOVATION ECONOMY</p>
            <p className="inno-district__title">Innovation District™</p>
          </div>
          <span className="inno-district__orb-badge">ORB · CURATOR</span>
        </header>

        <div className="inno-district__stats" aria-label="Network summary">
          <div className="inno-district__stat">
            <span className="inno-district__stat-val">{profile.summary.liveCollaborators}</span>
            <span className="inno-district__stat-label">LIVE FOUNDERS</span>
          </div>
          <div className="inno-district__stat">
            <span className="inno-district__stat-val">{profile.jointInnovations.length}</span>
            <span className="inno-district__stat-label">JOINT INNOVATIONS</span>
          </div>
          <div className="inno-district__stat">
            <span className="inno-district__stat-val">{profile.innovationNetworkScore}%</span>
            <span className="inno-district__stat-label">NETWORK SCORE</span>
          </div>
        </div>

        <main className="inno-district__campus">
          <p className="inno-district__section-title">SHARED GENOME™</p>
          {genome ? (
            <div className="inno-district__card">
              <p className="inno-district__card-head">Collaboration Genome™</p>
              <p className="inno-district__card-body">{genome.layerSummary}</p>
              <p className="inno-district__card-body" style={{ marginTop: 6 }}>
                Combined strengths: {genome.combinedStrengths.join(' · ')}
              </p>
            </div>
          ) : null}

          <p className="inno-district__section-title">LIVE PRESENCE</p>
          {profile.liveCollaborators.map((p) => (
            <div key={p.id} className="inno-district__card">
              <p className="inno-district__card-head">{p.role}</p>
              <p className="inno-district__card-body">{p.attributionLabel}</p>
              <div className="inno-district__presence-row">
                <span
                  className={`inno-district__presence-dot${p.status === 'observing' ? ' is-observing' : ''}${p.status === 'idle' ? ' is-idle' : ''}`}
                />
                <span>
                  {p.status === 'active' ? 'Inside' : p.status} {p.currentRoomLabel}
                </span>
              </div>
            </div>
          ))}

          <p className="inno-district__section-title">DISCOVERY™</p>
          {profile.recommendations.map((r) => (
            <div key={r.id} className="inno-district__card">
              <p className="inno-district__card-head">
                {r.founderName} · {r.complementScore}% complement
              </p>
              <p className="inno-district__card-body">{r.headline}</p>
              <p className="inno-district__card-body" style={{ marginTop: 4 }}>
                {r.rationale}
              </p>
            </div>
          ))}

          <p className="inno-district__section-title">JOINT INNOVATIONS™</p>
          {profile.jointInnovations.map((j) => (
            <div key={j.id} className="inno-district__card">
              <p className="inno-district__card-head">
                {j.title} · {j.innovationId}
              </p>
              <p className="inno-district__card-body">
                {j.assetTypeLabel} · {j.published ? j.visibilityLabel : 'Awaiting publication'}
              </p>
              <div className="inno-district__contrib-bar" aria-hidden>
                {j.contributions.map((c, i) => (
                  <div
                    key={c.founderId}
                    className="inno-district__contrib-seg"
                    style={{
                      width: `${c.percentage}%`,
                      background: CONTRIB_COLORS[i % CONTRIB_COLORS.length],
                    }}
                  />
                ))}
              </div>
              <p className="inno-district__contrib-legend">{summarizeContributions(j.contributions)}</p>
            </div>
          ))}
        </main>

        {curatorTicker ? (
          <p className="inno-district__curator" aria-live="polite">
            {curatorTicker}
          </p>
        ) : null}

        {pendingInnovation ? (
          <div className="inno-district__publish-bar" aria-label="Publish innovation">
            <p className="inno-district__publish-prompt">
              This appears to be an original innovation — &ldquo;{pendingInnovation.title}&rdquo;. Would you
              like to publish it?
            </p>
            <div className="inno-district__publish-actions">
              {PUBLICATION_VISIBILITY_OPTIONS.map((v) => (
                <button
                  key={v}
                  type="button"
                  className={`inno-district__publish-btn${v === 'marketplace' ? ' is-primary' : ''}`}
                  disabled={publishing}
                  onClick={() => void publishInnovation(pendingInnovation.id, v)}
                >
                  {PUBLICATION_VISIBILITY_LABELS[v]}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="inno-district__publish-bar">
            <button
              type="button"
              className="inno-district__publish-btn is-primary"
              onClick={focusRecommendations}
            >
              FIND COLLABORATORS
            </button>
          </div>
        )}
      </div>
    </>
  );
}
