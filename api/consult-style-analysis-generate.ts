export const config = { maxDuration: 300 };

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { isAdminEmail } from './_lib/adminAuth.js';
import { getAuthUser } from './_lib/auth.js';
import { generateConsultStyleAnalysis } from './_lib/consultStyleAnalysisFal.js';
import type { ManualConsultInspoSpecs } from './_lib/consultStyleAnalysisInspoSpecs.js';

function sendJson(res: VercelResponse, status: number, body: unknown): void {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.end(JSON.stringify(body));
}

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

function readManualSpecs(body: Record<string, unknown>): ManualConsultInspoSpecs | undefined {
  const raw = body.manualSpecs ?? body.inspoSpecs ?? body.consultInspoSpecs;
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return undefined;
  const src = raw as Record<string, unknown>;
  const read = (key: string) => (typeof src[key] === 'string' ? String(src[key]).trim() : undefined);
  const readNumber = (key: string) => {
    const value = src[key];
    const n = typeof value === 'number' ? value : typeof value === 'string' ? Number(value) : Number.NaN;
    return Number.isFinite(n) ? n : undefined;
  };
  const specs: ManualConsultInspoSpecs = {
    unit: read('unit'),
    color: read('color'),
    styling: read('styling') ?? read('style'),
    length: read('length'),
    lengthInches: readNumber('lengthInches'),
    part: read('part'),
    lace: read('lace'),
    density: read('density'),
    hairline: read('hairline'),
  };
  return Object.values(specs).some((value) => value !== undefined && String(value).trim() !== '')
    ? specs
    : undefined;
}

function siteOriginFromRequest(req: VercelRequest): string {
  const env = (process.env.SITE_URL || '').trim().replace(/\/$/, '');
  if (env) return env;
  const host = req.headers['x-forwarded-host'] || req.headers.host;
  const proto = req.headers['x-forwarded-proto'] || 'https';
  if (typeof host === 'string' && host) return `${proto}://${host}`;
  return 'https://fsbw.vercel.app';
}

function parseComparisonCount(raw: unknown): 1 | 4 | null {
  const n = typeof raw === 'number' ? raw : Number(raw);
  if (n === 1 || n === 4) return n;
  return null;
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
    sendJson(res, 405, { error: 'Method not allowed' });
    return;
  }

  const user = await getAuthUser(req);
  if (!user?.id) {
    sendJson(res, 401, { error: 'Sign in required' });
    return;
  }

  const body = parseBody(req);
  const selfieUrl =
    readString(body, 'selfieDataUrl') ||
    readString(body, 'selfieUrl') ||
    readString(body, 'clientSelfieUrl');
  const inspoUrl =
    readString(body, 'inspoDataUrl') ||
    readString(body, 'inspoUrl') ||
    readString(body, 'hairInspoUrl');
  const comparisonCount = parseComparisonCount(
    body.comparisonCount ?? body.consultStyleAnalysisComparisonCount
  );
  const clientName = readString(body, 'clientName');
  const manualSpecs = readManualSpecs(body);

  if (!selfieUrl || !inspoUrl) {
    sendJson(res, 400, {
      error: 'selfieDataUrl and inspoDataUrl are required',
    });
    return;
  }
  if (!comparisonCount) {
    sendJson(res, 400, { error: 'comparisonCount must be 1 or 4' });
    return;
  }

  try {
    const result = await generateConsultStyleAnalysis({
      selfieUrl,
      inspoUrl,
      comparisonCount,
      siteOrigin: siteOriginFromRequest(req),
      clientName: clientName || user.email?.split('@')[0] || 'CLIENT',
      manualSpecs,
    });

    sendJson(res, 200, {
      ok: true,
      imageUrl: result.imageUrl,
      prompt: result.prompt,
      comparisonTier: result.comparisonTier,
      inspoHairColor: result.inspoHairColor,
      inspoSpecs: result.inspoSpecs,
      analysisTier: result.analysis.tier,
      topMatch: result.analysis.topMatch,
      additionalLooks: result.analysis.additionalLooks,
      admin: isAdminEmail(user.email),
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error('[consult-style-analysis-generate]', msg);
    sendJson(res, 500, { ok: false, error: msg });
  }
}
