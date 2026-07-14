import type { DesignVariantRecord } from './experience-lab-design-variants';
import { resolveVariantCardBadge } from './experience-lab-design-variants';
import type { EnvironmentPackageDrawerModel } from '../../../studio-os-core/environment-asset-package';

type Props = {
  variant: DesignVariantRecord;
  packageModel?: EnvironmentPackageDrawerModel | null;
  isActive: boolean;
  onActivate: () => void;
  onArchive: () => void;
  onClose: () => void;
};

/** Variant metadata drawer — reuses Experience Lab sheet styling. */
export function ExperienceLabDesignVariantDrawerBody({
  variant,
  packageModel,
  isActive,
  onActivate,
  onArchive,
  onClose,
}: Props) {
  const badge = resolveVariantCardBadge(variant, isActive);

  return (
    <div className="elab-design-variant-drawer">
      <dl className="elab-sheet-dl">
        <div><dt>Variant</dt><dd>{variant.name}</dd></div>
        <div><dt>Package ID</dt><dd>{variant.environmentPackageId}</dd></div>
        {packageModel ? (
          <>
            <div><dt>Package status</dt><dd>{packageModel.packageStatus.toUpperCase()}</dd></div>
            <div><dt>Outputs generated</dt><dd>{packageModel.outputsGenerated}</dd></div>
            <div><dt>Outputs pending</dt><dd>{packageModel.outputsPending}</dd></div>
            <div><dt>Asset count</dt><dd>{packageModel.assetCount}</dd></div>
            <div><dt>Generation cost</dt><dd>${packageModel.generationCostUsd.toFixed(2)}</dd></div>
          </>
        ) : null}
        <div><dt>Theme</dt><dd>{variant.theme.toUpperCase()}</dd></div>
        <div><dt>Revision</dt><dd>r{packageModel?.revision ?? variant.promptRevision}</dd></div>
        <div><dt>Prompt version</dt><dd>{packageModel?.promptVersion ?? variant.promptHash}</dd></div>
        <div><dt>Estimated cost</dt><dd>${variant.estimatedCostUsd.toFixed(2)}</dd></div>
        <div><dt>Provider</dt><dd>{packageModel?.provider ?? variant.generationProvider}</dd></div>
        <div><dt>Seed</dt><dd>{packageModel?.seed ?? variant.seed}</dd></div>
        <div><dt>Generated</dt><dd>{new Date(variant.generatedAt).toLocaleString()}</dd></div>
        <div><dt>Status</dt><dd>{badge ?? variant.canonicalStatus.toUpperCase()}</dd></div>
        <div><dt>Stage</dt><dd>{variant.generationStage.toUpperCase()}</dd></div>
        <div><dt>Vault</dt><dd>{variant.vaultStatus.toUpperCase()}</dd></div>
      </dl>

      <div className="elab-design-variant-drawer__actions">
        {!isActive ? (
          <button type="button" className="elab-sheet-tool-btn" onClick={onActivate}>
            Set Active
          </button>
        ) : (
          <button type="button" className="elab-sheet-tool-btn" disabled>
            Active Variant
          </button>
        )}
        <button type="button" className="elab-sheet-tool-btn" onClick={onArchive}>
          Archive
        </button>
        <button type="button" className="elab-sheet-tool-btn" disabled title="Stage 2 — after founder selection">
          Promote to Canonical
        </button>
        <button type="button" className="elab-sheet-tool-btn" disabled title="Reserved for compare mode">
          Compare
        </button>
        <button type="button" className="elab-sheet-tool-btn" onClick={onClose}>
          Close
        </button>
      </div>
      <p className="elab-sheet-hint">
        Stage 1 preview concepts only. Production render, blueprint, and construction unlock after founder selects one canonical direction.
      </p>
    </div>
  );
}
