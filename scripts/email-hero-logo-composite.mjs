/**
 * Post-process Fal email heroes: paste official slayer-logo.png (same logic as compositeEmailHeroLogo.ts).
 */
import { existsSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const PLACEMENTS_PATH = join(ROOT, 'api/_lib/email/emailHeroLogoPlacements.json');
const DEFAULT_LOGO = join(ROOT, 'public/assets/email/slayer-logo.png');

function loadPlacements() {
  const raw = JSON.parse(readFileSync(PLACEMENTS_PATH, 'utf8'));
  return Object.fromEntries(Object.entries(raw).filter(([k, v]) => k !== '_comment' && typeof v === 'object'));
}

export function emailHeroNeedsLogoComposite(templateType) {
  return Boolean(loadPlacements()[templateType]);
}

export async function compositeEmailHeroLogo(heroBytes, templateType, logoPath = DEFAULT_LOGO) {
  const placement = loadPlacements()[templateType];
  if (!placement) return heroBytes;
  if (!existsSync(logoPath)) throw new Error(`Missing logo: ${logoPath}`);

  const hero = sharp(heroBytes);
  const { width: W = 0, height: H = 0 } = await hero.metadata();
  if (!W || !H) return heroBytes;

  const logoW = Math.max(1, Math.round(W * placement.widthPct));
  const logoBuf = await sharp(readFileSync(logoPath)).resize(logoW, undefined, { fit: 'inside' }).png().toBuffer();
  const { width: logoWidth = logoW, height: logoHeight = logoW } = await sharp(logoBuf).metadata();

  let left = Math.round(W * placement.xPct - logoWidth / 2);
  let top = Math.round(H * placement.yPct - logoHeight / 2);
  left = Math.max(0, Math.min(W - logoWidth, left));
  top = Math.max(0, Math.min(H - logoHeight, top));

  return hero.composite([{ input: logoBuf, left, top }]).webp({ quality: 92 }).toBuffer();
}
