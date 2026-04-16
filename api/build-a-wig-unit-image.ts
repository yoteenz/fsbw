export const config = {
  maxDuration: 120,
};

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { basename } from 'node:path';
import {
  buildGeneratedUnitColorPrompt,
  buildGeneratedUnitSelectionPrompt,
  buildRoseBackdropPrompt,
} from './_lib/buildWigGeneratedUnit.js';

type BuildWigUnitImageBody = {
  unitKey?: string;
  referenceImagePath?: string;
  referenceImageUrl?: string;
  backdropReferenceImagePath?: string;
  backdropReferenceImageUrl?: string;
  backdropReferenceImageUrls?: string[];
  referenceView?: string;
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

function readUrlArray(body: BuildWigUnitImageBody, key: keyof BuildWigUnitImageBody): string[] {
  const value = body[key];
  if (!Array.isArray(value)) return [];
  return value
    .map((item) => String(item || '').trim())
    .filter((item) => /^https?:\/\//i.test(item));
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

function inferReferenceView(body: BuildWigUnitImageBody): string {
  const explicit = readString(body, 'referenceView', '');
  if (explicit) return explicit;
  const source =
    `${readString(body, 'referenceImagePath', '')} ${readString(body, 'referenceImageUrl', '')}`.toUpperCase();
  if (source.includes('LEFT')) return 'LEFT';
  if (source.includes('RIGHT')) return 'RIGHT';
  if (source.includes('FRONT')) return 'FRONT';
  return 'FRONT';
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

function buildOptionalImageUrl(
  req: VercelRequest,
  explicitUrl: string,
  explicitPath: string,
  fallbackPath = ''
): string | null {
  if (/^https?:\/\//i.test(explicitUrl)) return explicitUrl;
  const refPath = explicitPath || fallbackPath;
  if (!refPath) return null;
  const proto =
    String(req.headers['x-forwarded-proto'] || 'https')
      .split(',')[0]
      .trim() || 'https';
  const host =
    String(req.headers['x-forwarded-host'] || req.headers.host || '')
      .split(',')[0]
      .trim();
  if (!host) return null;
  const normalizedPath = refPath.startsWith('/') ? refPath : `/${refPath}`;
  return new URL(normalizedPath, `${proto}://${host}`).toString();
}

function mimeForPath(assetPath: string, fallback = 'image/png'): string {
  const lower = assetPath.toLowerCase();
  if (lower.endsWith('.jpg') || lower.endsWith('.jpeg')) return 'image/jpeg';
  if (lower.endsWith('.webp')) return 'image/webp';
  if (lower.endsWith('.gif')) return 'image/gif';
  if (lower.endsWith('.png')) return 'image/png';
  return fallback;
}

async function uploadAssetUrlToFal(assetUrl: string, fileNameHint: string): Promise<string> {
  const { fal } = await import('@fal-ai/client');
  fal.config({ credentials: process.env.FAL_KEY || '' });
  const response = await fetch(assetUrl);
  if (!response.ok) {
    throw new Error(`Reference image fetch failed ${response.status} for ${assetUrl}`);
  }
  const contentType = response.headers.get('content-type') || 'image/png';
  const buffer = Buffer.from(await response.arrayBuffer());
  const blob = new Blob([buffer], { type: mimeForPath(fileNameHint, contentType) });
  const file = new File([blob], basename(fileNameHint) || 'reference-image', {
    type: mimeForPath(fileNameHint, contentType),
  });
  return fal.storage.upload(file);
}

async function urlExists(url: string): Promise<boolean> {
  try {
    const response = await fetch(url);
    return response.ok;
  } catch {
    return false;
  }
}

function buildPublicAssetUrl(req: VercelRequest, assetPath: string): string | null {
  const normalized = String(assetPath || '').trim();
  if (!normalized) return null;
  const proto =
    String(req.headers['x-forwarded-proto'] || 'https')
      .split(',')[0]
      .trim() || 'https';
  const host =
    String(req.headers['x-forwarded-host'] || req.headers.host || '')
      .split(',')[0]
      .trim();
  if (!host) return null;
  const normalizedPath = normalized.startsWith('/') ? normalized : `/${normalized}`;
  return new URL(normalizedPath, `${proto}://${host}`).toString();
}

async function resolveRoseReferenceUrls(req: VercelRequest, body: BuildWigUnitImageBody): Promise<string[]> {
  const explicitUrls = readUrlArray(body, 'backdropReferenceImageUrls');
  if (explicitUrls.length > 0) {
    return [await uploadAssetUrlToFal(explicitUrls[0], 'backdrop-reference-1')];
  }

  const explicitUrl = readString(body, 'backdropReferenceImageUrl', '');
  if (/^https?:\/\//i.test(explicitUrl)) {
    return [await uploadAssetUrlToFal(explicitUrl, 'backdrop-reference')];
  }

  const explicitPath = readString(body, 'backdropReferenceImagePath', '');
  if (explicitPath) {
    const publicUrl = buildPublicAssetUrl(req, explicitPath);
    if (!publicUrl) throw new Error('Could not resolve backdrop reference image URL');
    return [await uploadAssetUrlToFal(publicUrl, explicitPath)];
  }

  const preferredRemoteUrl =
    'https://hyycomvcaqxxvyrfupes.supabase.co/storage/v1/object/public/refs-noir/consult%20inspo2.JPG';
  if (await urlExists(preferredRemoteUrl)) {
    return [await uploadAssetUrlToFal(preferredRemoteUrl, preferredRemoteUrl)];
  }

  const preferredAssetCandidates = [
    '/assets/consult inspo.png',
    '/assets/consult inspo.jpg',
    '/assets/consult inspo.jpeg',
    '/assets/consult inspo.webp',
    '/assets/consult_inspo.png',
    '/assets/consult_inspo.jpg',
    '/assets/consult_inspo.jpeg',
    '/assets/consult_inspo.webp',
    '/assets/consult-inspo.png',
    '/assets/consult-inspo.jpg',
    '/assets/consult-inspo.jpeg',
    '/assets/consult-inspo.webp',
    '/assets/consult inspo2.png',
    '/assets/consult inspo2.jpg',
    '/assets/consult inspo2.jpeg',
    '/assets/consult inspo2.webp',
    '/assets/consult_inspo2.png',
    '/assets/consult_inspo2.jpg',
    '/assets/consult_inspo2.jpeg',
    '/assets/consult_inspo2.webp',
    '/assets/consult-inspo2.png',
    '/assets/consult-inspo2.jpg',
    '/assets/consult-inspo2.jpeg',
    '/assets/consult-inspo2.webp',
  ];

  const uploaded: string[] = [];
  for (const assetPath of preferredAssetCandidates) {
    const publicUrl = buildPublicAssetUrl(req, assetPath);
    if (!publicUrl) continue;
    if (!(await urlExists(publicUrl))) continue;
    uploaded.push(await uploadAssetUrlToFal(publicUrl, assetPath));
  }
  if (uploaded.length > 0) return uploaded;

  const fallbackPath = '/assets/new-background.jpg';
  const fallbackUrl = buildPublicAssetUrl(req, fallbackPath);
  if (!fallbackUrl) return [];
  return [await uploadAssetUrlToFal(fallbackUrl, fallbackPath)];
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
    const referenceImageUrl = await uploadAssetUrlToFal(
      buildReferenceImageUrl(req, body),
      readString(body, 'referenceImagePath', 'reference-image')
    );
    const roseReferenceImageUrls = await resolveRoseReferenceUrls(req, body);

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
      referenceView: inferReferenceView(body),
    };

    const roseBasePrompt = buildRoseBackdropPrompt(roseReferenceImageUrls.length > 0);
    let currentImageUrl = await runFalEdit(
      roseBasePrompt,
      roseReferenceImageUrls.length > 0 ? [referenceImageUrl, ...roseReferenceImageUrls] : [referenceImageUrl]
    );
    const stepsRun = ['rose-base'];

    const colorPrompt = buildGeneratedUnitColorPrompt({
      unitKey: selections.unitKey,
      color: selections.color,
      partSelection: selections.partSelection,
      referenceView: selections.referenceView,
    });
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
      backdropReferenceImageUrl: roseReferenceImageUrls[0] || null,
      backdropReferenceImageUrls: roseReferenceImageUrls,
      selections,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unit generation failed';
    sendJson(res, 500, { error: message });
  }
}
