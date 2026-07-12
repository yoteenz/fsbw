import type { AssetCandidateRecord } from '../../../../studio-os-core/scene-stack/verified-asset-production/contract';

type Props = {
  evidence: AssetCandidateRecord | null;
  compileRunId?: string | null;
  modelRoute?: string | null;
  brandReferenceUrl?: string | null;
};

export function VerifiedAssetProductionEvidencePanel({
  evidence,
  compileRunId,
  modelRoute,
  brandReferenceUrl,
}: Props) {
  if (!evidence) return null;

  const exportJson = () => {
    const payload = {
      compileRunId: compileRunId ?? null,
      modelRoute: modelRoute ?? evidence.routeId ?? null,
      brandReferenceUrl: brandReferenceUrl ?? evidence.brandReferenceUrls?.[0] ?? null,
      evidence,
    };
    void navigator.clipboard?.writeText(JSON.stringify(payload, null, 2));
  };

  const materialVerdict = evidence.materialFidelity?.finalMaterialVerdict;
  const genericWarning =
    materialVerdict === 'generic-material-substitution' ||
    materialVerdict === 'wrong-brand-material';

  return (
    <div className="cds-verified-asset-evidence" data-testid="verified-asset-evidence-panel">
      <header className="cds-verified-asset-evidence__header">
        <strong>Verified Asset Production Evidence</strong>
        <button type="button" className="cds-verified-asset-evidence__copy" onClick={exportJson}>
          Copy evidence
        </button>
      </header>
      <dl className="cds-verified-asset-evidence__grid">
        <div>
          <dt>Organization</dt>
          <dd>{evidence.organizationId}</dd>
        </div>
        <div>
          <dt>Model route</dt>
          <dd>{evidence.routeId ?? modelRoute ?? '—'}</dd>
        </div>
        <div>
          <dt>Provider model</dt>
          <dd>{evidence.providerModel ?? '—'}</dd>
        </div>
        <div>
          <dt>Resolution</dt>
          <dd>
            {evidence.resolutionTruth
              ? `${evidence.resolutionTruth.requestedResolution} → ${evidence.resolutionTruth.outputResolution} (${evidence.resolutionTruth.truthState})`
              : '—'}
          </dd>
        </div>
        <div>
          <dt>Requested asset</dt>
          <dd>{evidence.requestedAssetDescription}</dd>
        </div>
        <div>
          <dt>Identity</dt>
          <dd>
            {evidence.identityMatch ? 'match' : 'reject'} ({Math.round(evidence.identityConfidence * 100)}%)
          </dd>
        </div>
        <div>
          <dt>Material verdict</dt>
          <dd>{materialVerdict ?? '—'}</dd>
        </div>
        <div>
          <dt>Detected classes</dt>
          <dd>{evidence.detectedObjectClasses.join(', ') || '—'}</dd>
        </div>
        <div>
          <dt>Structure</dt>
          <dd>{evidence.structuralClassification}</dd>
        </div>
        <div>
          <dt>Background</dt>
          <dd>{evidence.backgroundClassification}</dd>
        </div>
        <div>
          <dt>Postprocess</dt>
          <dd>{evidence.postprocessClassification}</dd>
        </div>
        <div>
          <dt>Approval</dt>
          <dd>{evidence.approvalStatus}</dd>
        </div>
        <div>
          <dt>Registry</dt>
          <dd>{evidence.registryState}</dd>
        </div>
        <div>
          <dt>Shell similarity</dt>
          <dd>{evidence.shellSimilarity ?? 'n/a'}</dd>
        </div>
        <div>
          <dt>Stage</dt>
          <dd>{evidence.productionStage}</dd>
        </div>
      </dl>
      {genericWarning ? (
        <p className="cds-verified-asset-evidence__warning" data-testid="generic-substitution-warning">
          Generic material substitution detected — candidate cannot approve.
        </p>
      ) : null}
      <div className="cds-verified-asset-evidence__previews">
        {brandReferenceUrl ?? evidence.brandReferenceUrls?.[0] ? (
          <a
            href={brandReferenceUrl ?? evidence.brandReferenceUrls?.[0]}
            target="_blank"
            rel="noreferrer"
          >
            Open brand reference
          </a>
        ) : null}
        {evidence.sourceUrl ? (
          <a href={evidence.sourceUrl} target="_blank" rel="noreferrer">
            Open candidate
          </a>
        ) : null}
        {evidence.cleanedAssetUrl ? (
          <a href={evidence.cleanedAssetUrl} target="_blank" rel="noreferrer">
            Open cleaned asset
          </a>
        ) : null}
        {brandReferenceUrl && evidence.sourceUrl ? (
          <span>Compare material</span>
        ) : null}
      </div>
      {evidence.approvalReason || evidence.safeExplanation ? (
        <p className="cds-verified-asset-evidence__note">
          {evidence.approvalReason || evidence.safeExplanation}
        </p>
      ) : null}
    </div>
  );
}
