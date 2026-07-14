#!/usr/bin/env node
/**
 * Create pixel-preserving unlabeled twin from labeled catalog.
 * Surgical label removal only — no generative inpainting, no icon pixel changes.
 */
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');

const LABELED_REL = 'src/assets/studio-world/icons/source/studio-world-icon-catalog-labeled.png';
const TWIN_REL = 'src/assets/studio-world/icons/source/studio-world-icon-source-unlabeled-twin.png';
const REGISTRY_REL = 'src/features/studio-world/icons/experience-lab-icon-registry.ts';
const MASK_CONFIG_REL = 'src/features/studio-world/icons/studio-world-icon-label-mask.config.ts';
const PARITY_JSON = 'src/features/studio-world/icons/studio-world-icon-source-twin-parity.generated.json';
const PARITY_DOC = 'docs/studio-os/design-system/STUDIO_WORLD_ICON_SOURCE_TWIN_PARITY.md';
const QA_ASSETS_DIR = 'src/assets/studio-world/experience-lab/icons/source-twin-qa';
const QA_DOCS_DIR = 'docs/studio-os/qa/studio-world-icons/source-twin';
const V5_VERSION = 'studio-world-icons-v5-source-twin';

const ROWS = 8;
const COLS = 8;
const BRIGHT_LUM = 28;
const ICON_SCAN_RATIO = 0.52;

function luminance(r, g, b) {
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function isBright(r, g, b) {
  return luminance(r, g, b) > BRIGHT_LUM;
}

function cellRect(width, height, row, column) {
  const left = Math.round((column * width) / COLS);
  const top = Math.round((row * height) / ROWS);
  const right = Math.round(((column + 1) * width) / COLS);
  const bottom = Math.round(((row + 1) * height) / ROWS);
  return { left, top, width: Math.max(1, right - left), height: Math.max(1, bottom - top) };
}

function parseRegistry() {
  const text = fs.readFileSync(path.join(ROOT, REGISTRY_REL), 'utf8');
  const entries = [];
  const blockRe = /(\w+):\s*\{[^}]*sourceLabel:\s*'([^']+)'[^}]*row:\s*(\d+)[^}]*column:\s*(\d+)/gs;
  let m;
  while ((m = blockRe.exec(text)) !== null) {
    entries.push({ key: m[1], sourceLabel: m[2], row: Number(m[3]), column: Number(m[4]) });
  }
  return entries;
}

function analyzeCellRows(data, cw, ch, channels) {
  const rows = [];
  for (let y = 0; y < ch; y += 1) {
    let bright = 0;
    let minX = cw;
    let maxX = 0;
    for (let x = 0; x < cw; x += 1) {
      const i = (y * cw + x) * channels;
      if (isBright(data[i], data[i + 1], data[i + 2])) {
        bright += 1;
        minX = Math.min(minX, x);
        maxX = Math.max(maxX, x);
      }
    }
    rows.push({ y, bright, span: bright > 0 ? maxX - minX : 0 });
  }
  return rows;
}

function detectLabelMaskTop(rows, cw, ch) {
  const iconScanEnd = Math.floor(ch * ICON_SCAN_RATIO);
  let labelTop = ch;
  let labelBottom = -1;

  // Bottom-up: find the lowest text block in the label band (y >= iconScanEnd).
  for (let y = ch - 1; y >= iconScanEnd; y -= 1) {
    const r = rows[y];
    const looksLikeLabel = r.bright >= 6 && r.span >= Math.max(10, cw * 0.12);
    if (looksLikeLabel) {
      labelBottom = Math.max(labelBottom, y);
      labelTop = Math.min(labelTop, y);
    }
  }

  if (labelBottom < 0) {
    // Fallback: fixed bottom band for short labels
    labelTop = Math.floor(ch * 0.72);
    labelBottom = ch - 1;
  } else {
    // Extend upward through intra-label gaps (thin rows between letter strokes).
    for (let y = labelTop - 1; y >= iconScanEnd; y -= 1) {
      const r = rows[y];
      if (r.bright >= 6 && r.span >= Math.max(8, cw * 0.1)) {
        labelTop = y;
      } else if (r.bright === 0) {
        break;
      } else if (r.bright < 6) {
        break;
      }
    }
  }

  return {
    iconSafeTop: 0,
    iconSafeBottom: Math.max(0, labelTop - 1),
    labelMaskTop: labelTop,
    labelMaskBottom: ch - 1,
    left: 0,
    right: cw - 1,
  };
}

