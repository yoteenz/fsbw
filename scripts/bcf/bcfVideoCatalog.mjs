import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { loadBcfCfPhotoCatalog } from './bcfCfPhotoCatalog.mjs';
import { buildProductKey, ROOT } from './bcfVideoEnv.mjs';

const TEXTURES = ['straight', 'wavy', 'curly'];
const CF_CATEGORIES = ['closures', 'frontals'];

/** Legacy Kling .mov assets already on Supabase (texture defaults only). */
export const LEGACY_BCF_VIDEO_STORAGE_PATH = {
  'bundles-straight-default': 'wig-preview-live/make_this_image_shake_the_hair_Kling_30__51488.mov',
  'bundles-wavy-default': 'wig-preview-live/make_this_image_shake_the_hair_Kling_30__98237.mov',
  'bundles-curly-default': 'wig-preview-live/make_this_image_shake_the_hair_Kling_30__24695.mov',
  'closures-straight-default': 'wig-preview-live/make_this_image_shake_the_hair_Kling_30__27854.mov',
  'closures-wavy-default': 'wig-preview-live/make_this_image_shake_the_hair_Kling_30__49906.mov',
  'closures-curly-default': 'wig-preview-live/make_this_image_shake_the_hair_Kling_30__28643.mov',
  'frontals-straight-default': 'wig-preview-live/make_this_image_shake_the_hair_Kling_30__79719.mov',
  'frontals-wavy-default': 'wig-preview-live/make_this_image_slowly_showcas_Kling_30__78091.mov',
  'frontals-curly-default': 'wig-preview-live/make_this_image_shake_the_hair_Kling_30__79392.mov',
};

function extractConstUrls(ts, constName) {
  const re = new RegExp(`const ${constName}[\\s\\S]*?=\\s*\\{([\\s\\S]*?)\\n\\};`, 'm');
  const block = ts.match(re)?.[1] ?? '';
  const out = {};
  for (const m of block.matchAll(/(\w+):\s*\n?\s*'([^']+)'/g)) {
    out[m[1]] = m[2];
  }
  return out;
}

function extractColorMap(ts, constName) {
  const re = new RegExp(`const ${constName}[\\s\\S]*?=\\s*\\{([\\s\\S]*?)\\n\\};`, 'm');
  const block = ts.match(re)?.[1] ?? '';
  const out = {};
  for (const m of block.matchAll(/(?:'([^']+)'|([A-Z0-9 ]+)):\s*`\$\{([^}]+)\}\/([^`]+)`/g)) {
    const colorId = (m[1] || m[2] || '').trim();
    const baseRef = m[3].trim();
    const fileName = m[4].trim();
    out[colorId] = { baseRef, fileName };
  }
  return out;
}

function extractNestedColorMap(ts, constName) {
  const re = new RegExp(`const ${constName}[\\s\\S]*?=\\s*\\{([\\s\\S]*?)\\n\\};`, 'm');
  const block = ts.match(re)?.[1] ?? '';
  const out = { straight: {}, wavy: {}, curly: {} };
  for (const texture of TEXTURES) {
    const texRe = new RegExp(`${texture}:\\s*\\{([\\s\\S]*?)\\}(?=,\\s*(?:\\w+:|\\};))`, 'm');
    const texBlock = block.match(texRe)?.[1] ?? '';
    for (const m of texBlock.matchAll(/(?:'([^']+)'|([A-Z0-9 ]+)):\s*`\$\{([^}]+)\}\/([^`]+)`/g)) {
      const colorId = (m[1] || m[2] || '').trim();
      out[texture][colorId] = { baseRef: m[3].trim(), fileName: m[4].trim() };
    }
  }
  return out;
}

function resolveBaseUrl(ts, baseRef) {
  const re = new RegExp(`const ${baseRef}\\s*=\\s*'([^']+)'`);
  return ts.match(re)?.[1] ?? '';
}

function resolveColorPhotoPath(ts, entry) {
  const baseUrl = resolveBaseUrl(ts, entry.baseRef);
  return resolvePhotoStoragePath(baseUrl, entry.fileName);
}

function storagePathFromPublicUrl(url) {
  const marker = '/storage/v1/object/public/live-preview/';
  const idx = url.indexOf(marker);
  if (idx === -1) return null;
  return decodeURIComponent(url.slice(idx + marker.length));
}

function resolvePhotoStoragePath(baseUrl, fileName) {
  const basePath = storagePathFromPublicUrl(baseUrl);
  if (!basePath) return fileName;
  return `${basePath}/${fileName}`;
}

function addProduct(products, seen, entry) {
  if (seen.has(entry.productKey)) return;
  seen.add(entry.productKey);
  products.push(entry);
}

