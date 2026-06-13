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
import {
  colorLinePool,
  densityLinePool,
  hairlineLinePool,
  laceLinePool,
  lengthLinePool,
  partLinePool,
  styleLinePool,
  textureLinePool,
  type EveryDetailLineBuilder,
  type EveryDetailLineCtx,
} from './hairstyleAnalysisEveryDetailMattersPools';

export type EveryDetailMattersFaceFeatures = {
  faceShape?: string;
  eyeDescriptor?: string;
};

export const KATEENA_DEMO_FACE_FEATURES: EveryDetailMattersFaceFeatures = {
  faceShape: 'HEART SHAPED FACE',
  eyeDescriptor: 'BLACK ALMOND',
};

const DEFAULT_FACE: Required<EveryDetailMattersFaceFeatures> = {
  faceShape: 'FACE SHAPE',
  eyeDescriptor: 'EYE TONE',
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

export function everyDetailVariationSeed(): number {
  return ((Date.now() ^ Math.floor(Math.random() * 0x100000000)) >>> 0);
}

function pickVariantIndex(seed: number, rowIndex: number, count: number): number {
  if (count <= 1) return 0;
  let h = (seed >>> 0) ^ Math.imul(rowIndex + 1, 0x9e3779b9);
  h = Math.imul(h ^ (h >>> 16), 0x85ebca6b);
  h = Math.imul(h ^ (h >>> 13), 0xc2b2ae35);
  return (h >>> 0) % count;
}

function pickLine(seed: number, rowIndex: number, builders: EveryDetailLineBuilder[], ctx: EveryDetailLineCtx): string {
  const idx = pickVariantIndex(seed, rowIndex, builders.length);
  return builders[idx](ctx);
}

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

function hasFaceContext(faceFeatures: EveryDetailMattersFaceFeatures): boolean {
  return Boolean(faceFeatures.faceShape?.trim() || faceFeatures.eyeDescriptor?.trim());
}

function buildLineCtx(
  look: AnalysisLook,
  face: Required<EveryDetailMattersFaceFeatures>,
  withFace: boolean
): EveryDetailLineCtx {
  return {
    unit: specValueFromLook(look, 'texture'),
    color: specValueFromLook(look, 'color'),
    style: specValueFromLook(look, 'style'),
    length: specValueFromLook(look, 'length'),
    density: specValueFromLook(look, 'density'),
    part: specValueFromLook(look, 'part'),
    hairline: specValueFromLook(look, 'hairline'),
    inches: lengthInches(look.length),
    laceLabel: lacePhrase(look.lace),
    face,
    withFace,
  };
}

function lineForSpec(
  key: EveryDetailSpecKey,
  ctx: EveryDetailLineCtx,
  seed: number,
  rowIndex: number
): string {
  switch (key) {
    case 'lace':
      return pickLine(seed, rowIndex, laceLinePool(), ctx);
    case 'color':
      return pickLine(seed, rowIndex, colorLinePool(ctx), ctx);
    case 'texture':
      return pickLine(seed, rowIndex, textureLinePool(ctx), ctx);
    case 'style':
      return pickLine(seed, rowIndex, styleLinePool(ctx), ctx);
    case 'length':
      return pickLine(seed, rowIndex, lengthLinePool(ctx), ctx);
    case 'density':
      return pickLine(seed, rowIndex, densityLinePool(), ctx);
    case 'part':
      return pickLine(seed, rowIndex, partLinePool(), ctx);
    case 'hairline':
      return pickLine(seed, rowIndex, hairlineLinePool(), ctx);
    default:
      return `${ctx.unit} FOR THIS TOP MATCH`;
  }
}

export function buildEveryDetailMattersFromTopMatch(
  look: AnalysisLook,
  faceFeatures: EveryDetailMattersFaceFeatures = {},
  lineCount = 5,
  variationSeed: number = everyDetailVariationSeed()
): string[] {
  const face: Required<EveryDetailMattersFaceFeatures> = {
    ...DEFAULT_FACE,
    ...faceFeatures,
  };
  const withFace = hasFaceContext(faceFeatures);
  const ctx = buildLineCtx(look, face, withFace);
  const order = everyDetailMattersSpecKeys(lineCount);
  const lines = order.map((key, i) => lineForSpec(key, ctx, variationSeed, i));
  return compactEveryDetailMattersLines(lines);
}

export function formatEveryDetailMattersForFal(lines: string[]): string[] {
  return lines.map((line, i) => `EDM ${i + 1}: ${line}`);
}
