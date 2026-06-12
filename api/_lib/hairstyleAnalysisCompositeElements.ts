import { buildTextOverlaySvg } from './hairstyleAnalysisFonts.js';
import { formatScorePercent } from './hairstyleAnalysisDisplay.js';
import { RATING_SLOT, TOP_SCORE_SLOT } from './hairstyleAnalysisLayoutSlots.js';

export const STAR_EMPTY_PATH = '/assets/NOIR/star-symbol.png';
export const STAR_FILLED_PATH = '/assets/NOIR/filled-star.png';

export async function fetchImageBuffer(url: string, siteOrigin: string): Promise<Buffer> {
  const trimmed = url.trim();
  if (!trimmed) throw new Error('Image URL is required');

  if (trimmed.startsWith('data:')) {
    const m = /^data:([^;]+);base64,(.+)$/s.exec(trimmed);
    if (!m) throw new Error('Invalid data URL');
    return Buffer.from(m[2], 'base64');
  }

  const publicUrl =
    trimmed.startsWith('http://') || trimmed.startsWith('https://')
      ? trimmed
      : trimmed.startsWith('/')
        ? `${siteOrigin.replace(/\/$/, '')}${trimmed}`
        : null;

  if (!publicUrl) throw new Error(`Unsupported image URL: ${trimmed}`);

  const res = await fetch(publicUrl);
  if (!res.ok) throw new Error(`Failed to fetch ${publicUrl}: ${res.status}`);
  return Buffer.from(await res.arrayBuffer());
}

export function buildOverallScoreOverlaySvg(score: number): Buffer {
  return buildTextOverlaySvg([
    {
      text: formatScorePercent(score),
      rect: TOP_SCORE_SLOT,
      style: 'covered-red',
      align: 'center',
    },
  ]);
}

export async function buildStarComposites(
  rating: number,
  siteOrigin: string
): Promise<Array<{ input: Buffer; left: number; top: number }>> {
  const origin = siteOrigin.replace(/\/$/, '');
  const [emptyBuf, filledBuf] = await Promise.all([
    fetchImageBuffer(`${origin}${STAR_EMPTY_PATH}`, siteOrigin),
    fetchImageBuffer(`${origin}${STAR_FILLED_PATH}`, siteOrigin),
  ]);

  const filled = Math.min(5, Math.max(0, Math.round(rating)));
  const gap = Math.max(2, Math.round(RATING_SLOT.width * 0.02));
  const starW = Math.max(
    24,
    Math.min(Math.round(RATING_SLOT.height * 0.62), Math.floor((RATING_SLOT.width - gap * 4) / 5))
  );
  const rowWidth = 5 * starW + 4 * gap;
  const leftStart = RATING_SLOT.left + Math.round((RATING_SLOT.width - rowWidth) / 2);
  const top = RATING_SLOT.top + Math.round((RATING_SLOT.height - starW) / 2);

  const sharp = (await import('sharp')).default;
  const overlays: Array<{ input: Buffer; left: number; top: number }> = [];

  for (let i = 0; i < 5; i++) {
    const input = await sharp(i < filled ? filledBuf : emptyBuf)
      .resize(starW, starW, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .png()
      .toBuffer();
    overlays.push({
      input,
      left: leftStart + i * (starW + gap),
      top,
    });
  }

  return overlays;
}
