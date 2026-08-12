import type { VercelRequest, VercelResponse } from '@vercel/node';
import { requireAdmin } from '../_lib/adminAuth.js';
import { getSupabaseAdmin } from '../_lib/supabase.js';
import { TREND_SOURCE_ADAPTERS } from '../_lib/trendIntelligence/adapters/index.js';
import {
  approveCandidateAsTrendSignal,
  approveForecastCall,
  attachForecastCallToEdition,
  ensureDefaultSources,
  generatePsaBrief,
  getCandidateDetail,
  getTrendDeskOverview,
  ingestManualRawSignal,
  linkSignalToTrendReport,
  proposeForecastCall,
  publishForecastCall,
  updateCandidateStatus,
} from '../_lib/trendIntelligence/service.js';
import { seedTrendIntelligenceDemoWorkflow } from '../_lib/trendIntelligence/seedDemo.js';
import type { ManualRawSignalInput } from '../_lib/trendIntelligence/types.js';

/**
 * /api/admin/trend-desk
 * GET — overview, candidate detail (?candidateId=), sources/adapters
 * POST — actions via body.action
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(204).end();

  const admin = await requireAdmin(req);
  if (!admin) return res.status(403).json({ error: 'Forbidden' });

  const supabase = getSupabaseAdmin();

  try {
    await ensureDefaultSources(supabase);

    if (req.method === 'GET') {
      const candidateId = typeof req.query.candidateId === 'string' ? req.query.candidateId : undefined;
      if (candidateId) {
        const detail = await getCandidateDetail(supabase, candidateId);
        return res.status(200).json(detail);
      }

      const { data: sources } = await supabase.from('trend_sources').select('*').order('name');
      const overview = await getTrendDeskOverview(supabase);
      return res.status(200).json({
        overview,
        sources: sources ?? [],
        adapters: TREND_SOURCE_ADAPTERS,
        methodology: 'FS TREND INTELLIGENCE — V1 (human-curated, manual evidence, heuristic scoring)',
      });
    }

    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method not allowed' });
    }

    const body = typeof req.body === 'object' && req.body !== null ? req.body : {};
    const action = String((body as { action?: string }).action ?? '');

    switch (action) {
      case 'ingest_signal': {
        const input = (body as { input?: ManualRawSignalInput }).input;
        if (!input?.title || !input.summary || !input.observedAt || !input.sourceType) {
          return res.status(400).json({ error: 'Invalid signal input' });
        }
        const result = await ingestManualRawSignal(supabase, input, admin.email);
        return res.status(200).json(result);
      }
      case 'update_candidate_status': {
        const { candidateId, status, dismissReason, editorialNotes, forecastHorizon } = body as {
          candidateId?: string;
          status?: string;
          dismissReason?: string;
          editorialNotes?: string;
          forecastHorizon?: string;
        };
        if (!candidateId || !status) return res.status(400).json({ error: 'candidateId and status required' });
        const updated = await updateCandidateStatus(supabase, candidateId, status as never, admin.email, {
          dismissReason,
          editorialNotes,
          forecastHorizon,
        });
        return res.status(200).json({ candidate: updated });
      }
      case 'approve_signal': {
        const { candidateId, publicSummary } = body as { candidateId?: string; publicSummary?: string };
        if (!candidateId || !publicSummary) {
          return res.status(400).json({ error: 'candidateId and publicSummary required' });
        }
        const result = await approveCandidateAsTrendSignal(supabase, candidateId, admin.email, publicSummary);
        return res.status(200).json(result);
      }
      case 'propose_forecast': {
        const result = await proposeForecastCall(supabase, {
          trendSignalId: String((body as { trendSignalId?: string }).trendSignalId),
          prediction: String((body as { prediction?: string }).prediction),
          horizon: String((body as { horizon?: string }).horizon ?? 'next'),
          rationale: String((body as { rationale?: string }).rationale),
          publicRationale: (body as { publicRationale?: string }).publicRationale,
          relatedTrendReportIds: (body as { relatedTrendReportIds?: string[] }).relatedTrendReportIds,
          actorEmail: admin.email,
          isDemo: Boolean((body as { isDemo?: boolean }).isDemo),
        });
        return res.status(200).json({ forecastCall: result });
      }
      case 'approve_forecast': {
        const forecastCallId = String((body as { forecastCallId?: string }).forecastCallId);
        const result = await approveForecastCall(supabase, forecastCallId, admin.email);
        return res.status(200).json({ forecastCall: result });
      }
      case 'publish_forecast': {
        const forecastCallId = String((body as { forecastCallId?: string }).forecastCallId);
        const result = await publishForecastCall(supabase, forecastCallId, admin.email);
        return res.status(200).json({ forecastCall: result });
      }
      case 'attach_edition': {
        await attachForecastCallToEdition(supabase, {
          editionSlug: String((body as { editionSlug?: string }).editionSlug),
          forecastCallId: String((body as { forecastCallId?: string }).forecastCallId),
          overlayCategory: String((body as { overlayCategory?: string }).overlayCategory),
          overlayLabel: String((body as { overlayLabel?: string }).overlayLabel),
          displayOrder: Number((body as { displayOrder?: number }).displayOrder ?? 0),
          actorEmail: admin.email,
        });
        return res.status(200).json({ ok: true });
      }
      case 'link_report': {
        await linkSignalToTrendReport(supabase, {
          packId: String((body as { packId?: string }).packId),
          trendSignalId: String((body as { trendSignalId?: string }).trendSignalId),
          publicEvidenceSummary: (body as { publicEvidenceSummary?: string }).publicEvidenceSummary,
          displayOrder: Number((body as { displayOrder?: number }).displayOrder ?? 0),
          actorEmail: admin.email,
          isDemo: Boolean((body as { isDemo?: boolean }).isDemo),
        });
        return res.status(200).json({ ok: true });
      }
      case 'generate_psa_brief': {
        const editionSlug = String((body as { editionSlug?: string }).editionSlug);
        const headline = String((body as { headline?: string }).headline ?? 'SOFT STRUCTURE MOVES IN');
        const brief = await generatePsaBrief(supabase, editionSlug, headline);
        return res.status(200).json({ brief });
      }
      case 'seed_demo_workflow': {
        const result = await seedTrendIntelligenceDemoWorkflow(supabase, admin.email);
        return res.status(200).json(result);
      }
      default:
        return res.status(400).json({ error: 'Unknown action' });
    }
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Internal error';
    return res.status(500).json({ error: message });
  }
}
