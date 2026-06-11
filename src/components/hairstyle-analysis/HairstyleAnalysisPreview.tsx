import { useMemo, useRef, useState } from 'react';
import type { AnalysisTier, HairstyleAnalysis } from '../../types/hairstyleAnalysis';
import { validateHairstyleAnalysis } from '../../utils/hairstyleAnalysisRules';
import DownloadAnalysisButton from './DownloadAnalysisButton';
import HairstyleAnalysisCard from './HairstyleAnalysisCard';

type HairstyleAnalysisPreviewProps = {
  analysis: HairstyleAnalysis;
  tierOptions?: AnalysisTier[];
  onTierChange?: (tier: AnalysisTier) => void;
  clientPreviewUrl?: string;
  onClientPreviewUrlChange?: (url: string) => void;
};

const DEFAULT_TIER_OPTIONS: AnalysisTier[] = [
  'free',
  'three_month',
  'six_month',
  'twelve_month',
  'black',
];

export default function HairstyleAnalysisPreview({
  analysis,
  tierOptions = DEFAULT_TIER_OPTIONS,
  onTierChange,
  clientPreviewUrl,
  onClientPreviewUrlChange,
}: HairstyleAnalysisPreviewProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [showDebugFrames, setShowDebugFrames] = useState(false);

  const resolvedAnalysis = useMemo(() => {
    if (!clientPreviewUrl) return analysis;
    return {
      ...analysis,
      clientPreviewUrl,
      topMatch: {
        ...analysis.topMatch,
        imageUrl: analysis.topMatch.imageUrl ?? clientPreviewUrl,
      },
    };
  }, [analysis, clientPreviewUrl]);

  const validationIssues = useMemo(
    () => validateHairstyleAnalysis(resolvedAnalysis),
    [resolvedAnalysis]
  );

  const filename = `${resolvedAnalysis.clientName.toLowerCase()}-hairstyle-analysis-${resolvedAnalysis.tier}.png`;

  return (
    <div className="flex flex-col gap-6 w-full max-w-md mx-auto">
      <div className="flex flex-col gap-3">
        {onTierChange ? (
          <label className="flex flex-col gap-1 text-[10px] uppercase tracking-[0.14em] text-[#808080]">
            Tier
            <select
              value={analysis.tier}
              onChange={(e) => onTierChange(e.target.value as AnalysisTier)}
              className="border border-black bg-white px-2 py-2 text-black text-[11px] uppercase tracking-[0.12em]"
            >
              {tierOptions.map((tier) => (
                <option key={tier} value={tier}>
                  {tier.replace(/_/g, ' ')}
                </option>
              ))}
            </select>
          </label>
        ) : null}

        {onClientPreviewUrlChange ? (
          <label className="flex flex-col gap-1 text-[10px] uppercase tracking-[0.14em] text-[#808080]">
            Client preview URL
            <input
              type="url"
              value={clientPreviewUrl ?? analysis.clientPreviewUrl}
              onChange={(e) => onClientPreviewUrlChange(e.target.value)}
              className="border border-black bg-white px-2 py-2 text-black text-[11px]"
              placeholder="https://…"
            />
          </label>
        ) : null}

        <label className="flex items-center gap-2 text-[10px] uppercase tracking-[0.14em] text-[#808080]">
          <input
            type="checkbox"
            checked={showDebugFrames}
            onChange={(e) => setShowDebugFrames(e.target.checked)}
          />
          Show slot debug frames
        </label>
      </div>

      {validationIssues.length > 0 ? (
        <div className="border border-[#eb1c24] bg-[#fff5f5] p-3 text-[9px] uppercase tracking-[0.1em] text-[#eb1c24]">
          <p className="font-medium mb-1">Validation</p>
          <ul className="list-disc pl-4 space-y-1">
            {validationIssues.map((issue) => (
              <li key={`${issue.field}-${issue.message}`}>
                {issue.field}: {issue.message}
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <p className="text-[9px] uppercase tracking-[0.12em] text-[#22c55e]">Catalog validation passed</p>
      )}

      <div ref={cardRef} className="w-full shadow-lg border border-black/10">
        <HairstyleAnalysisCard analysis={resolvedAnalysis} showDebugFrames={showDebugFrames} />
      </div>

      <DownloadAnalysisButton targetRef={cardRef} filename={filename} />
    </div>
  );
}
