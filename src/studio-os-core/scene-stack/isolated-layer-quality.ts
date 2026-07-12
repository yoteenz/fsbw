import type { IsolatedLayerQualityClassification } from './isolated-layer-contract';
import { getIsolatedLayerContract, isIsolatedObjectLayer } from './isolated-layer-contract';
import type { SceneStackLayerId } from './types';

export type IsolatedLayerImageMetrics = {
  width: number;
  height: number;
  frameCoverage: number;
  edgeSharpness: number;
  avgLuminance: number;
  alphaChannelPresent: boolean;
  transparentSides: number;
  fullWidthEdgeContact: boolean;
  fullHeightEdgeContact: boolean;
  cornerOpacityAvg: number;
  bakedCheckerboardSuspect: boolean;
  shellSimilarity: number | null;
};

export type IsolatedLayerQualityAnalysis = {
  classification: IsolatedLayerQualityClassification;
  issues: string[];
  metrics: IsolatedLayerImageMetrics;
  regenerateRequired: boolean;
};

function loadImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('Failed to load layer image for quality analysis'));
    img.src = url;
  });
}

function analyzePixels(
  data: Uint8ClampedArray,
  sampleW: number,
  sampleH: number
): Omit<
  IsolatedLayerImageMetrics,
  'width' | 'height' | 'shellSimilarity'
> {
  let activePixels = 0;
  let luminanceSum = 0;
  let edgeSum = 0;
  let alphaSum = 0;
  let transparentPixels = 0;
  const total = sampleW * sampleH;

  const sideTransparent = { top: 0, bottom: 0, left: 0, right: 0 };
  const sideTotal = {
    top: sampleW,
    bottom: sampleW,
    left: sampleH,
    right: sampleH,
  };

  for (let y = 0; y < sampleH; y++) {
    for (let x = 0; x < sampleW; x++) {
      const i = (y * sampleW + x) * 4;
      const r = data[i]!;
      const g = data[i + 1]!;
      const b = data[i + 2]!;
      const a = data[i + 3]!;
      const lum = 0.299 * r + 0.587 * g + 0.114 * b;
      alphaSum += a;

      const isTransparent = a < 16;
      if (isTransparent) transparentPixels++;
      const isActive = a > 24 && lum > 18;
      if (isActive) activePixels++;
      luminanceSum += lum;

      if (x > 0 && y > 0) {
        const pi = ((y - 1) * sampleW + (x - 1)) * 4;
        const prevLum = 0.299 * data[pi]! + 0.587 * data[pi + 1]! + 0.114 * data[pi + 2]!;
        edgeSum += Math.abs(lum - prevLum);
      }

      if (isTransparent) {
        if (y === 0) sideTransparent.top++;
        if (y === sampleH - 1) sideTransparent.bottom++;
        if (x === 0) sideTransparent.left++;
        if (x === sampleW - 1) sideTransparent.right++;
      }
    }
  }

  const transparentSideCount = (['top', 'bottom', 'left', 'right'] as const).filter((side) => {
    const ratio = sideTransparent[side] / sideTotal[side];
    return ratio > 0.55;
  }).length;

  let fullWidthEdge = false;
  let fullHeightEdge = false;
  for (let x = 0; x < sampleW; x++) {
    const topI = x * 4 + 3;
    const botI = ((sampleH - 1) * sampleW + x) * 4 + 3;
    if (data[topI]! > 200 && data[botI]! > 200) fullWidthEdge = true;
  }
  for (let y = 0; y < sampleH; y++) {
    const leftI = (y * sampleW) * 4 + 3;
    const rightI = (y * sampleW + sampleW - 1) * 4 + 3;
    if (data[leftI]! > 200 && data[rightI]! > 200) fullHeightEdge = true;
  }

  const cornerIndices = [
    3,
    (sampleW - 1) * 4 + 3,
    ((sampleH - 1) * sampleW) * 4 + 3,
    ((sampleH - 1) * sampleW + sampleW - 1) * 4 + 3,
  ];
  const cornerOpacityAvg = cornerIndices.reduce((s, idx) => s + data[idx]!, 0) / cornerIndices.length;

  const grayishCorners = cornerIndices.filter((idx) => {
    const r = data[idx - 3]!;
    const g = data[idx - 2]!;
    const b = data[idx - 1]!;
    const a = data[idx]!;
    return a > 200 && Math.abs(r - g) < 8 && Math.abs(g - b) < 8 && r > 100 && r < 220;
  }).length;

  return {
    frameCoverage: activePixels / total,
    edgeSharpness: edgeSum / total,
    avgLuminance: luminanceSum / total,
    alphaChannelPresent: transparentPixels > total * 0.04,
    transparentSides: transparentSideCount,
    fullWidthEdgeContact: fullWidthEdge,
    fullHeightEdgeContact: fullHeightEdge,
    cornerOpacityAvg,
    bakedCheckerboardSuspect: grayishCorners >= 3,
  };
}

