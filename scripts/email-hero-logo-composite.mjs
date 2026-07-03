/**
 * Post-process Fal email heroes: erase Fal-invented marks, paste official slayer-logo.png.
 * Same logic as compositeEmailHeroLogo.ts.
 *
 * Usage:
 *   node scripts/email-hero-logo-composite.mjs welcome
 *   node scripts/email-hero-logo-composite.mjs welcome,order_received
 */
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const PLACEMENTS_PATH = join(ROOT, 'api/_lib/email/emailHeroLogoPlacements.json');
const DEFAULT_LOGO = join(ROOT, 'public/assets/email/slayer-logo.png');
const HEROES_DIR = join(ROOT, 'public/assets/email/heroes');

function loadPlacements() {
  const raw = JSON.parse(readFileSync(PLACEMENTS_PATH, 'utf8'));
  return Object.fromEntries(Object.entries(raw).filter(([k, v]) => k !== '_comment' && typeof v === 'object'));
}

export function emailHeroNeedsLogoComposite(templateType) {
  return Boolean(loadPlacements()[templateType]);
}

function wipeRectAttrs(wipe, W, H) {
  const width = Math.max(1, Math.round(W * wipe.wPct));
  const height = Math.max(1, Math.round(H * wipe.hPct));
  let left = Math.round(W * wipe.xPct - width / 2);
  let top = Math.round(H * wipe.yPct - height / 2);
  left = Math.max(0, Math.min(W - width, left));
  top = Math.max(0, Math.min(H - height, top));
  return { left, top, width, height };
}

async function buildWipeOverlay(wipes, W, H) {
  const rects = wipes
    .map((wipe) => {
      const { left, top, width, height } = wipeRectAttrs(wipe, W, H);
      return `<rect x="${left}" y="${top}" width="${width}" height="${height}" rx="8" fill="rgba(255,255,255,0.93)"/>`;
    })
    .join('');
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">${rects}</svg>`;
  return sharp(Buffer.from(svg)).png().toBuffer();
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

  const composites = [];
  if (placement.wipes?.length) {
    const wipeBuf = await buildWipeOverlay(placement.wipes, W, H);
    composites.push({ input: wipeBuf, left: 0, top: 0 });
  }
  composites.push({ input: logoBuf, left, top });

  return hero.composite(composites).webp({ quality: 92 }).toBuffer();
}

async function main() {
  const arg = process.argv[2]?.trim();
  if (!arg) {
    console.error('Usage: node scripts/email-hero-logo-composite.mjs <template>[,template2,...]');
    process.exit(1);
  }
  const types = arg.split(',').map((s) => s.trim()).filter(Boolean);
  for (const templateType of types) {
    const heroPath = join(HEROES_DIR, `${templateType}.webp`);
    if (!existsSync(heroPath)) {
      console.error('Missing hero:', heroPath);
      continue;
    }
    const raw = readFileSync(heroPath);
    const out = await compositeEmailHeroLogo(raw, templateType);
    writeFileSync(heroPath, out);
    console.log('Re-composited', heroPath);
  }
}

const invoked = process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1];
if (invoked) {
  main().catch((e) => {
    console.error(e);
    process.exit(1);
  });
}
