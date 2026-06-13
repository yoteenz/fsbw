/**
 * Build every-detail-matters bullets from TOP MATCH spec values + client features.
 * Client mirror of api/_lib/hairstyleAnalysisEveryDetailMatters.ts — keep in sync.
 */
import type { AnalysisLook } from '../types/hairstyleAnalysis';
import {
  displayDensity,
  displayHairline,
  displayLength,
  displayLace,
  displayPart,
  displayStyle,
} from './hairstyleAnalysisFormat';
import { compactEveryDetailMattersLines } from './hairstyleAnalysisEveryDetailMattersCompact';

export type EveryDetailMattersFaceFeatures = {
  faceShape?: string;
  eyeDescriptor?: string;
  jawline?: string;
  faceLength?: string;
  forehead?: string;
};

export const KATEENA_DEMO_FACE_FEATURES: EveryDetailMattersFaceFeatures = {
  faceShape: 'HEART-SHAPED FACE',
  eyeDescriptor: 'BLACK ALMOND',
  jawline: 'SHARP JAWLINE',
  faceLength: 'LONG FACE',
  forehead: 'HIGH FOREHEAD',
};

const DEFAULT_FACE: Required<EveryDetailMattersFaceFeatures> = {
  faceShape: 'FACE SHAPE',
  eyeDescriptor: 'ALMOND',
  jawline: 'JAWLINE',
  faceLength: 'FACE LENGTH',
  forehead: 'FOREHEAD',
};

type SpecKey = 'lace' | 'color' | 'texture' | 'style' | 'length' | 'density' | 'part' | 'hairline';

/** Five rose rows — each maps to one TOP MATCH spec column value. */
const FIVE_LINE_SPEC_ORDER: SpecKey[] = ['lace', 'color', 'texture', 'style', 'length'];

function lacePhrase(lace: string): string {
  const normalized = displayLace({ lace } as AnalysisLook);
  if (/\bHD\b/.test(normalized)) return 'HD LACE';
  return normalized.includes('LACE') ? normalized : `${normalized} LACE`;
}

function lineForSpec(
  key: SpecKey,
  look: AnalysisLook,
  face: Required<EveryDetailMattersFaceFeatures>
): string {
  const unit = look.unit.trim().toUpperCase();
  const color = look.color.trim().toUpperCase();
  const style = displayStyle(look);
  const length = displayLength(look);
  const density = displayDensity(look);
  const part = displayPart(look);
  const hairline = displayHairline(look);

  switch (key) {
    case 'lace':
      return `${lacePhrase(look.lace)} FOR THE ULTRA REALISTIC FINISH`;
    case 'color':
      return `${color} TO COMPLEMENT YOUR ${face.eyeDescriptor} EYES`;
    case 'texture':
      return `${unit} TO FRAME YOUR ${face.faceShape}`;
    case 'style':
      return style === 'NONE'
        ? `${unit} TO SOFTEN YOUR ${face.jawline}`
        : `${style} TO DEFINE YOUR ${face.jawline}`;
    case 'length':
      return `${length} TO BALANCE YOUR ${face.faceLength}`;
    case 'density':
      return `${density} DENSITY FOR YOUR ${face.faceShape} PROPORTIONS`;
    case 'part':
      return `${part} PART TO OPEN YOUR ${face.forehead}`;
    case 'hairline':
      return `${hairline} HAIRLINE FOR A SEAMLESS LACE BLEND`;
    default:
      return `${unit} FOR YOUR ${face.faceShape}`;
  }
}

export function buildEveryDetailMattersFromTopMatch(
  look: AnalysisLook,
  faceFeatures: EveryDetailMattersFaceFeatures = {},
  lineCount = 5
): string[] {
  const face: Required<EveryDetailMattersFaceFeatures> = {
    ...DEFAULT_FACE,
    ...faceFeatures,
  };
  const order = FIVE_LINE_SPEC_ORDER.slice(0, Math.min(lineCount, FIVE_LINE_SPEC_ORDER.length));
  const lines = order.map((key) => lineForSpec(key, look, face));
  return compactEveryDetailMattersLines(lines);
}
