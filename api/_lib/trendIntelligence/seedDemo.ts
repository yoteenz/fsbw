import type { SupabaseClient } from '@supabase/supabase-js';
import {
  approveCandidateAsTrendSignal,
  approveForecastCall,
  attachForecastCallToEdition,
  ingestManualRawSignal,
  linkSignalToTrendReport,
  proposeForecastCall,
  publishForecastCall,
} from './service.js';

/** Development-only end-to-end fixture: LIVED-IN WAVES pipeline. All rows marked is_demo=true. */
export async function seedTrendIntelligenceDemoWorkflow(
  supabase: SupabaseClient,
  actorEmail: string | null,
): Promise<{ trendSignalId: string; forecastCallId: string }> {
  const base = {
    category: 'texture',
    createCandidate: {
      name: 'Lived-In Waves',
      canonicalLabel: 'LIVED-IN WAVES',
      primaryCategory: 'texture',
      tags: ['lived-in-wave', 'texture'],
    },
    isDemo: true,
  } as const;

  const first = await ingestManualRawSignal(
    supabase,
    {
      ...base,
      sourceType: 'search',
      sourceProvider: 'Manual Search Observation',
      observedAt: '2026-07-25T12:00:00.000Z',
      title: 'Search interest rising — lived-in waves',
      summary: 'Demo fixture: relative search interest for lived-in wave styling began rising.',
      observedValue: 42,
      previousValue: 28,
      qualitativeStrength: 'rising',
    },
    actorEmail,
  );

  const candidateId = first.candidate?.id;
  if (!candidateId) throw new Error('Demo candidate missing after first signal');

  await ingestManualRawSignal(
    supabase,
    {
      ...base,
      candidateId,
      sourceType: 'editorial',
      sourceProvider: 'Manual Editorial',
      observedAt: '2026-07-30T12:00:00.000Z',
      title: 'Editorial coverage — soft separated waves',
      summary: 'Demo fixture: beauty editorial recurring mention of soft, separated wave texture.',
      qualitativeStrength: 'accelerating',
    },
    actorEmail,
  );

  await ingestManualRawSignal(
    supabase,
    {
      ...base,
      candidateId,
      sourceType: 'fs_first_party',
      sourceProvider: 'Manual FS Behavior Note',
      observedAt: '2026-08-05T12:00:00.000Z',
      title: 'FS Build-A-Wig texture selections',
      summary: 'Demo fixture: aggregated BAW texture selections show increased lived-in wave interest. Sample size sufficient for dev only.',
      observedValue: 18,
      previousValue: 11,
      qualitativeStrength: 'rising',
    },
    actorEmail,
  );

  const { data: candidate } = await supabase.from('trend_candidates').select('*').eq('id', candidateId).single();
  if (!candidate?.id) throw new Error('Demo candidate missing');

  const { trendSignalId } = await approveCandidateAsTrendSignal(
    supabase,
    candidateId,
    actorEmail,
    'Cross-platform adoption and editorial movement toward lived-in, separated wave texture.',
  );

  await linkSignalToTrendReport(supabase, {
    packId: 'trend-report-summer',
    trendSignalId,
    publicEvidenceSummary: 'Search momentum + editorial confirmation + FS texture selections (demo aggregate).',
    actorEmail,
    isDemo: true,
  });

  const call = await proposeForecastCall(supabase, {
    trendSignalId,
    prediction: 'Lived-in wave styling is likely to continue accelerating through early fall.',
    horizon: 'next',
    rationale: 'Sustained cross-source movement with editorial and first-party confirmation (demo fixture).',
    relatedTrendReportIds: ['trend-report-summer'],
    actorEmail,
    isDemo: true,
  });

  const forecastCallId = call.id as string;
  await approveForecastCall(supabase, forecastCallId, actorEmail);
  await publishForecastCall(supabase, forecastCallId, actorEmail);

  await attachForecastCallToEdition(supabase, {
    editionSlug: 'forecast-2026-08-10',
    forecastCallId,
    overlayCategory: 'TEXTURE',
    overlayLabel: 'LIVED-IN WAVES',
    displayOrder: 0,
    actorEmail,
  });

  return { trendSignalId, forecastCallId };
}
