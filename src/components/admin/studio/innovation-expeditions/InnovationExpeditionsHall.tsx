import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useInnovationExpeditions } from '../../../../hooks/useInnovationExpeditions';
import {
  EXPEDITION_PATH_LABELS,
  EXPEDITION_TYPE_LABELS,
  summarizeCommunityExpeditions,
  summarizeLiveEvents,
  summarizeRewards,
  type ExpeditionPathLevel,
  type ExpeditionType,
} from '../../../../studio-os-core/innovation-expeditions';
import { INNOVATION_EXPEDITIONS_STYLES } from './innovationExpeditionsTheme';

const TYPE_FILTERS: Array<ExpeditionType | 'all'> = [
  'all',
  'industry',
  'innovation',
  'founder',
  'company',
  'blueprint',
];

const PATH_OPTIONS: ExpeditionPathLevel[] = ['beginner', 'founder', 'enterprise', 'creative', 'operations', 'strategy'];

/**
 * Innovation Expeditions™ Hall — guided exploration through Studio World knowledge.
 * Museum tour + university course + documentary + RPG quest — not tutorials.
 */
export function InnovationExpeditionsHall() {
  const navigate = useNavigate();
  const {
    profile,
    guideLines,
    typeFilter,
    setTypeFilter,
    activeExpedition,
    activeStop,
    activeStops,
    filteredExpeditions,
    beginExpedition,
    nextStop,
    changePath,
  } = useInnovationExpeditions();

  const guideTicker = useMemo(
    () => guideLines.map((l) => l.message).join(' · '),
    [guideLines]
  );

  const missions = activeExpedition?.missions ?? [];
  const isComplete =
    activeExpedition != null &&
    profile.completedExpeditionIds.includes(activeExpedition.id);

  return (
    <>
      <style>{INNOVATION_EXPEDITIONS_STYLES}</style>
      <div className="ie-hall" role="application" aria-label="Innovation Expeditions Hall">
        <div className="ie-hall__marble" aria-hidden />

        <header className="ie-hall__hud">
          <button
            type="button"
            className="ie-hall__back"
            onClick={() => navigate('/admin/studio/innovation-constellations')}
            aria-label="Return to Innovation Constellations"
          >
            ←
          </button>
          <div className="ie-hall__title-block">
            <p className="ie-hall__eyebrow">STUDIO ARCHIVES™ · GUIDED KNOWLEDGE NETWORK</p>
            <p className="ie-hall__title">Innovation Expeditions™</p>
          </div>
          <span className="ie-hall__orb-badge">ORB · EXPEDITION GUIDE</span>
        </header>

        <div className="ie-hall__stats" aria-label="Expedition summary">
          <div className="ie-hall__stat">
            <span className="ie-hall__stat-val">{profile.expeditionScore}%</span>
            <span className="ie-hall__stat-label">SCORE</span>
          </div>
          <div className="ie-hall__stat">
            <span className="ie-hall__stat-val">{profile.completedExpeditionIds.length}</span>
            <span className="ie-hall__stat-label">COMPLETE</span>
          </div>
          <div className="ie-hall__stat">
            <span className="ie-hall__stat-val">{profile.unlockedRewards.filter((r) => r.unlocked).length}</span>
            <span className="ie-hall__stat-label">REWARDS</span>
          </div>
        </div>

        <main className="ie-hall__scroll">
          <p className="ie-hall__section-title">EXPEDITION TYPES</p>
          <div className="ie-hall__type-nav" aria-label="Filter by expedition type">
            {TYPE_FILTERS.map((t) => (
              <button
                key={t}
                type="button"
                className={`ie-hall__type-pill${typeFilter === t ? ' is-active' : ''}`}
                onClick={() => setTypeFilter(t)}
              >
                {t === 'all' ? 'ALL' : EXPEDITION_TYPE_LABELS[t].replace('™', '')}
              </button>
            ))}
          </div>

          <p className="ie-hall__section-title">YOUR PATH</p>
          <div className="ie-hall__path-nav" aria-label="Expedition path level">
            {PATH_OPTIONS.map((p) => (
              <button
                key={p}
                type="button"
                className={`ie-hall__path-pill${profile.activePathLevel === p ? ' is-active' : ''}`}
                onClick={() => changePath(p)}
              >
                {EXPEDITION_PATH_LABELS[p]}
              </button>
            ))}
          </div>

          <p className="ie-hall__section-title">CHOOSE EXPEDITION</p>
          {filteredExpeditions.map((exp) => (
            <button
              key={exp.id}
              type="button"
              className={`ie-hall__card${activeExpedition?.id === exp.id ? ' is-active' : ''}`}
              onClick={() => beginExpedition(exp.id)}
            >
              <p className="ie-hall__card-title">{exp.title}</p>
              <p className="ie-hall__card-meta">
                {EXPEDITION_TYPE_LABELS[exp.type]} · {exp.stopCount} stops · {exp.durationMinutes} min ·{' '}
                {exp.principleSummary}
              </p>
            </button>
          ))}

          {activeExpedition && activeStop ? (
            <div className="ie-hall__tour" aria-label="Active guided tour">
              <p className="ie-hall__section-title">GUIDED TOUR — STOP {profile.activeStopIndex + 1} OF {activeStops.length}</p>
              <div className="ie-hall__progress" aria-hidden>
                {activeStops.map((s, i) => (
                  <div
                    key={s.id}
                    className={`ie-hall__progress-dot${i < profile.activeStopIndex ? ' is-done' : ''}${i === profile.activeStopIndex ? ' is-current' : ''}`}
                  />
                ))}
              </div>
              <p className="ie-hall__stop-title">{activeStop.title}</p>
              <p className="ie-hall__stop-location">{activeStop.locationLabel}</p>
              <p className="ie-hall__stop-story">{activeStop.storyBeat}</p>
              <p className="ie-hall__stop-story" style={{ marginTop: 6 }}>
                Principle: {activeStop.principle}
              </p>

              {missions.length > 0 ? (
                <>
                  <p className="ie-hall__section-title" style={{ marginTop: 8 }}>
                    INTERACTIVE MISSIONS
                  </p>
                  {missions.map((m) => (
                    <p key={m.id} className="ie-hall__mission">
                      {m.title} — {m.challenge} {m.optional ? '(optional)' : '(required)'}
                    </p>
                  ))}
                </>
              ) : null}

              {isComplete ? (
                <p className="ie-hall__stop-story" style={{ marginTop: 8, color: '#e8c878' }}>
                  Expedition complete — rewards unlocked.
                </p>
              ) : null}
            </div>
          ) : null}

          <p className="ie-hall__section-title">COMMUNITY EXPEDITIONS™</p>
          <p className="ie-hall__card-meta" style={{ marginBottom: 6 }}>
            {summarizeCommunityExpeditions(profile.communityExpeditions)}
          </p>
          {profile.communityExpeditions.map((c) => (
            <p key={c.id} className="ie-hall__event">
              {c.title} by {c.authorName} · ★ {c.rating}
              {c.marketplaceListed ? ' · Marketplace' : ''}
            </p>
          ))}

          <p className="ie-hall__section-title">LIVE EVENTS</p>
          <p className="ie-hall__card-meta" style={{ marginBottom: 6 }}>
            {summarizeLiveEvents(profile.liveEvents)}
          </p>
          {profile.liveEvents.slice(0, 3).map((e) => (
            <p key={e.id} className="ie-hall__event">
              {e.title} · {e.host} · {e.seatsRemaining} seats
            </p>
          ))}

          <p className="ie-hall__section-title">REWARDS</p>
          <p className="ie-hall__card-meta">{summarizeRewards(profile.unlockedRewards)}</p>
        </main>

        <div className="ie-hall__guide" aria-live="polite">
          <p className="ie-hall__guide-text">{guideTicker}</p>
          <div className="ie-hall__actions">
            {activeStop ? (
              <button
                type="button"
                className="ie-hall__action-btn"
                onClick={() => navigate(activeStop.routePath)}
              >
                ENTER {activeStop.locationLabel}
              </button>
            ) : null}
            <button
              type="button"
              className="ie-hall__action-btn"
              onClick={nextStop}
              disabled={!activeExpedition || isComplete}
            >
              {isComplete ? 'EXPEDITION COMPLETE' : 'NEXT STOP →'}
            </button>
            <button
              type="button"
              className="ie-hall__action-btn"
              onClick={() => navigate('/admin/studio/world-atlas')}
            >
              ATLAS JOURNEY
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
