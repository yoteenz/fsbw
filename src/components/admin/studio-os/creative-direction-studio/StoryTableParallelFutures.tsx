import type { useCreativeUniversalPipeline } from '../../../../hooks/useCreativeUniversalPipeline';

type UniversalApi = ReturnType<typeof useCreativeUniversalPipeline>;

type Props = {
  universal: UniversalApi;
};

/** Parallel Futures™ + Future Merge™ on Story Table™ — complete Scene Stack concepts. */
export function StoryTableParallelFutures({ universal }: Props) {
  const { pipeline, activeConcept, conceptApproved } = universal;
  const visionConcepts = pipeline.concepts.filter((c) => !c.isMerged || c.id === pipeline.mergeDraftConceptId);

  if (conceptApproved && pipeline.phase !== 'parallel-futures' && pipeline.phase !== 'future-merge') {
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
        {pipeline.mergeLabActive ? 'Future Merge™' : 'Parallel Futures™'}
      </p>
      <div className="cds-story-table__pf-scroll">
        {visionConcepts.slice(0, 6).map((concept) => (
          <button
            key={concept.id}
            type="button"
            className={`cds-story-table__pf-card${activeConcept?.id === concept.id ? ' is-active' : ''}${concept.isMerged ? ' is-merged' : ''}`}
            onClick={() => universal.selectConcept(concept.id)}
          >
            <strong>{concept.tagline}</strong>
            <span>{concept.label}</span>
            <span className="cds-story-table__pf-metrics">
              {concept.analysis.reusePct}% reuse · {concept.analysis.generationCostEstimate}
            </span>
          </button>
        ))}
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
        {!pipeline.mergeLabActive ? (
          <button type="button" className="cds-story-table__pf-btn is-primary" onClick={() => universal.openMergeLab()}>
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
