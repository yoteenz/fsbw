import type { SupabaseClient } from '@supabase/supabase-js';
import { writeTrendAuditLog } from './audit.js';
import { SCORING_VERSION } from './constants.js';
import { recalculateCandidateScores } from './scoring.js';
import { createEvidenceSnapshot } from './snapshots.js';
import type {
  ManualRawSignalInput,
  PsaBriefPayload,
  PublicForecastPayload,
  PublicReportPayload,
  TrendCandidateRow,
  TrendRawSignalRow,
} from './types.js';
import { assertProductionPublishAllowed, canonicalizeSourceUrl, validateForecastCallForApproval } from './validation.js';

function slugify(input: string): string {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
}

export async function ensureDefaultSources(supabase: SupabaseClient): Promise<void> {
  const defaults = [
    { slug: 'manual-editorial', name: 'Manual Editorial', source_type: 'editorial', adapter_type: 'manual' },
    { slug: 'manual-search', name: 'Manual Search Observation', source_type: 'search', adapter_type: 'manual' },
    { slug: 'manual-social', name: 'Manual Social Observation', source_type: 'social', adapter_type: 'manual' },
    { slug: 'manual-fs-behavior', name: 'Manual FS Behavior Note', source_type: 'fs_first_party', adapter_type: 'fs_behavior', automation_status: 'planned' },
  ];

  for (const row of defaults) {
    await supabase.from('trend_sources').upsert(
      {
        ...row,
        reliability: 'unknown',
        automation_status: row.automation_status ?? 'manual',
        enabled: true,
        is_demo: false,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'slug' },
    );
  }
}

export async function getTrendDeskOverview(supabase: SupabaseClient) {
  const { data: candidates } = await supabase
    .from('trend_candidates')
    .select('*')
    .not('status', 'eq', 'dismissed')
    .order('updated_at', { ascending: false });

  const rows = (candidates ?? []) as TrendCandidateRow[];
  const momentumCounts = rows.reduce<Record<string, number>>((acc, row) => {
    acc[row.current_momentum] = (acc[row.current_momentum] ?? 0) + 1;
    return acc;
  }, {});

  return {
    activeCandidates: rows.length,
    momentumCounts,
    candidates: rows,
  };
}

