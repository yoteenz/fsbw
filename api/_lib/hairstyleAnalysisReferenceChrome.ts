import { clearableValueRects } from './hairstyleAnalysisCardBlueprint.js';
import { CARD_CANVAS } from './hairstyleAnalysisCardBlueprint.js';
import { fetchImageBuffer } from './hairstyleAnalysisCompositeElements.js';
import type { FalHairstyleAnalysis } from './hairstyleAnalysisFalPrompt.js';

function escapeXml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/** Frosted patches over dotted value lines on the reference template before dynamic text. */
function buildValueClearMaskSvg(rects: Array<{ left: number; top: number; width: number; height: number }>): Buffer {
  const pads = rects.map((rect) => {
    const pad = 4;
    const x = Math.max(0, rect.left - pad);
    const y = Math.max(0, rect.top - pad);
    const w = rect.width + pad * 2;
    const h = rect.height + pad * 2;
    return `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="4" fill="rgba(255,252,252,0.88)"/>`;
  });
  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${CARD_CANVAS.width}" height="${CARD_CANVAS.height}">
${pads.join('\n')}
</svg>`;
  return Buffer.from(svg);
}

/**
 * Load tier reference PNG (marble + acrylic + labels + footer baked in).
 * Optionally masks dotted placeholder lines in value slots.
 */
export async function renderReferenceTemplateBase(
  templateUrl: string,
  siteOrigin: string,
  analysis?: FalHairstyleAnalysis
): Promise<Buffer> {
  const sharp = (await import('sharp')).default;
  const baseBuf = await fetchImageBuffer(templateUrl, siteOrigin);

  if (!analysis) {
    return sharp(baseBuf).png().toBuffer();
  }

  const clearRects = clearableValueRects(analysis);
  if (clearRects.length === 0) {
    return sharp(baseBuf).png().toBuffer();
  }

  const maskSvg = buildValueClearMaskSvg(clearRects);
  const maskPng = await sharp(maskSvg).png().toBuffer();
  return sharp(baseBuf).composite([{ input: maskPng, left: 0, top: 0 }]).png().toBuffer();
}
