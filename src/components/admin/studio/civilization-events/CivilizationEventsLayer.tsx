import type { CivilizationEventsSnapshot } from '../../../../studio-os-core/civilization-events';

type Props = {
  events: CivilizationEventsSnapshot;
  compact?: boolean;
};

/**
 * Civilization Events™ — world-scale events that permanently evolve Studio World.
 */
export function CivilizationEventsLayer({ events, compact = false }: Props) {
  const primaryEvent = events.activeEvents[0];
  const grand = events.grandChallenge;
  const competingTeam = events.crossDisciplineTeams.find((t) => t.status === 'competing');

  return (
    <div className="sw-events-layer" aria-label="Civilization Events">
      {primaryEvent ? (
        <div className="sw-events-layer__banner" role="status">
          <p className="sw-events-layer__banner-label">Civilization Event™ · Active</p>
          <p className="sw-events-layer__banner-title">
            {primaryEvent.title} — {primaryEvent.subtitle}
          </p>
        </div>
      ) : null}

      {!compact && grand ? (
        <article className="sw-events-layer__grand" aria-label="Grand Challenge">
          <p className="sw-events-layer__grand-label">The Grand Challenge™ {grand.year}</p>
          <p className="sw-events-layer__grand-theme">{grand.theme}</p>
          <p className="sw-events-layer__grand-progress">
            Community progress {grand.communityProgressPct}% · {grand.permanentImpact}
          </p>
        </article>
      ) : null}

      {!compact ? (
        <div className="sw-events-layer__discoveries" aria-label="Civilization Discoveries">
          <p className="sw-events-layer__discoveries-title">
            Civilization Discoveries™ · {events.unlockedDiscoveries.length} unlocked
          </p>
          {events.discoveries.slice(0, 4).map((d) => {
            const unlocked = events.unlockedDiscoveries.some((u) => u.id === d.id);
            return (
              <span
                key={d.id}
                className={`sw-events-layer__discovery-item${unlocked ? '' : ' is-locked'}`}
              >
                {unlocked ? '★ ' : '○ '}
                {d.title}
              </span>
            );
          })}
        </div>
      ) : null}

      {!compact && competingTeam ? (
        <article className="sw-events-layer__collab" aria-label="Cross-discipline team">
          <p className="sw-events-layer__collab-label">Cross-Discipline Championship™ · 2× collaboration weight</p>
          <p className="sw-events-layer__collab-team">
            {competingTeam.label}: {competingTeam.innovationTitle}
          </p>
        </article>
      ) : null}
    </div>
  );
}
