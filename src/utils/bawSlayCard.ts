import type { BawTutorialSelections } from '../constants/bawTutorialConfig';
import { NOIR_NATURAL_FRONT_MANNEQUIN_SRC } from './bawStaticMannequinReferencePaths';

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`Failed to load image: ${src}`));
    img.src = src;
  });
}

export async function renderBawSlayCardPng(selections: BawTutorialSelections): Promise<Blob> {
  const canvas = document.createElement('canvas');
  const w = 1080;
  const h = 1350;
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas not supported');

  ctx.fillStyle = '#FAFAFA';
  ctx.fillRect(0, 0, w, h);

  try {
    const marble = await loadImage('/assets/marble-half.png');
    ctx.globalAlpha = 0.55;
    ctx.drawImage(marble, 0, 0, w, h);
    ctx.globalAlpha = 1;
  } catch {
    /* marble optional */
  }

  ctx.strokeStyle = '#000000';
  ctx.lineWidth = 4;
  ctx.strokeRect(48, 48, w - 96, h - 96);

  ctx.textAlign = 'center';
  ctx.fillStyle = '#1A1A1A';
  ctx.font = '600 44px Futura, "Futura PT Medium", sans-serif';
  ctx.fillText('FRONTAL', w / 2, 130);
  ctx.fillStyle = '#EB1C24';
  ctx.fillText('SLAYER', w / 2, 182);

  ctx.fillStyle = '#808080';
  ctx.font = '500 28px Futura, "Futura PT Book", sans-serif';
  ctx.fillText('SLAY CARD — BUILD-A-WIG VIEW', w / 2, 230);

  try {
    const mannequin = await loadImage(NOIR_NATURAL_FRONT_MANNEQUIN_SRC);
    const imgW = 520;
    const imgH = (mannequin.height / mannequin.width) * imgW;
    ctx.drawImage(mannequin, (w - imgW) / 2, 280, imgW, imgH);
  } catch {
    ctx.fillStyle = '#E5E5E5';
    ctx.fillRect((w - 520) / 2, 280, 520, 680);
  }

  const lines = [
    selections.unit.toUpperCase(),
    `LENGTH ${selections.length}`,
    `DENSITY ${selections.density}`,
    `COLOR ${selections.color}`,
    `STYLING ${selections.styling}`,
    `CAP ${selections.capSize}`,
  ];

  let y = 1020;
  ctx.fillStyle = '#EB1C24';
  ctx.font = '600 36px "Covered By Your Grace", cursive';
  ctx.fillText(selections.unit.toUpperCase(), w / 2, y);
  y += 52;

  ctx.fillStyle = '#1A1A1A';
  ctx.font = '500 26px Futura, "Futura PT Medium", sans-serif';
  for (const line of lines.slice(1)) {
    ctx.fillText(line, w / 2, y);
    y += 40;
  }

  ctx.fillStyle = '#808080';
  ctx.font = '400 22px Futura, "Futura PT Book", sans-serif';
  ctx.fillText('TRY THE FULL BUILDER WITH MEMBERSHIP', w / 2, h - 88);

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
          text: 'Built with Build-A-Wig Try',
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