async function computeHistogramSimilarity(urlA: string, urlB: string): Promise<number> {
  try {
    const [imgA, imgB] = await Promise.all([loadImage(urlA), loadImage(urlB)]);
    const sample = 32;
    const canvas = document.createElement('canvas');
    canvas.width = sample;
    canvas.height = sample;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return 0;

    ctx.drawImage(imgA, 0, 0, sample, sample);
    const a = ctx.getImageData(0, 0, sample, sample).data;
    ctx.drawImage(imgB, 0, 0, sample, sample);
    const b = ctx.getImageData(0, 0, sample, sample).data;

    const mA = analyzePixels(a, sample, sample);
    const mB = analyzePixels(b, sample, sample);
    const covDiff = Math.abs(mA.frameCoverage - mB.frameCoverage);
    const lumDiff = Math.abs(mA.avgLuminance - mB.avgLuminance) / 255;
    const sharpDiff = Math.abs(mA.edgeSharpness - mB.edgeSharpness) / Math.max(mA.edgeSharpness, mB.edgeSharpness, 1);
    return Math.max(0, 1 - (covDiff * 0.5 + lumDiff * 0.3 + sharpDiff * 0.2));
  } catch {
    return 0;
  }
}

export async function analyzeIsolatedLayerQuality(input: {
  layerId: SceneStackLayerId;
  publicUrl: string;
  shellReferenceUrl?: string | null;
}): Promise<IsolatedLayerQualityAnalysis> {
  const contract = getIsolatedLayerContract(input.layerId);
  const issues: string[] = [];
  let classification: IsolatedLayerQualityClassification = 'low-confidence-isolation';

  const metrics: IsolatedLayerImageMetrics = {
    width: 0,
    height: 0,
    frameCoverage: 0,
    edgeSharpness: 0,
    avgLuminance: 0,
    alphaChannelPresent: false,
    transparentSides: 0,
    fullWidthEdgeContact: false,
    fullHeightEdgeContact: false,
    cornerOpacityAvg: 255,
    bakedCheckerboardSuspect: false,
    shellSimilarity: null,
  };

  try {
    const img = await loadImage(input.publicUrl);
    const sampleW = 64;
    const sampleH = 64;
    const canvas = document.createElement('canvas');
    canvas.width = sampleW;
    canvas.height = sampleH;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) throw new Error('Canvas unavailable');

    ctx.drawImage(img, 0, 0, sampleW, sampleH);
    const sampled = analyzePixels(ctx.getImageData(0, 0, sampleW, sampleH).data, sampleW, sampleH);

    metrics.width = img.naturalWidth || img.width;
    metrics.height = img.naturalHeight || img.height;
    Object.assign(metrics, sampled);

    const evaluated = evaluateIsolatedLayerQualityRules({
      layerId: input.layerId,
      contract,
      metrics,
      shellSimilarity: null,
    });
    issues.push(...evaluated.issues);
    classification = evaluated.classification;

    if (input.shellReferenceUrl && isIsolatedObjectLayer(input.layerId)) {
      const similarity = await computeHistogramSimilarity(input.publicUrl, input.shellReferenceUrl);
      metrics.shellSimilarity = similarity;
      const shellEval = evaluateIsolatedLayerQualityRules({
        layerId: input.layerId,
        contract,
        metrics,
        shellSimilarity: similarity,
      });
      issues.push(...shellEval.issues.filter((i) => !issues.includes(i)));
      if (shellEval.classification === 'full-scene-rerender' || shellEval.classification === 'opaque-background' || shellEval.classification === 'baked-checkerboard') {
        classification = shellEval.classification;
      } else if (shellEval.classification === 'suspicious-scene-rerender' && classification === 'low-confidence-isolation') {
        classification = shellEval.classification;
      }
    }

    if (issues.length === 0) {
      classification = 'isolated-valid';
    }
  } catch {
    issues.push('Quality guard could not analyze image — save blocked until verification succeeds.');
    classification = 'low-confidence-isolation';
  }

  const regenerateRequired = issues.some(
    (i) => i.includes('REGENERATE REQUIRED') || i.includes('save blocked')
  );

  return { classification, issues, metrics, regenerateRequired };
}

