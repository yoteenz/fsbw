import type { BawTutorialSelections } from '../constants/bawTutorialConfig';
import {
  BAW_TUTORIAL_DEFAULT_SELECTIONS,
  resolveBawTutorialUnitLabelFromPathname,
} from '../constants/bawTutorialConfig';
import {
  bawStaticMannequinFrontReferencePathFromUnitAndHairline,
  NOIR_NATURAL_FRONT_MANNEQUIN_DISPLAY_SCALE,
  isNoirNaturalFrontMannequinSrc,
} from './bawStaticMannequinReferencePaths';
import {
  BAW_SLAY_CARD_SLAYER_LOGO_SRC,
  BAW_SLAY_CARD_TEMPLATE_SRC,
  DEFAULT_BAW_SLAY_CARD_LAYOUT,
  getActiveBawSlayCardLayout,
  normalizeBawSlayCardLayout,
  type BawSlayCardLayout,
  type BawSlayCardTextStyle,
} from './bawSlayCardLayout';

export { BAW_SLAY_CARD_TEMPLATE_SRC, BAW_SLAY_CARD_SLAYER_LOGO_SRC } from './bawSlayCardLayout';
export type { BawSlayCardLayout } from './bawSlayCardLayout';

export type BawSlayCardSelections = BawTutorialSelections & {
  lace: string;
  texture: string;
  hairline: string;
  addOns: string[];
};

const BAW_SLAY_CARD_CAP_SIZE_DISPLAY: Record<string, string> = {
  XS: 'EXTRA SMALL',
  S: 'SMALL',
  M: 'MEDIUM',
  L: 'LARGE',
  'XXS/XS/S': 'XXS/XS/S',
  'S/M/L': 'S/M/L',
};

function formatBawSlayCardCapSizeLine(capSize: string): string {
  const token = capSize.trim().toUpperCase();
  const label = BAW_SLAY_CARD_CAP_SIZE_DISPLAY[token] ?? token;
  return `${label} CAP SIZE`;
}

function readSlayCardScalar(keys: string[], fallback: string): string {
  if (typeof localStorage === 'undefined') return fallback;
  for (const key of keys) {
    const value = localStorage.getItem(key);
    if (value && value.trim()) return value.trim();
  }
  return fallback;
}

function readSlayCardAddOns(): string[] {
  if (typeof localStorage === 'undefined') return [];
  const keys = ['selectedAddOns', 'customizeSelectedAddOns', 'editSelectedAddOns'];
  for (const key of keys) {
    const raw = localStorage.getItem(key);
    if (!raw) continue;
    try {
      const parsed = JSON.parse(raw) as unknown;
      if (Array.isArray(parsed)) {
        return parsed.filter((item): item is string => typeof item === 'string' && item.trim() !== '');
      }
    } catch {
      /* ignore */
    }
  }
  return [];
}

/** Detail lines under the unit name — value first, label second; styling omitted when NONE. */
export function buildBawSlayCardSpecLines(selections: BawSlayCardSelections): string[] {
  const lines = [
    `${selections.length} LENGTH`,
    `${selections.density} DENSITY`,
    `${selections.color} COLOR`,
    `${selections.lace} LACE`,
    `${selections.texture} TEXTURE`,
    `${selections.hairline} HAIRLINE`,
  ];

  const styling = (selections.styling || '').trim().toUpperCase();
  if (styling && styling !== 'NONE') {
    lines.push(`${styling} STYLING`);
  }

  for (const addOn of selections.addOns) {
    lines.push(`${addOn} ADD-ON`);
  }

  lines.push(formatBawSlayCardCapSizeLine(selections.capSize));
  return lines;
}

