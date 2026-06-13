import { useCallback, useEffect, useMemo, useRef, useState, type ChangeEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import type {
  AnalysisTier,
  HairstyleAnalysis,
  PercentRect,
  SlotLayoutOverrides,
  TextContentOverrides,
  TextFontStyle,
  TextFontStyleOverrides,
} from '../../types/hairstyleAnalysis';
import {
  clearHairstyleAnalysisTierDebug,
  formatHairstyleAnalysisDebugForCopy,
  loadHairstyleAnalysisTierDebug,
  saveHairstyleAnalysisTierDebug,
} from '../../utils/hairstyleAnalysisLayoutDebug';
import { getTemplateFields } from '../../utils/hairstyleAnalysisTemplateLayouts';
import {
  getHairstyleAnalysisUsage,
  postHairstyleAnalysisGenerate,
  type HairstyleAnalysisUsageResult,
} from '../../utils/api';
import { getCurrentUser, isAdminEmail } from '../../utils/adminAuth';
import { validateHairstyleAnalysis } from '../../utils/hairstyleAnalysisRules';
import { appendHairstyleAnalysisToLocalCart } from '../../utils/hairstyleAnalysisPurchase';
import { requestOpenPsaChat } from '../../utils/psaOpenChatRequest';
import DownloadAnalysisButton from './DownloadAnalysisButton';
import HairstyleAnalysisCard from './HairstyleAnalysisCard';
import SiteFontPicker from './SiteFontPicker';
import { formatScorePercent } from '../../utils/hairstyleAnalysisFormat';
import {
  DEFAULT_OVERALL_SCORE_FONT_ID,
  resolveSiteFontId,
  siteFontStylePatch,
} from '../../utils/siteFonts';

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
  const navigate = useNavigate();
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
  const [fontOverrides, setFontOverrides] = useState<TextFontStyleOverrides>({});
  const [selectedFontSlot, setSelectedFontSlot] = useState('topScore');
  const [debugSaveMessage, setDebugSaveMessage] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [usageState, setUsageState] = useState<HairstyleAnalysisUsageResult | null>(null);
  const [usageLoading, setUsageLoading] = useState(true);

  const isAdmin = useMemo(() => {
    const user = getCurrentUser();
    return user ? isAdminEmail(user.email || '') : false;
  }, []);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const usage = await getHairstyleAnalysisUsage();
        if (cancelled) return;
        setUsageState(usage);
        if (!isAdmin && usage.eligible && usage.analysisTier && onTierChange) {
          onTierChange(usage.analysisTier as AnalysisTier);
        }
      } catch {
        if (!cancelled) setUsageState(null);
      } finally {
        if (!cancelled) setUsageLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [isAdmin, onTierChange]);

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

  const textFieldIds = useMemo(
    () =>
      getTemplateFields(analysis.tier)
        .filter((field) => field.kind === 'text')
        .map((field) => field.id),
    [analysis.tier]
  );

  useEffect(() => {
    const saved = loadHairstyleAnalysisTierDebug(analysis.tier);
    setSlotOverrides(saved.slotOverrides);
    setTextOverrides(saved.textOverrides);
    setFontOverrides(saved.fontOverrides);
    setSelectedFontSlot((prev) =>
      textFieldIds.includes(prev) ? prev : textFieldIds[0] ?? 'topScore'
    );
  }, [analysis.tier, textFieldIds]);

  const onTierSelect = (tier: AnalysisTier) => {
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

  const canGenerate = useMemo(() => {
    if (validationIssues.length > 0 || generating || usageLoading) return false;
    if (isAdmin || usageState?.unlimited) return true;
    if (!usageState?.eligible) return false;
    if (usageState.canGenerate === true) return true;
    return (usageState.monthRemaining ?? 0) > 0 || (usageState.paidCreditsRemaining ?? 0) > 0;
  }, [generating, isAdmin, usageLoading, usageState, validationIssues.length]);

  const purchaseRequired = useMemo(() => {
    if (isAdmin || usageState?.unlimited || !usageState?.eligible || usageLoading) return false;
    return usageState.purchaseRequired === true;
  }, [isAdmin, usageLoading, usageState]);

  const handlePurchaseTier = useCallback(
    (comparisonCount: 1 | 4) => {
      appendHairstyleAnalysisToLocalCart(comparisonCount);
      navigate('/checkout');
    },
    [navigate]
  );

  const handleAskPsaToPurchase = useCallback(() => {
    requestOpenPsaChat({
      prefillMessage:
        'I used my free hairstyle analysis for this month. Help me purchase another at the consult style analysis prices.',
    });
  }, []);

  const handleGenerate = useCallback(async () => {
    setGenerating(true);
    setGenerateError(null);
    try {
      const hasLayoutOverrides = Object.keys(slotOverrides).length > 0;
      const hasFontOverrides = Object.keys(fontOverrides).length > 0;
      const result = await postHairstyleAnalysisGenerate(
        resolvedAnalysis as unknown as Record<string, unknown>,
        hasLayoutOverrides || hasFontOverrides
          ? {
              slotOverrides: hasLayoutOverrides ? slotOverrides : undefined,
              fontOverrides: hasFontOverrides ? fontOverrides : undefined,
            }
          : undefined
      );
      setGeneratedUrl(result.imageUrl);
      setLastPrompt(result.prompt);
      if (result.usage) {
        setUsageState((prev) =>
          prev
            ? {
                ...prev,
                usage: result.usage!,
                monthRemaining: result.usage!.monthRemaining,
                paidCreditsRemaining: result.usage!.paidCreditsRemaining ?? prev.paidCreditsRemaining,
                canGenerate: result.usage!.canGenerate ?? prev.canGenerate,
                purchaseRequired: (result.usage!.canGenerate ?? prev.canGenerate) === false,
              }
            : prev
        );
      } else if (!usageState?.unlimited && !isAdmin) {
        const refreshed = await getHairstyleAnalysisUsage();
        setUsageState(refreshed);
      }
    } catch (e) {
      setGenerateError(e instanceof Error ? e.message.toUpperCase() : 'GENERATION FAILED');
    } finally {
      setGenerating(false);
    }
  }, [fontOverrides, isAdmin, resolvedAnalysis, slotOverrides, usageState?.unlimited]);

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

  const onFontFieldChange = useCallback(
    (key: keyof TextFontStyle, value: string) => {
      setFontOverrides((prev) => ({
        ...prev,
        [selectedFontSlot]: {
          ...prev[selectedFontSlot],
          [key]: value || undefined,
        },
      }));
    },
    [selectedFontSlot]
  );

  const overallScoreFontId = resolveSiteFontId(fontOverrides.topScore);
  const overallScorePreviewText =
    textOverrides.topScore ?? formatScorePercent(resolvedAnalysis.topMatch.score);

  const onOverallScoreFontChange = useCallback(
    (fontId: string) => {
      const patch = siteFontStylePatch(fontId);
      setFontOverrides((prev) => {
        const next: TextFontStyleOverrides = {
          ...prev,
          topScore: {
            ...prev.topScore,
            ...patch,
            color: prev.topScore?.color ?? '#EB1C24',
          },
        };
        saveHairstyleAnalysisTierDebug(analysis.tier, {
          slotOverrides,
          textOverrides,
          fontOverrides: next,
        });
        return next;
      });
      setSelectedFontSlot('topScore');
      setDebugSaveMessage('Saved overall score font');
      window.setTimeout(() => setDebugSaveMessage(null), 2500);
    },
    [analysis.tier, slotOverrides, textOverrides]
  );

  const handleSaveDebugLayout = useCallback(() => {
    saveHairstyleAnalysisTierDebug(analysis.tier, {
      slotOverrides,
      textOverrides,
      fontOverrides,
    });
    setDebugSaveMessage(`Saved layout for ${analysis.tier.replace(/_/g, ' ')}`);
    window.setTimeout(() => setDebugSaveMessage(null), 2500);
  }, [analysis.tier, fontOverrides, slotOverrides, textOverrides]);

  const handleResetDebugLayout = useCallback(() => {
    clearHairstyleAnalysisTierDebug(analysis.tier);
    setSlotOverrides({});
    setTextOverrides({});
    setFontOverrides({});
    setDebugSaveMessage(`Reset ${analysis.tier.replace(/_/g, ' ')} to defaults`);
    window.setTimeout(() => setDebugSaveMessage(null), 2500);
  }, [analysis.tier]);

  const selectedFontStyle = fontOverrides[selectedFontSlot] ?? {};

  const layoutJson = formatHairstyleAnalysisDebugForCopy({
    slotOverrides,
    textOverrides,
    fontOverrides,
  });

  return (
    <div className="flex flex-col gap-6 w-full max-w-md mx-auto">
      <div className="flex flex-col gap-3">
        {usageLoading ? (
          <p className="text-[9px] uppercase tracking-[0.1em] text-[#808080]">Checking monthly allowance…</p>
        ) : usageState?.unlimited ? (
          <p className="text-[9px] uppercase tracking-[0.1em] text-[#808080]">
            Admin test mode — unlimited generations
          </p>
        ) : usageState?.eligible ? (
          <div className="flex flex-col gap-2">
            <p
              className={`text-[9px] uppercase tracking-[0.1em] leading-relaxed ${
                canGenerate ? 'text-[#808080]' : 'text-[#eb1c24]'
              }`}
            >
              {(usageState.monthRemaining ?? 0) > 0
                ? `${usageState.monthRemaining} free hairstyle analysis remaining this month (3 / 6 / 12 month members)`
                : 'You have used your free hairstyle analysis for this month.'}
              {(usageState.paidCreditsRemaining ?? 0) > 0
                ? ` ${usageState.paidCreditsRemaining} paid credit(s) available.`
                : ''}
              {!canGenerate ? ' Purchase another through checkout or ask your PSA.' : ''}
            </p>
            {purchaseRequired && usageState.purchaseOptions?.length ? (
              <div className="flex flex-col gap-2 border border-black/15 p-3">
                <p className="text-[9px] uppercase tracking-[0.1em] text-[#808080] leading-relaxed">
                  Same prices as the wig consult style analysis add-on (non-refundable)
                </p>
                <div className="flex flex-col gap-2">
                  {usageState.purchaseOptions.map((tier) => (
                    <button
                      key={tier.comparisonCount}
                      type="button"
                      onClick={() => handlePurchaseTier(tier.comparisonCount)}
                      className="border border-black bg-white px-3 py-2 text-left text-[10px] uppercase tracking-[0.12em] text-black"
                    >
                      {tier.label} · ${tier.priceUsd}
                    </button>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={handleAskPsaToPurchase}
                  className="border border-black bg-black px-3 py-2 text-[10px] uppercase tracking-[0.12em] text-white"
                >
                  Ask your PSA
                </button>
              </div>
            ) : null}
          </div>
        ) : (
          <p className="text-[9px] uppercase tracking-[0.1em] text-[#eb1c24] leading-relaxed">
            A 3, 6, or 12 month premium subscription is required.{' '}
            <Link to="/account/rewards" className="underline text-black">
              View membership
            </Link>
          </p>
        )}

        {onTierChange && isAdmin ? (
          <label className="flex flex-col gap-1 text-[10px] uppercase tracking-[0.14em] text-[#808080]">
            Membership tier (admin test)
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
        ) : usageState?.analysisTier ? (
          <p className="text-[9px] uppercase tracking-[0.1em] text-[#808080]">
            Your card tier: {usageState.analysisTier.replace(/_/g, ' ')}
          </p>
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
                placeholder="/assets/… or https://… (use Upload for large photos)"
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
          disabled={!canGenerate}
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
                  fontOverrides={fontOverrides}
                  onSlotRectChange={onSlotRectChange}
                  onTextChange={onTextChange}
                />
              </div>
              {showDebugFrames ? (
                <div className="flex flex-col gap-3 border border-black/15 p-3">
                  <p className="text-[9px] uppercase tracking-[0.12em] text-[#808080] leading-relaxed">
                    Drag slot handles to reposition overlay previews. Save layout persists debug positions for the
                    dev overlay only — server post-process applies in-place bottom fade to marble (no cutout layer) on Generate.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={handleSaveDebugLayout}
                      className="border border-black bg-[#eb1c24] px-3 py-2 text-[10px] uppercase tracking-[0.12em] text-white"
                    >
                      Save layout
                    </button>
                    <button
                      type="button"
                      onClick={handleResetDebugLayout}
                      className="border border-black bg-white px-3 py-2 text-[10px] uppercase tracking-[0.12em] text-black"
                    >
                      Reset tier
                    </button>
                  </div>
                  {debugSaveMessage ? (
                    <p className="text-[9px] uppercase tracking-[0.1em] text-[#22c55e]">{debugSaveMessage}</p>
                  ) : null}
                  <SiteFontPicker
                    valueId={overallScoreFontId || DEFAULT_OVERALL_SCORE_FONT_ID}
                    previewText={overallScorePreviewText}
                    previewColor={fontOverrides.topScore?.color ?? '#EB1C24'}
                    onChange={onOverallScoreFontChange}
                  />
                  <p className="text-[9px] uppercase tracking-[0.12em] text-[#808080] leading-relaxed">
                    Overall score font updates the debug overlay preview. Fal always generates the red OVERALL
                    SCORE in Covered By Your Grace handwritten script — not MATCH 02–04 gray scores.
                    Use Save layout for slot positions and other font fields.
                  </p>
                  <label className="flex flex-col gap-1 text-[10px] uppercase tracking-[0.14em] text-[#808080]">
                    Font slot
                    <select
                      value={selectedFontSlot}
                      onChange={(e) => setSelectedFontSlot(e.target.value)}
                      className="border border-black bg-white px-2 py-2 text-black text-[11px]"
                    >
                      {textFieldIds.map((id) => (
                        <option key={id} value={id}>
                          {id}
                        </option>
                      ))}
                    </select>
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <label className="flex flex-col gap-1 text-[9px] uppercase tracking-[0.12em] text-[#808080]">
                      Font family
                      <input
                        type="text"
                        value={selectedFontStyle.fontFamily ?? ''}
                        onChange={(e) => onFontFieldChange('fontFamily', e.target.value)}
                        placeholder='Futura PT Medium'
                        className="border border-black bg-white px-2 py-1.5 text-black text-[11px] normal-case"
                      />
                    </label>
                    <label className="flex flex-col gap-1 text-[9px] uppercase tracking-[0.12em] text-[#808080]">
                      Font size
                      <input
                        type="text"
                        value={selectedFontStyle.fontSize ?? ''}
                        onChange={(e) => onFontFieldChange('fontSize', e.target.value)}
                        placeholder="2.65cqw or 10px"
                        className="border border-black bg-white px-2 py-1.5 text-black text-[11px] normal-case"
                      />
                    </label>
                    <label className="flex flex-col gap-1 text-[9px] uppercase tracking-[0.12em] text-[#808080]">
                      Color
                      <input
                        type="text"
                        value={selectedFontStyle.color ?? ''}
                        onChange={(e) => onFontFieldChange('color', e.target.value)}
                        placeholder="#808080"
                        className="border border-black bg-white px-2 py-1.5 text-black text-[11px] normal-case"
                      />
                    </label>
                    <label className="flex flex-col gap-1 text-[9px] uppercase tracking-[0.12em] text-[#808080]">
                      Weight
                      <input
                        type="text"
                        value={selectedFontStyle.fontWeight ?? ''}
                        onChange={(e) => onFontFieldChange('fontWeight', e.target.value)}
                        placeholder="500 or 600"
                        className="border border-black bg-white px-2 py-1.5 text-black text-[11px] normal-case"
                      />
                    </label>
                    <label className="flex flex-col gap-1 text-[9px] uppercase tracking-[0.12em] text-[#808080]">
                      Letter spacing
                      <input
                        type="text"
                        value={selectedFontStyle.letterSpacing ?? ''}
                        onChange={(e) => onFontFieldChange('letterSpacing', e.target.value)}
                        placeholder="0.08em"
                        className="border border-black bg-white px-2 py-1.5 text-black text-[11px] normal-case"
                      />
                    </label>
                    <label className="flex flex-col gap-1 text-[9px] uppercase tracking-[0.12em] text-[#808080]">
                      Text align
                      <select
                        value={selectedFontStyle.textAlign ?? ''}
                        onChange={(e) => onFontFieldChange('textAlign', e.target.value)}
                        className="border border-black bg-white px-2 py-1.5 text-black text-[11px] normal-case"
                      >
                        <option value="">Default</option>
                        <option value="left">Left</option>
                        <option value="center">Center</option>
                        <option value="right">Right</option>
                      </select>
                    </label>
                    <label className="flex flex-col gap-1 text-[9px] uppercase tracking-[0.12em] text-[#808080] col-span-2">
                      Text transform
                      <select
                        value={selectedFontStyle.textTransform ?? ''}
                        onChange={(e) => onFontFieldChange('textTransform', e.target.value)}
                        className="border border-black bg-white px-2 py-1.5 text-black text-[11px] normal-case"
                      >
                        <option value="">Default (uppercase)</option>
                        <option value="uppercase">Uppercase</option>
                        <option value="none">None</option>
                        <option value="lowercase">Lowercase</option>
                        <option value="capitalize">Capitalize</option>
                      </select>
                    </label>
                  </div>
                  <pre className="text-[8px] leading-relaxed overflow-x-auto whitespace-pre-wrap break-all text-[#333]">
                    {layoutJson}
                  </pre>
                </div>
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
