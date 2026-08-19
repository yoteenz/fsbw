import type { SupabaseClient } from '@supabase/supabase-js';
import type { DemoStore } from '../demo/demoTypes';
import { matchesLoadBoardFilters } from './carrierLoadProjection';
import { searchPublishedLoads } from './freightSearchService';
import type { LoadBoardSearchFilters } from './freightTypes';
import { deliverFreightNotificationDemo, notifyFreightEvent } from './freightNotifications';
import { mapCarrierRowToResult } from './supabaseFreightMappers';

function filtersMatchLoad(filters: LoadBoardSearchFilters, orgId: string, store: DemoStore, loadId: string): boolean {
  const response = searchPublishedLoads(store, orgId, filters);
  return response.results.some((r) => r.loadId === loadId);
}

export async function evaluateSavedSearchAlertsDemo(loadId: string, store: DemoStore): Promise<number> {
  const saved = store.loadBoardSavedSearches ?? [];
  let count = 0;

  for (const search of saved) {
    if (!search.alertEnabled) continue;
    if (!filtersMatchLoad(search.filters, search.organizationId, store, loadId)) continue;

    const dedupeKey = `saved-search-alert:${search.id}:${loadId}:1`;
    const delivered = deliverFreightNotificationDemo({
      eventType: 'NEW_MATCHING_LOAD',
      organizationId: search.organizationId,
      title: 'New matching load',
      body: `A load matches your saved search "${search.label}".`,
      loadId,
      dedupeKey,
      link: `/portal/load-board/loads/${loadId}`,
    });

    if (delivered) count += 1;
  }

  return count;
}

export async function evaluateSavedSearchAlertsSupabase(
  supabase: SupabaseClient,
  loadId: string,
): Promise<number> {
  const { data: savedRows } = await supabase
    .from('aio_load_board_saved_searches')
    .select('*')
    .eq('alerts_enabled', true);

  if (!savedRows?.length) return 0;

  const { data: loadRow } = await supabase.from('aio_load_board_carrier_loads').select('*').eq('load_id', loadId).maybeSingle();
  if (!loadRow) return 0;

  let count = 0;
  for (const search of savedRows) {
    const filters = (search.filters_json ?? {}) as LoadBoardSearchFilters;
    const result = mapCarrierRowToResult(loadRow, filters);
    if (!matchesLoadBoardFilters(result, filters)) continue;

    const dedupeKey = `saved-search-alert:${search.id}:${loadId}:1`;
    const { data: existing } = await supabase
      .from('aio_load_board_search_alert_events')
      .select('id')
      .eq('user_id', search.user_id)
      .eq('saved_search_id', search.id)
      .eq('load_id', loadId)
      .eq('trigger_version', 1)
      .maybeSingle();

    if (existing) continue;

    await supabase.from('aio_load_board_search_alert_events').insert({
      user_id: search.user_id,
      saved_search_id: search.id,
      load_id: loadId,
      trigger_version: 1,
    });

    await notifyFreightEvent(supabase, {
      eventType: 'NEW_MATCHING_LOAD',
      organizationId: search.organization_id,
      userId: search.user_id,
      loadId,
      title: 'New matching load',
      body: `A load matches your saved search "${search.name}".`,
      dedupeKey,
      link: `/portal/load-board/loads/${loadId}`,
    });

    count += 1;
  }

  return count;
}
