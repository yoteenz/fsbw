/**
 * POST /api/psa/selfie-style-analysis — premium PSA ranked unit picks from member selfie.
 * Body: { selfieDataUrl: string }
 */
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getAuthUser } from '../_lib/auth.js';
import { getPsaPremiumProfile } from '../_lib/psaPremiumCheck.js';
import {
  buildBawPathFromPick,
  buildPsaSelfieStyleAnalysisInstructions,
  parsePsaSelfieAnalysisJson,
  psaSelfieMaxPicks,
  unitKeyFromLabel,
  type PsaSelfieAnalysisPayload,
} from '../_lib/psaSelfieStyleAnalysis.js';

export const config = {
  maxDuration: 60,
};

const DEFAULT_MODEL = (process.env.PSA_OPENAI_MODEL || 'gpt-5.4-mini').trim();

function sendJson(res: VercelResponse, status: number, body: unknown): void {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.end(JSON.stringify(body));
}

function parseBody(req: VercelRequest): { selfieDataUrl?: string } {
  const body = req.body;
  if (typeof body === 'string') {
    try {
      return JSON.parse(body) as { selfieDataUrl?: string };
    } catch {
      return {};
    }
  }
  if (body && typeof body === 'object') return body as { selfieDataUrl?: string };
  return {};
}

async function callOpenAiVision(
  selfieDataUrl: string,
  instructions: string
): Promise<string | null> {
  const key = (process.env.OPENAI_API_KEY || '').trim();
  if (!key) return null;

  const res = await fetch('https://api.openai.com/v1/responses', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${key}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: DEFAULT_MODEL,
      instructions,
      input: [
        {
          role: 'user',
          content: [
            {
              type: 'input_text',
              text: 'Analyze this selfie and return the JSON picks for our six wig units.',
            },
            {
              type: 'input_image',
              image_url: selfieDataUrl,
              detail: 'low',
            },
          ],
        },
      ],
    }),
  });

  if (!res.ok) {
    const errText = await res.text();
    console.error('[psa/selfie-style-analysis] OpenAI', res.status, errText.slice(0, 500));
    return null;
  }

  const data = (await res.json()) as {
    output?: Array<{ type?: string; content?: Array<{ type?: string; text?: string }> }>;
  };
  const texts: string[] = [];
  for (const block of data.output ?? []) {
    if (block.type !== 'message') continue;
    for (const part of block.content ?? []) {
      if (part.type === 'output_text' && part.text) texts.push(part.text);
    }
  }
  return texts.join('\n').trim() || null;
}

function enrichPayload(
  payload: PsaSelfieAnalysisPayload,
  maxPicks: number,
  subscriptionTier: string | null
) {
  const picks = payload.picks.slice(0, maxPicks).map((pick, i) => ({
    rank: pick.rank ?? i + 1,
    unitKey: unitKeyFromLabel(pick.unitLabel),
    unitLabel: pick.unitLabel.trim().toUpperCase(),
    length: pick.length,
    density: pick.density,
    texture: pick.texture,
    color: pick.color,
    hairline: pick.hairline,
    styling: pick.styling,
    partSelection: pick.partSelection,
    why: pick.why,
    stars: pick.stars ?? (i < 2 ? 5 : i < 4 ? 4 : 3),
    buildAWigPath: buildBawPathFromPick(pick),
  }));

  return {
    clientSummary: payload.clientSummary,
    faceShape: payload.faceShape,
    undertone: payload.undertone,
    maxPicks,
    subscriptionTier,
    picks,
  };
}

export default async function handler(req: VercelRequest, res: VercelResponse): Promise<void> {
  if (req.method !== 'POST') {
    sendJson(res, 405, { ok: false, error: 'Method not allowed' });
    return;
  }

  const auth = await getAuthUser(req);
  if (!auth?.user?.id) {
    sendJson(res, 401, { ok: false, code: 'SIGN_IN_REQUIRED', message: 'Sign in required.' });
    return;
  }

  const profile = await getPsaPremiumProfile(auth.user.id, auth.accessToken, auth.user.email);
  if (!profile?.isPremium) {
    sendJson(res, 403, {
      ok: false,
      code: 'PREMIUM_REQUIRED',
      message: 'PSA style analysis is for premium members only.',
    });
    return;
  }

  const { selfieDataUrl } = parseBody(req);
  if (!selfieDataUrl || !selfieDataUrl.startsWith('data:image/')) {
    sendJson(res, 400, { ok: false, message: 'Expected selfieDataUrl (data:image/...).' });
    return;
  }

  const subscriptionTier = profile.subscriptionTier;
  const maxPicks = psaSelfieMaxPicks(subscriptionTier);
  const instructions = buildPsaSelfieStyleAnalysisInstructions(maxPicks);

  const raw = await callOpenAiVision(selfieDataUrl, instructions);
  if (!raw) {
    sendJson(res, 503, {
      ok: false,
      message: 'Style analysis is temporarily unavailable. Try again shortly.',
    });
    return;
  }

  const parsed = parsePsaSelfieAnalysisJson(raw);
  if (!parsed?.picks?.length) {
    sendJson(res, 502, { ok: false, message: 'Could not parse style analysis. Try another photo.' });
    return;
  }

  sendJson(res, 200, { ok: true, result: enrichPayload(parsed, maxPicks, subscriptionTier) });
}
