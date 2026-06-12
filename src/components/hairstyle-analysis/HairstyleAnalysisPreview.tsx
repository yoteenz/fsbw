import { useCallback, useMemo, useRef, useState, type ChangeEvent } from 'react';
import type {
  AnalysisTier,
  HairstyleAnalysis,
  PercentRect,
  SlotLayoutOverrides,
  TextContentOverrides,
} from '../../types/hairstyleAnalysis';
import { postHairstyleAnalysisGenerate } from '../../utils/api';
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
  const generatedRef = useRef<HTMLDivElement>(null);
  const overlayCardRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [generating, setGenerating] = useState(false);
  const [generateError, setGenerateError] = useState<string | null>(null);
  const [generatedUrl, setGeneratedUrl] = useState<string | null>(null);
  const [lastPrompt, setLastPrompt] = useState<string | null>(null);
  const [showOverlayPreview, setShowOverlayPreview] = useState(false);
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

  const onTierSelect = (tier: AnalysisTier) => {
    setSlotOverrides({});
    setTextOverrides({});
    setGeneratedUrl(null);
    setLastPrompt(null);
    setGenerateError(null);
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
    setGeneratedUrl(null);
    setLastPrompt(null);
  };

  const handleGenerate = useCallback(async () => {
    setGenerating(true);
    setGenerateError(null);
    try {
      const result = await postHairstyleAnalysisGenerate(resolvedAnalysis as unknown as Record<string, unknown>);
      setGeneratedUrl(result.imageUrl);
      setLastPrompt(result.prompt);
    } catch (e) {
      setGenerateError(e instanceof Error ? e.message.toUpperCase() : 'GENERATION FAILED');
    } finally {
      setGenerating(false);
    }
  }, [resolvedAnalysis]);

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

  const layoutJson = JSON.stringify({ slotOverrides, textOverrides }, null, 2);

  return (
    <div className="flex flex-col gap-6 w-full max-w-md mx-auto">
      <div className="flex flex-col gap-3">
        {onTierChange ? (
          <label className="flex flex-col gap-1 text-[10px] uppercase tracking-[0.14em] text-[#808080]">
            Membership tier
            <select
              value={analysis.tier}
              onChange={(e) => onTierSelect(e.target.value as AnalysisTier)}
              className="border border-black bg-white px-2 py-2 text-black text-[11px] uppercase tracking-[0.12em]"
              disabled={generating}
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
              disabled={generating}
              className="border border-black bg-white px-3 py-2 text-[10px] uppercase tracking-[0.14em] text-black disabled:opacity-40"
            >
              Upload client preview photo
            </button>
            <label className="flex flex-col gap-1 text-[10px] uppercase tracking-[0.14em] text-[#808080]">
              Or paste image URL
              <input
                type="text"
                value={clientPreviewUrl ?? analysis.clientPreviewUrl}
                onChange={(e) => {
                  onClientPreviewUrlChange(e.target.value);
                  setGeneratedUrl(null);
                  setLastPrompt(null);
                }}
                disabled={generating}
                className="border border-black bg-white px-2 py-2 text-black text-[11px]"
                placeholder="/assets/… or https://…"
              />
            </label>
            {uploadError ? (
              <p className="text-[9px] uppercase tracking-[0.1em] text-[#eb1c24]">{uploadError}</p>
            ) : null}
          </div>
        ) : null}

        <button
          type="button"
          onClick={() => void handleGenerate()}
          disabled={generating || validationIssues.length > 0}
          className="w-full py-3 border border-black uppercase disabled:opacity-40"
          style={{ fontFamily: '"Futura PT Medium"', fontSize: '11px', color: '#FFFFFF', backgroundColor: '#EB1C24' }}
        >
          {generating ? 'GENERATING WITH GPT IMAGE 2…' : 'GENERATE TEMPLATE PREVIEW (GPT IMAGE 2 · 4:5 · 2K)'}
        </button>

        <p className="text-[9px] uppercase tracking-[0.1em] text-[#808080] leading-relaxed">
          Sends the static Supabase template + client photo to Fal with the tier population prompt. This is the
          client-facing card — not the React text overlay composer.
        </p>
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

      {generateError ? (
        <p className="text-[9px] uppercase tracking-[0.1em] text-[#eb1c24] leading-relaxed">{generateError}</p>
      ) : null}

      {generating ? (
        <div
          className="aspect-[4/5] w-full border border-black/20 bg-black/5 flex flex-col items-center justify-center gap-3 px-6"
          aria-busy
        >
          <div className="w-8 h-8 border-2 border-black/20 border-t-[#eb1c24] rounded-full animate-spin" />
          <p className="text-center uppercase text-[9px] tracking-[0.12em] text-[#808080] leading-relaxed">
            GPT IMAGE 2 IS POPULATING THE {analysis.tier.replace(/_/g, ' ')} TEMPLATE — DO NOT LEAVE THIS PAGE.
          </p>
        </div>
      ) : generatedUrl ? (
        <div ref={generatedRef} className="w-full shadow-lg border border-black/10">
          <img
            src={generatedUrl}
            alt={`Generated hairstyle analysis — ${analysis.tier}`}
            className="w-full h-auto block"
          />
        </div>
      ) : (
        <div className="w-full shadow-lg border border-black/10 opacity-60">
          <img
            src={resolvedAnalysis.templateUrl}
            alt="Empty template reference"
            className="w-full h-auto block"
          />
          <p className="text-center py-2 text-[8px] uppercase tracking-[0.1em] text-[#808080]">
            Empty template reference — tap generate above
          </p>
        </div>
      )}

      {generatedUrl ? (
        <a
          href={generatedUrl}
          download={filename}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full border border-black bg-[#eb1c24] text-white uppercase tracking-[0.18em] text-[10px] px-4 py-3 text-center block"
        >
          DOWNLOAD GENERATED PNG
        </a>
      ) : null}

      {lastPrompt ? (
        <details className="border border-black/20 p-2">
          <summary className="text-[9px] uppercase tracking-[0.12em] text-[#808080] cursor-pointer">
            Fal population prompt (last run)
          </summary>
          <pre className="mt-2 text-[8px] leading-relaxed overflow-x-auto whitespace-pre-wrap break-all text-[#333]">
            {lastPrompt}
          </pre>
        </details>
      ) : null}

      <details className="border border-black/15 p-2">
        <summary className="text-[9px] uppercase tracking-[0.12em] text-[#808080] cursor-pointer">
          Advanced — React overlay composer (dev only)
        </summary>
        <div className="mt-3 flex flex-col gap-3">
          <label className="flex items-center gap-2 text-[10px] uppercase tracking-[0.14em] text-[#808080]">
            <input
              type="checkbox"
              checked={showOverlayPreview}
              onChange={(e) => setShowOverlayPreview(e.target.checked)}
            />
            Show overlay preview
          </label>
          {showOverlayPreview ? (
            <>
              <label className="flex items-center gap-2 text-[10px] uppercase tracking-[0.14em] text-[#808080]">
                <input
                  type="checkbox"
                  checked={showDebugFrames}
                  onChange={(e) => setShowDebugFrames(e.target.checked)}
                />
                Debug slot frames
              </label>
              <div ref={overlayCardRef} className="w-full border border-black/10">
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
                <pre className="text-[8px] leading-relaxed overflow-x-auto whitespace-pre-wrap break-all text-[#333]">
                  {layoutJson}
                </pre>
              ) : null}
              <DownloadAnalysisButton
                targetRef={overlayCardRef}
                filename={`${filename.replace('.png', '')}-overlay.png`}
                beforeCapture={() => setHideDebugForCapture(true)}
                afterCapture={() => setHideDebugForCapture(false)}
              />
            </>
          ) : null}
        </div>
      </details>
    </div>
  );
}
