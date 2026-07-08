import type { useCreativeUniversalPipeline } from '../../../../hooks/useCreativeUniversalPipeline';

type UniversalApi = ReturnType<typeof useCreativeUniversalPipeline>;

type Props = {
  universal: UniversalApi;
};

/** Parallel Futures™ + Future Tournament™ on Story Table™. */
export function StoryTableParallelFutures({ universal }: Props) {
  const { pipeline, activeConcept, conceptApproved, finalistConcepts, finalistScores } = universal;
  const tournament = pipeline.tournamentResult;
  const displayConcepts = tournament
    ? finalistConcepts
    : pipeline.concepts.filter((c) => !c.isMerged || c.id === pipeline.mergeDraftConceptId);

  if (conceptApproved && pipeline.phase !== 'parallel-futures' && pipeline.phase !== 'future-merge' && pipeline.phase !== 'future-tournament') {
    return (
      <div className="cds-story-table__pf cds-story-table__pf--approved">
        <p className="cds-story-table__pf-kicker">Concept Approval™</p>
        <p className="cds-story-table__pf-title">{universal.approvedConcept?.tagline}</p>
        <p className="cds-story-table__pf-sub">{universal.phaseLabel}</p>
        {pipeline.deconstructionLayers.length > 0 ? (
          <p className="cds-story-table__pf-meta">
            {universal.deconstructionSummaryLines(pipeline.deconstructionLayers).join(' · ')}
          </p>
        ) : null}
      </div>
    );
  }

  return (
    <div className="cds-story-table__pf" role="region" aria-label="Parallel Futures concepts">
      <p className="cds-story-table__pf-kicker">
        {pipeline.mergeLabActive ? 'Future Merge™' : tournament ? 'Future Tournament™ · Finalists' : 'Parallel Futures™'}
      </p>

      {tournament ? (
        <p className="cds-story-table__pf-meta">
          {tournament.rounds.length} rounds · {tournament.eliminatedIds.length} eliminated ·{' '}
          {tournament.championship.recommendMerge ? 'Chairman recommends merge' : 'Finalists ready'}
        </p>
      ) : null}

      <div className="cds-story-table__pf-scroll">
        {displayConcepts.slice(0, 6).map((concept) => {
          const score = finalistScores.find((s) => s.conceptId === concept.id)?.score;
          return (
            <button
              key={concept.id}
              type="button"
              className={`cds-story-table__pf-card${activeConcept?.id === concept.id ? ' is-active' : ''}${concept.isMerged ? ' is-merged' : ''}${tournament?.eliminatedIds.includes(concept.id) ? ' is-eliminated' : ''}`}
              onClick={() => universal.selectConcept(concept.id)}
              disabled={tournament?.eliminatedIds.includes(concept.id)}
            >
              <strong>{concept.tagline}</strong>
              <span>{concept.label}</span>
              <span className="cds-story-table__pf-metrics">
                {score != null ? `Score ${score} · ` : ''}
                {concept.analysis.reusePct}% reuse · {concept.analysis.generationCostEstimate}
              </span>
            </button>
          );
        })}
      </div>

      {pipeline.mergeLabActive && pipeline.activeMergeRecipe ? (
        <div className="cds-story-table__pf-merge">
          {pipeline.activeMergeRecipe.ingredients.map((ing) => (
            <p key={`${ing.kind}-${ing.sourceConceptId}`}>
              {ing.label} ← {ing.sourceConceptLabel}
            </p>
          ))}
        </div>
      ) : null}

      <div className="cds-story-table__pf-actions">
        {!tournament ? (
          <button type="button" className="cds-story-table__pf-btn is-primary" onClick={() => universal.runTournament()}>
            RUN TOURNAMENT™
          </button>
        ) : (
          <button type="button" className="cds-story-table__pf-btn is-primary" onClick={() => universal.openReviewChamber()}>
            REVIEW CHAMBER™
          </button>
        )}
        {!pipeline.mergeLabActive ? (
          <button type="button" className="cds-story-table__pf-btn" onClick={() => universal.openMergeLab()}>
            MERGE CONCEPTS™
          </button>
        ) : (
          <>
            <button type="button" className="cds-story-table__pf-btn is-primary" onClick={() => universal.mergeConcepts()}>
              MERGE FUTURES™
            </button>
            <button type="button" className="cds-story-table__pf-btn" onClick={() => universal.closeMergeLab()}>
              EXIT MERGE
            </button>
          </>
        )}
        {activeConcept ? (
          <button
            type="button"
            className="cds-story-table__pf-btn"
            onClick={() => universal.approveConcept(activeConcept.id)}
            disabled={conceptApproved}
          >
            {conceptApproved ? 'APPROVED' : 'APPROVE CONCEPT™'}
          </button>
        ) : null}
      </div>
    </div>
  );
}
