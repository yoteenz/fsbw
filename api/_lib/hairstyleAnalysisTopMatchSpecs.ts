import {
  displayDensity,
  displayHairline,
  displayLength,
  displayLace,
  displayPart,
  displayStyle,
} from './hairstyleAnalysisDisplay.js';
import { topMatchSpecSlots } from './hairstyleAnalysisLayoutSlots.js';
import { restoreTemplateSlots } from './hairstyleAnalysisTemplateRestore.js';
import {
  buildTextPathsSvg,
  textPathData,
  topMatchSpecValueFontSize,
} from './hairstyleAnalysisTextPaths.js';

const TOP_MATCH_SPEC_BLACK = '#1a1a1a';

export type TopMatchSpecLook = {
  unit: string;
  color: string;
  length: string;
  lace: string;
  density: string;
  part: string;
  hairline: string;
  styling: string;
};

export type TopMatchSpecValueEntry = {
  id: string;
  text: string;
};

export function topMatchSpecValueEntries(look: TopMatchSpecLook): TopMatchSpecValueEntry[] {
  const style = displayStyle(look.styling, look.unit);
  return [
    { id: 'specTexture', text: look.unit.trim().toUpperCase() },
    { id: 'specColor', text: look.color.trim().toUpperCase() },
    { id: 'specLength', text: displayLength(look.length) },
    { id: 'specLace', text: displayLace(look.lace) },
    { id: 'specDensity', text: displayDensity(look.density) },
    { id: 'specParting', text: displayPart(look.part) },
    { id: 'specHairline', text: displayHairline(look.hairline) },
    { id: 'specStyle', text: style },
  ];
}

async function compositeLeftAlignedText(
  baseBuf: Buffer,
  text: string,
  slot: { left: number; top: number; width: number; height: number },
  fontSize: number
): Promise<Buffer> {
  const sharp = (await import('sharp')).default;
  const pathData = textPathData(text, slot, {
    fontFile: 'FuturaPTMedium.ttf',
    fontSize,
    fill: TOP_MATCH_SPEC_BLACK,
    align: 'left',
  });
  const svg = buildTextPathsSvg([{ pathData, fill: TOP_MATCH_SPEC_BLACK }]);
  return sharp(baseBuf)
    .composite([{ input: svg, left: 0, top: 0 }])
    .png()
    .toBuffer();
}

/** Server-composite petite TOP MATCH spec values; wipe Fal placeholder text first. */
export async function compositeTopMatchSpecValues(
  baseBuf: Buffer,
  templateBuf: Buffer,
  look: TopMatchSpecLook
): Promise<Buffer> {
  const slots = topMatchSpecSlots();
  const values = topMatchSpecValueEntries(look);
  const valueById = new Map(values.map((entry) => [entry.id, entry.text]));

  let base = await restoreTemplateSlots(
    baseBuf,
    templateBuf,
    slots.map((slot) => slot.rect)
  );

  for (const slot of slots) {
    const text = valueById.get(slot.id);
    if (!text) continue;
    const fontSize = topMatchSpecValueFontSize(slot.rect);
    base = await compositeLeftAlignedText(base, text, slot.rect, fontSize);
  }

  return base;
}
