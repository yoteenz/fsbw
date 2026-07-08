import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdminStudioMuseum } from '../../../../hooks/useAdminStudioMuseumState';
import { LEGACY_WALL_KIND_META } from '../../../../studio-os-core/studio-museum';
import { STUDIO_MUSEUM_SUBTITLE } from '../../../../utils/adminStudioMuseumDemo';
import { adminStudioWarehousePath } from '../../../../utils/adminStudioRoutes';
import { MUSEUM_STYLES, smSectionTitle } from './museumTheme';

const VIEW_TABS = [
  { id: 'exhibits' as const, label: 'EXHIBITS' },
  { id: 'time-machine' as const, label: 'TIME MACHINE™' },
  { id: 'legacy-wall' as const, label: 'LEGACY WALL™' },
  { id: 'memory-sphere' as const, label: 'MEMORY SPHERE™' },
  { id: 'replay' as const, label: 'IMMERSIVE REPLAY™' },
  { id: 'marketplace-history' as const, label: 'MARKETPLACE HISTORY™' },
];

export function MuseumWorkspace() {
  const navigate = useNavigate();
  const museum = useAdminStudioMuseum();
  const exhibit = museum.selectedExhibit;

  useEffect(() => {
    if (!museum.replayPlaying || !exhibit?.replaySteps.length) return;
    const step = exhibit.replaySteps[museum.replayStepIndex];
    if (!step) return;
    const timer = window.setTimeout(() => museum.advanceReplay(), step.durationSec * 120);
    return () => window.clearTimeout(timer);
  }, [exhibit, museum.advanceReplay, museum.replayPlaying, museum.replayStepIndex]);

  return (
    <div className="sm-root">
      <style>{MUSEUM_STYLES}</style>

      <header className="sm-hero">
        <p className="sm-hero__title">Studio Museum™</p>
        <p className="sm-hero__sub">{STUDIO_MUSEUM_SUBTITLE}</p>
        <p className="sm-hero__sub" style={{ marginTop: 6, opacity: 0.45 }}>
          {museum.snapshot.totalExhibits} exhibits · {museum.snapshot.totalLegacyFrames} legacy frames · $
          {(museum.snapshot.totalRevenueImpactUsd / 1_000_000).toFixed(1)}M preserved impact
        </p>
        <div className="sm-tabs">
          {VIEW_TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              className={`sm-tab${museum.viewMode === tab.id ? ' is-active' : ''}`}
              onClick={() => {
                museum.setViewMode(tab.id);
                if (tab.id === 'memory-sphere') museum.setHistorianContext('idle');
                if (tab.id === 'marketplace-history') museum.setHistorianContext('marketplace');
              }}
            >
              {tab.label}
            </button>
          ))}
          <button type="button" className="sm-tab" onClick={() => navigate(adminStudioWarehousePath())}>
            STUDIO WAREHOUSE™ →
          </button>
        </div>
      </header>

      <div className="sm-layout">
        <div>
          {(museum.viewMode === 'exhibits' || museum.viewMode === 'time-machine' || museum.viewMode === 'replay' || museum.viewMode === 'marketplace-history') && (
            <>
              <nav className="sm-exhibit-list" aria-label="Museum exhibits">
                {museum.exhibits.map((ex) => (
                  <button
                    key={ex.id}
                    type="button"
                    className={`sm-exhibit-btn${museum.selectedExhibitId === ex.id ? ' is-active' : ''}`}
                    onClick={() => museum.selectExhibit(ex.id)}
                  >
                    <p className="sm-exhibit-btn__title">
                      {ex.title}
                      {museum.isFavorite(ex.id) ? ' ★' : ''}
                      {!museum.isVisited(ex.id) ? ' · NEW' : ''}
                    </p>
                    <p className="sm-exhibit-btn__sub">
                      {ex.subtitle} · {ex.launchDate}
                    </p>
                  </button>
                ))}
              </nav>

              {exhibit ? (
                <>
                  <div className="sm-hero-env">
                    <div className="sm-hero-env__plate" style={{ background: exhibit.heroGradient }} aria-hidden />
                    <div className="sm-hero-env__label">
                      <strong>{exhibit.title}</strong> — {exhibit.heroEnvironment}
                      <br />
                      Walk inside · View original rooms · Experience the launch exactly as it happened
                    </div>
                  </div>

                  <div className="sm-rooms">
                    {exhibit.rooms.map((room) => (
                      <span key={room} className="sm-room-chip">
                        {room}
                      </span>
                    ))}
                  </div>
                </>
              ) : null}
            </>
          )}

          {museum.viewMode === 'legacy-wall' && (
            <section>
              <p style={smSectionTitle}>The Legacy Wall™ — monumental hallway of milestones</p>
              <div className="sm-legacy-hall">
                {museum.legacyWall.map((item) => {
                  const meta = LEGACY_WALL_KIND_META[item.kind] ?? { icon: item.icon, frameClass: '' };
                  return (
                    <button
                      key={item.id}
                      type="button"
                      className={`sm-legacy-frame ${meta.frameClass}`}
                      onClick={() => item.exhibitId && museum.selectExhibit(item.exhibitId)}
                    >
                      <span className="sm-legacy-frame__icon">{meta.icon}</span>
                      <p className="sm-legacy-frame__title">{item.title}</p>
                      <p className="sm-legacy-frame__caption">
                        {item.date} — {item.caption}
                      </p>
                    </button>
                  );
                })}
              </div>
            </section>
          )}

          {museum.viewMode === 'time-machine' && exhibit && exhibit.timeline.length > 0 && (
            <section className="sm-panel">
              <p style={smSectionTitle}>Time Machine™ — {exhibit.company}</p>
              <div className="sm-timeline">
                {exhibit.timeline.map((node, i) => (
                  <span key={node.id} style={{ display: 'contents' }}>
                    {i > 0 ? <span className="sm-timeline__arrow">↓</span> : null}
                    <button
                      type="button"
                      className={`sm-timeline__node${museum.timelineIndex === i ? ' is-active' : ''}`}
                      onClick={() => museum.scrubTimeline(i)}
                    >
                      {node.label}
                    </button>
                  </span>
                ))}
              </div>
              <input
                type="range"
                className="sm-timeline-scrub"
                min={0}
                max={Math.max(0, exhibit.timeline.length - 1)}
                value={museum.timelineIndex}
                onChange={(e) => museum.scrubTimeline(Number(e.target.value))}
                aria-label="Timeline scrubber"
              />
              {museum.activeTimelineNode ? (
                <div style={{ marginTop: 8 }}>
                  <p style={{ fontSize: 6, color: '#9b7bb8', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                    {museum.activeTimelineNode.era} · {museum.activeTimelineNode.date}
                  </p>
                  <p className="sm-bullet">{museum.activeTimelineNode.summary}</p>
                </div>
              ) : null}
            </section>
          )}

          {museum.viewMode === 'replay' && exhibit && exhibit.replaySteps.length > 0 && (
            <section className="sm-panel">
              <p style={smSectionTitle}>Immersive Replay™ — relive creation</p>
              <div className="sm-replay-track">
                {exhibit.replaySteps.map((step, i) => (
                  <span
                    key={step.id}
                    className={`sm-replay-step${museum.replayStepIndex === i ? ' is-active' : ''}${i < museum.replayStepIndex ? ' is-done' : ''}`}
                  >
                    {step.label}
                  </span>
                ))}
              </div>
              <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                <button type="button" className="sm-action" onClick={museum.startReplay}>
                  {museum.replayPlaying ? 'Replaying…' : 'Start Replay™'}
                </button>
                <button type="button" className="sm-action" onClick={() => museum.setReplayPlaying(false)}>
                  Pause
                </button>
                <button type="button" className="sm-action" onClick={museum.advanceReplay}>
                  Step →
                </button>
              </div>
            </section>
          )}

          {museum.viewMode === 'marketplace-history' && exhibit?.marketplace && (
            <section className="sm-panel">
              <p style={smSectionTitle}>Marketplace History™</p>
              <div className="sm-meta-row">
                <span>Downloads</span>
                <span>{exhibit.marketplace.downloads.toLocaleString()}</span>
              </div>
              <div className="sm-meta-row">
                <span>Revenue</span>
                <span>${exhibit.marketplace.revenueUsd.toLocaleString()}</span>
              </div>
              <div className="sm-meta-row">
                <span>Creator</span>
                <span>{exhibit.marketplace.creator}</span>
              </div>
              <div className="sm-meta-row">
                <span>Forks</span>
                <span>{exhibit.marketplace.forks}</span>
              </div>
              <div className="sm-meta-row">
                <span>Companies Using</span>
                <span>{exhibit.marketplace.companiesUsing}</span>
              </div>
              <div className="sm-meta-row">
                <span>Community Rating</span>
                <span>{exhibit.marketplace.communityRating} / 5</span>
              </div>
              <p style={{ ...smSectionTitle, marginTop: 10 }}>Evolution Tree</p>
              {exhibit.marketplace.evolutionBranches.map((b) => (
                <p key={b} className="sm-bullet">
                  ↳ {b}
                </p>
              ))}
            </section>
          )}

          {exhibit && (museum.viewMode === 'exhibits' || museum.viewMode === 'memory-sphere') && (
            <section className="sm-panel">
              <p style={smSectionTitle}>Exhibit Archive — preserved forever</p>
              <div className="sm-meta-row">
                <span>Launch Date</span>
                <span>{exhibit.launchDate}</span>
              </div>
              <div className="sm-meta-row">
                <span>Generation Cost</span>
                <span>${exhibit.generationCostUsd.toFixed(2)}</span>
              </div>
              <div className="sm-meta-row">
                <span>Revenue Impact</span>
                <span>${exhibit.revenueImpactUsd.toLocaleString()}</span>
              </div>
              <div className="sm-meta-row">
                <span>Runtime Sessions</span>
                <span>{exhibit.runtimeStats.sessions.toLocaleString()}</span>
              </div>
              <div className="sm-meta-row">
                <span>Reusable Assets</span>
                <span>{exhibit.runtimeStats.reuseAssets}</span>
              </div>
              <div className="sm-meta-row">
                <span>Iterations</span>
                <span>{exhibit.iterationCount}</span>
              </div>
              <p style={{ ...smSectionTitle, marginTop: 8 }}>Scene Recipe™</p>
              {exhibit.sceneRecipe.map((line) => (
                <p key={line.role} className="sm-bullet">
                  {line.role}: {line.assetName} {line.version}
                </p>
              ))}
              <p style={{ ...smSectionTitle, marginTop: 8 }}>Asset Recipe™</p>
              {exhibit.assetRecipe.map((line) => (
                <p key={line.category} className="sm-bullet">
                  {line.category}: {line.count} ({line.reusableCount} reusable)
                </p>
              ))}
              <p style={{ ...smSectionTitle, marginTop: 8 }}>Creative Decisions™</p>
              {exhibit.creativeDecisions.map((d) => (
                <p key={d} className="sm-bullet">
                  {d}
                </p>
              ))}
              <p style={{ ...smSectionTitle, marginTop: 8 }}>Founder Notes™</p>
              {exhibit.founderNotes.map((n) => (
                <p key={n} className="sm-bullet" style={{ fontStyle: 'italic' }}>
                  "{n}"
                </p>
              ))}
              <p style={{ ...smSectionTitle, marginTop: 8 }}>Approval History™</p>
              {exhibit.approvalHistory.map((h) => (
                <p key={h} className="sm-bullet">
                  {h}
                </p>
              ))}
              <p style={{ ...smSectionTitle, marginTop: 8 }}>Company Genome™</p>
              <p className="sm-bullet">{exhibit.companyGenomeSnapshot}</p>
              <div style={{ marginTop: 8, display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                <button
                  type="button"
                  className="sm-action"
                  onClick={() => exhibit && museum.toggleFavorite(exhibit.id)}
                >
                  {museum.isFavorite(exhibit.id) ? 'Unfavorite' : 'Favorite Exhibit'}
                </button>
                <button type="button" className="sm-action" onClick={museum.startReplay}>
                  Replay Creation™
                </button>
              </div>
            </section>
          )}
        </div>

        <aside className="sm-orb-host">
          <p style={smSectionTitle}>Memory Sphere™</p>
          <div className="sm-orb-sphere" aria-hidden />
          <p className="sm-orb-speech">{museum.historianQuote}</p>
          <p style={{ fontSize: 4, opacity: 0.45, marginTop: 10, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
            Museum Orb · Company Historian
          </p>
          {exhibit ? (
            <button
              type="button"
              className="sm-action"
              style={{ marginTop: 10 }}
              onClick={() => museum.setHistorianContext('marketplace')}
            >
              Tell Marketplace Story
            </button>
          ) : null}
        </aside>
      </div>
    </div>
  );
}
