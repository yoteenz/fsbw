import { existsSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';
import type { EmailTemplateType } from './types.js';
import { EMAIL_HERO_LOGO_REF_RELATIVE } from './emailHeroPrompts.js';

type WipeRegion = { xPct: number; yPct: number; wPct: number; hPct: number };
type LogoPlacement = { xPct: number; yPct: number; widthPct: number; wipes?: WipeRegion[] };

const __dirname = dirname(fileURLToPath(import.meta.url));
const PLACEMENTS_PATH = join(__dirname, 'emailHeroLogoPlacements.json');

let cachedPlacements: Record<string, LogoPlacement> | null = null;

function loadPlacements(): Record<string, LogoPlacement> {
  if (cachedPlacements) return cachedPlacements;
  const raw = JSON.parse(readFileSync(PLACEMENTS_PATH, 'utf8')) as Record<string, LogoPlacement | string>;
  cachedPlacements = Object.fromEntries(
    Object.entries(raw).filter(([k, v]) => k !== '_comment' && typeof v === 'object'),
  ) as Record<string, LogoPlacement>;
  return cachedPlacements;
}

function wipeRectAttrs(wipe: WipeRegion, W: number, H: number): { left: number; top: number; width: number; height: number } {
  const width = Math.max(1, Math.round(W * wipe.wPct));
  const height = Math.max(1, Math.round(H * wipe.hPct));
  let left = Math.round(W * wipe.xPct - width / 2);
  let top = Math.round(H * wipe.yPct - height / 2);
  left = Math.max(0, Math.min(W - width, left));
  top = Math.max(0, Math.min(H - height, top));
  return { left, top, width, height };
}

/** Paint frosted patches over Fal-invented seals/text before pasting the official logo. */
async function buildWipeOverlay(wipes: WipeRegion[], W: number, H: number): Promise<Buffer> {
  const rects = wipes
    .map((wipe) => {
      const { left, top, width, height } = wipeRectAttrs(wipe, W, H);
      return `<rect x="${left}" y="${top}" width="${width}" height="${height}" rx="8" fill="rgba(255,255,255,0.93)"/>`;
    })
    .join('');
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">${rects}</svg>`;
  return sharp(Buffer.from(svg)).png().toBuffer();
}

export function emailHeroNeedsLogoComposite(templateType: EmailTemplateType): boolean {
  const placements = loadPlacements();
  return Boolean(placements[templateType]);
}

export function resolveEmailHeroLogoPath(repoRoot = process.cwd()): string {
  const custom = process.env.EMAIL_HERO_LOGO_REF?.trim();
  if (custom) return join(repoRoot, custom.replace(/^\//, ''));
  return join(repoRoot, EMAIL_HERO_LOGO_REF_RELATIVE);
}

/** Paste the official SLAYER wordmark PNG onto generated hero art — never rely on Fal to redraw it. */
export async function compositeEmailHeroLogo(
  heroBytes: Buffer,
  templateType: EmailTemplateType,
  repoRoot = process.cwd(),
): Promise<Buffer> {
  const placements = loadPlacements();
  const placement = placements[templateType];
  if (!placement) return heroBytes;

  const logoPath = resolveEmailHeroLogoPath(repoRoot);
  if (!existsSync(logoPath)) {
    throw new Error(`Missing official logo for composite: ${logoPath}`);
  }

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

  const composites: { input: Buffer; left: number; top: number }[] = [];
  if (placement.wipes?.length) {
    const wipeBuf = await buildWipeOverlay(placement.wipes, W, H);
    composites.push({ input: wipeBuf, left: 0, top: 0 });
  }
  composites.push({ input: logoBuf, left, top });

  return hero
    .composite(composites)
    .webp({ quality: 92 })
    .toBuffer();
}
