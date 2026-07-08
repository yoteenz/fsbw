import { isBlendCompositeLayer } from './reference-chain';
import type { MasterSceneBlueprint } from './master-scene-blueprint';
import type { SceneLayerQualityStatus, SceneStackLayerId } from './types';

export type SceneQualityGuardResult = {
  status: SceneLayerQualityStatus;
  issues: string[];
  metrics: {
    width: number;
    height: number;
    frameCoverage: number;
    shellSimilarity: number | null;
    edgeSharpness: number;
  };
};

type ImageMetrics = {
  width: number;
  height: number;
  frameCoverage: number;
  edgeSharpness: number;
  avgLuminance: number;
};

function loadImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('Failed to load layer image for quality guard'));
    img.src = url;
  });
}

function sampleImageMetrics(img: HTMLImageElement, sampleSize = 64): ImageMetrics {
  const canvas = document.createElement('canvas');
  canvas.width = sampleSize;
  canvas.height = sampleSize;
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  if (!ctx) {
    return { width: img.width, height: img.height, frameCoverage: 0, edgeSharpness: 0, avgLuminance: 0 };
  }

  ctx.drawImage(img, 0, 0, sampleSize, sampleSize);
  const { data } = ctx.getImageData(0, 0, sampleSize, sampleSize);

  let activePixels = 0;
  let luminanceSum = 0;
  let edgeSum = 0;
  const total = sampleSize * sampleSize;

  for (let y = 0; y < sampleSize; y++) {
    for (let x = 0; x < sampleSize; x++) {
      const i = (y * sampleSize + x) * 4;
      const r = data[i]!;
      const g = data[i + 1]!;
      const b = data[i + 2]!;
      const a = data[i + 3]!;
      const lum = 0.299 * r + 0.587 * g + 0.114 * b;

      const isActive = a > 24 && lum > 18;
      if (isActive) activePixels++;
      luminanceSum += lum;

      if (x > 0 && y > 0) {
        const pi = ((y - 1) * sampleSize + (x - 1)) * 4;
        const prevLum = 0.299 * data[pi]! + 0.587 * data[pi + 1]! + 0.114 * data[pi + 2]!;
        edgeSum += Math.abs(lum - prevLum);
      }
    }
  }

  return {
    width: img.naturalWidth || img.width,
    height: img.naturalHeight || img.height,
    frameCoverage: activePixels / total,
    edgeSharpness: edgeSum / total,
    avgLuminance: luminanceSum / total,
  };
}

async function computeHistogramSimilarity(urlA: string, urlB: string): Promise<number> {
  try {
    const [imgA, imgB] = await Promise.all([loadImage(urlA), loadImage(urlB)]);
    const mA = sampleImageMetrics(imgA, 32);
    const mB = sampleImageMetrics(imgB, 32);
    const covDiff = Math.abs(mA.frameCoverage - mB.frameCoverage);
    const lumDiff = Math.abs(mA.avgLuminance - mB.avgLuminance) / 255;
    const sharpDiff = Math.abs(mA.edgeSharpness - mB.edgeSharpness) / Math.max(mA.edgeSharpness, mB.edgeSharpness, 1);
    return Math.max(0, 1 - (covDiff * 0.5 + lumDiff * 0.3 + sharpDiff * 0.2));
  } catch {
    return 0;
  }
}

function parseAspectRatio(ratio: string): number {
  const [w, h] = ratio.split(':').map(Number);
  if (!w || !h) return 9 / 16;
  return w / h;
}

/**
 * Scene Stack Quality Guard™ — validates layer output before approval.
 * Heuristic canvas analysis; marks REGENERATE REQUIRED with human-readable reasons.
 */
export async function validateSceneLayerQuality(input: {
  layerId: SceneStackLayerId;
  publicUrl: string;
  blueprint: MasterSceneBlueprint;
}): Promise<SceneQualityGuardResult> {
  const issues: string[] = [];

  let metrics: SceneQualityGuardResult['metrics'] = {
    width: 0,
    height: 0,
    frameCoverage: 0,
    shellSimilarity: null,
    edgeSharpness: 0,
  };

  try {
    const img = await loadImage(input.publicUrl);
    const sampled = sampleImageMetrics(img);
    metrics = {
      width: sampled.width,
      height: sampled.height,
      frameCoverage: sampled.frameCoverage,
      shellSimilarity: null,
      edgeSharpness: sampled.edgeSharpness,
    };

    const minDim = Math.min(sampled.width, sampled.height);
    if (minDim < 512) {
      issues.push(`Resolution below target (${sampled.width}×${sampled.height}) — REGENERATE REQUIRED.`);
    }

    const expectedRatio = parseAspectRatio(input.blueprint.camera.aspectRatio);
    const actualRatio = sampled.width / sampled.height;
    if (Math.abs(actualRatio - expectedRatio) > 0.15) {
      issues.push(
        `Aspect ratio drift (${actualRatio.toFixed(2)} vs ${expectedRatio.toFixed(2)}) — possible geometry drift.`
      );
    }

    if (sampled.edgeSharpness < 2.5) {
      issues.push('Low edge sharpness — possible blur or over-compression. REGENERATE REQUIRED.');
    }

    if (input.layerId === 'environment-shell') {
      if (sampled.frameCoverage < 0.35) {
        issues.push('Shell layer appears sparse — may be incomplete architecture pass.');
      }
    } else if (isBlendCompositeLayer(input.layerId)) {
      if (sampled.frameCoverage > 0.55) {
        issues.push(
          'Blend overlay layer covers too much frame — likely full-scene rerender instead of isolated effect pass. REGENERATE REQUIRED.'
        );
      }
      if (sampled.avgLuminance > 140) {
        issues.push('Lighting washout detected on overlay pass — REGENERATE REQUIRED.');
      }
    } else {
      if (sampled.frameCoverage > 0.82) {
        issues.push(
          'Object layer fills entire frame — likely full-scene rerender baking prior layers. REGENERATE REQUIRED.'
        );
      }
    }

    if (input.blueprint.shellReferenceUrl && input.layerId !== 'environment-shell') {
      const similarity = await computeHistogramSimilarity(
        input.publicUrl,
        input.blueprint.shellReferenceUrl
      );
      metrics.shellSimilarity = similarity;
      if (similarity > 0.88 && sampled.frameCoverage > 0.5) {
        issues.push(
          'Layer closely matches shell with high frame coverage — likely re-encoded shell instead of isolated plate. REGENERATE REQUIRED.'
        );
      }
    }
  } catch {
    issues.push('Quality guard could not analyze image — save blocked until verification succeeds.');
  }

  const regenerateRequired = issues.some(
    (i) => i.includes('REGENERATE REQUIRED') || i.includes('save blocked')
  );

  return {
    status: regenerateRequired ? 'regenerate_required' : 'validated',
    issues,
    metrics,
  };
}

export function formatQualityGuardSummary(result: SceneQualityGuardResult): string {
  if (result.status === 'validated') return 'Quality guard passed.';
  return result.issues.join(' ');
}
