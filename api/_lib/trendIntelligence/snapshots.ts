import type { SupabaseClient } from '@supabase/supabase-js';
import type { TrendRawSignalRow } from './types.js';

export async function createEvidenceSnapshot(
  supabase: SupabaseClient,
  rawSignal: TrendRawSignalRow,
  isDemo = false,
): Promise<string> {
  const snapshotData = {
    rawSignalId: rawSignal.id,
    sourceType: rawSignal.source_type,
    sourceProvider: rawSignal.source_provider,
    sourceUrl: rawSignal.source_url,
    sourceTitle: rawSignal.source_title,
    sourcePublisher: rawSignal.source_publisher,
    observedAt: rawSignal.observed_at,
    title: rawSignal.title,
    summary: rawSignal.summary,
    observedValue: rawSignal.observed_value,
    previousValue: rawSignal.previous_value,
    changePercent: rawSignal.change_percent,
    qualitativeStrength: rawSignal.qualitative_strength,
    reliabilityLevel: rawSignal.reliability_level,
  };

  const { data, error } = await supabase
    .from('trend_evidence_snapshots')
    .insert({
      raw_signal_id: rawSignal.id,
      snapshot_data: snapshotData,
      is_demo: isDemo,
    })
    .select('id')
    .single();

  if (error || !data?.id) {
    throw new Error(error?.message ?? 'Failed to create evidence snapshot');
  }

  return data.id as string;
}

export async function createSnapshotsForRawSignals(
  supabase: SupabaseClient,
  rawSignals: TrendRawSignalRow[],
  isDemo = false,
): Promise<string[]> {
  const ids: string[] = [];
  for (const signal of rawSignals) {
    ids.push(await createEvidenceSnapshot(supabase, signal, isDemo));
  }
  return ids;
}