export async function ingestManualRawSignal(
  supabase: SupabaseClient,
  input: ManualRawSignalInput,
  actorEmail: string | null,
): Promise<{ rawSignal: TrendRawSignalRow; candidate: TrendCandidateRow | null }> {
  const canonicalUrl = canonicalizeSourceUrl(input.sourceUrl);
  if (canonicalUrl) {
    const { data: dup } = await supabase
      .from('trend_raw_signals')
      .select('id')
      .eq('source_url', canonicalUrl)
      .eq('observed_at', input.observedAt)
      .maybeSingle();
    if (dup?.id) {
      throw new Error('Duplicate evidence URL for this observation date already exists.');
    }
  }

  let candidate: TrendCandidateRow | null = null;
  if (input.candidateId) {
    const { data } = await supabase.from('trend_candidates').select('*').eq('id', input.candidateId).single();
    candidate = (data as TrendCandidateRow) ?? null;
  } else if (input.createCandidate) {
    const slugBase = slugify(input.createCandidate.canonicalLabel);
    const { data, error } = await supabase
      .from('trend_candidates')
      .insert({
        slug: `${slugBase}-${Date.now()}`,
        name: input.createCandidate.name,
        canonical_label: input.createCandidate.canonicalLabel,
        primary_category: input.createCandidate.primaryCategory,
        tags: input.createCandidate.tags ?? [],
        status: 'detected',
        current_momentum: 'watching',
        scoring_version: SCORING_VERSION,
        is_demo: Boolean(input.isDemo),
      })
      .select('*')
      .single();
    if (error) throw new Error(error.message);
    candidate = data as TrendCandidateRow;
    await writeTrendAuditLog(supabase, {
      actorEmail,
      action: 'candidate.created',
      entityType: 'trend_candidate',
      entityId: candidate.id,
      changeSummary: `Created candidate ${candidate.canonical_label}`,
    });
  }

  const changePercent =
    input.observedValue != null && input.previousValue != null && input.previousValue !== 0
      ? ((input.observedValue - input.previousValue) / Math.abs(input.previousValue)) * 100
      : null;

  const { data: raw, error: rawError } = await supabase
    .from('trend_raw_signals')
    .insert({
      source_type: input.sourceType,
      source_provider: input.sourceProvider ?? null,
      source_url: canonicalUrl,
      source_title: input.sourceTitle ?? null,
      source_publisher: input.sourcePublisher ?? null,
      observed_at: input.observedAt,
      category: input.category,
      signal_type: input.signalType ?? 'observation',
      title: input.title,
      summary: input.summary,
      observed_value: input.observedValue ?? null,
      previous_value: input.previousValue ?? null,
      change_percent: changePercent,
      qualitative_strength: input.qualitativeStrength ?? null,
      geographic_scope: input.geographicScope ?? null,
      audience_scope: input.audienceScope ?? null,
      event_id: input.eventId ?? null,
      reliability_level: input.reliabilityLevel ?? 'unknown',
      public_attribution_allowed: Boolean(input.publicAttributionAllowed),
      notes: input.notes ?? null,
      is_demo: Boolean(input.isDemo),
      created_by: actorEmail,
    })
    .select('*')
    .single();

  if (rawError || !raw) throw new Error(rawError?.message ?? 'Failed to create raw signal');
  const rawSignal = raw as TrendRawSignalRow;

  await writeTrendAuditLog(supabase, {
    actorEmail,
    action: 'raw_signal.created',
    entityType: 'trend_raw_signal',
    entityId: rawSignal.id,
    changeSummary: rawSignal.title,
  });

  if (candidate) {
    await supabase.from('trend_candidate_raw_signal_links').upsert({
      candidate_id: candidate.id,
      raw_signal_id: rawSignal.id,
      linked_by: actorEmail,
    });

    const { data: linkedRaw } = await supabase
      .from('trend_candidate_raw_signal_links')
      .select('raw_signal_id')
      .eq('candidate_id', candidate.id);
    const rawIds = (linkedRaw ?? []).map((r) => r.raw_signal_id as string);
    const { data: rawRows } = await supabase.from('trend_raw_signals').select('*').in('id', rawIds);
    const updates = recalculateCandidateScores(candidate, (rawRows ?? []) as TrendRawSignalRow[]);
    const { data: updated } = await supabase
      .from('trend_candidates')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', candidate.id)
      .select('*')
      .single();
    candidate = (updated as TrendCandidateRow) ?? candidate;
  }

  return { rawSignal, candidate };
}

export async function getCandidateDetail(supabase: SupabaseClient, candidateId: string) {
  const { data: candidate, error } = await supabase
    .from('trend_candidates')
    .select('*')
    .eq('id', candidateId)
    .single();
  if (error || !candidate) throw new Error('Candidate not found');

  const { data: links } = await supabase
    .from('trend_candidate_raw_signal_links')
    .select('raw_signal_id')
    .eq('candidate_id', candidateId);
  const rawIds = (links ?? []).map((l) => l.raw_signal_id as string);
  const { data: rawSignals } = rawIds.length
    ? await supabase.from('trend_raw_signals').select('*').in('id', rawIds).order('observed_at', { ascending: true })
    : { data: [] as TrendRawSignalRow[] };

  return {
    candidate: candidate as TrendCandidateRow,
    rawSignals: (rawSignals ?? []) as TrendRawSignalRow[],
  };
}