/** Pure rule evaluation for isolated layers — used by quality guard and tests. */
export function evaluateIsolatedLayerQualityRules(input: {
  layerId: SceneStackLayerId;
  contract: ReturnType<typeof getIsolatedLayerContract>;
  metrics: Pick<
    IsolatedLayerImageMetrics,
    | 'frameCoverage'
    | 'alphaChannelPresent'
    | 'transparentSides'
    | 'fullWidthEdgeContact'
    | 'fullHeightEdgeContact'
    | 'bakedCheckerboardSuspect'
  >;
  shellSimilarity: number | null;
}): { classification: IsolatedLayerQualityClassification; issues: string[] } {
  const { contract, metrics, shellSimilarity } = input;
  const issues: string[] = [];
  let classification: IsolatedLayerQualityClassification = 'low-confidence-isolation';

  if (isIsolatedObjectLayer(input.layerId)) {
    if (!metrics.alphaChannelPresent) {
      issues.push('Opaque background detected — isolated object layer requires transparent alpha. REGENERATE REQUIRED.');
      classification = 'opaque-background';
    }

    if (metrics.frameCoverage > contract.maximumFrameCoverage) {
      issues.push(
        'Object layer fills entire frame — likely full-scene rerender baking prior layers. REGENERATE REQUIRED.'
      );
      classification = 'full-scene-rerender';
    }

    if (metrics.transparentSides < contract.minimumTransparentSides) {
      issues.push(
        `Insufficient transparent margin (${metrics.transparentSides}/${contract.minimumTransparentSides} sides). REGENERATE REQUIRED.`
      );
      if (classification === 'low-confidence-isolation') classification = 'suspicious-scene-rerender';
    }

    if (!contract.allowFullWidthEdgeContact && metrics.fullWidthEdgeContact) {
      issues.push('Object touches full frame width — likely scene background. REGENERATE REQUIRED.');
      classification = 'full-scene-rerender';
    }

    if (!contract.allowFullHeightEdgeContact && metrics.fullHeightEdgeContact) {
      issues.push('Object touches full frame height — likely scene background. REGENERATE REQUIRED.');
      classification = 'full-scene-rerender';
    }

    if (metrics.bakedCheckerboardSuspect) {
      issues.push('Baked checkerboard or matte studio background detected. REGENERATE REQUIRED.');
      classification = 'baked-checkerboard';
    }
  }

  if (shellSimilarity != null && isIsolatedObjectLayer(input.layerId)) {
    if (shellSimilarity > contract.shellSimilarityThreshold && metrics.frameCoverage > 0.45) {
      issues.push(
        'Layer closely matches shell with high frame coverage — likely re-encoded shell instead of isolated plate. REGENERATE REQUIRED.'
      );
      classification = 'full-scene-rerender';
    } else if (shellSimilarity > contract.shellSimilarityThreshold - 0.05) {
      if (classification === 'low-confidence-isolation') classification = 'suspicious-scene-rerender';
    }
  }

  if (issues.length === 0) {
    classification = 'isolated-valid';
  }

  return { classification, issues };
}
