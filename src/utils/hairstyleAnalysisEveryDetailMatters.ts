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
  /** Flattering only — e.g. HEART SHAPED FACE */
  faceShape?: string;
  /** e.g. BLACK ALMOND */
  eyeDescriptor?: string;
};

export const KATEENA_DEMO_FACE_FEATURES: EveryDetailMattersFaceFeatures = {
  faceShape: 'HEART SHAPED FACE',
  eyeDescriptor: 'BLACK ALMOND',
};

const DEFAULT_FACE: Required<EveryDetailMattersFaceFeatures> = {
  faceShape: 'FEATURES',
  eyeDescriptor: 'ALMOND',
};

export type EveryDetailSpecKey =
  | 'texture'
  | 'color'
  | 'length'
  | 'lace'
  | 'density'
  | 'part'
  | 'hairline'
  | 'style';

export const EVERY_DETAIL_SPEC_COLUMN_ORDER: EveryDetailSpecKey[] = [
  'texture',
  'color',
  'length',
  'lace',
  'density',
  'part',
  'hairline',
  'style',
];

export const FREE_TIER_EVERY_DETAIL_SPEC_ORDER: EveryDetailSpecKey[] = [
  'lace',
  'color',
  'texture',
  'style',
  'length',
];

const SPEC_MANIFEST_LABEL: Record<EveryDetailSpecKey, string> = {
  texture: 'TEXTURE',
  color: 'COLOR',
  length: 'LENGTH',
  lace: 'LACE',
  density: 'DENSITY',
  part: 'PART',
  hairline: 'HAIRLINE',
  style: 'STYLE',
};

export function everyDetailMattersSpecKeys(lineCount = 5): EveryDetailSpecKey[] {
  return FREE_TIER_EVERY_DETAIL_SPEC_ORDER.slice(
    0,
    Math.min(lineCount, FREE_TIER_EVERY_DETAIL_SPEC_ORDER.length)
  );
}

export function specManifestLabel(key: EveryDetailSpecKey): string {
  return SPEC_MANIFEST_LABEL[key];
}

export function specValueFromLook(look: AnalysisLook, key: EveryDetailSpecKey): string {
  switch (key) {
    case 'texture':
      return look.unit.trim().toUpperCase();
    case 'color':
      return look.color.trim().toUpperCase();
    case 'length':
      return displayLength(look);
    case 'lace':
      return displayLace(look);
    case 'density':
      return displayDensity(look);
    case 'part':
      return displayPart(look);
    case 'hairline':
      return displayHairline(look);
    case 'style':
      return displayStyle(look);
    default:
      return look.unit.trim().toUpperCase();
  }
}

function lacePhrase(lace: string): string {
  const normalized = displayLace({ lace } as AnalysisLook);
  if (/\bHD\b/.test(normalized)) return 'HD LACE';
  return normalized.includes('LACE') ? normalized : `${normalized} LACE`;
}

function lengthInches(length: string): number | null {
  const match = displayLength({ length } as AnalysisLook).match(/(\d+)/);
  return match ? Number.parseInt(match[1], 10) : null;
}

function lineForSpec(
  key: EveryDetailSpecKey,
  look: AnalysisLook,
  face: Required<EveryDetailMattersFaceFeatures>
): string {
  const unit = specValueFromLook(look, 'texture');
  const color = specValueFromLook(look, 'color');
  const style = specValueFromLook(look, 'style');
  const length = specValueFromLook(look, 'length');
  const density = specValueFromLook(look, 'density');
  const part = specValueFromLook(look, 'part');
  const hairline = specValueFromLook(look, 'hairline');
  const inches = lengthInches(look.length);

  switch (key) {
    case 'lace':
      return `${lacePhrase(look.lace)} FOR AN ULTRA REALISTIC FINISH`;
    case 'color':
      return `${color} TO COMPLEMENT YOUR ${face.eyeDescriptor} EYES`;
    case 'texture':
      return `${unit} TO FRAME YOUR ${face.faceShape}`;
    case 'style':
      return style === 'NONE'
        ? `${unit} SILHOUETTE TO SOFTEN YOUR ${face.faceShape}`
        : `${style} TO ENHANCE YOUR JAWLINE`;
    case 'length':
      if (inches !== null && inches >= 28) {
        return `${length} FOR STATEMENT LENGTH ON YOUR ${face.faceShape}`;
      }
      if (inches !== null && inches <= 22) {
        return `${length} FOR A SOFT COLLARBONE GRAZE`;
      }
      return `${length} FOR A FLATTERING MID CHEST FALL`;
    case 'density':
      return `${density} DENSITY FOR BALANCED FULLNESS ON YOUR ${face.faceShape}`;
    case 'part':
      return `${part} PART TO BALANCE YOUR ${face.faceShape}`;
    case 'hairline':
      return `${hairline} HAIRLINE FOR A SEAMLESS ${lacePhrase(look.lace)} BLEND`;
    default:
      return `${unit} SELECTED FOR YOUR ${face.faceShape}`;
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
  const order = everyDetailMattersSpecKeys(lineCount);
  const lines = order.map((key) => lineForSpec(key, look, face));
  return compactEveryDetailMattersLines(lines);
}

export function formatEveryDetailMattersForFal(
  look: AnalysisLook,
  lines: string[]
): string[] {
  const keys = everyDetailMattersSpecKeys(lines.length);
  return lines.map((line, i) => {
    const key = keys[i] ?? keys[keys.length - 1];
    const label = specManifestLabel(key);
    const value = specValueFromLook(look, key);
    return `EVERY DETAIL MATTERS LINE ${i + 1} (TOP MATCH ${label} = ${value}): ${line}`;
  });
}