export async function updateCandidateStatus(
  supabase: SupabaseClient,
  candidateId: string,
  status: TrendCandidateRow['status'],
  actorEmail: string | null,
  extras?: { dismissReason?: string; editorialNotes?: string; forecastHorizon?: string },
): Promise<TrendCandidateRow> {
  const { data, error } = await supabase
    .from('trend_candidates')
    .update({
      status,
      dismiss_reason: extras?.dismissReason ?? null,
      editorial_notes: extras?.editorialNotes ?? null,
      forecast_horizon: extras?.forecastHorizon ?? null,
      updated_at: new Date().toISOString(),
    })
    .eq('id', candidateId)
    .select('*')
    .single();
  if (error || !data) throw new Error(error?.message ?? 'Update failed');

  await writeTrendAuditLog(supabase, {
    actorEmail,
    action: `candidate.${status}`,
    entityType: 'trend_candidate',
    entityId: candidateId,
    changeSummary: `Status → ${status}`,
  });

  return data as TrendCandidateRow;
}

export async function approveCandidateAsTrendSignal(
  supabase: SupabaseClient,
  candidateId: string,
  actorEmail: string | null,
  publicSummary: string,
): Promise<{ trendSignalId: string }> {
  const { candidate, rawSignals } = await getCandidateDetail(supabase, candidateId);
  if (rawSignals.length === 0) {
    throw new Error('Cannot approve candidate without linked evidence.');
  }

  const slug = slugify(candidate.canonical_label);
  const { data: signal, error } = await supabase
    .from('trend_signals')
    .insert({
      candidate_id: candidateId,
      slug: `${slug}-${Date.now()}`,
      canonical_label: candidate.canonical_label,
      primary_category: candidate.primary_category,
      tags: candidate.tags,
      public_momentum: candidate.current_momentum,
      public_summary: publicSummary,
      internal_summary: candidate.editorial_notes,
      editorial_confidence: candidate.editorial_confidence,
      forecast_horizon: candidate.forecast_horizon,
      status: 'approved',
      is_demo: candidate.is_demo,
      approved_by: actorEmail,
      approved_at: new Date().toISOString(),
    })
    .select('id')
    .single();
  if (error || !signal?.id) throw new Error(error?.message ?? 'Failed to create trend signal');

  await updateCandidateStatus(supabase, candidateId, 'approved', actorEmail);

  await writeTrendAuditLog(supabase, {
    actorEmail,
    action: 'trend_signal.approved',
    entityType: 'trend_signal',
    entityId: signal.id as string,
    changeSummary: candidate.canonical_label,
  });

  return { trendSignalId: signal.id as string };
}

export async function proposeForecastCall(
  supabase: SupabaseClient,
  params: {
    trendSignalId: string;
    prediction: string;
    horizon: string;
    rationale: string;
    publicRationale?: string;
    relatedTrendReportIds?: string[];
    actorEmail: string | null;
    isDemo?: boolean;
  },
) {
  const { data: signal } = await supabase
    .from('trend_signals')
    .select('*')
    .eq('id', params.trendSignalId)
    .single();
  if (!signal) throw new Error('Trend signal not found');

  const { data: links } = await supabase
    .from('trend_candidate_raw_signal_links')
    .select('raw_signal_id')
    .eq('candidate_id', signal.candidate_id);
  const rawIds = (links ?? []).map((l) => l.raw_signal_id as string);
  const { data: rawSignals } = rawIds.length
    ? await supabase.from('trend_raw_signals').select('*').in('id', rawIds)
    : { data: [] };

  const snapshotIds: string[] = [];
  for (const raw of (rawSignals ?? []) as TrendRawSignalRow[]) {
    snapshotIds.push(await createEvidenceSnapshot(supabase, raw, Boolean(params.isDemo)));
  }

  validateForecastCallForApproval({ prediction: params.prediction, rationale: params.rationale });

  const { data: call, error } = await supabase
    .from('forecast_calls')
    .insert({
      trend_signal_id: params.trendSignalId,
      prediction: params.prediction,
      horizon: params.horizon,
      momentum_at_prediction: signal.public_momentum,
      confidence: signal.editorial_confidence ?? 'medium',
      rationale: params.rationale,
      public_rationale: params.publicRationale ?? params.rationale,
      status: 'draft',
      evidence_snapshot_ids: snapshotIds,
      related_trend_report_ids: params.relatedTrendReportIds ?? [],
      scoring_version: SCORING_VERSION,
      is_demo: Boolean(params.isDemo),
    })
    .select('*')
    .single();
  if (error) throw new Error(error.message);

  await writeTrendAuditLog(supabase, {
    actorEmail: params.actorEmail,
    action: 'forecast_call.proposed',
    entityType: 'forecast_call',
    entityId: call.id as string,
    changeSummary: params.prediction,
  });

  return call;
}