/** Build catalog rows from src/utils/bcfPdpHeroAssets.ts (single source of truth for stills). */
export function loadBcfProductCatalog() {
  const tsPath = join(ROOT, 'src/utils/bcfPdpHeroAssets.ts');
  const ts = readFileSync(tsPath, 'utf8');

  const bundleDefaults = extractConstUrls(ts, 'BUNDLE_PHOTO_BY_TEXTURE');
  const cfDefaults = {
    closures: extractConstUrls(ts, 'BCF_CF_PHOTO')?.closures ?? {},
    frontals: extractConstUrls(ts, 'BCF_CF_PHOTO')?.frontals ?? {},
  };

  // Fix nested BCF_CF_PHOTO extraction — it's Record<'closures'|'frontals', Record<texture, string>>
  const cfBlock = ts.match(/export const BCF_CF_PHOTO[\s\S]*?= \{([\s\S]*?)\n\};/m)?.[1] ?? '';
  const cfPhotos = { closures: {}, frontals: {} };
  for (const category of CF_CATEGORIES) {
    const catRe = new RegExp(`${category}:\\s*\\{([\\s\\S]*?)\\n  \\}`, 'm');
    const catBlock = cfBlock.match(catRe)?.[1] ?? '';
    for (const m of catBlock.matchAll(/(\w+):\s*\n?\s*'([^']+)'/g)) {
      cfPhotos[category][m[1]] = m[2];
    }
  }

  const bundleStraightColors = extractColorMap(ts, 'BUNDLE_STRAIGHT_COLOR_PHOTO');
  const bundleWavyColors = extractColorMap(ts, 'BUNDLE_WAVY_COLOR_PHOTO');
  const bundleCurlyColors = extractColorMap(ts, 'BUNDLE_CURLY_COLOR_PHOTO');
  const closuresColors = extractNestedColorMap(ts, 'CLOSURES_COLOR_PHOTO');
  const frontalsColors = extractNestedColorMap(ts, 'FRONTALS_COLOR_PHOTO');

  const products = [];
  const seen = new Set();

  for (const texture of TEXTURES) {
    const defaultPath = storagePathFromPublicUrl(bundleDefaults[texture] ?? '');
    if (defaultPath) {
      addProduct(products, seen, {
        productKey: buildProductKey('bundles', texture, 'DEFAULT'),
        category: 'bundles',
        texture,
        colorId: 'DEFAULT',
        sourcePhotoStoragePath: defaultPath,
        legacyVideoStoragePath: LEGACY_BCF_VIDEO_STORAGE_PATH[buildProductKey('bundles', texture, 'DEFAULT')] ?? null,
      });
    }

    const colorMaps = {
      straight: bundleStraightColors,
      wavy: bundleWavyColors,
      curly: bundleCurlyColors,
    };
    const colors = colorMaps[texture];
    for (const [colorId, entry] of Object.entries(colors)) {
      const path = resolveColorPhotoPath(ts, entry);
      addProduct(products, seen, {
        productKey: buildProductKey('bundles', texture, colorId),
        category: 'bundles',
        texture,
        colorId,
        sourcePhotoStoragePath: path,
        legacyVideoStoragePath: null,
      });
    }
  }

  for (const category of CF_CATEGORIES) {
    for (const texture of TEXTURES) {
      const defaultPath = storagePathFromPublicUrl(cfPhotos[category][texture] ?? '');
      if (defaultPath) {
        addProduct(products, seen, {
          productKey: buildProductKey(category, texture, 'DEFAULT'),
          category,
          texture,
          colorId: 'DEFAULT',
          sourcePhotoStoragePath: defaultPath,
          legacyVideoStoragePath:
            LEGACY_BCF_VIDEO_STORAGE_PATH[buildProductKey(category, texture, 'DEFAULT')] ?? null,
        });
      }
    }
  }

  // Full noir + blonde palette — source stills from generated CF color PNGs.
  for (const row of loadBcfCfPhotoCatalog()) {
    addProduct(products, seen, {
      productKey: row.productKey,
      category: row.category,
      texture: row.texture,
      colorId: row.colorId,
      sourcePhotoStoragePath: row.photoStoragePath,
      legacyVideoStoragePath: null,
    });
  }

  return products.sort((a, b) => a.productKey.localeCompare(b.productKey));
}

export function bcfVideoStoragePaths(productKey, prefix = 'BCF/videos/v1') {
  return {
    mp4StoragePath: `${prefix}/${productKey}.mp4`,
    webmStoragePath: `${prefix}/${productKey}.webm`,
  };
}
