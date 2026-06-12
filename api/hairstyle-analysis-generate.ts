export const config = { maxDuration: 300 };

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getAuthUser } from './_lib/auth.js';
import {
  generateHairstyleAnalysisWithFal,
  type GenerateHairstyleAnalysisFalInput,
} from './_lib/hairstyleAnalysisFal.js';
import type { FalHairstyleAnalysis } from './_lib/hairstyleAnalysisFalPrompt.js';

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

function readString(obj: Record<string, unknown>, key: string): string {
  const v = obj[key];
  return typeof v === 'string' ? v.trim() : '';
}

function readLook(raw: unknown): FalHairstyleAnalysis['topMatch'] | null {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return null;
  const o = raw as Record<string, unknown>;
  const score = typeof o.score === 'number' ? o.score : Number(o.score);
  const rating = typeof o.rating === 'number' ? o.rating : Number(o.rating);
  const rank = typeof o.rank === 'number' ? o.rank : Number(o.rank);
  if (!Number.isFinite(score) || !Number.isFinite(rating) || !Number.isFinite(rank)) return null;
  return {
    rank,
    unit: readString(o, 'unit') || 'NOIR',
    color: readString(o, 'color') || 'JET BLACK',
    hex: readString(o, 'hex') || '#000000',
    length: readString(o, 'length') || '24 INCHES',
    lace: readString(o, 'lace') || '13X6 HD',
    density: readString(o, 'density') || '250%',
    hairline: readString(o, 'hairline') || 'NATURAL',
    part: readString(o, 'part') || 'MIDDLE',
    styling: readString(o, 'styling') || 'NONE',
    score,
    rating,
  };
}

function parseTier(raw: string): FalHairstyleAnalysis['tier'] | null {
  const v = raw.trim().toLowerCase();
  if (
    v === 'free' ||
    v === 'three_month' ||
    v === 'six_month' ||
    v === 'twelve_month' ||
    v === 'black'
  ) {
    return v;
  }
  return null;
}

function siteOriginFromRequest(req: VercelRequest): string {
  const env = (process.env.SITE_URL || '').trim().replace(/\/$/, '');
  if (env) return env;
  const host = req.headers['x-forwarded-host'] || req.headers.host;
  const proto = req.headers['x-forwarded-proto'] || 'https';
  if (typeof host === 'string' && host) return `${proto}://${host}`;
  return 'https://fsbw.vercel.app';
}

function parseAnalysis(body: Record<string, unknown>): GenerateHairstyleAnalysisFalInput | null {
  const nested = body.analysis;
  const src =
    nested && typeof nested === 'object' && !Array.isArray(nested)
      ? (nested as Record<string, unknown>)
      : body;

  const tier = parseTier(readString(src, 'tier'));
  const topMatch = readLook(src.topMatch);
  const templateUrl = readString(src, 'templateUrl');
  const clientPreviewUrl = readString(src, 'clientPreviewUrl');
  if (!tier || !topMatch || !templateUrl || !clientPreviewUrl) return null;

  const additionalLooks: FalHairstyleAnalysis['additionalLooks'] = [];
  if (Array.isArray(src.additionalLooks)) {
    for (const item of src.additionalLooks) {
      const look = readLook(item);
      if (look) additionalLooks.push(look);
    }
  }

  const whyItWorks: string[] = [];
  if (Array.isArray(src.whyItWorks)) {
    for (const line of src.whyItWorks) {
      if (typeof line === 'string' && line.trim()) whyItWorks.push(line.trim());
    }
  }

  return {
    analysis: {
      clientName: readString(src, 'clientName') || 'CLIENT',
      tier,
      topMatch,
      additionalLooks,
      whyItWorks,
    },
    templateUrl,
    clientPreviewUrl,
    siteOrigin: '',
  };
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
    res.status(401).json({ error: 'Sign in required to generate hairstyle analysis previews' });
    return;
  }

  const body = parseBody(req);
  const parsed = parseAnalysis(body);
  if (!parsed) {
    res.status(400).json({ error: 'Invalid analysis payload — tier, templateUrl, clientPreviewUrl, topMatch required' });
    return;
  }

  parsed.siteOrigin = siteOriginFromRequest(req);

  try {
    const result = await generateHairstyleAnalysisWithFal(parsed);
    res.status(200).json({ ok: true, ...result });
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Hairstyle analysis generation failed';
    console.error('[hairstyle-analysis-generate]', msg);
    res.status(500).json({ error: msg });
  }
}
