import type { VercelRequest, VercelResponse } from '@vercel/node';
import { runExpertCaptureAi } from '../_lib/expertCaptureAi.js';

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

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const body = parseBody(req);
  const action = typeof body.action === 'string' ? body.action : '';

  try {
    if (action === 'greet') {
      const result = await runExpertCaptureAi({
        action: 'greet',
        expertName: String(body.expertName ?? 'Expert'),
        expertRole: String(body.expertRole ?? 'Professional'),
        profileId: typeof body.profileId === 'string' ? body.profileId : undefined,
        industryContext: typeof body.industryContext === 'string' ? body.industryContext : undefined,
      });
      return res.status(200).json(result);
    }

    if (action === 'analyze_answer') {
      const result = await runExpertCaptureAi({
        action: 'analyze_answer',
        question: String(body.question ?? ''),
        transcript: String(body.transcript ?? ''),
        expertRole: String(body.expertRole ?? 'Professional'),
        profileId: typeof body.profileId === 'string' ? body.profileId : undefined,
        industryContext: typeof body.industryContext === 'string' ? body.industryContext : undefined,
      });
      return res.status(200).json(result);
    }

    if (action === 'clarify') {
      const result = await runExpertCaptureAi({
        action: 'clarify',
        question: String(body.question ?? ''),
        transcript: String(body.transcript ?? ''),
        misunderstanding: String(body.misunderstanding ?? ''),
        expertCorrection: String(body.expertCorrection ?? ''),
        profileId: typeof body.profileId === 'string' ? body.profileId : undefined,
        industryContext: typeof body.industryContext === 'string' ? body.industryContext : undefined,
      });
      return res.status(200).json(result);
    }

    return res.status(400).json({ error: 'Unknown action' });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return res.status(503).json({ error: message });
  }
}
