/** @deprecated Production uses Supabase reference PNG + value overlays (`hairstyleAnalysisReferenceChrome.ts`). */

import type { AnalysisFontStyle } from './hairstyleAnalysisFonts.js';
import { BRAND_RED, buildTextOverlaySvg, textPathInRect } from './hairstyleAnalysisFonts.js';
import type { CardBlueprint, PanelDef, PixelRect, StaticLabelDef } from './hairstyleAnalysisCardBlueprint.js';
import { CARD_CANVAS, getCardBlueprint } from './hairstyleAnalysisCardBlueprint.js';
import { fetchImageBuffer } from './hairstyleAnalysisCompositeElements.js';
import type { HairstyleAnalysisCardTier } from './hairstyleAnalysisTemplates.js';

const ROSE_PATHS = [
  'M13 4C12.4094 4.13281 11.85 4.27937 11.3219 4.43594C10.0562 4.81094 8.9625 5.28438 8.02812 5.7375C7.425 6.03031 7.20937 6.15969 6.41875 6.61969C4.59375 7.6725 3.5 9.03844 3.5 11.0825C3.5 13.3922 5.2375 15 8 15C10.7625 15 12.5 13.2559 12.5 10.9462C12.5 8.63656 10.5938 7.03875 13 4Z',
  'M8.25 5.63094C7.63469 4.78719 7.05625 4.42188 6.60313 4.175C5.08125 3.34688 3 3 3 3C4.29688 4.36563 4.1625 5.81562 4 7C4 7 3.87906 8.0275 4.05969 8.82531',
  'M11.6248 4.34844C11.142 3.20625 10.4998 2 10.4998 2C10.4998 2 8.52109 2 6.25953 4M7.92109 2.73656C6.91391 1.43156 5.49984 1 5.49984 1C5.02172 1.65 4.60016 2.61187 4.41016 3.31781',
];

function escapeXml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function panelSvg(panel: PanelDef): string {
  const { rect, variant } = panel;
  const { left, top, width, height } = rect;
  const rx = variant === 'thumb-frame' ? 8 : 16;
  const fill =
    variant === 'photo-frame'
      ? 'rgba(255,255,255,0.08)'
      : variant === 'thumb-frame'
        ? 'rgba(255,255,255,0.35)'
        : 'rgba(255,255,255,0.52)';
  const stroke = BRAND_RED;
  const strokeWidth = variant === 'photo-frame' ? 5 : 3;
  return `<rect x="${left}" y="${top}" width="${width}" height="${height}" rx="${rx}" fill="${fill}" stroke="${stroke}" stroke-width="${strokeWidth}" filter="url(#panelGlow)"/>`;
}

function clientPillSvg(rect: PixelRect): string {
  const pad = 6;
  return `<rect x="${rect.left - pad}" y="${rect.top - pad}" width="${rect.width + pad * 2}" height="${rect.height + pad * 2}" rx="28" fill="rgba(255,255,255,0.88)" stroke="${BRAND_RED}" stroke-width="2.5" filter="url(#panelGlow)"/>`;
}

function roseGroup(rect: PixelRect): string {
  const scale = rect.width / 16;
  const paths = ROSE_PATHS.map(
    (d) =>
      `<path d="${d}" transform="translate(${rect.left},${rect.top}) scale(${scale})" fill="none" stroke="${BRAND_RED}" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/>`
  );
  return paths.join('\n');
}

function staticLabelToStyle(style: StaticLabelDef['style']): AnalysisFontStyle {
  if (style === 'futura-red') return 'futura-red';
  if (style === 'covered-red') return 'covered-red';
  return 'futura-black';
}

function buildChromeSvg(blueprint: CardBlueprint): Buffer {
  const panelShapes = blueprint.panels.map(panelSvg).join('\n');
  const clientNameField = blueprint.fields.find((f) => f.id === 'clientName');
  const pill = clientNameField ? clientPillSvg(clientNameField.rect) : '';
  const roses = blueprint.roses.map(roseGroup).join('\n');

  const labelPaths: string[] = [];
  for (const label of blueprint.staticLabels) {
    const path = textPathInRect(label.text, label.rect, staticLabelToStyle(label.style), {
      align: label.align,
      maxFontSize: label.style === 'covered-red' ? 72 : 42,
    });
    if (path) {
      const fill =
        label.style === 'futura-red' || label.style === 'covered-red' ? BRAND_RED : '#1a1a1a';
      labelPaths.push(`<path d="${escapeXml(path)}" fill="${fill}"/>`);
    }
  }

  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${CARD_CANVAS.width}" height="${CARD_CANVAS.height}">
  <defs>
    <filter id="panelGlow" x="-40%" y="-40%" width="180%" height="180%">
      <feDropShadow dx="0" dy="0" stdDeviation="10" flood-color="${BRAND_RED}" flood-opacity="0.55"/>
    </filter>
  </defs>
  ${panelShapes}
  ${pill}
  ${roses}
  ${labelPaths.join('\n')}
</svg>`;
  return Buffer.from(svg);
}

/** Render code-built card chrome (marble + panels + static labels). No dynamic values or photos. */
export async function renderBuiltCardChrome(
  tier: HairstyleAnalysisCardTier,
  siteOrigin: string
): Promise<Buffer> {
  const sharp = (await import('sharp')).default;
  const blueprint = getCardBlueprint(tier);

  const marbleBuf = await fetchImageBuffer('/assets/marble-half.png', siteOrigin);
  const marbleBase = await sharp(marbleBuf)
    .resize(CARD_CANVAS.width, CARD_CANVAS.height, { fit: 'cover', position: 'centre' })
    .png()
    .toBuffer();

  const chromeSvg = buildChromeSvg(blueprint);
  const chromePng = await sharp(chromeSvg).png().toBuffer();

  return sharp(marbleBase).composite([{ input: chromePng, left: 0, top: 0 }]).png().toBuffer();
}

/** Static labels only (for tests / layering). */
export function buildStaticLabelsOverlay(blueprint: CardBlueprint): Buffer {
  const items = blueprint.staticLabels.map((label) => ({
    text: label.text,
    rect: label.rect,
    style: staticLabelToStyle(label.style),
    align: label.align,
  }));
  return buildTextOverlaySvg(items);
}
