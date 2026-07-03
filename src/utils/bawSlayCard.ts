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
  BAW_SLAY_CARD_TEMPLATE_SRC,
  DEFAULT_BAW_SLAY_CARD_LAYOUT,
  type BawSlayCardLayout,
  type BawSlayCardTextStyle,
} from './bawSlayCardLayout';

export { BAW_SLAY_CARD_TEMPLATE_SRC } from './bawSlayCardLayout';
export type { BawSlayCardLayout } from './bawSlayCardLayout';

export function readBawSlayCardSelectionsFromPathname(pathname: string): BawTutorialSelections {
  const unit = resolveBawTutorialUnitLabelFromPathname(pathname);
  const isBlanco = unit === 'BLANCO';
  const capSize =
    localStorage.getItem('selectedCapSize') ||
    localStorage.getItem('customizeSelectedCapSize') ||
    BAW_TUTORIAL_DEFAULT_SELECTIONS.capSize;
  const length =
    localStorage.getItem('selectedLength') ||
    localStorage.getItem('customizeSelectedLength') ||
    BAW_TUTORIAL_DEFAULT_SELECTIONS.length;
  const density =
    localStorage.getItem('selectedDensity') ||
    localStorage.getItem('customizeSelectedDensity') ||
    (isBlanco ? '250%' : BAW_TUTORIAL_DEFAULT_SELECTIONS.density);
  const color =
    localStorage.getItem('selectedColor') ||
    localStorage.getItem('customizeSelectedColor') ||
    (isBlanco ? 'PLATINUM' : BAW_TUTORIAL_DEFAULT_SELECTIONS.color);
  const hairStyling =
    localStorage.getItem('selectedHairStyling') ||
    localStorage.getItem('customizeSelectedHairStyling') ||
    '';
  const stylingRaw =
    localStorage.getItem('selectedStyling') ||
    localStorage.getItem('customizeSelectedStyling') ||
    BAW_TUTORIAL_DEFAULT_SELECTIONS.styling;
  const styling = hairStyling.trim() || stylingRaw || 'NONE';

  return {
    unit,
    capSize,
    length,
    density,
    color,
    styling: styling === '' ? 'NONE' : styling,
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

async function ensureCanvasFontsReady(): Promise<void> {
  try {
    if (typeof document !== 'undefined' && document.fonts?.ready) {
      await document.fonts.ready;
    }
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
  selections: BawTutorialSelections,
  layout: BawSlayCardLayout = DEFAULT_BAW_SLAY_CARD_LAYOUT,
  opts?: { hairline?: string; mannequinSrc?: string }
): Promise<{ mannequinBounds: { x: number; y: number; width: number; height: number } | null }> {
  const { canvasWidth, canvasHeight } = layout;
  ctx.clearRect(0, 0, canvasWidth, canvasHeight);

  const template = await loadImage(BAW_SLAY_CARD_TEMPLATE_SRC);
  ctx.drawImage(template, 0, 0, canvasWidth, canvasHeight);

  const hairline =
    opts?.hairline ||
    (typeof localStorage !== 'undefined'
      ? localStorage.getItem('selectedHairline') ||
        localStorage.getItem('customizeSelectedHairline') ||
        'NATURAL'
      : 'NATURAL');
  const mannequinSrc =
    opts?.mannequinSrc ||
    bawStaticMannequinFrontReferencePathFromUnitAndHairline(selections.unit, hairline);
  const noirFrontScale = isNoirNaturalFrontMannequinSrc(mannequinSrc)
    ? NOIR_NATURAL_FRONT_MANNEQUIN_DISPLAY_SCALE
    : 1;

  let mannequinBounds: { x: number; y: number; width: number; height: number } | null = null;
  try {
    const mannequin = await loadImage(mannequinSrc);
    drawMannequinInRect(ctx, mannequin, layout.mannequin, noirFrontScale);
    mannequinBounds = computeBawSlayCardMannequinDrawBounds(mannequin, layout, noirFrontScale);
  } catch {
    ctx.fillStyle = 'rgba(255, 255, 255, 0.35)';
    ctx.fillRect(layout.mannequin.x, layout.mannequin.y, layout.mannequin.width, layout.mannequin.height);
  }

  ctx.textAlign = 'center';
  ctx.textBaseline = 'alphabetic';

  const { header, textPanel } = layout;

  ctx.fillStyle = header.frontal.color;
  ctx.font = fontFromStyle(header.frontal);
  ctx.fillText('FRONTAL', header.frontal.x, header.frontal.y);

  ctx.fillStyle = header.slayer.color;
  ctx.font = fontFromStyle(header.slayer);
  ctx.fillText('SLAYER', header.slayer.x, header.slayer.y);

  ctx.fillStyle = header.subtitle.color;
  ctx.font = fontFromStyle(header.subtitle);
  ctx.fillText('SLAY CARD — BUILD-A-WIG VIEW', header.subtitle.x, header.subtitle.y);

  const specLines = [
    `LENGTH ${selections.length}`,
    `DENSITY ${selections.density}`,
    `COLOR ${selections.color}`,
    `STYLING ${selections.styling}`,
    `CAP ${selections.capSize}`,
  ];

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
  ctx.fillText('TRY THE FULL BUILDER WITH MEMBERSHIP', textPanel.footer.x, textPanel.footer.y);

  return { mannequinBounds };
}

export async function renderBawSlayCardPng(
  selections: BawTutorialSelections,
  layout: BawSlayCardLayout = DEFAULT_BAW_SLAY_CARD_LAYOUT
): Promise<Blob> {
  const canvas = document.createElement('canvas');
  canvas.width = layout.canvasWidth;
  canvas.height = layout.canvasHeight;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas not supported');

  await ensureCanvasFontsReady();
  await paintBawSlayCard(ctx, selections, layout);

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
