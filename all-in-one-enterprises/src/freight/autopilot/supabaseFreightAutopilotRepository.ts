import { getAioSupabase } from '../../data/supabase/client';
import { evaluateDocumentCompleteness } from './documentCompleteness';
import type { FreightAutopilotRepository } from './freightAutopilotRepositoryTypes';
import {
  buildAutopilotStateFromPersisted,
  fetchDocumentCompletenessRow,
  fetchLoadForAutopilot,
  fetchOpenExceptions,
  fetchPersistedAutopilotContext,
} from './supabaseFreightAutopilotRead';
import type { SupabaseClient } from '@supabase/supabase-js';

export function createSupabaseFreightAutopilotRepository(
  clientOverride?: SupabaseClient,
): FreightAutopilotRepository {
  return {
    async getPanelData(loadId: string) {
      const client = clientOverride ?? getAioSupabase();
      if (!client) return undefined;

      const load = await fetchLoadForAutopilot(client, loadId);
      if (!load) return undefined;

      const [docRow, ctx, exceptions] = await Promise.all([
        fetchDocumentCompletenessRow(client, loadId),
        fetchPersistedAutopilotContext(client, loadId),
        fetchOpenExceptions(client, loadId),
      ]);

      const documentCompleteness = docRow ?? evaluateDocumentCompleteness(load);
      const state = buildAutopilotStateFromPersisted(load, documentCompleteness, ctx);

      return { load, state, exceptions, documentCompleteness };
    },
  };
}
