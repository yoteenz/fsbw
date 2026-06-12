import type {
  AnalysisTier,
  SlotLayoutOverrides,
  TextContentOverrides,
  TextFontStyleOverrides,
} from '../types/hairstyleAnalysis';

export const HAIRSTYLE_ANALYSIS_LAYOUT_DEBUG_KEY = 'hairstyle_analysis_overlay_debug';

export type HairstyleAnalysisTierDebugState = {
  slotOverrides: SlotLayoutOverrides;
  textOverrides: TextContentOverrides;
  fontOverrides: TextFontStyleOverrides;
};

export type HairstyleAnalysisLayoutDebugFile = Partial<
  Record<AnalysisTier, HairstyleAnalysisTierDebugState>
>;

const EMPTY_TIER_STATE: HairstyleAnalysisTierDebugState = {
  slotOverrides: {},
  textOverrides: {},
  fontOverrides: {},
};

export function loadHairstyleAnalysisLayoutDebug(): HairstyleAnalysisLayoutDebugFile {
  if (typeof window === 'undefined') return {};
  try {
    const raw = localStorage.getItem(HAIRSTYLE_ANALYSIS_LAYOUT_DEBUG_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as HairstyleAnalysisLayoutDebugFile;
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
}

export function loadHairstyleAnalysisTierDebug(tier: AnalysisTier): HairstyleAnalysisTierDebugState {
  const file = loadHairstyleAnalysisLayoutDebug();
  const saved = file[tier];
  if (!saved) return { ...EMPTY_TIER_STATE };
  return {
    slotOverrides: saved.slotOverrides ?? {},
    textOverrides: saved.textOverrides ?? {},
    fontOverrides: saved.fontOverrides ?? {},
  };
}

export function saveHairstyleAnalysisTierDebug(
  tier: AnalysisTier,
  state: HairstyleAnalysisTierDebugState
): void {
  const file = loadHairstyleAnalysisLayoutDebug();
  file[tier] = {
    slotOverrides: state.slotOverrides,
    textOverrides: state.textOverrides,
    fontOverrides: state.fontOverrides,
  };
  localStorage.setItem(HAIRSTYLE_ANALYSIS_LAYOUT_DEBUG_KEY, JSON.stringify(file, null, 2));
}

export function clearHairstyleAnalysisTierDebug(tier: AnalysisTier): void {
  const file = loadHairstyleAnalysisLayoutDebug();
  delete file[tier];
  localStorage.setItem(HAIRSTYLE_ANALYSIS_LAYOUT_DEBUG_KEY, JSON.stringify(file, null, 2));
}

export function formatHairstyleAnalysisDebugForCopy(
  state: HairstyleAnalysisTierDebugState
): string {
  return JSON.stringify(state, null, 2);
}
