import { useCallback, useMemo, useRef, useState, type ChangeEvent } from 'react';
import type {
  AnalysisTier,
  HairstyleAnalysis,
  PercentRect,
  SlotLayoutOverrides,
  TextContentOverrides,
} from '../../types/hairstyleAnalysis';
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

function readFileAsDataUrl(file: File): Promise<string | null> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = () => {
      const r = reader.result;
      resolve(typeof r === 'string' && r.startsWith('data:') ? r : null);
    };
    reader.onerror = () => resolve(null);
    reader.readAsDataURL(file);
  });
}

export default function HairstyleAnalysisPreview({
  analysis,
  tierOptions = DEFAULT_TIER_OPTIONS,
  onTierChange,
  clientPreviewUrl,
  onClientPreviewUrlChange,
}: HairstyleAnalysisPreviewProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showDebugFrames, setShowDebugFrames] = useState(false);
  const [hideDebugForCapture, setHideDebugForCapture] = useState(false);
  const [slotOverrides, setSlotOverrides] = useState<SlotLayoutOverrides>({});
  const [textOverrides, setTextOverrides] = useState<TextContentOverrides>({});
  const [uploadError, setUploadError] = useState<string | null>(null);

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

  const onSlotRectChange = useCallback((slotId: string, rect: PercentRect) => {
    setSlotOverrides((prev) => ({
      ...prev,
      [slotId]: {
        left: rect.left,
        top: rect.top,
        width: rect.width,
        height: rect.height,
      },
    }));
  }, []);

  const onTextChange = useCallback((slotId: string, value: string) => {
    setTextOverrides((prev) => ({ ...prev, [slotId]: value }));
  }, []);

  const onTierSelect = (tier: AnalysisTier) => {
    setSlotOverrides({});
    setTextOverrides({});
    onTierChange?.(tier);
  };

  const onPhotoSelected = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file || !onClientPreviewUrlChange) return;
    setUploadError(null);
    const dataUrl = await readFileAsDataUrl(file);
    if (!dataUrl) {
      setUploadError('COULD NOT READ THAT PHOTO');
      return;
    }
    onClientPreviewUrlChange(dataUrl);
  };

  const layoutJson = JSON.stringify({ slotOverrides, textOverrides }, null, 2);

  return (
    <div className="flex flex-col gap-6 w-full max-w-md mx-auto">
      <div className="flex flex-col gap-3">
        {onTierChange ? (
          <label className="flex flex-col gap-1 text-[10px] uppercase tracking-[0.14em] text-[#808080]">
            Tier
            <select
              value={analysis.tier}
              onChange={(e) => onTierSelect(e.target.value as AnalysisTier)}
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
          <div className="flex flex-col gap-2">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => void onPhotoSelected(e)}
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="border border-black bg-white px-3 py-2 text-[10px] uppercase tracking-[0.14em] text-black"
            >
              Upload client preview photo
            </button>
            <label className="flex flex-col gap-1 text-[10px] uppercase tracking-[0.14em] text-[#808080]">
              Or paste image URL
              <input
                type="text"
                value={clientPreviewUrl ?? analysis.clientPreviewUrl}
                onChange={(e) => onClientPreviewUrlChange(e.target.value)}
                className="border border-black bg-white px-2 py-2 text-black text-[11px]"
                placeholder="/assets/… or https://…"
              />
            </label>
            {uploadError ? (
              <p className="text-[9px] uppercase tracking-[0.1em] text-[#eb1c24]">{uploadError}</p>
            ) : null}
          </div>
        ) : null}

        <label className="flex items-center gap-2 text-[10px] uppercase tracking-[0.14em] text-[#808080]">
          <input
            type="checkbox"
            checked={showDebugFrames}
            onChange={(e) => setShowDebugFrames(e.target.checked)}
          />
          Debug — drag slot handles · click text to edit
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
        <HairstyleAnalysisCard
          analysis={resolvedAnalysis}
          showDebugFrames={showDebugFrames && !hideDebugForCapture}
          slotOverrides={slotOverrides}
          textOverrides={textOverrides}
          onSlotRectChange={onSlotRectChange}
          onTextChange={onTextChange}
        />
      </div>

      {showDebugFrames ? (
        <details className="border border-black/20 p-2">
          <summary className="text-[9px] uppercase tracking-[0.12em] text-[#808080] cursor-pointer">
            Slot layout JSON (copy into hairstyleAnalysisRules)
          </summary>
          <pre className="mt-2 text-[8px] leading-relaxed overflow-x-auto whitespace-pre-wrap break-all text-[#333]">
            {layoutJson}
          </pre>
        </details>
      ) : null}

      <DownloadAnalysisButton
        targetRef={cardRef}
        filename={filename}
        beforeCapture={() => setHideDebugForCapture(true)}
        afterCapture={() => setHideDebugForCapture(false)}
      />
    </div>
  );
}
