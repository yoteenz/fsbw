import { getAioSupabase } from '../data/supabase/client';
import type {
  CarrierLoadBoardOffer,
  LoadBoardPublication,
  LoadBoardSearchFilters,
  LoadBoardSearchResponse,
  RecentLoadSearch,
  SavedLoadSearch,
} from './freightTypes';
import type { FreightRepository, FreightResult } from './freightRepositoryTypes';
import {
  mapCarrierRowToResult,
  mapOfferRow,
  mapRecentSearchRow,
  mapRowToPublication,
  mapSavedSearchRow,
  type CarrierLoadRow,
} from './supabaseFreightMappers';
import { matchesLoadBoardFilters } from './carrierLoadProjection';
import { evaluateSavedSearchAlertsSupabase } from './freightSavedSearchAlerts';
import { buildLoadMapDataFromResults } from './freightGeocoding';
import { setActiveLoadBoardFilters } from './loadBoardSessionFilters';
import { recordLoadStatusTransition } from './freightStatusHistory';
import { notifyFreightEvent } from './freightNotifications';

function ok<T>(data: T): FreightResult<T> {
  return { ok: true, data };
}

function fail(code: 'UNAVAILABLE' | 'QUERY_FAILED' | 'FORBIDDEN', message: string): FreightResult<never> {
  return { ok: false, error: { code, message } };
}

export class SupabaseFreightRepository implements FreightRepository {
  readonly mode = 'supabase' as const;

  constructor(
    private readonly userId: string,
  ) {}

  private client() {
    const supabase = getAioSupabase();
    if (!supabase) return null;
    return supabase;
  }

  async searchPublishedLoads(
    _carrierOrgId: string,
    filters: LoadBoardSearchFilters,
  ): Promise<FreightResult<LoadBoardSearchResponse>> {
    const supabase = this.client();
    if (!supabase) return fail('UNAVAILABLE', "We couldn't load available freight. Backend is not configured.");

    const { data, error } = await supabase.from('aio_load_board_carrier_loads').select('*');
    if (error) {
      console.error('[freight] searchPublishedLoads failed', { code: error.code });
      return fail('QUERY_FAILED', "We couldn't load available freight. Try again.");
    }

    const rows = (data ?? []) as CarrierLoadRow[];
    const results = rows
      .map((row) => mapCarrierRowToResult(row, filters))
      .filter((r) => matchesLoadBoardFilters(r, filters));

    return ok({ results, totalCount: results.length, appliedFilters: filters });
  }

  async getPublication(loadId: string): Promise<FreightResult<LoadBoardPublication | null>> {
    const supabase = this.client();
    if (!supabase) return fail('UNAVAILABLE', 'Backend is not configured.');

    const { data, error } = await supabase
      .from('aio_load_board_publications')
      .select('*')
      .eq('load_id', loadId)
      .maybeSingle();

    if (error) return fail('QUERY_FAILED', 'Could not load publication.');
    if (!data) return ok(null);

    return ok(mapRowToPublication({
      load_id: loadId,
      load_number: '',
      origin_city: null,
      origin_state: null,
      destination_city: null,
      destination_state: null,
      origin_lat: null,
      origin_lng: null,
      destination_lat: null,
      destination_lng: null,
      pickup_date: null,
      delivery_date: null,
      equipment_type: null,
      loaded_miles: null,
      deadhead_miles: null,
      currency: 'USD',
      carrier_rate_minor: null,
      publication_status: data.publication_status,
      trailer_length_ft: data.trailer_length_ft,
      full_partial: data.full_partial,
      instant_book_enabled: data.instant_book_enabled,
      offer_enabled: data.offer_enabled,
      published_at: data.published_at,
      post_expires_at: data.post_expires_at,
    }));
  }

