import type { SceneLayerQualityStatus, SceneStackLayerId } from './types';
import type { MasterSceneBlueprint } from './master-scene-blueprint';
import { isIsolatedObjectLayer } from './isolated-layer-contract';
import { analyzeIsolatedLayerQuality, type IsolatedLayerQualityAnalysis } from './isolated-layer-quality';
import { isBlendCompositeLayer } from './reference-chain';

export type SceneQualityGuardResult = {
  status: SceneLayerQualityStatus;
  issues: string[];
  classification?: IsolatedLayerQualityAnalysis['classification'];
  metrics: {
    width: number;
    height: number;
    frameCoverage: number;
    shellSimilarity: number | null;
    edgeSharpness: number;
    alphaChannelPresent?: boolean;
    transparentSides?: number;
  };
};

function parseAspectRatio(ratio: string): number {
  const [w, h] = ratio.split(':').map(Number);
  if (!w || !h) return 9 / 16;
  return w / h;
}

function loadImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('Failed to load layer image for quality guard'));
    img.src = url;
  });
}

function sampleImageMetrics(img: HTMLImageElement, sampleSize = 64) {
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

/**
 * Scene Stack Quality Guard™ — validates layer output before approval.
 */
export async function validateSceneLayerQuality(input: {
  layerId: SceneStackLayerId;
  publicUrl: string;
  blueprint: MasterSceneBlueprint;
}): Promise<SceneQualityGuardResult> {
  if (isIsolatedObjectLayer(input.layerId)) {
    const analysis = await analyzeIsolatedLayerQuality({
      layerId: input.layerId,
      publicUrl: input.publicUrl,
      shellReferenceUrl: input.blueprint.shellReferenceUrl,
    });
    return {
      status: analysis.regenerateRequired ? 'regenerate_required' : 'validated',
      issues: analysis.issues,
      classification: analysis.classification,
      metrics: {
        width: analysis.metrics.width,
        height: analysis.metrics.height,
        frameCoverage: analysis.metrics.frameCoverage,
        shellSimilarity: analysis.metrics.shellSimilarity,
        edgeSharpness: analysis.metrics.edgeSharpness,
        alphaChannelPresent: analysis.metrics.alphaChannelPresent,
        transparentSides: analysis.metrics.transparentSides,
      },
    };
  }

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

export function formatLayerQualityFailureMessage(
  layerId: SceneStackLayerId,
  layerLabel: string,
  result: SceneQualityGuardResult
): string {
  const isFullScene =
    result.classification === 'full-scene-rerender' ||
    result.classification === 'opaque-background' ||
    result.classification === 'suspicious-scene-rerender';

  if (isFullScene) {
    const subject =
      layerId === 'signature-landmark'
        ? 'an isolated landmark'
        : layerId === 'furniture-objects'
          ? 'an isolated furniture group'
          : 'an isolated component';
    return `${layerLabel} rejected — Generated asset contains a full-scene background instead of ${subject}.`;
  }

  if (result.status === 'validated') return 'Quality guard passed.';
  return `${layerLabel} rejected — ${result.issues.join(' ')}`;
}
