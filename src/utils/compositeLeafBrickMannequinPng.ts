/**
 * Build a single PNG: leaf-brick background + NOIR 2D mannequin (same visual stack as product hero 2D view).
 */
const LEAF_BRICK_URL = '/assets/leaf-brick-resize.png';

const OUT_W = 400;
const OUT_H = 580;
/** Matches hero 2D mannequin width scale (~230px in ~200px-wide frame), doubled for export. */
const MANNEQUIN_DRAW_WIDTH = 460;

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`Failed to load image: ${src}`));
    img.src = src;
  });
}

/** Cover brick into rect (like CSS background-size: cover). */
function drawImageCover(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  dx: number,
  dy: number,
  dw: number,
  dh: number
): void {
  const ir = img.width / img.height;
  const cr = dw / dh;
  let sx: number;
  let sy: number;
  let sw: number;
  let sh: number;
  if (ir > cr) {
    sh = img.height;
    sw = sh * cr;
    sx = (img.width - sw) / 2;
    sy = 0;
  } else {
    sw = img.width;
    sh = sw / cr;
    sx = 0;
    sy = (img.height - sh) / 2;
  }
  ctx.drawImage(img, sx, sy, sw, sh, dx, dy, dw, dh);
}

/**
 * @param mannequinSrc - e.g. `/assets/natural front.png` (same paths as NOIR 2D hero)
 */
export async function compositeLeafBrickMannequinPng(mannequinSrc: string): Promise<Blob> {
  const [brick, mannequin] = await Promise.all([loadImage(LEAF_BRICK_URL), loadImage(mannequinSrc)]);
  const canvas = document.createElement('canvas');
  canvas.width = OUT_W;
  canvas.height = OUT_H;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas 2D not available');
  drawImageCover(ctx, brick, 0, 0, OUT_W, OUT_H);
  const mw = MANNEQUIN_DRAW_WIDTH;
  const mh = (mannequin.height / mannequin.width) * mw;
  const mx = (OUT_W - mw) / 2;
  // Hero uses ~1px nudge vs strict vertical center; keep subtle shift for parity
  const my = (OUT_H - mh) / 2 + 3;
  ctx.drawImage(mannequin, mx, my, mw, mh);
  return new Promise((resolve, reject) => {
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('PNG encode failed'))), 'image/png');
  });
}

/** Trigger browser download of the composite PNG. */
export async function downloadCompositeLeafBrickPng(mannequinSrc: string, filename: string): Promise<void> {
  const blob = await compositeLeafBrickMannequinPng(mannequinSrc);
  const url = URL.createObjectURL(blob);
  try {
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.rel = 'noopener';
    document.body.appendChild(a);
    a.click();
    a.remove();
  } finally {
    URL.revokeObjectURL(url);
  }
}
