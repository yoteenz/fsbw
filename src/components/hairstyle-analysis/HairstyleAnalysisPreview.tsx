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
  postConsultStyleAnalysisGenerate,
  postHairstyleAnalysisGenerate,
  type HairstyleAnalysisUsageResult,
} from '../../utils/api';
import { getCurrentUser, isAdminEmail } from '../../utils/adminAuth';
import { validateHairstyleAnalysis } from '../../utils/hairstyleAnalysisRules';
import { appendHairstyleAnalysisToLocalCart } from '../../utils/hairstyleAnalysisPurchase';
import { requestOpenPsaChat } from '../../utils/psaOpenChatRequest';
import {
  buildEveryDetailMattersFromTopMatch,
  everyDetailVariationSeed,
} from '../../utils/hairstyleAnalysisEveryDetailMatters';
import {
  compressClientPreviewDataUrl,
} from '../../utils/hairstyleAnalysisClientPreviewImage';
import DownloadAnalysisButton from './DownloadAnalysisButton';
import HairstyleAnalysisCard from './HairstyleAnalysisCard';
import ManifestSpecPicker, {
  defaultAdditionalManifests,
  defaultTopMatchManifest,
} from './ManifestSpecPicker';
import {
  buildAnalysisFromManifest,
  lookToManifestDraft,
} from '../../utils/hairstyleAnalysisManifestBuild';
import type { ManifestLookDraft } from '../../utils/hairstyleAnalysisManifestOptions';
import {
  clearManifestForTier,
  initialManifestDrafts,
  loadManifestForTier,
  loadManifestTestModeEnabled,
  saveManifestForTier,
  saveManifestTestModeEnabled,
} from '../../utils/hairstyleAnalysisManifestStorage';
import {
  additionalLooksLimit,
  consultComparisonCountForAdminTier,
  formatHairstyleAnalysisTierLabel,
  HAIRSTYLE_ANALYSIS_ADMIN_TIER_OPTIONS,
  isConsultStyleAnalysisAdminTier,
} from '../../utils/hairstyleAnalysisRules';
import type { StyleAnalysisChart } from '../../types/styleAnalysis';

type HairstyleAnalysisPreviewProps = {
  analysis: HairstyleAnalysis;
  tierOptions?: AnalysisTier[];
  onTierChange?: (tier: AnalysisTier) => void;
  clientPreviewUrl?: string;
  onClientPreviewUrlChange?: (url: string) => void;
};

const DEFAULT_TIER_OPTIONS: AnalysisTier[] = HAIRSTYLE_ANALYSIS_ADMIN_TIER_OPTIONS;

/** Simulated progress cap before Fal returns (API maxDuration 300s). */
const HAIRSTYLE_ANALYSIS_GENERATE_ESTIMATE_MS = 180_000;

