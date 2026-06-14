import type { CartItem } from '../types/cart';
import type { StyleAnalysisComparisonTier } from '../types/styleAnalysis';

/** Inputs for `POST /api/consult-style-analysis-generate` from a consult cart line or order row. */
export type ConsultStyleAnalysisGenerateInputs = {
  selfieDataUrl: string;
  inspoDataUrl: string;
  comparisonCount: StyleAnalysisComparisonTier;
};

type ConsultLineLike = {
  consultStyleAnalysisSelfieUrl?: string;
  consultStyleAnalysisComparisonCount?: number;
  bookingInspoPhotoUrls?: string[];
};

export function consultStyleAnalysisInputsFromLine(
  line: ConsultLineLike | null | undefined
): ConsultStyleAnalysisGenerateInputs | null {
  if (!line) return null;
  const selfie = String(line.consultStyleAnalysisSelfieUrl || '').trim();
  const inspoUrls = Array.isArray(line.bookingInspoPhotoUrls)
    ? line.bookingInspoPhotoUrls.filter((u): u is string => typeof u === 'string' && u.trim().length > 0)
    : [];
  const inspo = inspoUrls[0]?.trim() || '';
  const count = line.consultStyleAnalysisComparisonCount;
  if (!selfie.startsWith('data:image/') && !selfie.startsWith('http')) return null;
  if (!inspo.startsWith('data:image/') && !inspo.startsWith('http') && !inspo.startsWith('/')) return null;
  if (count !== 1 && count !== 4) return null;
  return {
    selfieDataUrl: selfie,
    inspoDataUrl: inspo,
    comparisonCount: count,
  };
}

export function consultStyleAnalysisInputsFromCartItem(
  item: CartItem | null | undefined
): ConsultStyleAnalysisGenerateInputs | null {
  if (item?.type !== 'booking-consult') return null;
  return consultStyleAnalysisInputsFromLine(item);
}
