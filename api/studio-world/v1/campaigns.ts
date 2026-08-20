import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getSupabaseAdmin } from '../_lib/supabase.js';
import { verifyExternalRequest } from '../_lib/virtualProduction/external-auth.js';
import {
  getClientSafeStatus,
  listClientSafeActivity,
  listClientSafeDeliverables,
  listClientSafeReviews,
  provisionCampaignExternal,
  submitClientReview,
} from '../_lib/virtualProduction/external-service.js';
import {
  validateProvisionRequest,
  validateReviewSubmission,
} from '../../src/studio-os-core/virtual-production/external/contract-v1.js';

function rawBody(req: VercelRequest): string {
  if (typeof req.body === 'string') return req.body;
  if (req.body && typeof req.body === 'object') return JSON.stringify(req.body);
  return '';
}

function parseJson(req: VercelRequest): unknown {
  const raw = rawBody(req);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as unknown;
  } catch {
    return null;
  }
}

/**
 * Studio World External Integration API v1
 * POST /api/studio-world/v1/campaigns — provision (idempotent)
 * GET  /api/studio-world/v1/campaigns?campaignId=&externalEngagementId= — client-safe status
 * GET  /api/studio-world/v1/campaigns/reviews?...
 * POST /api/studio-world/v1/campaigns/reviews — submit review
 * GET  /api/studio-world/v1/campaigns/deliverables?...
 * GET  /api/studio-world/v1/campaigns/activity?...
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'Content-Type, X-Studio-World-System, X-Studio-World-Timestamp, X-Studio-World-Signature'
  );
  if (req.method === 'OPTIONS') return res.status(204).end();

  const bodyStr = rawBody(req);
  const auth = verifyExternalRequest(req, bodyStr);
  if ('error' in auth) {
    return res.status(auth.status).json({
      contractVersion: 'v1',
      error: auth.error,
      code: auth.code,
    });
  }

  try {
    const supabase = getSupabaseAdmin();
    const q = req.query ?? {};
    const action = typeof q.action === 'string' ? q.action : 'status';

    if (req.method === 'POST' && action === 'provision') {
      const payload = validateProvisionRequest(parseJson(req));
      if (!payload) {
        return res.status(400).json({
          contractVersion: 'v1',
          error: 'Invalid provision payload',
          code: 'INVALID_PAYLOAD',
        });
      }
      const result = await provisionCampaignExternal(
        supabase,
        auth.orgId,
        auth.externalSystem,
        payload
      );
      return res.status(result.idempotentReplay ? 200 : 201).json(result);
    }

    if (req.method === 'POST' && action === 'submit_review') {
      const submission = validateReviewSubmission(parseJson(req));
      const campaignId = String(q.campaignId ?? '');
      const externalEngagementId = String(q.externalEngagementId ?? '');
      if (!submission || !campaignId || !externalEngagementId) {
        return res.status(400).json({
          contractVersion: 'v1',
          error: 'Invalid review submission',
          code: 'INVALID_PAYLOAD',
        });
      }
      const ok = await submitClientReview(
        supabase,
        auth.orgId,
        campaignId,
        auth.externalSystem,
        externalEngagementId,
        submission.reviewId,
        submission.action,
        submission.notes
      );
      if (!ok) {
        return res.status(403).json({
          contractVersion: 'v1',
          error: 'Unauthorized or review not found',
          code: 'UNAUTHORIZED',
        });
      }
      return res.status(200).json({ contractVersion: 'v1', ok: true });
    }

    const campaignId = String(q.campaignId ?? '');
    const externalEngagementId = String(q.externalEngagementId ?? '');
    if (!campaignId || !externalEngagementId) {
      return res.status(400).json({
        contractVersion: 'v1',
        error: 'campaignId and externalEngagementId required',
        code: 'MISSING_PARAMS',
      });
    }

    if (req.method === 'GET' && action === 'reviews') {
      const reviews = await listClientSafeReviews(
        supabase,
        auth.orgId,
        campaignId,
        auth.externalSystem,
        externalEngagementId
      );
      return res.status(200).json({ contractVersion: 'v1', reviews });
    }

    if (req.method === 'GET' && action === 'deliverables') {
      const deliverables = await listClientSafeDeliverables(
        supabase,
        auth.orgId,
        campaignId,
        auth.externalSystem,
        externalEngagementId
      );
      return res.status(200).json({ contractVersion: 'v1', deliverables });
    }

    if (req.method === 'GET' && action === 'activity') {
      const activity = await listClientSafeActivity(
        supabase,
        auth.orgId,
        campaignId,
        auth.externalSystem,
        externalEngagementId
      );
      return res.status(200).json({ contractVersion: 'v1', activity });
    }

    if (req.method === 'GET') {
      const status = await getClientSafeStatus(
        supabase,
        auth.orgId,
        campaignId,
        auth.externalSystem,
        externalEngagementId
      );
      if (!status) {
        return res.status(403).json({
          contractVersion: 'v1',
          error: 'Unauthorized campaign access',
          code: 'UNAUTHORIZED',
        });
      }
      return res.status(200).json(status);
    }

    return res.status(405).json({
      contractVersion: 'v1',
      error: 'Method not allowed',
      code: 'METHOD_NOT_ALLOWED',
    });
  } catch (err) {
    console.error('[studio-world-v1]', err instanceof Error ? err.message : err);
    return res.status(500).json({
      contractVersion: 'v1',
      error: 'External API request failed',
      code: 'INTERNAL_ERROR',
    });
  }
}