function AnalysisGenerateProgressOverlay({
  label,
  progress,
}: {
  label: string;
  progress: number;
}) {
  const pct = Math.round(Math.min(1, Math.max(0, progress)) * 100);
  return (
    <div
      className="aspect-[4/5] w-full border border-black/20 bg-black/5 flex flex-col items-center justify-center gap-3 px-10"
      aria-busy
    >
      <div
        className="w-8 h-8 border-2 border-black/20 border-t-[#eb1c24] rounded-full animate-spin"
        aria-hidden
      />
      <p className="text-center uppercase text-[9px] tracking-[0.12em] text-[#404040] leading-relaxed">{label}</p>
      <p className="text-center uppercase text-[8px] tracking-[0.12em] text-[#808080] leading-relaxed">
        DO NOT LEAVE THIS PAGE.
      </p>
      <div className="w-full max-w-[220px] h-1 rounded-full overflow-hidden bg-black/15">
        <div
          className="h-full bg-[#eb1c24] transition-[width] duration-200 ease-linear"
          style={{ width: `${pct}%` }}
          role="progressbar"
          aria-valuenow={pct}
          aria-valuemin={0}
          aria-valuemax={100}
        />
      </div>
    </div>
  );
}

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
  const inspoFileInputRef = useRef<HTMLInputElement>(null);

  const [generating, setGenerating] = useState(false);
  const [generateProgress, setGenerateProgress] = useState(0);
  const [generateError, setGenerateError] = useState<string | null>(null);
  const [generatedUrl, setGeneratedUrl] = useState<string | null>(null);
  const [generatedChart, setGeneratedChart] = useState<StyleAnalysisChart | null>(null);
  const [hairInspoUrl, setHairInspoUrl] = useState<string | null>(null);
  const [inspoUploadError, setInspoUploadError] = useState<string | null>(null);
  const [lastPrompt, setLastPrompt] = useState<string | null>(null);
  const [showOverlayPreview, setShowOverlayPreview] = useState(false);
  const [showDebugFrames, setShowDebugFrames] = useState(false);
  const [hideDebugForCapture, setHideDebugForCapture] = useState(false);
  const [slotOverrides, setSlotOverrides] = useState<SlotLayoutOverrides>({});
  const [textOverrides, setTextOverrides] = useState<TextContentOverrides>({});
  const [fontOverrides, setFontOverrides] = useState<TextFontStyleOverrides>({});
  const [selectedFontSlot, setSelectedFontSlot] = useState('clientHeaderName');
  const [debugSaveMessage, setDebugSaveMessage] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [usageState, setUsageState] = useState<HairstyleAnalysisUsageResult | null>(null);
  const [usageLoading, setUsageLoading] = useState(true);
  const manifestTierRef = useRef(analysis.tier);

  const [manifestTestMode, setManifestTestMode] = useState(() => loadManifestTestModeEnabled());
  const [topManifest, setTopManifest] = useState<ManifestLookDraft>(() => {
    const initial = initialManifestDrafts(
      analysis.tier,
      lookToManifestDraft(analysis.topMatch),
      analysis.additionalLooks.length > 0
        ? analysis.additionalLooks.map(lookToManifestDraft)
        : defaultAdditionalManifests()
    );
    return initial.topMatch;
  });
  const [altManifests, setAltManifests] = useState<ManifestLookDraft[]>(() => {
    const initial = initialManifestDrafts(
      analysis.tier,
      lookToManifestDraft(analysis.topMatch),
      analysis.additionalLooks.length > 0
        ? analysis.additionalLooks.map(lookToManifestDraft)
        : defaultAdditionalManifests()
    );
    return initial.additionalLooks;
  });

  const isAdmin = useMemo(() => {
    const user = getCurrentUser();
    return user ? isAdminEmail(user.email || '') : false;
  }, []);

  const consultDebugMode = isConsultStyleAnalysisAdminTier(analysis.tier);

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
    const previewUrl = clientPreviewUrl ?? analysis.clientPreviewUrl;
    const base =
      manifestTestMode && isAdmin
        ? buildAnalysisFromManifest({
            tier: analysis.tier,
            clientPreviewUrl: previewUrl,
            clientName: analysis.clientName,
            topMatch: topManifest,
            additionalLooks: altManifests,
            everyDetailFaceFeatures: analysis.everyDetailFaceFeatures,
          })
        : analysis;

    if (!clientPreviewUrl) return base;
    return {
      ...base,
      clientPreviewUrl,
      topMatch: {
        ...base.topMatch,
        imageUrl: base.topMatch.imageUrl ?? clientPreviewUrl,
      },
    };
  }, [
    altManifests,
    analysis,
    clientPreviewUrl,
    isAdmin,
    manifestTestMode,
    topManifest,
  ]);

  const validationIssues = useMemo(
    () => validateHairstyleAnalysis(resolvedAnalysis),
    [resolvedAnalysis]
  );

  const filename = `${resolvedAnalysis.clientName.toLowerCase()}-hairstyle-analysis-${resolvedAnalysis.tier}.png`;

  const textFieldIds = useMemo(
    () =>
      getTemplateFields(analysis.tier)
        .filter((field) => field.kind === 'text' && field.id !== 'topScore' && field.id !== 'rating')
        .map((field) => field.id),
    [analysis.tier]
  );

  useEffect(() => {
    if (manifestTestMode && isAdmin) return;
    const initial = initialManifestDrafts(
      analysis.tier,
      lookToManifestDraft(analysis.topMatch),
      analysis.additionalLooks.length > 0
        ? analysis.additionalLooks.map(lookToManifestDraft)
        : defaultAdditionalManifests()
    );
    setTopManifest(initial.topMatch);
    setAltManifests(initial.additionalLooks);
  }, [analysis, isAdmin, manifestTestMode]);

  useEffect(() => {
    if (!manifestTestMode || !isAdmin) return;
    if (manifestTierRef.current === analysis.tier) return;
    manifestTierRef.current = analysis.tier;
    const saved = loadManifestForTier(analysis.tier);
    if (saved) {
      setTopManifest(saved.topMatch);
      setAltManifests(saved.additionalLooks);
      return;
    }
    const limit = additionalLooksLimit(analysis.tier);
    setTopManifest(defaultTopMatchManifest());
    setAltManifests(defaultAdditionalManifests().slice(0, limit));
  }, [analysis.tier, isAdmin, manifestTestMode]);

  useEffect(() => {
    if (!manifestTestMode || !isAdmin) return;
    saveManifestForTier(analysis.tier, {
      topMatch: topManifest,
      additionalLooks: altManifests,
    });
  }, [altManifests, analysis.tier, isAdmin, manifestTestMode, topManifest]);

  useEffect(() => {
    const saved = loadHairstyleAnalysisTierDebug(analysis.tier);
    setSlotOverrides(saved.slotOverrides);
    setTextOverrides(saved.textOverrides);
    setFontOverrides(saved.fontOverrides);
    setSelectedFontSlot((prev) =>
      textFieldIds.includes(prev) ? prev : textFieldIds[0] ?? 'clientHeaderName'
    );
  }, [analysis.tier, textFieldIds]);

  const onTierSelect = (tier: AnalysisTier) => {
    setGeneratedUrl(null);
    setGeneratedChart(null);
    setLastPrompt(null);
    setGenerateError(null);
    if (!isConsultStyleAnalysisAdminTier(tier)) {
      setHairInspoUrl(null);
      setInspoUploadError(null);
    }
    onTierChange?.(tier);
  };

  const onInspoSelected = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    setInspoUploadError(null);
    const dataUrl = await readFileAsDataUrl(file);
    if (!dataUrl) {
      setInspoUploadError('COULD NOT READ THAT PHOTO');
      return;
    }
    try {
      const compressed = await compressClientPreviewDataUrl(dataUrl);
      setHairInspoUrl(compressed);
    } catch {
      setInspoUploadError('PHOTO TOO LARGE — TRY A SMALLER IMAGE');
      return;
    }
    setGeneratedUrl(null);
    setGeneratedChart(null);
    setLastPrompt(null);
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
    try {
      const compressed = await compressClientPreviewDataUrl(dataUrl);
      onClientPreviewUrlChange(compressed);
    } catch {
      setUploadError('PHOTO TOO LARGE — TRY A SMALLER IMAGE');
      return;
    }
    setGeneratedUrl(null);
    setGeneratedChart(null);
    setLastPrompt(null);
  };

  const previewPhotoUrl = clientPreviewUrl ?? resolvedAnalysis.clientPreviewUrl;

  const canGenerate = useMemo(() => {
    if (generating || usageLoading) return false;
    if (consultDebugMode) {
      if (!isAdmin) return false;
      return Boolean(previewPhotoUrl?.trim()) && Boolean(hairInspoUrl?.trim());
    }
    if (validationIssues.length > 0) return false;
    if (isAdmin || usageState?.unlimited) return true;
    if (!usageState?.eligible) return false;
    if (usageState.canGenerate === true) return true;
    return (usageState.monthRemaining ?? 0) > 0 || (usageState.paidCreditsRemaining ?? 0) > 0;
  }, [
    consultDebugMode,
    generating,
    hairInspoUrl,
    isAdmin,
    previewPhotoUrl,
    usageLoading,
    usageState,
    validationIssues.length,
  ]);

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

  useEffect(() => {
    if (!generating) return;
    const startedAt = Date.now();
    setGenerateProgress(0);
    const id = window.setInterval(() => {
      const elapsed = Date.now() - startedAt;
      setGenerateProgress(Math.min(0.95, elapsed / HAIRSTYLE_ANALYSIS_GENERATE_ESTIMATE_MS));
    }, 100);
    return () => clearInterval(id);
  }, [generating]);

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
      const consultCount = consultComparisonCountForAdminTier(analysis.tier);
      if (consultCount) {
        const selfie = previewPhotoUrl;
        if (!selfie?.trim() || !hairInspoUrl?.trim()) {
          throw new Error('SELFIE AND HAIR INSPO PHOTOS ARE REQUIRED');
        }
        let selfieForApi = selfie;
        if (selfie.startsWith('data:')) {
          selfieForApi = await compressClientPreviewDataUrl(selfie);
        }
        let inspoForApi = hairInspoUrl;
        if (inspoForApi.startsWith('data:')) {
          inspoForApi = await compressClientPreviewDataUrl(inspoForApi);
        }
        const result = await postConsultStyleAnalysisGenerate({
          selfieDataUrl: selfieForApi,
          inspoDataUrl: inspoForApi,
          comparisonCount: consultCount,
        });
        if (!result.ok) throw new Error(result.error);
        setGenerateProgress(1);
        setGeneratedChart(result.chart);
        setGeneratedUrl(null);
        setLastPrompt(null);
        return;
      }

      const hasLayoutOverrides = Object.keys(slotOverrides).length > 0;
      const hasFontOverrides = Object.keys(fontOverrides).length > 0;
      const freshWhyItWorks = buildEveryDetailMattersFromTopMatch(
        resolvedAnalysis.topMatch,
        resolvedAnalysis.everyDetailFaceFeatures,
        5,
        everyDetailVariationSeed()
      );
      const previewUrl = clientPreviewUrl ?? resolvedAnalysis.clientPreviewUrl;
      let clientPreviewForApi = previewUrl;
      if (previewUrl.startsWith('data:')) {
        clientPreviewForApi = await compressClientPreviewDataUrl(previewUrl);
      }
      const analysisForGenerate = {
        ...resolvedAnalysis,
        clientPreviewUrl: clientPreviewForApi,
        whyItWorks: freshWhyItWorks,
      };
      const result = await postHairstyleAnalysisGenerate(
        analysisForGenerate as unknown as Record<string, unknown>,
        {
          slotOverrides: hasLayoutOverrides ? slotOverrides : undefined,
          fontOverrides: hasFontOverrides ? fontOverrides : undefined,
          manifestTestMode: manifestTestMode && isAdmin ? true : undefined,
        }
      );
      setGenerateProgress(1);
      setGeneratedUrl(result.imageUrl);
      setGeneratedChart(null);
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
      setGenerateProgress(0);
    } finally {
      setGenerating(false);
    }
  }, [
    analysis.tier,
    fontOverrides,
    hairInspoUrl,
    isAdmin,
    manifestTestMode,
    previewPhotoUrl,
    resolvedAnalysis,
    slotOverrides,
    usageState?.unlimited,
    clientPreviewUrl,
  ]);

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

  const handleSaveDebugLayout = useCallback(() => {
    saveHairstyleAnalysisTierDebug(analysis.tier, {
      slotOverrides,
      textOverrides,
      fontOverrides,
    });
    setDebugSaveMessage(`Saved layout for ${formatHairstyleAnalysisTierLabel(analysis.tier)}`);
    window.setTimeout(() => setDebugSaveMessage(null), 2500);
  }, [analysis.tier, fontOverrides, slotOverrides, textOverrides]);

  const handleResetDebugLayout = useCallback(() => {
    clearHairstyleAnalysisTierDebug(analysis.tier);
    setSlotOverrides({});
    setTextOverrides({});
    setFontOverrides({});
    setDebugSaveMessage(`Reset ${formatHairstyleAnalysisTierLabel(analysis.tier)} to defaults`);
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
                  {formatHairstyleAnalysisTierLabel(tier)}
                </option>
              ))}
            </select>
          </label>
        ) : usageState?.analysisTier ? (
          <p className="text-[9px] uppercase tracking-[0.1em] text-[#808080]">
            Your card tier: {formatHairstyleAnalysisTierLabel(usageState.analysisTier as AnalysisTier)}
          </p>
        ) : null}

        {isAdmin ? (
          <div className="flex flex-col gap-3 border border-black/15 p-3">
            <label className="flex items-center gap-2 text-[10px] uppercase tracking-[0.14em] text-[#808080]">
              <input
                type="checkbox"
                checked={manifestTestMode}
                onChange={(e) => {
                  const enabled = e.target.checked;
                  setManifestTestMode(enabled);
                  saveManifestTestModeEnabled(enabled);
                }}
                disabled={generating}
              />
              Use manifest test picker (exact specs — no shuffle)
            </label>
            {manifestTestMode ? (
              <ManifestSpecPicker
                tier={analysis.tier}
                topMatch={topManifest}
                additionalLooks={altManifests}
                onTopMatchChange={(draft) => {
                  setTopManifest(draft);
                  setGeneratedUrl(null);
                  setLastPrompt(null);
                }}
                onAdditionalLookChange={(index, draft) => {
                  setAltManifests((prev) => {
                    const next = [...prev];
                    next[index] = draft;
                    return next;
                  });
                  setGeneratedUrl(null);
                  setLastPrompt(null);
                }}
                onResetDefaults={() => {
                  clearManifestForTier(analysis.tier);
                  const limit = additionalLooksLimit(analysis.tier);
                  setTopManifest(defaultTopMatchManifest());
                  setAltManifests(defaultAdditionalManifests().slice(0, limit));
                  setGeneratedUrl(null);
                  setLastPrompt(null);
                }}
              />
            ) : null}
          </div>
        ) : null}

        {onClientPreviewUrlChange ? (
          consultDebugMode ? (
            <div className="flex flex-col gap-3">
              <p className="text-[9px] uppercase tracking-[0.12em] text-[#808080] leading-relaxed">
                Wig consult debug — upload <span className="text-black">two photos</span> (selfie + hair inspo).
                Template analysis tiers below use client preview only.
              </p>

              <div className="border border-black/20 p-3 flex flex-col gap-2">
                <p className="text-[10px] uppercase tracking-[0.14em] text-black font-medium">
                  1. Your selfie
                  <span className="text-[#eb1c24]">*</span>
                </p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*,image/heic,image/heif,.heic,.heif"
                  className="hidden"
                  onChange={(e) => void onPhotoSelected(e)}
                />
                {previewPhotoUrl ? (
                  <img
                    src={previewPhotoUrl}
                    alt=""
                    className="w-[72px] h-24 object-cover border border-black mx-auto block"
                  />
                ) : null}
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={generating}
                  className="border border-black bg-white px-3 py-2 text-[10px] uppercase tracking-[0.14em] text-black disabled:opacity-40"
                >
                  {previewPhotoUrl ? 'Replace selfie' : 'Choose selfie'}
                </button>
                <label className="flex flex-col gap-1 text-[10px] uppercase tracking-[0.14em] text-[#808080]">
                  Or paste selfie URL
                  <input
                    type="text"
                    value={clientPreviewUrl ?? analysis.clientPreviewUrl}
                    onChange={(e) => {
                      onClientPreviewUrlChange(e.target.value);
                      setGeneratedUrl(null);
                      setGeneratedChart(null);
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

              <div className="border border-black/20 p-3 flex flex-col gap-2">
                <p className="text-[10px] uppercase tracking-[0.14em] text-black font-medium">
                  2. Hair inspo
                  <span className="text-[#eb1c24]">*</span>
                </p>
                <input
                  ref={inspoFileInputRef}
                  type="file"
                  accept="image/*,image/heic,image/heif,.heic,.heif"
                  className="hidden"
                  onChange={(e) => void onInspoSelected(e)}
                />
                {hairInspoUrl ? (
                  <img
                    src={hairInspoUrl}
                    alt=""
                    className="w-[72px] h-24 object-cover border border-black mx-auto block"
                  />
                ) : null}
                <button
                  type="button"
                  onClick={() => inspoFileInputRef.current?.click()}
                  disabled={generating}
                  className="border border-black bg-white px-3 py-2 text-[10px] uppercase tracking-[0.14em] text-black disabled:opacity-40"
                >
                  {hairInspoUrl ? 'Replace hair inspo' : 'Choose hair inspo'}
                </button>
                <label className="flex flex-col gap-1 text-[10px] uppercase tracking-[0.14em] text-[#808080]">
                  Or paste inspo URL
                  <input
                    type="text"
                    value={hairInspoUrl ?? ''}
                    onChange={(e) => {
                      setHairInspoUrl(e.target.value.trim() || null);
                      setInspoUploadError(null);
                      setGeneratedUrl(null);
                      setGeneratedChart(null);
                      setLastPrompt(null);
                    }}
                    disabled={generating}
                    className="border border-black bg-white px-2 py-2 text-black text-[11px]"
                    placeholder="/assets/… or https://…"
                  />
                </label>
                {inspoUploadError ? (
                  <p className="text-[9px] uppercase tracking-[0.1em] text-[#eb1c24]">{inspoUploadError}</p>
                ) : null}
              </div>
            </div>
          ) : (
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
          )
        ) : null}

        <button
          type="button"
          onClick={() => void handleGenerate()}
          disabled={!canGenerate}
          className="w-full py-3 border border-black uppercase disabled:opacity-40"
          style={{ fontFamily: '"Futura PT Medium"', fontSize: '11px', color: '#FFFFFF', backgroundColor: '#EB1C24' }}
        >
          {generating
            ? consultDebugMode
              ? 'GENERATING CONSULT STYLE CHART…'
              : 'GENERATING WITH GPT IMAGE 2…'
            : consultDebugMode
              ? 'GENERATE CONSULT STYLE CHART (SELFIE + INSPO)'
              : 'GENERATE TEMPLATE PREVIEW (GPT IMAGE 2 · 4:5 · 2K)'}
        </button>

        <p className="text-[9px] uppercase tracking-[0.1em] text-[#808080] leading-relaxed">
          {consultDebugMode
            ? 'Uses the wig consult pipeline (selfie + inspo → exact hairstyle on you, then color-only alternates). Template overlay below matches 1 pick / 4 pick layout for slot QA only.'
            : 'Sends the static Supabase template + client photo to Fal with the tier population prompt. This is the client-facing card — not the React text overlay composer.'}
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
        <AnalysisGenerateProgressOverlay
          label={
            consultDebugMode
              ? `GPT IMAGE 2 IS BUILDING THE ${formatHairstyleAnalysisTierLabel(analysis.tier).toUpperCase()} CONSULT CHART`
              : `GPT IMAGE 2 IS POPULATING THE ${formatHairstyleAnalysisTierLabel(analysis.tier).toUpperCase()} TEMPLATE`
          }
          progress={generateProgress}
        />
      ) : generatedChart ? (
        <div ref={generatedRef} className="w-full shadow-lg border border-black/10 p-3 flex flex-col gap-3">
          <p className="text-[10px] uppercase tracking-[0.12em] text-black text-center">
            {generatedChart.title}
            {generatedChart.subtitle ? ` · ${generatedChart.subtitle}` : ''}
          </p>
          <div className="grid grid-cols-2 gap-2">
            {generatedChart.cells.map((cell) => (
              <div key={cell.id} className="flex flex-col gap-1">
                {cell.imageUrl ? (
                  <img src={cell.imageUrl} alt="" className="w-full aspect-[3/4] object-cover border border-black/10" />
                ) : (
                  <div className="w-full aspect-[3/4] border border-black/10 bg-black/5" />
                )}
                <p className="text-[8px] uppercase tracking-[0.1em] text-[#808080] text-center leading-snug">
                  {cell.subtitle ?? cell.color ?? cell.role}
                </p>
              </div>
            ))}
          </div>
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
                    Drag slot handles to reposition overlay previews. OVERALL SCORE % and MATCH RATING stars
                    are Fal in-image only — no React text overlay. Save layout persists debug positions for
                    the tier. Fal generates TOP MATCH photo: bg removed, 9:16 centered, bottom-anchored,
                    symmetrical bottom fade into marble, plus a subtle low-opacity mirror reflection below
                    the fade (server-composited).
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