function iconRegionBounds(data, cw, ch, channels, maxY) {
  let minX = cw;
  let maxX = 0;
  let minY = ch;
  let maxYFound = 0;
  let count = 0;
  for (let y = 0; y <= maxY; y += 1) {
    for (let x = 0; x < cw; x += 1) {
      const i = (y * cw + x) * channels;
      if (isBright(data[i], data[i + 1], data[i + 2])) {
        count += 1;
        minX = Math.min(minX, x);
        maxX = Math.max(maxX, x);
        minY = Math.min(minY, y);
        maxYFound = Math.max(maxYFound, y);
      }
    }
  }
  if (count < 8) return null;
  return {
    minX,
    maxX,
    minY,
    maxY: maxYFound,
    cx: (minX + maxX) / 2,
    cy: (minY + maxYFound) / 2,
    count,
  };
}

function regionChecksum(data, cw, ch, channels, y0, y1) {
  const h = createHash('sha256');
  for (let y = y0; y <= y1; y += 1) {
    for (let x = 0; x < cw; x += 1) {
      const i = (y * cw + x) * channels;
      h.update(Buffer.from([data[i], data[i + 1], data[i + 2]]));
    }
  }
  return h.digest('hex');
}

function createHash(algo) {
  return crypto.createHash(algo);
}

function sampleBackgroundRgb(data, cw, channels, mask) {
  const samples = [];
  const y = Math.max(0, mask.labelMaskTop - 3);
  for (let x = 2; x < cw - 2; x += 4) {
    const i = (y * cw + x) * channels;
    if (!isBright(data[i], data[i + 1], data[i + 2])) {
      samples.push([data[i], data[i + 1], data[i + 2]]);
    }
  }
  if (!samples.length) return [0, 0, 0];
  const r = Math.round(samples.reduce((s, p) => s + p[0], 0) / samples.length);
  const g = Math.round(samples.reduce((s, p) => s + p[1], 0) / samples.length);
  const b = Math.round(samples.reduce((s, p) => s + p[2], 0) / samples.length);
  return [r, g, b];
}