export async function approveForecastCall(
  supabase: SupabaseClient,
  forecastCallId: string,
  actorEmail: string | null,
) {
  const { data: call } = await supabase.from('forecast_calls').select('*').eq('id', forecastCallId).single();
  if (!call) throw new Error('Forecast call not found');
  validateForecastCallForApproval(call);

  const { data, error } = await supabase
    .from('forecast_calls')
    .update({
      status: 'approved',
      approved_by: actorEmail,
      approved_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq('id', forecastCallId)
    .select('*')
    .single();
  if (error) throw new Error(error.message);

  await writeTrendAuditLog(supabase, {
    actorEmail,
    action: 'forecast_call.approved',
    entityType: 'forecast_call',
    entityId: forecastCallId,
  });

  return data;
}

export async function publishForecastCall(
  supabase: SupabaseClient,
  forecastCallId: string,
  actorEmail: string | null,
) {
  const { data: call } = await supabase.from('forecast_calls').select('*').eq('id', forecastCallId).single();
  if (!call) throw new Error('Forecast call not found');

  assertProductionPublishAllowed({
    isDemo: Boolean(call.is_demo),
    evidenceSnapshotIds: call.evidence_snapshot_ids ?? [],
    approvedBy: call.approved_by ?? actorEmail,
  });

  if (call.status !== 'approved') {
    throw new Error('Forecast call must be approved before publish.');
  }

  const { data, error } = await supabase
    .from('forecast_calls')
    .update({
      status: 'published',
      published_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq('id', forecastCallId)
    .select('*')
    .single();
  if (error) throw new Error(error.message);

  await writeTrendAuditLog(supabase, {
    actorEmail,
    action: 'forecast_call.published',
    entityType: 'forecast_call',
    entityId: forecastCallId,
  });

  return data;
}

export async function attachForecastCallToEdition(
  supabase: SupabaseClient,
  params: {
    editionSlug: string;
    forecastCallId: string;
    overlayCategory: string;
    overlayLabel: string;
    displayOrder?: number;
    actorEmail: string | null;
  },
) {
  const { data: call } = await supabase.from('forecast_calls').select('status,is_demo').eq('id', params.forecastCallId).single();
  if (!call || (call.status !== 'approved' && call.status !== 'published')) {
    throw new Error('Only approved/published forecast calls can attach to editions.');
  }

  const { error } = await supabase.from('forecast_edition_call_links').upsert({
    edition_slug: params.editionSlug,
    forecast_call_id: params.forecastCallId,
    overlay_category: params.overlayCategory,
    overlay_label: params.overlayLabel,
    display_order: params.displayOrder ?? 0,
  });
  if (error) throw new Error(error.message);

  await writeTrendAuditLog(supabase, {
    actorEmail: params.actorEmail,
    action: 'forecast_edition.attached',
    entityType: 'forecast_edition',
    entityId: params.editionSlug,
    details: { forecastCallId: params.forecastCallId },
  });
}

export async function linkSignalToTrendReport(
  supabase: SupabaseClient,
  params: {
    packId: string;
    trendSignalId: string;
    publicEvidenceSummary?: string;
    displayOrder?: number;
    actorEmail: string | null;
    isDemo?: boolean;
  },
) {
  const { data: report } = await supabase
    .from('trend_report_intelligence')
    .upsert(
      {
        pack_id: params.packId,
        status: 'draft',
        is_demo: Boolean(params.isDemo),
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'pack_id' },
    )
    .select('id')
    .single();

  if (!report?.id) throw new Error('Failed to upsert trend report intelligence');

  const { data: signal } = await supabase
    .from('trend_signals')
    .select('candidate_id,is_demo')
    .eq('id', params.trendSignalId)
    .single();
  if (!signal) throw new Error('Trend signal not found');

  const { data: links } = await supabase
    .from('trend_candidate_raw_signal_links')
    .select('raw_signal_id')
    .eq('candidate_id', signal.candidate_id);
  const rawIds = (links ?? []).map((l) => l.raw_signal_id as string);
  const snapshotIds: string[] = [];
  if (rawIds.length) {
    const { data: rawSignals } = await supabase.from('trend_raw_signals').select('*').in('id', rawIds);
    for (const raw of (rawSignals ?? []) as TrendRawSignalRow[]) {
      snapshotIds.push(await createEvidenceSnapshot(supabase, raw, Boolean(params.isDemo)));
    }
  }

  const { error } = await supabase.from('trend_report_signal_links').upsert({
    report_id: report.id,
    trend_signal_id: params.trendSignalId,
    display_order: params.displayOrder ?? 0,
    evidence_snapshot_ids: snapshotIds,
    public_evidence_summary: params.publicEvidenceSummary ?? null,
  });
  if (error) throw new Error(error.message);

  await writeTrendAuditLog(supabase, {
    actorEmail: params.actorEmail,
    action: 'trend_report.signal_linked',
    entityType: 'trend_report',
    entityId: params.packId,
    details: { trendSignalId: params.trendSignalId },
  });
}

export async function generatePsaBrief(
  supabase: SupabaseClient,
  editionSlug: string,
  headline: string,
): Promise<PsaBriefPayload> {
  const { data } = await supabase.rpc('trend_intelligence_public_forecast_payload', {
    p_edition_slug: editionSlug,
  });
  const payload = (data ?? { signals: [] }) as PublicForecastPayload;
  const primaryCalls = (payload.signals ?? []).map((s) => ({
    label: s.label,
    category: s.category,
    momentum: s.momentum,
    prediction: s.prediction,
  }));

  const brief: PsaBriefPayload = {
    editionSlug,
    headline,
    primaryCalls,
    openingDirection: primaryCalls.length
      ? `This week we're seeing movement toward ${primaryCalls.map((c) => c.label.toLowerCase()).join(', ')}.`
      : 'Signals are still forming for this edition.',
    closingDirection: 'Polished without looking like you tried too hard.',
    overlaySignals: primaryCalls.map((c) => ({
      category: c.category,
      label: c.label,
      momentum: c.momentum,
    })),
  };

  await supabase.from('forecast_psa_briefs').upsert(
    {
      edition_slug: editionSlug,
      headline,
      opening_direction: brief.openingDirection,
      closing_direction: brief.closingDirection,
      brief_payload: brief,
      status: 'draft',
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'edition_slug' },
  );

  return brief;
}

export async function fetchPublicForecastPayload(
  supabase: SupabaseClient,
  editionSlug: string,
): Promise<PublicForecastPayload> {
  const { data, error } = await supabase.rpc('trend_intelligence_public_forecast_payload', {
    p_edition_slug: editionSlug,
  });
  if (error) throw new Error(error.message);
  return (data ?? { editionSlug, signals: [] }) as PublicForecastPayload;
}

export async function fetchPublicReportPayload(
  supabase: SupabaseClient,
  packId: string,
): Promise<PublicReportPayload> {
  const { data, error } = await supabase.rpc('trend_intelligence_public_report_signals', {
    p_pack_id: packId,
  });
  if (error) throw new Error(error.message);
  return (data ?? { packId, signals: [] }) as PublicReportPayload;
}
