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

type LineCtx = {
  unit: string;
  color: string;
  style: string;
  length: string;
  density: string;
  part: string;
  hairline: string;
  inches: number | null;
  laceLabel: string;
  face: Required<EveryDetailMattersFaceFeatures>;
  withFace: boolean;
};

type LineBuilder = (ctx: LineCtx) => string;

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

function pickLine(seed: number, rowIndex: number, builders: LineBuilder[], ctx: LineCtx): string {
  const idx = pickVariantIndex(seed, rowIndex, builders.length);
  return builders[idx](ctx);
}

const LACE_LINES: LineBuilder[] = [
  (c) => `MELTED LACE, ${c.hairline} HAIRLINE`,
  (c) => `${c.hairline} HAIRLINE WITH HD MELT`,
  (c) => `SEAMLESS ${c.hairline} LACE FRONT`,
  (c) => `${c.laceLabel} MELTS INTO ${c.hairline} EDGE`,
  (c) => `INVISIBLE ${c.laceLabel} WITH ${c.hairline} HAIRLINE`,
  (c) => `${c.hairline} EDGE ON ${c.laceLabel}`,
];

const COLOR_LINES: LineBuilder[] = [
  (c) =>
    c.withFace
      ? `${c.color} TO COMPLEMENT YOUR ${c.face.eyeDescriptor} EYES`
      : `${c.color} FOR RICH CONTRAST WITH YOUR LOOK`,
  (c) =>
    c.withFace
      ? `${c.color} HIGHLIGHTS YOUR ${c.face.eyeDescriptor} EYE SHAPE`
      : `${c.color} KEEPS YOUR TONE BALANCED`,
  (c) =>
    c.withFace
      ? `${c.color} BALANCES YOUR ${c.face.eyeDescriptor} EYES`
      : `${c.color} ADDS DEPTH TO YOUR LOOK`,
  (c) =>
    c.withFace
      ? `${c.color} WARMS YOUR ${c.face.eyeDescriptor} EYE LINE`
      : `${c.color} PAIRS CLEANLY WITH YOUR SKIN TONE`,
  (c) =>
    c.withFace
      ? `${c.color} FRAMES YOUR ${c.face.eyeDescriptor} EYES`
      : `${c.color} FOR A POLISHED FINISH`,
  (c) =>
    c.withFace
      ? `${c.color} SOFTENS AGAINST YOUR ${c.face.eyeDescriptor} EYES`
      : `${c.color} FOR INSTALL COLOR HARMONY`,
];

const TEXTURE_LINES: LineBuilder[] = [
  (c) =>
    c.withFace
      ? `${c.unit} TO FRAME YOUR ${c.face.faceShape}`
      : `${c.unit} TEXTURE FOR CLEAN LINES`,
  (c) =>
    c.withFace
      ? `${c.unit} SOFTENS YOUR ${c.face.faceShape}`
      : `${c.unit} STRANDS FOR A POLISHED FINISH`,
  (c) =>
    c.withFace
      ? `${c.unit} BALANCES YOUR ${c.face.faceShape}`
      : `${c.unit} BODY FOR INSTALL FULLNESS`,
  (c) =>
    c.withFace
      ? `${c.unit} ADDS VERTICAL LINE ON YOUR ${c.face.faceShape}`
      : `${c.unit} FOR A SLEEK SILHOUETTE`,
  (c) =>
    c.withFace
      ? `${c.unit} LENGTHENS YOUR ${c.face.faceShape}`
      : `${c.unit} TEXTURE FOR DEFINED STRANDS`,
  (c) =>
    c.withFace
      ? `${c.unit} HUGS YOUR ${c.face.faceShape} NICELY`
      : `${c.unit} FOR NATURAL STRAND FLOW`,
];

function styleLines(ctx: LineCtx): LineBuilder[] {
  if (ctx.style === 'NONE') {
    return [
      (c) =>
        c.withFace
          ? `${c.unit} SILHOUETTE FOR YOUR ${c.face.faceShape}`
          : `${c.unit} SILHOUETTE FOR CLEAN LINES`,
      (c) =>
        c.withFace
          ? `${c.unit} SHAPE SUITS YOUR ${c.face.faceShape}`
          : `${c.unit} FINISH FOR A NATURAL LOOK`,
      (c) =>
        c.withFace
          ? `${c.unit} FLOW ON YOUR ${c.face.faceShape}`
          : `${c.unit} FOR A SOFT NATURAL FINISH`,
    ];
  }
  return [
    (c) => `${c.style} TO ENHANCE YOUR JAWLINE`,
    (c) => `${c.style} POLISHES YOUR JAWLINE`,
    (c) => `${c.style} ADDS STRUCTURE AT YOUR JAWLINE`,
    (c) => `${c.style} KEEPS YOUR JAWLINE SHARP`,
    (c) => `${c.style} DEFINES YOUR JAWLINE CLEANLY`,
    (c) => `${c.style} FOR A SCULPTED JAWLINE`,
  ];
}

function lengthLines(ctx: LineCtx): LineBuilder[] {
  const { inches, face, withFace } = ctx;
  if (inches !== null && inches >= 28) {
    return [
      (c) =>
        withFace
          ? `${c.length} FOR LONG LENGTH ON YOUR ${face.faceShape}`
          : `${c.length} FOR LONG INSTALL LENGTH`,
      (c) =>
        withFace
          ? `${c.length} DRAWS THE EYE DOWN YOUR ${face.faceShape}`
          : `${c.length} FOR EXTRA LONG DRAMA`,
      (c) =>
        withFace
          ? `${c.length} ADDS LENGTH ON YOUR ${face.faceShape}`
          : `${c.length} FOR A LONG SILHOUETTE`,
    ];
  }
  if (inches !== null && inches <= 22) {
    return [
      (c) => `${c.length} AT COLLARBONE LENGTH`,
      (c) => `${c.length} STOPS AT COLLARBONE FOR BALANCE`,
      (c) => `${c.length} FOR A LIGHT COLLARBONE HIT`,
      (c) => `${c.length} LANDS AT COLLARBONE CLEANLY`,
    ];
  }
  return [
    (c) => `${c.length} AT MID CHEST LENGTH`,
    (c) => `${c.length} LANDS AT MID CHEST FOR BALANCE`,
    (c) => `${c.length} HITS MID CHEST WITH CLEAN LINES`,
    (c) => `${c.length} FOR MID CHEST INSTALL LENGTH`,
    (c) =>
      withFace
        ? `${c.length} SITS MID CHEST ON YOUR ${face.faceShape}`
        : `${c.length} FOR MID CHEST DRAMA`,
  ];
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
): LineCtx {
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
  ctx: LineCtx,
  seed: number,
  rowIndex: number
): string {
  switch (key) {
    case 'lace':
      return pickLine(seed, rowIndex, LACE_LINES, ctx);
    case 'color':
      return pickLine(seed, rowIndex, COLOR_LINES, ctx);
    case 'texture':
      return pickLine(seed, rowIndex, TEXTURE_LINES, ctx);
    case 'style':
      return pickLine(seed, rowIndex, styleLines(ctx), ctx);
    case 'length':
      return pickLine(seed, rowIndex, lengthLines(ctx), ctx);
    case 'density':
      return `${ctx.density} DENSITY FOR INSTALL FULLNESS`;
    case 'part':
      return `${ctx.part} PART FOR BALANCED FRAMING`;
    case 'hairline':
      return `${ctx.hairline} HAIRLINE FOR A SEAMLESS ${ctx.laceLabel} BLEND`;
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