  async publishLoad(loadId: string, staffId: string, partial?: Partial<LoadBoardPublication>): Promise<FreightResult<void>> {
    const supabase = this.client();
    if (!supabase) return fail('UNAVAILABLE', 'Backend is not configured.');

    const now = new Date().toISOString();
    const { error } = await supabase.from('aio_load_board_publications').upsert({
      load_id: loadId,
      publication_status: 'published',
      visibility_type: 'published',
      source_type: partial?.sourceType ?? 'aio_shipper_freight',
      trailer_length_ft: partial?.trailerLengthFt ?? 53,
      full_partial: partial?.fullPartial ?? 'full',
      max_weight_lbs: partial?.maxWeightLbs,
      instant_book_enabled: partial?.bookingMode === 'instant_book',
      offer_enabled: partial?.bookingMode !== 'request_only',
      published_at: now,
      published_by: staffId,
      updated_at: now,
    });

    if (error) {
      console.error('[freight] publishLoad failed', { loadId, code: error.code });
      return fail('QUERY_FAILED', 'Publication failed.');
    }

    await recordLoadStatusTransition(supabase, loadId, 'draft', 'published', staffId, 'Published to AIO Load Board');
    const alertCount = await evaluateSavedSearchAlertsSupabase(supabase, loadId);
    if (alertCount > 0) {
      console.info('[freight] saved-search alerts generated', { loadId, alertCount });
    }
    return ok(undefined);
  }

  async holdLoad(loadId: string): Promise<FreightResult<void>> {
    const supabase = this.client();
    if (!supabase) return fail('UNAVAILABLE', 'Backend is not configured.');

    const { error } = await supabase
      .from('aio_load_board_publications')
      .update({ publication_status: 'paused', visibility_type: 'hold', updated_at: new Date().toISOString() })
      .eq('load_id', loadId);

    if (error) return fail('QUERY_FAILED', 'Could not hold load.');
    return ok(undefined);
  }

  async saveSearch(
    orgId: string,
    userId: string,
    label: string,
    filters: LoadBoardSearchFilters,
    alertEnabled = false,
  ): Promise<FreightResult<SavedLoadSearch>> {
    const supabase = this.client();
    if (!supabase) return fail('UNAVAILABLE', 'Backend is not configured.');

    const { data, error } = await supabase
      .from('aio_load_board_saved_searches')
      .insert({
        user_id: userId,
        organization_id: orgId,
        name: label,
        filters_json: filters,
        alerts_enabled: alertEnabled,
      })
      .select('*')
      .single();

    if (error || !data) return fail('QUERY_FAILED', 'Could not save search.');
    return ok(mapSavedSearchRow(data));
  }

  async deleteSavedSearch(searchId: string): Promise<FreightResult<void>> {
    const supabase = this.client();
    if (!supabase) return fail('UNAVAILABLE', 'Backend is not configured.');

    const { error } = await supabase.from('aio_load_board_saved_searches').delete().eq('id', searchId);
    if (error) return fail('QUERY_FAILED', 'Could not delete saved search.');
    return ok(undefined);
  }

  async listSavedSearches(orgId: string, userId: string): Promise<FreightResult<SavedLoadSearch[]>> {
    const supabase = this.client();
    if (!supabase) return fail('UNAVAILABLE', 'Backend is not configured.');

    const { data, error } = await supabase
      .from('aio_load_board_saved_searches')
      .select('*')
      .eq('organization_id', orgId)
      .eq('user_id', userId)
      .order('updated_at', { ascending: false });

    if (error) return fail('QUERY_FAILED', 'Could not load saved searches.');
    return ok((data ?? []).map(mapSavedSearchRow));
  }

  async listRecentSearches(orgId: string, userId: string): Promise<FreightResult<RecentLoadSearch[]>> {
    const supabase = this.client();
    if (!supabase) return fail('UNAVAILABLE', 'Backend is not configured.');

    const { data, error } = await supabase
      .from('aio_load_board_recent_searches')
      .select('*')
      .eq('organization_id', orgId)
      .eq('user_id', userId)
      .order('searched_at', { ascending: false })
      .limit(10);

    if (error) return fail('QUERY_FAILED', 'Could not load recent searches.');
    return ok((data ?? []).map(mapRecentSearchRow));
  }

