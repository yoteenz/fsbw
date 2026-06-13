export const config = { maxDuration: 300 };

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { isAdminEmail } from './_lib/adminAuth.js';
import { getAuthUser } from './_lib/auth.js';
import {
  effectiveHairstyleAnalysisTierForRequest,
  resolveHairstyleAnalysisEntitlement,
} from './_lib/hairstyleAnalysisEntitlement.js';
import {
  generateHairstyleAnalysisWithFal,
  type GenerateHairstyleAnalysisFalInput,
} from './_lib/hairstyleAnalysisFal.js';
import { parseCompositeLayoutOverrides } from './_lib/hairstyleAnalysisCompositeLayout.js';
import { parseHairstyleAnalysisFontOverrides } from './_lib/hairstyleAnalysisFontOverrides.js';
import type { FalHairstyleAnalysis } from './_lib/hairstyleAnalysisFalPrompt.js';
import { hairstyleAnalysisTemplateUrlForTier } from './_lib/hairstyleAnalysisTemplates.js';
import {
  consumeHairstyleAnalysisGeneration,
  getHairstyleAnalysisUsage,
  hairstyleAnalysisPurchaseOptions,
  refundHairstyleAnalysisGeneration,
} from './_lib/hairstyleAnalysisUsage.js';
import { getPsaPremiumProfile } from './_lib/psaPremiumCheck.js';

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

function parseFaceFeatures(raw: unknown): FalHairstyleAnalysis['everyDetailFaceFeatures'] {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return undefined;
  const o = raw as Record<string, unknown>;
  const faceShape = typeof o.faceShape === 'string' ? o.faceShape.trim() : '';
  const eyeDescriptor = typeof o.eyeDescriptor === 'string' ? o.eyeDescriptor.trim() : '';
  if (!faceShape && !eyeDescriptor) return undefined;
  return {
    ...(faceShape ? { faceShape } : {}),
    ...(eyeDescriptor ? { eyeDescriptor } : {}),
  };
}

function parseAnalysis(body: Record<string, unknown>): GenerateHairstyleAnalysisFalInput | null {
  const nested = body.analysis;
  const src =
    nested && typeof nested === 'object' && !Array.isArray(nested)
      ? (nested as Record<string, unknown>)
      : body;

  const layoutOverrides = parseCompositeLayoutOverrides(
    body.slotOverrides ?? body.layoutOverrides
  );
  const fontOverrides = parseHairstyleAnalysisFontOverrides(body.fontOverrides);

  const tierRaw = readString(src, 'tier');
  const tier = tierRaw ? parseTier(tierRaw) : 'three_month';
  const topMatch = readLook(src.topMatch);
  const templateUrl = readString(src, 'templateUrl');
  const clientPreviewUrl = readString(src, 'clientPreviewUrl');
  if (!tier || !topMatch || !clientPreviewUrl) return null;

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
      everyDetailFaceFeatures: parseFaceFeatures(src.everyDetailFaceFeatures),
    },
    templateUrl: templateUrl || hairstyleAnalysisTemplateUrlForTier(tier),
    clientPreviewUrl,
    siteOrigin: '',
    layoutOverrides,
    fontOverrides,
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
    res.status(400).json({
      error: 'Invalid analysis payload — clientPreviewUrl and topMatch required',
    });
    return;
  }

  const isAdmin = isAdminEmail(user.email);
  const premium = await getPsaPremiumProfile(user.id, user.accessToken, user.email);
  const entitlement = resolveHairstyleAnalysisEntitlement(premium, user.email);

  if (!entitlement.eligible && !isAdmin) {
    res.status(403).json({
      error: 'A 3, 6, or 12 month premium subscription is required for hairstyle analysis.',
      code: 'PREMIUM_REQUIRED',
    });
    return;
  }

  const effectiveTier = effectiveHairstyleAnalysisTierForRequest({
    entitlement,
    requestedTier: parsed.analysis.tier,
    isAdmin,
  });
  parsed.analysis.tier = effectiveTier;
  parsed.templateUrl = hairstyleAnalysisTemplateUrlForTier(effectiveTier);

  let consumed = false;
  let consumedSource: 'monthly' | 'paid' | null = null;
  let consumedComparisonCount: 1 | 4 | undefined;
  if (!entitlement.unlimited) {
    const consumeResult = await consumeHairstyleAnalysisGeneration(user.id);
    if (!consumeResult.ok) {
      res.status(402).json({
        error:
          'You have used your free hairstyle analysis this month. Purchase another through checkout or ask your PSA for the same tiers as the wig consult style analysis add-on.',
        code: 'PURCHASE_REQUIRED',
        usage: consumeResult.usage,
        retryAfterSec: consumeResult.retryAfterSec,
        purchaseOptions: hairstyleAnalysisPurchaseOptions(),
      });
      return;
    }
    consumed = true;
    consumedSource = consumeResult.source;
    consumedComparisonCount = consumeResult.comparisonCount;
  }

  parsed.siteOrigin = siteOriginFromRequest(req);

  try {
    const result = await generateHairstyleAnalysisWithFal(parsed);
    res.status(200).json({
      ok: true,
      ...result,
      analysisTier: effectiveTier,
      consumeSource: consumedSource,
      comparisonCount: consumedComparisonCount ?? null,
      usage: entitlement.unlimited ? null : await getHairstyleAnalysisUsage(user.id),
    });
  } catch (e) {
    if (consumed && consumedSource) {
      await refundHairstyleAnalysisGeneration(user.id, consumedSource, consumedComparisonCount);
    }
    const msg = e instanceof Error ? e.message : 'Hairstyle analysis generation failed';
    console.error('[hairstyle-analysis-generate]', msg);
    res.status(500).json({ error: msg });
  }
}