export function readBawSlayCardSelectionsFromPathname(pathname: string): BawSlayCardSelections {
  const unit = resolveBawTutorialUnitLabelFromPathname(pathname);
  const isBlanco = unit === 'BLANCO';
  const capSize = readSlayCardScalar(
    ['selectedCapSize', 'customizeSelectedCapSize', 'editSelectedCapSize'],
    BAW_TUTORIAL_DEFAULT_SELECTIONS.capSize
  );
  const length = readSlayCardScalar(
    ['selectedLength', 'customizeSelectedLength', 'editSelectedLength'],
    BAW_TUTORIAL_DEFAULT_SELECTIONS.length
  );
  const density = readSlayCardScalar(
    ['selectedDensity', 'customizeSelectedDensity', 'editSelectedDensity'],
    isBlanco ? '250%' : BAW_TUTORIAL_DEFAULT_SELECTIONS.density
  );
  const color = readSlayCardScalar(
    ['selectedColor', 'customizeSelectedColor', 'editSelectedColor'],
    isBlanco ? 'PLATINUM' : BAW_TUTORIAL_DEFAULT_SELECTIONS.color
  );
  const hairStyling = readSlayCardScalar(
    ['selectedHairStyling', 'customizeSelectedHairStyling', 'editSelectedHairStyling'],
    ''
  );
  const stylingRaw = readSlayCardScalar(
    ['selectedStyling', 'customizeSelectedStyling', 'editSelectedStyling'],
    BAW_TUTORIAL_DEFAULT_SELECTIONS.styling
  );
  const styling = hairStyling || stylingRaw || 'NONE';
  const lace = readSlayCardScalar(['selectedLace', 'customizeSelectedLace', 'editSelectedLace'], '13X6');
  const texture = readSlayCardScalar(
    ['selectedTexture', 'customizeSelectedTexture', 'editSelectedTexture'],
    'SILKY'
  );
  const hairline = readSlayCardScalar(
    ['selectedHairline', 'customizeSelectedHairline', 'editSelectedHairline'],
    'NATURAL'
  );
  const addOns = readSlayCardAddOns();

  return {
    unit,
    capSize,
    length,
    density,
    color,
    styling: styling === '' ? 'NONE' : styling,
    lace,
    texture,
    hairline,
    addOns,
  };
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`Failed to load image: ${src}`));
    img.src = src;
  });
}

async function ensureCanvasFontsReady(layout: BawSlayCardLayout): Promise<void> {
  try {
    if (typeof document === 'undefined' || !document.fonts?.load) return;
    const { header, textPanel } = layout;
    await Promise.all([
      document.fonts.load(fontFromStyle(header.frontal)),
      document.fonts.load(fontFromStyle(header.subtitle)),
      document.fonts.load(fontFromStyle(textPanel.unit)),
      document.fonts.load(fontFromStyle(textPanel.footer)),
      document.fonts.load(
        `${textPanel.specsFontWeight} ${textPanel.specsFontSize}px ${textPanel.specsFontFamily}`
      ),
    ]);
    await document.fonts.ready;
  } catch {
    /* optional */
  }
}

function fontFromStyle(style: BawSlayCardTextStyle): string {
  return `${style.fontWeight} ${style.fontSize}px ${style.fontFamily}`;
}

function drawMannequinInRect(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  rect: BawSlayCardLayout['mannequin'],
  extraScale = 1
): void {
  const scale = Math.min(rect.width / img.width, rect.height / img.height) * extraScale;
  const dw = img.width * scale;
  const dh = img.height * scale;
  const dx = rect.x + (rect.width - dw) / 2;
  const dy = rect.y + (rect.height - dh) / 2;
  ctx.drawImage(img, dx, dy, dw, dh);
}

/** Returns fitted mannequin draw bounds (for debug hit-testing / handles). */
export function computeBawSlayCardMannequinDrawBounds(
  img: HTMLImageElement,
  layout: BawSlayCardLayout,
  extraScale = 1
): { x: number; y: number; width: number; height: number } {
  const { mannequin: rect } = layout;
  const scale = Math.min(rect.width / img.width, rect.height / img.height) * extraScale;
  const width = img.width * scale;
  const height = img.height * scale;
  return {
    x: rect.x + (rect.width - width) / 2,
    y: rect.y + (rect.height - height) / 2,
    width,
    height,
  };
}

