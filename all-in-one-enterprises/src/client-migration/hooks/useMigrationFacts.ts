import { useCallback, useEffect, useState } from 'react';
import { isSupabaseMode } from '../../config/dataMode';
import { loadDemoStore } from '../../demo/demoStore';
import { useDemoStore } from '../../demo/useDemoStore';
import { supabaseListExtractedFacts } from '../repositories/supabaseMigrationRepository';
import type { ExtractedFactRecord } from '../types';

function mapSupabaseFact(row: Record<string, unknown>): ExtractedFactRecord {
  return {
    id: String(row.id),
    batchId: String(row.batch_id),
    organizationId: String(row.organization_id),
    documentId: row.document_id ? String(row.document_id) : undefined,
    entityType: String(row.entity_type),
    fieldKey: String(row.field_key),
    proposedValue: row.proposed_value ? String(row.proposed_value) : '',
    existingValue: row.existing_value ? String(row.existing_value) : undefined,
    confidence: String(row.confidence) as ExtractedFactRecord['confidence'],
    sourceReference: row.source_reference ? String(row.source_reference) : undefined,
    reviewAction: row.review_action as ExtractedFactRecord['reviewAction'],
    createdAt: row.created_at ? String(row.created_at) : new Date().toISOString(),
  };
}

/** Demo store facts + Supabase-backed facts when in production data mode. */
export function useMigrationFacts(batchId: string | undefined, organizationId: string | undefined): ExtractedFactRecord[] {
  const store = useDemoStore();
  const [remoteFacts, setRemoteFacts] = useState<ExtractedFactRecord[]>([]);

  const refresh = useCallback(async () => {
    if (!isSupabaseMode() || !batchId) {
      setRemoteFacts([]);
      return;
    }
    const rows = await supabaseListExtractedFacts(batchId);
    setRemoteFacts(rows.map((r) => mapSupabaseFact(r as Record<string, unknown>)));
  }, [batchId]);

  useEffect(() => {
    void refresh();
    if (!isSupabaseMode() || !batchId) return undefined;
    const timer = window.setInterval(() => void refresh(), 4000);
    return () => window.clearInterval(timer);
  }, [batchId, refresh]);

  const localFacts = (store.clientExtractedFacts ?? loadDemoStore().clientExtractedFacts ?? []).filter((f) =>
    batchId ? f.batchId === batchId : f.organizationId === organizationId,
  );

  if (!isSupabaseMode()) return localFacts;

  const byId = new Map<string, ExtractedFactRecord>();
  for (const f of localFacts) byId.set(f.id, f);
  for (const f of remoteFacts) byId.set(f.id, f);
  return [...byId.values()];
}
