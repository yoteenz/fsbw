/**
 * Build every-detail-matters bullets from TOP MATCH spec values + client features.
 * One rose row per spec: catalog value + one fit note — never empowerment fluff.
 */
import {
  compactEveryDetailMattersLines,
  displayDensity,
  displayHairline,
  displayLength,
  displayLace,
  displayPart,
  displayStyle,
} from './hairstyleAnalysisDisplay.js';

export type EveryDetailMattersFaceFeatures = {
  faceShape?: string;
  eyeDescriptor?: string;
};

export type EveryDetailMattersLook = {
  unit: string;
  color: string;
  length: string;
  lace: string;
  density: string;
  hairline: string;
  part: string;
  styling: string;
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

/** Rose rows on free template — one line each, tied to TOP MATCH spec column. */
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

export function specValueFromLook(look: EveryDetailMattersLook, key: EveryDetailSpecKey): string {
  switch (key) {
    case 'texture':
      return look.unit.trim().toUpperCase();
    case 'color':
      return look.color.trim().toUpperCase();
    case 'length':
      return displayLength(look.length);
    case 'lace':
      return displayLace(look.lace);
    case 'density':
      return displayDensity(look.density);
    case 'part':
      return displayPart(look.part);
    case 'hairline':
      return displayHairline(look.hairline);
    case 'style':
      return displayStyle(look.styling, look.unit);
    default:
      return look.unit.trim().toUpperCase();
  }
}

function lacePhrase(lace: string): string {
  const normalized = displayLace(lace);
  if (/\bHD\b/.test(normalized)) return 'HD LACE';
  return normalized.includes('LACE') ? normalized : `${normalized} LACE`;
}

function lengthInches(length: string): number | null {
  const match = displayLength(length).match(/(\d+)/);
  return match ? Number.parseInt(match[1], 10) : null;
}

function hasFaceContext(faceFeatures: EveryDetailMattersFaceFeatures): boolean {
  return Boolean(faceFeatures.faceShape?.trim() || faceFeatures.eyeDescriptor?.trim());
}

function lengthLine(length: string, inches: number | null, faceShape: string, withFace: boolean): string {
  if (inches !== null && inches >= 28) {
    return withFace
      ? `${length} FOR LONG LENGTH ON YOUR ${faceShape}`
      : `${length} FOR LONG INSTALL LENGTH`;
  }
  if (inches !== null && inches <= 22) {
    return `${length} AT COLLARBONE LENGTH`;
  }
  return `${length} AT MID CHEST LENGTH`;
}

/** One row = TOP MATCH catalog spec value + one concrete fit note (not empowerment copy). */
function lineForSpec(
  key: EveryDetailSpecKey,
  look: EveryDetailMattersLook,
  face: Required<EveryDetailMattersFaceFeatures>,
  withFace: boolean
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
      return `MELTED LACE, ${hairline} HAIRLINE`;
    case 'color':
      return withFace
        ? `${color} TO COMPLEMENT YOUR ${face.eyeDescriptor} EYES`
        : `${color} FOR RICH CONTRAST WITH YOUR LOOK`;
    case 'texture':
      return withFace
        ? `${unit} TO FRAME YOUR ${face.faceShape}`
        : `${unit} TEXTURE FOR CLEAN LINES`;
    case 'style':
      return style === 'NONE'
        ? withFace
          ? `${unit} SILHOUETTE FOR YOUR ${face.faceShape}`
          : `${unit} SILHOUETTE FOR CLEAN LINES`
        : `${style} TO ENHANCE YOUR JAWLINE`;
    case 'length':
      return lengthLine(length, inches, face.faceShape, withFace);
    case 'density':
      return `${density} DENSITY FOR INSTALL FULLNESS`;
    case 'part':
      return `${part} PART FOR BALANCED FRAMING`;
    case 'hairline':
      return `${hairline} HAIRLINE FOR A SEAMLESS ${lacePhrase(look.lace)} BLEND`;
    default:
      return `${unit} FOR THIS TOP MATCH`;
  }
}

export function buildEveryDetailMattersFromTopMatch(
  look: EveryDetailMattersLook,
  faceFeatures: EveryDetailMattersFaceFeatures = {},
  lineCount = 5
): string[] {
  const face: Required<EveryDetailMattersFaceFeatures> = {
    ...DEFAULT_FACE,
    ...faceFeatures,
  };
  const withFace = hasFaceContext(faceFeatures);
  const order = everyDetailMattersSpecKeys(lineCount);
  const lines = order.map((key) => lineForSpec(key, look, face, withFace));
  return compactEveryDetailMattersLines(lines);
}

export function everyDetailMattersRowGuide(lineCount = 5): string[] {
  const keys = everyDetailMattersSpecKeys(lineCount);
  return keys.map(
    (key, i) => `Rose row ${i + 1} = TOP MATCH ${specManifestLabel(key)} spec only`
  );
}

/** Fal prompt rows — tie each bullet to the live TOP MATCH manifest value. */
export function formatEveryDetailMattersForFal(
  look: EveryDetailMattersLook,
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
