export const config = { maxDuration: 60 };

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getAuthUser } from './_lib/auth.js';
import { startStudioTryOnRender } from './_lib/liveTryOnStudio.js';
import { type LiveTryOnAngle } from './_lib/liveTryOnOverlay.js';

function parseBody(req: VercelRequest): Record<string, unknown> {
  const body = req.body;
  if (typeof body === 'string') {
    try {
      return JSON.parse(body) as Record<string, unknown>;
    } catch {
      return {};
    }
  }
  if (body && typeof body === 'object' && !Array.isArray(body)) return body as Record<string, unknown>;
  return {};
}

function readString(obj: Record<string, unknown>, key: string, fallback = ''): string {
  const v = obj[key];
  return typeof v === 'string' && v.trim() ? v.trim() : fallback;
}

function parseAngle(raw: string): LiveTryOnAngle {
  const v = raw.toLowerCase();
  if (v === 'left' || v === 'right' || v === 'front') return v;
  return 'front';
}

function parseHeadYawDeg(body: Record<string, unknown>): number | undefined {
  const raw = body.headYawDeg;
  const n = typeof raw === 'number' ? raw : typeof raw === 'string' && raw.trim() ? Number(raw) : NaN;
  if (!Number.isFinite(n)) return undefined;
  return Math.round(Math.max(-40, Math.min(40, n)));
}

export default async function handler(req: VercelRequest, res: VercelResponse): Promise<void> {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') {
    res.status(204).end();
    return;
  }
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const user = await getAuthUser(req);
  if (!user?.id) {
    res.status(401).json({ error: 'Sign in required for Studio Try-On' });
    return;
  }

  const body = parseBody(req);
  const imageDataUrl = readString(body, 'imageDataUrl');
  const color = readString(body, 'color');
  if (!imageDataUrl) {
    res.status(400).json({ error: 'imageDataUrl is required' });
    return;
  }
  if (!color) {
    res.status(400).json({ error: 'color is required' });
    return;
  }

  const angle = parseAngle(readString(body, 'angle', 'front'));
  const unitKey = readString(body, 'unitKey', 'NOIR');
  const headYawDeg = parseHeadYawDeg(body);
  const length = readString(body, 'length', '24"');
  const density = readString(body, 'density', '200%');
  const lace = readString(body, 'lace', '13X6');
  const texture = readString(body, 'texture', 'SILKY');
  const hairline = readString(body, 'hairline', 'NATURAL');
  const styling = readString(body, 'styling', 'NONE');
  const partSelection = readString(body, 'partSelection', 'MIDDLE');
  const addOnsRaw = body.addOns;
  const addOns = Array.isArray(addOnsRaw)
    ? addOnsRaw.map((x) => String(x).toUpperCase()).filter(Boolean)
    : [];

  try {
    const result = await startStudioTryOnRender({
      imageDataUrl,
      color,
      unitKey,
      length,
      density,
      lace,
      texture,
      hairline,
      styling,
      addOns,
      partSelection,
      angle,
      headYawDeg,
      userId: user.id,
    });
    res.status(200).json({ ok: true, ...result });
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Studio render failed';
    const status =
      msg === 'COLOR_PREVIEW_MISSING'
        ? 400
        : msg.includes('Sign in')
          ? 401
          : /rejected by Fal|422|unprocessable entity/i.test(msg)
            ? 422
            : 500;
    res.status(status).json({ error: msg });
  }
}
