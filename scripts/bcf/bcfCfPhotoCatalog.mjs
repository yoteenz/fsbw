import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import {
  BCF_CF_PHOTO_BLONDE_IDS,
  BCF_CF_PHOTO_COLORS,
} from './bcfCfPhotoColors.mjs';
import { buildProductKey, ROOT, slugifyColorId } from './bcfVideoEnv.mjs';

const TEXTURES = ['straight', 'wavy', 'curly'];
const CF_CATEGORIES = ['closures', 'frontals'];
const TEXTURE_FOLDER = { straight: 'Straight', wavy: 'Wavy', curly: 'Curly' };
const CATEGORY_ROOT = { closures: 'Closures Color', frontals: 'Frontals Color' };

function storagePathFromPublicUrl(url) {
  const marker = '/storage/v1/object/public/live-preview/';
  const idx = url.indexOf(marker);
  if (idx === -1) return null;
  return decodeURIComponent(url.slice(idx + marker.length));
}

function extractNestedColorMap(ts, constName) {
  const re = new RegExp(`const ${constName}[\\s\\S]*?=\\s*\\{([\\s\\S]*?)\\n\\};`, 'm');
  const block = ts.match(re)?.[1] ?? '';
  const out = { straight: {}, wavy: {}, curly: {} };
  for (const texture of TEXTURES) {
    const texRe = new RegExp(`${texture}:\\s*\\{([\\s\\S]*?)\\n  \\}`, 'm');
    const texBlock = block.match(texRe)?.[1] ?? '';
    for (const m of texBlock.matchAll(/(?:'([^']+)'|([A-Z0-9 ]+)):\s*`\$\{([^}]+)\}\/([^`]+)`/g)) {
      const colorId = (m[1] || m[2] || '').trim();
      out[texture][colorId] = m[4].trim();
    }
  }
  return out;
}

function resolveBasePath(ts, baseRef) {
  const re = new RegExp(`const ${baseRef}\\s*=\\s*'([^']+)'`);
  const baseUrl = ts.match(re)?.[1] ?? '';
  return storagePathFromPublicUrl(baseUrl);
}

function resolveExistingPhotoPath(ts, category, texture, colorId, nestedMaps) {
  const entry = nestedMaps[category][texture][colorId];
  if (!entry) return null;
  const baseRef =
    category === 'closures' ? 'CLOSURES_COLOR_PHOTO_BASE' : 'FRONTALS_COLOR_PHOTO_BASE';
  const basePath = resolveBasePath(ts, baseRef);
  if (!basePath) return entry;
  return `${basePath}/${entry}`;
}

/** Target storage path for a closure/frontal color hero PNG. */
export function bcfCfPhotoStoragePath(category, texture, colorId) {
  const root = CATEGORY_ROOT[category];
  if (BCF_CF_PHOTO_BLONDE_IDS.has(colorId)) {
    return `${root}/Platinum/${slugifyColorId(colorId)}.png`;
  }
  return `${root}/${TEXTURE_FOLDER[texture]}/${slugifyColorId(colorId)}.png`;
}

function loadCfDefaults(ts) {
  const cfBlock = ts.match(/export const BCF_CF_PHOTO[\s\S]*?= \{([\s\S]*?)\n\};/m)?.[1] ?? '';
  const out = { closures: {}, frontals: {} };
  for (const category of CF_CATEGORIES) {
    const catRe = new RegExp(`${category}:\\s*\\{([\\s\\S]*?)\\n  \\}`, 'm');
    const catBlock = cfBlock.match(catRe)?.[1] ?? '';
    for (const m of catBlock.matchAll(/(\w+):\s*\n?\s*'([^']+)'/g)) {
      out[category][m[1]] = m[2];
    }
  }
  return out;
}

/** Build closure/frontal color photo catalog rows (bundles excluded). */
export function loadBcfCfPhotoCatalog() {
  const tsPath = join(ROOT, 'src/utils/bcfPdpHeroAssets.ts');
  const ts = readFileSync(tsPath, 'utf8');
  const cfDefaults = loadCfDefaults(ts);
  const closuresExisting = extractNestedColorMap(ts, 'CLOSURES_COLOR_PHOTO');
  const frontalsExisting = extractNestedColorMap(ts, 'FRONTALS_COLOR_PHOTO');
  const nestedMaps = { closures: closuresExisting, frontals: frontalsExisting };

  const rows = [];
  for (const category of CF_CATEGORIES) {
    for (const texture of TEXTURES) {
      const sourcePhotoStoragePath = storagePathFromPublicUrl(cfDefaults[category][texture] ?? '');
      if (!sourcePhotoStoragePath) continue;

      for (const color of BCF_CF_PHOTO_COLORS) {
        const legacyFile = resolveExistingPhotoPath(ts, category, texture, color.id, nestedMaps);
        const photoStoragePath = legacyFile ?? bcfCfPhotoStoragePath(category, texture, color.id);
        rows.push({
          productKey: buildProductKey(category, texture, color.id),
          category,
          texture,
          colorId: color.id,
          colorName: color.promptName,
          hexCode: color.hex,
          sourcePhotoStoragePath,
          photoStoragePath,
          legacyFileName: legacyFile ? legacyFile.split('/').pop() : null,
        });
      }
    }
  }

  return rows.sort((a, b) => a.productKey.localeCompare(b.productKey));
}