  async recordRecentSearch(orgId: string, userId: string, filters: LoadBoardSearchFilters): Promise<FreightResult<void>> {
    setActiveLoadBoardFilters(filters);
    const supabase = this.client();
    if (!supabase) return fail('UNAVAILABLE', 'Backend is not configured.');

    await supabase.from('aio_load_board_recent_searches').insert({
      user_id: userId,
      organization_id: orgId,
      filters_json: filters,
    });

    const { data: stale } = await supabase
      .from('aio_load_board_recent_searches')
      .select('id')
      .eq('user_id', userId)
      .order('searched_at', { ascending: false })
      .range(10, 100);

    if (stale?.length) {
      await supabase.from('aio_load_board_recent_searches').delete().in('id', stale.map((r) => r.id));
    }

    return ok(undefined);
  }

  async submitCarrierOffer(
    loadId: string,
    carrierOrgId: string,
    offerAmountMinor: number,
    note?: string,
  ): Promise<FreightResult<CarrierLoadBoardOffer>> {
    const supabase = this.client();
    if (!supabase) return fail('UNAVAILABLE', 'Backend is not configured.');

    const { data, error } = await supabase
      .from('aio_carrier_offers')
      .insert({
        load_id: loadId,
        carrier_organization_id: carrierOrgId,
        submitted_by: this.userId,
        offer_source: 'load_board',
        offer_amount_minor: offerAmountMinor,
        message: note,
        status: 'pending',
      })
      .select('*')
      .single();

    if (error || !data) {
      console.error('[freight] submitCarrierOffer failed', { loadId, code: error?.code });
      return fail('QUERY_FAILED', 'Could not submit offer.');
    }

    await notifyFreightEvent(supabase, {
      eventType: 'CARRIER_OFFER_SUBMITTED',
      organizationId: carrierOrgId,
      userId: this.userId,
      loadId,
      title: 'Offer submitted',
      body: 'Your load board offer was sent to AIO brokerage.',
      dedupeKey: `offer-submitted:${data.id}`,
    });

    return ok(mapOfferRow(data));
  }

  async listCarrierOffers(carrierOrgId: string): Promise<FreightResult<CarrierLoadBoardOffer[]>> {
    const supabase = this.client();
    if (!supabase) return fail('UNAVAILABLE', 'Backend is not configured.');

    const { data, error } = await supabase
      .from('aio_carrier_offers')
      .select('*')
      .eq('carrier_organization_id', carrierOrgId)
      .order('created_at', { ascending: false });

    if (error) return fail('QUERY_FAILED', 'Could not load offers.');
    return ok((data ?? []).map(mapOfferRow));
  }

  async listPublishedLoadsForMap(carrierOrgId: string): Promise<FreightResult<LoadBoardSearchResponse>> {
    return this.searchPublishedLoads(carrierOrgId, { originDeadheadMiles: 500 });
  }

  async getLoadMapData(carrierOrgId: string, truckProfileId?: string) {
    const response = await this.searchPublishedLoads(carrierOrgId, { originDeadheadMiles: 500, truckProfileId });
    if (!response.ok) return response;
    return ok(buildLoadMapDataFromResults(response.data.results, truckProfileId));
  }

  async evaluateSavedSearchAlerts(loadId: string): Promise<FreightResult<number>> {
    const supabase = this.client();
    if (!supabase) return fail('UNAVAILABLE', 'Backend is not configured.');
    const count = await evaluateSavedSearchAlertsSupabase(supabase, loadId);
    return ok(count);
  }
}

export function createSupabaseFreightRepository(orgId: string, userId: string): SupabaseFreightRepository {
  void orgId;
  return new SupabaseFreightRepository(userId);
}
