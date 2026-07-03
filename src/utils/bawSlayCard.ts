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

export const BAW_SLAY_CARD_TEMPLATE_SRC =
  'https://hyycomvcaqxxvyrfupes.supabase.co/storage/v1/object/public/live-preview/Stock%20Content/00C5D5BE-1F40-4974-A2DF-F02616BD231B.png';

const SLAY_CARD_WIDTH = 1122;
const SLAY_CARD_HEIGHT = 1402;

/** Tuned to the stock template display case + bottom plaque. */
const MANNEQUIN_BOX = { x: 252, y: 292, w: 618, h: 748 };
const HEADER = { centerX: SLAY_CARD_WIDTH / 2, frontalY: 118, slayerY: 170, subtitleY: 218 };
const TEXT_PANEL = {
  centerX: SLAY_CARD_WIDTH / 2,
  unitY: 1146,
  specsStartY: 1194,
  lineHeight: 34,
  footerY: 1334,
};

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

function drawMannequinInBox(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  box: typeof MANNEQUIN_BOX,
  extraScale = 1
): void {
  const scale = Math.min(box.w / img.width, box.h / img.height) * extraScale;
  const dw = img.width * scale;
  const dh = img.height * scale;
  const dx = box.x + (box.w - dw) / 2;
  const dy = box.y + (box.h - dh) / 2;
  ctx.drawImage(img, dx, dy, dw, dh);
}

export async function renderBawSlayCardPng(selections: BawTutorialSelections): Promise<Blob> {
  const canvas = document.createElement('canvas');
  canvas.width = SLAY_CARD_WIDTH;
  canvas.height = SLAY_CARD_HEIGHT;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas not supported');

  await ensureCanvasFontsReady();

  const template = await loadImage(BAW_SLAY_CARD_TEMPLATE_SRC);
  ctx.drawImage(template, 0, 0, SLAY_CARD_WIDTH, SLAY_CARD_HEIGHT);

  const hairline =
    localStorage.getItem('selectedHairline') ||
    localStorage.getItem('customizeSelectedHairline') ||
    'NATURAL';
  const mannequinSrc = bawStaticMannequinFrontReferencePathFromUnitAndHairline(
    selections.unit,
    hairline
  );
  const noirFrontScale = isNoirNaturalFrontMannequinSrc(mannequinSrc)
    ? NOIR_NATURAL_FRONT_MANNEQUIN_DISPLAY_SCALE
    : 1;

  try {
    const mannequin = await loadImage(mannequinSrc);
    drawMannequinInBox(ctx, mannequin, MANNEQUIN_BOX, noirFrontScale);
  } catch {
    ctx.fillStyle = 'rgba(255, 255, 255, 0.35)';
    ctx.fillRect(MANNEQUIN_BOX.x, MANNEQUIN_BOX.y, MANNEQUIN_BOX.w, MANNEQUIN_BOX.h);
  }

  ctx.textAlign = 'center';
  ctx.textBaseline = 'alphabetic';

  ctx.fillStyle = '#1A1A1A';
  ctx.font = '600 46px "Futura PT Demi", Futura, "Futura PT Medium", sans-serif';
  ctx.fillText('FRONTAL', HEADER.centerX, HEADER.frontalY);
  ctx.fillStyle = '#EB1C24';
  ctx.fillText('SLAYER', HEADER.centerX, HEADER.slayerY);

  ctx.fillStyle = '#1A1A1A';
  ctx.font = '500 28px "Futura PT Book", Futura, sans-serif';
  ctx.fillText('SLAY CARD — BUILD-A-WIG VIEW', HEADER.centerX, HEADER.subtitleY);

  const specLines = [
    `LENGTH ${selections.length}`,
    `DENSITY ${selections.density}`,
    `COLOR ${selections.color}`,
    `STYLING ${selections.styling}`,
    `CAP ${selections.capSize}`,
  ];

  ctx.fillStyle = '#EB1C24';
  ctx.font = '600 40px "Covered By Your Grace", cursive';
  ctx.fillText(selections.unit.toUpperCase(), TEXT_PANEL.centerX, TEXT_PANEL.unitY);

  ctx.fillStyle = '#1A1A1A';
  ctx.font = '500 27px "Futura PT Medium", Futura, sans-serif';
  let y = TEXT_PANEL.specsStartY;
  for (const line of specLines) {
    ctx.fillText(line.toUpperCase(), TEXT_PANEL.centerX, y);
    y += TEXT_PANEL.lineHeight;
  }

  ctx.fillStyle = '#808080';
  ctx.font = '400 22px "Futura PT Book", Futura, sans-serif';
  ctx.fillText('TRY THE FULL BUILDER WITH MEMBERSHIP', TEXT_PANEL.centerX, TEXT_PANEL.footerY);

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
