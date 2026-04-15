export const config = {
  maxDuration: 120,
};

import type { VercelRequest, VercelResponse } from '@vercel/node';
import {
  buildGeneratedUnitColorPrompt,
  buildGeneratedUnitSelectionPrompt,
  buildRoseBackdropPrompt,
} from './_lib/buildWigGeneratedUnit.js';

type BuildWigUnitImageBody = {
  unitKey?: string;
  referenceImagePath?: string;
  referenceImageUrl?: string;
  length?: string;
  density?: string;
  lace?: string;
  texture?: string;
  color?: string;
  hairline?: string;
  styling?: string;
  addOns?: string[];
  partSelection?: string;
  referenceMatchesHairline?: boolean;
};

function sendJson(res: VercelResponse, status: number, body: unknown): void {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.end(JSON.stringify(body));
}

function parseBody(req: VercelRequest): BuildWigUnitImageBody {
  const body = req.body;
  if (typeof body === 'string') {
    try {
      const parsed = JSON.parse(body) as unknown;
      return parsed && typeof parsed === 'object' && !Array.isArray(parsed)
        ? (parsed as BuildWigUnitImageBody)
        : {};
    } catch {
      return {};
    }
  }
  if (body && typeof body === 'object' && !Array.isArray(body)) {
    return body as BuildWigUnitImageBody;
  }
  return {};
}

function readString(body: BuildWigUnitImageBody, key: keyof BuildWigUnitImageBody, fallback = ''): string {
  const value = body[key];
  return typeof value === 'string' && value.trim() ? value.trim() : fallback;
}

function readStringArray(body: BuildWigUnitImageBody, key: keyof BuildWigUnitImageBody): string[] {
  const value = body[key];
  if (!Array.isArray(value)) return [];
  return value.map((item) => String(item).trim().toUpperCase()).filter(Boolean);
}

function readBool(body: BuildWigUnitImageBody, key: keyof BuildWigUnitImageBody): boolean {
  const value = body[key];
  if (value === true) return true;
  if (value === false) return false;
  if (typeof value === 'string') {
    const normalized = value.trim().toLowerCase();
    return normalized === '1' || normalized === 'true' || normalized === 'yes';
  }
  return false;
}

function buildReferenceImageUrl(req: VercelRequest, body: BuildWigUnitImageBody): string {
  const explicitUrl = readString(body, 'referenceImageUrl', '');
  if (/^https?:\/\//i.test(explicitUrl)) return explicitUrl;

  const refPath = readString(body, 'referenceImagePath', '');
  if (!refPath) {
    throw new Error('referenceImagePath or referenceImageUrl is required');
  }

  const proto =
    String(req.headers['x-forwarded-proto'] || 'https')
      .split(',')[0]
      .trim() || 'https';
  const host =
    String(req.headers['x-forwarded-host'] || req.headers.host || '')
      .split(',')[0]
      .trim();
  if (!host) {
    throw new Error('Could not resolve the public host for the mannequin reference image');
  }
  const normalizedPath = refPath.startsWith('/') ? refPath : `/${refPath}`;
  return new URL(normalizedPath, `${proto}://${host}`).toString();
}

async function runFalEdit(prompt: string, imageUrls: string[]): Promise<string> {
  const { fal } = await import('@fal-ai/client');
  fal.config({ credentials: process.env.FAL_KEY || '' });
  const result = await fal.subscribe('fal-ai/nano-banana-pro/edit', {
    input: {
      prompt,
      image_urls: imageUrls,
      aspect_ratio: 'auto',
      resolution: '2K',
      output_format: 'webp',
      num_images: 1,
    },
    logs: false,
  });
  const imageUrl = result?.data?.images?.[0]?.url;
  if (!imageUrl) {
    throw new Error(`Unit generation returned an unexpected fal response: ${JSON.stringify(result?.data).slice(0, 400)}`);
  }
  return imageUrl;
}

export default async function handler(req: VercelRequest, res: VercelResponse): Promise<void> {
  try {
    if (req.method !== 'POST') {
      sendJson(res, 405, { error: 'Method not allowed' });
      return;
    }

    if (!process.env.FAL_KEY?.trim()) {
      sendJson(res, 503, { error: 'FAL_KEY is not configured on the server' });
      return;
    }

    const body = parseBody(req);
    const unitKey = readString(body, 'unitKey', 'NOIR');
    const referenceImageUrl = buildReferenceImageUrl(req, body);

    const selections = {
      unitKey,
      length: readString(body, 'length', '24"'),
      density: readString(body, 'density', unitKey.trim().toUpperCase() === 'BLANCO' ? '250%' : '200%'),
      lace: readString(body, 'lace', '13X6'),
      texture: readString(body, 'texture', 'SILKY'),
      color: readString(body, 'color', unitKey.trim().toUpperCase() === 'BLANCO' ? 'PLATINUM' : 'OFF BLACK'),
      hairline: readString(body, 'hairline', 'NATURAL'),
      styling: readString(body, 'styling', 'NONE'),
      addOns: readStringArray(body, 'addOns'),
      partSelection: readString(body, 'partSelection', 'MIDDLE'),
      referenceMatchesHairline: readBool(body, 'referenceMatchesHairline'),
    };

    let currentImageUrl = await runFalEdit(buildRoseBackdropPrompt(), [referenceImageUrl]);
    const stepsRun = ['rose-base'];

    const colorPrompt = buildGeneratedUnitColorPrompt(selections);
    if (colorPrompt) {
      currentImageUrl = await runFalEdit(colorPrompt, [currentImageUrl]);
      stepsRun.push('color');
    }

    const selectionPrompt = buildGeneratedUnitSelectionPrompt(selections);
    if (selectionPrompt) {
      currentImageUrl = await runFalEdit(selectionPrompt, [currentImageUrl]);
      stepsRun.push('selection');
    }

    sendJson(res, 200, {
      ok: true,
      imageUrl: currentImageUrl,
      stepsRun,
      referenceImageUrl,
      selections,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unit generation failed';
    sendJson(res, 500, { error: message });
  }
}
