import { useMemo } from 'react';
import type { AnalysisTier } from '../../types/hairstyleAnalysis';
import {
  formatManifestSummaryRibbon,
  previewEveryDetailLines,
} from '../../utils/hairstyleAnalysisManifestBuild';
import {
  defaultAdditionalManifests,
  defaultTopMatchManifest,
  MANIFEST_SPEC_CATEGORIES,
  normalizeManifestDraft,
  optionsForManifestField,
  type ManifestLookDraft,
} from '../../utils/hairstyleAnalysisManifestOptions';
import { additionalLooksLimit } from '../../utils/hairstyleAnalysisRules';

type ManifestSpecPickerProps = {
  tier: AnalysisTier;
  topMatch: ManifestLookDraft;
  additionalLooks: ManifestLookDraft[];
  onTopMatchChange: (draft: ManifestLookDraft) => void;
  onAdditionalLookChange: (index: number, draft: ManifestLookDraft) => void;
  onResetDefaults?: () => void;
};

function ManifestLookFields({
  label,
  draft,
  onChange,
}: {
  label: string;
  draft: ManifestLookDraft;
  onChange: (draft: ManifestLookDraft) => void;
}) {
  const normalized = normalizeManifestDraft(draft);

  const updateField = (field: keyof ManifestLookDraft, value: string) => {
    const next = normalizeManifestDraft({ ...normalized, [field]: value });
    onChange(next);
  };

  return (
    <fieldset className="border border-black/15 p-3 flex flex-col gap-3">
      <legend className="px-1 text-[10px] uppercase tracking-[0.14em] text-black font-medium">
        {label}
      </legend>
      <p className="text-[8px] uppercase tracking-[0.1em] text-[#808080] -mt-1">
        {formatManifestSummaryRibbon(normalized)}
      </p>
      <div className="grid grid-cols-1 gap-2">
        {MANIFEST_SPEC_CATEGORIES.map((category) => {
          const options = optionsForManifestField(category.id, normalized);
          const value = normalized[category.id];
          return (
            <label
              key={`${label}-${category.id}`}
              className="flex flex-col gap-1 text-[9px] uppercase tracking-[0.12em] text-[#808080]"
            >
              <span>
                {category.label}
                {category.description ? (
                  <span className="text-[#b0b0b0] normal-case tracking-normal"> — {category.description}</span>
                ) : null}
              </span>
              <select
                value={value}
                onChange={(e) => updateField(category.id, e.target.value)}
                className="border border-black bg-white px-2 py-2 text-black text-[11px] uppercase tracking-[0.08em]"
              >
                {options.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}

export default function ManifestSpecPicker({
  tier,
  topMatch,
  additionalLooks,
  onTopMatchChange,
  onAdditionalLookChange,
  onResetDefaults,
}: ManifestSpecPickerProps) {
  const altLimit = additionalLooksLimit(tier);
  const edmPreview = useMemo(() => previewEveryDetailLines(topMatch), [topMatch]);

  return (
    <section className="border border-black/20 p-3 flex flex-col gap-3">
      <div className="flex flex-col gap-1">
        <h2 className="text-[10px] uppercase tracking-[0.14em] text-black font-medium">
          Manifest test picker
        </h2>
        <p className="text-[8px] uppercase tracking-[0.1em] text-[#808080] leading-relaxed">
          Choose exact TOP MATCH specs by category. Generate sends this manifest verbatim (no diversity
          shuffle). Premium tiers can edit MATCH 02–04 below.
        </p>
      </div>

      <ManifestLookFields label="Top match" draft={topMatch} onChange={onTopMatchChange} />

      <details className="border border-black/10 p-2">
        <summary className="text-[9px] uppercase tracking-[0.12em] text-[#808080] cursor-pointer">
          Every detail matters preview (top match)
        </summary>
        <ol className="mt-2 list-decimal pl-4 space-y-1 text-[8px] uppercase tracking-[0.08em] text-[#404040] leading-relaxed">
          {edmPreview.map((line) => (
            <li key={line}>{line}</li>
          ))}
        </ol>
      </details>

      {altLimit > 0 ? (
        <div className="flex flex-col gap-3">
          {Array.from({ length: altLimit }, (_, i) => {
            const draft = additionalLooks[i] ?? defaultAdditionalManifests()[i] ?? defaultTopMatchManifest();
            return (
              <ManifestLookFields
                key={`match-${i + 2}`}
                label={`Match ${String(i + 2).padStart(2, '0')}`}
                draft={draft}
                onChange={(next) => onAdditionalLookChange(i, next)}
              />
            );
          })}
        </div>
      ) : (
        <p className="text-[8px] uppercase tracking-[0.1em] text-[#808080]">
          Free tier — top match only (no MATCH 02–04).
        </p>
      )}

      {onResetDefaults ? (
        <button
          type="button"
          onClick={onResetDefaults}
          className="border border-black bg-white px-3 py-2 text-[10px] uppercase tracking-[0.12em] text-black self-start"
        >
          Reset manifest defaults
        </button>
      ) : null}
    </section>
  );
}

export { defaultTopMatchManifest, defaultAdditionalManifests };
