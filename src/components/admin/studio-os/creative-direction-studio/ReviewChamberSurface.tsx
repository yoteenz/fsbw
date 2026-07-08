import type { useCreativeUniversalPipeline } from '../../../../hooks/useCreativeUniversalPipeline';

type UniversalApi = ReturnType<typeof useCreativeUniversalPipeline>;

type Props = {
  universal: UniversalApi;
};

/** Review Chamber™ — executive presentation room for tournament finalists. */
export function ReviewChamberSurface({ universal }: Props) {
  const { pipeline, activeConcept, finalistConcepts, chairmanLines } = universal;
  const tournament = pipeline.tournamentResult;
  const championship = tournament?.championship;

  if (!tournament) {
    return (
      <div className="cds-review-chamber" role="region" aria-label="Review Chamber">
        <p className="cds-review-chamber__kicker">Review Chamber™</p>
        <p className="cds-review-chamber__title">Run Future Tournament™ first</p>
        <button type="button" className="cds-review-chamber__btn is-primary" onClick={() => universal.runTournament()}>
          RUN TOURNAMENT™
        </button>
      </div>
    );
  }

  return (
    <div className="cds-review-chamber" role="region" aria-label="Review Chamber executive presentation">
      <p className="cds-review-chamber__kicker">Review Chamber™ · Chairman of the Review Board</p>
      <p className="cds-review-chamber__title">{championship?.chairmanSummary}</p>

      <div className="cds-review-chamber__holo-row">
        {finalistConcepts.map((concept, i) => (
          <article
            key={concept.id}
            className={`cds-review-chamber__holo${activeConcept?.id === concept.id ? ' is-active' : ''}`}
            style={{ '--holo-rot': `${(i - 0.5) * 6}deg` } as React.CSSProperties}
          >
            <div className="cds-review-chamber__holo-glow" aria-hidden />
            <p className="cds-review-chamber__holo-tag">{concept.tagline}</p>
            <p className="cds-review-chamber__holo-label">{concept.label}</p>
            <p className="cds-review-chamber__holo-mood">{concept.mood}</p>
            <p className="cds-review-chamber__holo-detail">{concept.environment}</p>
            <p className="cds-review-chamber__holo-detail">{concept.lighting}</p>
            <button
              type="button"
              className="cds-review-chamber__btn"
              onClick={() => universal.selectConcept(concept.id)}
            >
              INSPECT
            </button>
            <button
              type="button"
              className="cds-review-chamber__btn is-primary"
              onClick={() => universal.approveConcept(concept.id)}
            >
              APPROVE CONCEPT™
            </button>
          </article>
        ))}
      </div>

      {championship?.recommendMerge ? (
        <div className="cds-review-chamber__championship is-merge">
          <p className="cds-review-chamber__champ-title">Championship — Recommend Future Merge™</p>
          <p>{championship.mergeRationale}</p>
          <p>Creative Equity boost ~{championship.mergeEquityBoostPct}%</p>
          <div className="cds-review-chamber__actions">
            <button type="button" className="cds-review-chamber__btn is-primary" onClick={() => universal.acceptChairmanRecommendation()}>
              ACCEPT CHAIRMAN RECOMMENDATION™
            </button>
            <button type="button" className="cds-review-chamber__btn" onClick={() => universal.rejectChairmanRecommendation()}>
              FOUNDER OVERRIDE
            </button>
          </div>
        </div>
      ) : championship?.clearWinnerId ? (
        <div className="cds-review-chamber__championship">
          <p className="cds-review-chamber__champ-title">Championship — Clear leader</p>
          <p>{championship.mergeRationale}</p>
        </div>
      ) : null}

      <div className="cds-review-chamber__bracket">
        <p className="cds-review-chamber__bracket-title">Head-to-head rounds</p>
        {tournament.rounds.slice(-3).map((round) => (
          <div key={round.id} className="cds-review-chamber__round">
            {universal.formatHeadToHeadReplay(round).map((line) => (
              <span key={line}>{line}<br /></span>
            ))}
          </div>
        ))}
      </div>

      <div className="cds-review-chamber__orb-panel">
        {chairmanLines.slice(0, 3).map((line) => (
          <p key={line.id} className="cds-review-chamber__orb-line">
            {line.message}
          </p>
        ))}
      </div>
    </div>
  );
}