export async function paintBawSlayCard(
  ctx: CanvasRenderingContext2D,
  selections: BawSlayCardSelections,
  layout: BawSlayCardLayout = DEFAULT_BAW_SLAY_CARD_LAYOUT,
  opts?: { hairline?: string; mannequinSrc?: string }
): Promise<{ mannequinBounds: { x: number; y: number; width: number; height: number } | null }> {
  const resolvedLayout = normalizeBawSlayCardLayout(layout);
  const { canvasWidth, canvasHeight } = resolvedLayout;
  ctx.clearRect(0, 0, canvasWidth, canvasHeight);

  await ensureCanvasFontsReady(resolvedLayout);

  const template = await loadImage(BAW_SLAY_CARD_TEMPLATE_SRC);
  ctx.drawImage(template, 0, 0, canvasWidth, canvasHeight);

  const hairline = opts?.hairline || selections.hairline || 'NATURAL';
  const mannequinSrc =
    opts?.mannequinSrc ||
    bawStaticMannequinFrontReferencePathFromUnitAndHairline(selections.unit, hairline);
  const noirFrontScale = isNoirNaturalFrontMannequinSrc(mannequinSrc)
    ? NOIR_NATURAL_FRONT_MANNEQUIN_DISPLAY_SCALE
    : 1;

  let mannequinBounds: { x: number; y: number; width: number; height: number } | null = null;
  try {
    const mannequin = await loadImage(mannequinSrc);
    drawMannequinInRect(ctx, mannequin, resolvedLayout.mannequin, noirFrontScale);
    mannequinBounds = computeBawSlayCardMannequinDrawBounds(mannequin, resolvedLayout, noirFrontScale);
  } catch {
    ctx.fillStyle = 'rgba(255, 255, 255, 0.35)';
    ctx.fillRect(
      resolvedLayout.mannequin.x,
      resolvedLayout.mannequin.y,
      resolvedLayout.mannequin.width,
      resolvedLayout.mannequin.height
    );
  }

  ctx.textAlign = 'center';
  ctx.textBaseline = 'alphabetic';

  const { header, textPanel } = resolvedLayout;

  ctx.fillStyle = header.frontal.color;
  ctx.font = fontFromStyle(header.frontal);
  ctx.fillText('FRONTAL', header.frontal.x, header.frontal.y);

  try {
    const slayerLogoImg = await loadImage(BAW_SLAY_CARD_SLAYER_LOGO_SRC);
    const logo = header.slayerLogo;
    ctx.drawImage(slayerLogoImg, logo.x, logo.y, logo.width, logo.height);
  } catch {
    const fallback = DEFAULT_BAW_SLAY_CARD_LAYOUT.header.slayerLogo;
    try {
      const slayerLogoImg = await loadImage(BAW_SLAY_CARD_SLAYER_LOGO_SRC);
      ctx.drawImage(slayerLogoImg, fallback.x, fallback.y, fallback.width, fallback.height);
    } catch {
      ctx.fillStyle = '#EB1C24';
      ctx.font = '600 46px "Futura PT Demi", Futura, sans-serif';
      ctx.fillText('SLAYER', header.frontal.x, header.frontal.y + 52);
    }
  }

  ctx.fillStyle = header.subtitle.color;
  ctx.font = fontFromStyle(header.subtitle);
  ctx.fillText('PERSONAL BUILD-A-WIG SLAY CARD', header.subtitle.x, header.subtitle.y);

  const specLines = buildBawSlayCardSpecLines(selections);

  ctx.fillStyle = textPanel.unit.color;
  ctx.font = fontFromStyle(textPanel.unit);
  ctx.fillText(selections.unit.toUpperCase(), textPanel.unit.x, textPanel.unit.y);

  ctx.fillStyle = textPanel.specsColor;
  ctx.font = `${textPanel.specsFontWeight} ${textPanel.specsFontSize}px ${textPanel.specsFontFamily}`;
  let y = textPanel.specsStartY;
  for (const line of specLines) {
    ctx.fillText(line.toUpperCase(), textPanel.unit.x, y);
    y += textPanel.lineHeight;
  }

  ctx.fillStyle = textPanel.footer.color;
  ctx.font = fontFromStyle(textPanel.footer);
  ctx.fillText('PURCHASE THIS CUSTOM DESIGNED UNIT WITH YOUR PREMIUM MEMBERSHIP.', textPanel.footer.x, textPanel.footer.y);

  return { mannequinBounds };
}

export async function renderBawSlayCardPng(
  selections: BawSlayCardSelections,
  layout?: BawSlayCardLayout
): Promise<Blob> {
  const resolvedLayout = layout ?? getActiveBawSlayCardLayout();
  const canvas = document.createElement('canvas');
  canvas.width = resolvedLayout.canvasWidth;
  canvas.height = resolvedLayout.canvasHeight;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas not supported');

  await ensureCanvasFontsReady(resolvedLayout);
  await paintBawSlayCard(ctx, selections, resolvedLayout, { hairline: selections.hairline });

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) resolve(blob);
        else reject(new Error('Could not export slay card'));
      },
      'image/png',
      0.92
    );
  });
}

export async function shareOrDownloadBawSlayCard(
  blob: Blob,
  filename = 'frontal-slayer-slay-card.png'
): Promise<'shared' | 'downloaded'> {
  const file = new File([blob], filename, { type: 'image/png' });
  if (typeof navigator !== 'undefined' && navigator.share) {
    try {
      if (!navigator.canShare || navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: 'My Frontal Slayer look',
          text: 'Built with Build-A-Wig View',
        });
        return 'shared';
      }
    } catch (err) {
      if (err instanceof DOMException && err.name === 'AbortError') {
        throw err;
      }
    }
  }

  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
  return 'downloaded';
}
