export const config = { maxDuration: 300 };

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { isAdminEmail } from './_lib/adminAuth.js';
import { getAuthUser } from './_lib/auth.js';
import { generateConsultStyleAnalysis } from './_lib/consultStyleAnalysisFal.js';

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
    const chart = await generateConsultStyleAnalysis({
      selfieUrl,
      inspoUrl,
      comparisonCount,
      siteOrigin: siteOriginFromRequest(req),
    });

    sendJson(res, 200, {
      ok: true,
      chart: {
        kind: chart.kind,
        title: 'STYLE ANALYSIS',
        subtitle: 'YOUR INSPO ON YOU',
        comparisonTier: chart.comparisonTier,
        inspoHairColor: chart.inspoHairColor,
        cells: chart.cells.map((cell) => ({
          id: cell.id,
          role: cell.role,
          color: cell.color,
          imageUrl: cell.imageUrl,
          subtitle: cell.subtitle,
          unitLabel: cell.color,
        })),
        createdAt: new Date().toISOString(),
      },
      admin: isAdminEmail(user.email),
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error('[consult-style-analysis-generate]', msg);
    sendJson(res, 500, { ok: false, error: msg });
  }
}
