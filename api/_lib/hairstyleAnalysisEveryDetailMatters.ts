/**
 * Build every-detail-matters bullets from TOP MATCH spec values + client features.
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
  faceShape: 'FEATURES',
  eyeDescriptor: 'ALMOND',
};

type SpecKey = 'lace' | 'color' | 'texture' | 'style' | 'length' | 'density' | 'part' | 'hairline';

const FIVE_LINE_SPEC_ORDER: SpecKey[] = ['lace', 'color', 'texture', 'style', 'length'];

function lacePhrase(lace: string): string {
  const normalized = displayLace(lace);
  if (/\bHD\b/.test(normalized)) return 'HD LACE';
  return normalized.includes('LACE') ? normalized : `${normalized} LACE`;
}

function lineForSpec(
  key: SpecKey,
  look: EveryDetailMattersLook,
  face: Required<EveryDetailMattersFaceFeatures>
): string {
  const unit = look.unit.trim().toUpperCase();
  const color = look.color.trim().toUpperCase();
  const style = displayStyle(look.styling, look.unit);
  const length = displayLength(look.length);
  const density = displayDensity(look.density);
  const part = displayPart(look.part);
  const hairline = displayHairline(look.hairline);

  switch (key) {
    case 'lace':
      return `${lacePhrase(look.lace)} FOR AN ULTRA REALISTIC FINISH`;
    case 'color':
      return `${color} TO COMPLEMENT YOUR ${face.eyeDescriptor} EYES`;
    case 'texture':
      return `${unit} TO FRAME YOUR ${face.faceShape}`;
    case 'style':
      return style === 'NONE'
        ? `${unit} TO COMPLEMENT YOUR ${face.faceShape}`
        : `${style} TO ENHANCE YOUR JAWLINE`;
    case 'length':
      return `${length} FOR A FLATTERING MID CHEST FALL`;
    case 'density':
      return `${density} DENSITY FOR BALANCED FULLNESS`;
    case 'part':
      return `${part} PART TO FRAME YOUR FEATURES`;
    case 'hairline':
      return `${hairline} HAIRLINE FOR A SEAMLESS LACE BLEND`;
    default:
      return `${unit} FOR YOUR ${face.faceShape}`;
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
  const order = FIVE_LINE_SPEC_ORDER.slice(0, Math.min(lineCount, FIVE_LINE_SPEC_ORDER.length));
  const lines = order.map((key) => lineForSpec(key, look, face));
  return compactEveryDetailMattersLines(lines);
}