async function main() {
  const labeledPath = path.join(ROOT, LABELED_REL);
  if (!fs.existsSync(labeledPath)) throw new Error(`Missing labeled catalog: ${LABELED_REL}`);

  const labeledSha = crypto.createHash('sha256').update(fs.readFileSync(labeledPath)).digest('hex');
  const meta = await sharp(labeledPath).metadata();
  const sw = meta.width ?? 1402;
  const sh = meta.height ?? 1122;

  const { data: srcData, info } = await sharp(labeledPath).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const channels = info.channels;
  const twin = Buffer.from(srcData);

  const registry = parseRegistry();
  if (registry.length !== 64) throw new Error(`Expected 64 registry entries, got ${registry.length}`);

  const masks = {};
  const cellReports = [];
  let globalProtectedChanged = 0;
  let globalLabelChanged = 0;
  let globalChanged = 0;

  for (const entry of registry) {
    const cell = cellRect(sw, sh, entry.row, entry.column);
    const rows = analyzeCellRows(
      srcData.subarray((cell.top * sw + cell.left) * channels),
      cell.width,
      cell.height,
      channels,
    );

    // Re-read cell with proper stride
    const cellBuf = Buffer.alloc(cell.width * cell.height * channels);
    for (let y = 0; y < cell.height; y += 1) {
      for (let x = 0; x < cell.width; x += 1) {
        const si = ((cell.top + y) * sw + (cell.left + x)) * channels;
        const di = (y * cell.width + x) * channels;
        cellBuf[di] = srcData[si];
        cellBuf[di + 1] = srcData[si + 1];
        cellBuf[di + 2] = srcData[si + 2];
        cellBuf[di + 3] = channels === 4 ? srcData[si + 3] : 255;
      }
    }

    const rowStats = analyzeCellRows(cellBuf, cell.width, cell.height, channels);
    const mask = detectLabelMaskTop(rowStats, cell.width, cell.height);
    masks[`${entry.row},${entry.column}`] = { ...mask, key: entry.key, sourceLabel: entry.sourceLabel };

    const beforeBounds = iconRegionBounds(cellBuf, cell.width, cell.height, channels, mask.iconSafeBottom);
    const beforeChecksum = regionChecksum(cellBuf, cell.width, cell.height, channels, 0, mask.iconSafeBottom);

    const bg = sampleBackgroundRgb(cellBuf, cell.width, channels, mask);
    let protectedChanged = 0;
    let labelChanged = 0;

    for (let y = mask.labelMaskTop; y <= mask.labelMaskBottom; y += 1) {
      for (let x = 0; x < cell.width; x += 1) {
        const gi = ((cell.top + y) * sw + (cell.left + x)) * channels;
        const si = (y * cell.width + x) * channels;
        const srcR = srcData[gi];
        const srcG = srcData[gi + 1];
        const srcB = srcData[gi + 2];
        if (srcR !== bg[0] || srcG !== bg[1] || srcB !== bg[2]) {
          labelChanged += 1;
          twin[gi] = bg[0];
          twin[gi + 1] = bg[1];
          twin[gi + 2] = bg[2];
          if (channels === 4) twin[gi + 3] = 255;
        }
      }
    }

    // Verify protected pixels unchanged
    for (let y = 0; y < mask.labelMaskTop; y += 1) {
      for (let x = 0; x < cell.width; x += 1) {
        const gi = ((cell.top + y) * sw + (cell.left + x)) * channels;
        if (twin[gi] !== srcData[gi] || twin[gi + 1] !== srcData[gi + 1] || twin[gi + 2] !== srcData[gi + 2]) {
          protectedChanged += 1;
        }
      }
    }

    // Re-read twin cell for after metrics
    const twinCell = Buffer.alloc(cell.width * cell.height * channels);
    for (let y = 0; y < cell.height; y += 1) {
      for (let x = 0; x < cell.width; x += 1) {
        const gi = ((cell.top + y) * sw + (cell.left + x)) * channels;
        const di = (y * cell.width + x) * channels;
        twinCell[di] = twin[gi];
        twinCell[di + 1] = twin[gi + 1];
        twinCell[di + 2] = twin[gi + 2];
      }
    }

    const afterBounds = iconRegionBounds(twinCell, cell.width, cell.height, channels, mask.iconSafeBottom);
    const afterChecksum = regionChecksum(twinCell, cell.width, cell.height, channels, 0, mask.iconSafeBottom);

    let residualText = 0;
    for (let y = mask.labelMaskTop; y <= mask.labelMaskBottom; y += 1) {
      for (let x = 0; x < cell.width; x += 1) {
        const i = (y * cell.width + x) * channels;
        if (isBright(twinCell[i], twinCell[i + 1], twinCell[i + 2])) residualText += 1;
      }
    }

    let status = 'PASS';
    if (protectedChanged > 0 || beforeChecksum !== afterChecksum) status = 'FAIL';
    else if (
      beforeBounds &&
      afterBounds &&
      (Math.abs(beforeBounds.cx - afterBounds.cx) > 0.01 ||
        Math.abs(beforeBounds.cy - afterBounds.cy) > 0.01 ||
        beforeBounds.minX !== afterBounds.minX ||
        beforeBounds.maxX !== afterBounds.maxX ||
        beforeBounds.minY !== afterBounds.minY ||
        beforeBounds.maxY !== afterBounds.maxY)
    ) {
      status = 'FAIL';
    } else if (residualText > 0) status = 'FAIL';

    globalProtectedChanged += protectedChanged;
    globalLabelChanged += labelChanged;
    globalChanged += labelChanged;

    cellReports.push({
      key: entry.key,
      sourceLabel: entry.sourceLabel,
      row: entry.row,
      column: entry.column,
      mask,
      iconRegionChecksumBefore: beforeChecksum,
      iconRegionChecksumAfter: afterChecksum,
      iconCentroidBefore: beforeBounds ? { cx: beforeBounds.cx, cy: beforeBounds.cy } : null,
      iconCentroidAfter: afterBounds ? { cx: afterBounds.cx, cy: afterBounds.cy } : null,
      iconBoundsBefore: beforeBounds,
      iconBoundsAfter: afterBounds,
      protectedPixelsChanged: protectedChanged,
      labelPixelsChanged: labelChanged,
      residualTextPixels: residualText,
      parityStatus: status,
    });
  }

  if (globalProtectedChanged > 0) {
    throw new Error(`Protected icon pixels changed: ${globalProtectedChanged} (must be 0)`);
  }

  const twinPath = path.join(ROOT, TWIN_REL);
  fs.mkdirSync(path.dirname(twinPath), { recursive: true });
  await sharp(twin, { raw: { width: sw, height: sh, channels } }).png().toFile(twinPath);
  const twinSha = crypto.createHash('sha256').update(fs.readFileSync(twinPath)).digest('hex');

  fs.mkdirSync(path.join(ROOT, QA_ASSETS_DIR), { recursive: true });
  fs.mkdirSync(path.join(ROOT, QA_DOCS_DIR), { recursive: true });

  // Visual diff (highlight changed pixels)
  const diff = Buffer.alloc(sw * sh * 4);
  for (let i = 0; i < sw * sh; i += 1) {
    const si = i * channels;
    const changed =
      srcData[si] !== twin[si] || srcData[si + 1] !== twin[si + 1] || srcData[si + 2] !== twin[si + 2];
    const di = i * 4;
    if (changed) {
      diff[di] = 255;
      diff[di + 1] = 40;
      diff[di + 2] = 40;
      diff[di + 3] = 255;
    } else {
      diff[di] = 20;
      diff[di + 1] = 20;
      diff[di + 2] = 24;
      diff[di + 3] = 255;
    }
  }

  // Protected-region diff (should be empty / dark)
  const protectedDiff = Buffer.alloc(sw * sh * 4, 0);
  for (const report of cellReports) {
    const cell = cellRect(sw, sh, report.row, report.column);
    for (let y = 0; y < report.mask.labelMaskTop; y += 1) {
      for (let x = 0; x < cell.width; x += 1) {
        const gi = ((cell.top + y) * sw + (cell.left + x)) * channels;
        const pi = (cell.top + y) * sw + (cell.left + x);
        const di = pi * 4;
        const changed =
          srcData[gi] !== twin[gi] || srcData[gi + 1] !== twin[gi + 1] || srcData[gi + 2] !== twin[gi + 2];
        if (changed) {
          protectedDiff[di] = 255;
          protectedDiff[di + 1] = 0;
          protectedDiff[di + 2] = 255;
          protectedDiff[di + 3] = 255;
        }
      }
    }
  }

  // Label mask visualization
  const maskVis = Buffer.alloc(sw * sh * 4);
  for (let i = 0; i < sw * sh; i += 1) {
    const di = i * 4;
    maskVis[di] = 14;
    maskVis[di + 1] = 14;
    maskVis[di + 2] = 16;
    maskVis[di + 3] = 255;
  }
  for (const report of cellReports) {
    const cell = cellRect(sw, sh, report.row, report.column);
    for (let y = report.mask.labelMaskTop; y <= report.mask.labelMaskBottom; y += 1) {
      for (let x = 0; x < cell.width; x += 1) {
        const pi = (cell.top + y) * sw + (cell.left + x);
        const di = pi * 4;
        maskVis[di] = 255;
        maskVis[di + 1] = 80;
        maskVis[di + 2] = 80;
        maskVis[di + 3] = 180;
      }
    }
  }

  // 64-cell side-by-side sheet
  const thumbW = 175;
  const thumbH = 140;
  const sheetW = COLS * thumbW * 2;
  const sheetH = ROWS * thumbH;
  const sheet = Buffer.alloc(sheetW * sheetH * 4, 0);
  for (let i = 0; i < sheet.length; i += 4) {
    sheet[i] = 10;
    sheet[i + 1] = 10;
    sheet[i + 2] = 12;
    sheet[i + 3] = 255;
  }
  for (const report of cellReports) {
    const cell = cellRect(sw, sh, report.row, report.column);
    const labeledCell = await sharp(labeledPath).extract(cell).png().toBuffer();
    const twinCellImg = await sharp(twinPath).extract(cell).png().toBuffer();
    for (const [buf, offset] of [
      [labeledCell, 0],
      [twinCellImg, thumbW],
    ]) {
      const img = await sharp(buf)
        .resize(thumbW, thumbH, { fit: 'fill' })
        .ensureAlpha()
        .raw()
        .toBuffer({ resolveWithObject: true });
      const ox = report.column * thumbW * 2 + offset;
      const oy = report.row * thumbH;
      for (let y = 0; y < img.info.height; y += 1) {
        for (let x = 0; x < img.info.width; x += 1) {
          const si = (y * img.info.width + x) * 4;
          const dx = ox + x;
          const dy = oy + y;
          const di = (dy * sheetW + dx) * 4;
          sheet[di] = img.data[si];
          sheet[di + 1] = img.data[si + 1];
          sheet[di + 2] = img.data[si + 2];
          sheet[di + 3] = 255;
        }
      }
    }
  }

  for (const qaDir of [QA_ASSETS_DIR, QA_DOCS_DIR]) {
    await sharp(labeledPath).png().toFile(path.join(ROOT, qaDir, 'labeled-source-preview.png'));
    await sharp(twinPath).png().toFile(path.join(ROOT, qaDir, 'unlabeled-twin-preview.png'));
    await sharp(diff, { raw: { width: sw, height: sh, channels: 4 } })
      .png()
      .toFile(path.join(ROOT, qaDir, 'source-twin-diff.png'));
    await sharp(protectedDiff, { raw: { width: sw, height: sh, channels: 4 } })
      .png()
      .toFile(path.join(ROOT, qaDir, 'protected-region-diff.png'));
    await sharp(maskVis, { raw: { width: sw, height: sh, channels: 4 } })
      .png()
      .toFile(path.join(ROOT, qaDir, 'label-mask-visualization.png'));
    await sharp(sheet, { raw: { width: sheetW, height: sheetH, channels: 4 } })
      .png()
      .toFile(path.join(ROOT, qaDir, '64-cell-source-twin-comparison.png'));
  }

  const pass = cellReports.filter((r) => r.parityStatus === 'PASS').length;
  const warn = cellReports.filter((r) => r.parityStatus === 'WARN').length;
  const fail = cellReports.filter((r) => r.parityStatus === 'FAIL').length;

  const parityPayload = {
    version: V5_VERSION,
    labeledSha256: labeledSha,
    twinSha256: twinSha,
    width: sw,
    height: sh,
    rows: ROWS,
    columns: COLS,
    protectedPixelsChanged: globalProtectedChanged,
    labelPixelsChanged: globalLabelChanged,
    changedPixels: globalChanged,
    parityPass: pass,
    parityWarn: warn,
    parityFail: fail,
    icons: cellReports,
  };
  fs.writeFileSync(path.join(ROOT, PARITY_JSON), JSON.stringify(parityPayload, null, 2));

  const lines = cellReports
    .map(
      (r) =>
        `| ${r.sourceLabel} | ${r.key} | ${r.row},${r.column} | ${r.iconRegionChecksumBefore.slice(0, 12)} | ${r.iconRegionChecksumAfter.slice(0, 12)} | ${r.protectedPixelsChanged} | ${r.labelPixelsChanged} | ${r.residualTextPixels} | ${r.parityStatus} |`,
    )
    .join('\n');

  fs.writeFileSync(
    path.join(ROOT, PARITY_DOC),
    `# Studio World Icon Source Twin Parity\n\nVersion: ${V5_VERSION}\n\nLabeled sha256: \`${labeledSha}\`\n\nTwin sha256: \`${twinSha}\`\n\n## Summary\n\n- Protected pixels changed (global): ${globalProtectedChanged}\n- Label pixels changed: ${globalLabelChanged}\n- Parity PASS: ${pass}\n- Parity WARN: ${warn}\n- Parity FAIL: ${fail}\n\n| Label | Key | Row,Col | Icon checksum before | Icon checksum after | Protected Δ | Label Δ | Residual text | Status |\n|---|---|---|---:|---:|---:|---:|---:|---|\n${lines}\n`,
  );

  // Emit mask config for tests
  const maskBody = `/** Per-cell label masks — generated by scripts/create-studio-world-unlabeled-source-twin.mjs */
export const STUDIO_WORLD_ICON_LABEL_MASK_VERSION = '${V5_VERSION}' as const;

export type StudioWorldIconLabelMask = {
  key: string;
  sourceLabel: string;
  iconSafeTop: number;
  iconSafeBottom: number;
  labelMaskTop: number;
  labelMaskBottom: number;
  left: number;
  right: number;
};

export const STUDIO_WORLD_ICON_LABEL_MASKS: Record<string, StudioWorldIconLabelMask> = ${JSON.stringify(
    Object.fromEntries(
      cellReports.map((r) => [
        r.key,
        {
          key: r.key,
          sourceLabel: r.sourceLabel,
          ...r.mask,
        },
      ]),
    ),
    null,
    2,
  )} as Record<string, StudioWorldIconLabelMask>;
`;
  fs.writeFileSync(path.join(ROOT, MASK_CONFIG_REL), maskBody);

  console.log(
    JSON.stringify(
      {
        version: V5_VERSION,
        labeledSha256: labeledSha,
        twinSha256: twinSha,
        protectedPixelsChanged: globalProtectedChanged,
        labelPixelsChanged: globalLabelChanged,
        parityPass: pass,
        parityWarn: warn,
        parityFail: fail,
      },
      null,
      2,
    ),
  );

  if (fail > 0 || globalProtectedChanged > 0) process.exit(1);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
