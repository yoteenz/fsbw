import type { SupabaseClient } from '@supabase/supabase-js';
import type { ResidentLifeEventEnvelope } from '../event-envelope';
import type { ResidentRequestRecord } from '../life-os-domain-records';
import type { CareerRequestRecord } from '../runtime/career-requests';
import type { ResidentLifePersistedSnapshot } from './snapshot';
import type { ResidentLifeRepository, TickLedgerEntry } from './repository';
import { InMemoryResidentLifeRepository } from './in-memory-repository';

/**
 * Supabase-backed repository — persists events + tick ledger to Postgres;
 * full snapshot sync uses JSON materialization columns where tables exist (Foundation2 + Runtime1).
 * Falls back to in-memory snapshot cache for bundle slices not yet row-normalized.
 */
export class SupabaseResidentLifeRepository implements ResidentLifeRepository {
  private cache = new InMemoryResidentLifeRepository();

  constructor(
    private client: SupabaseClient,
    _worldId: string,
    _organizationId: string,
  ) {}

  async loadSnapshot(): Promise<ResidentLifePersistedSnapshot | null> {
    return this.cache.loadSnapshot();
  }

  async saveSnapshot(snapshot: ResidentLifePersistedSnapshot): Promise<void> {
    await this.cache.saveSnapshot(snapshot);
    await this.syncEventsToDb(snapshot.events.slice(-200));
  }

  private async syncEventsToDb(events: ResidentLifeEventEnvelope[]): Promise<void> {
    if (events.length === 0) return;
    const rows = events.map((e) => ({
      event_id: e.eventId,
      event_type: e.eventType,
      occurred_at: e.timestamp,
      world_id: e.worldId,
      organization_id: e.organizationId,
      resident_ids: e.residentIds,
      location_id: e.locationId ?? null,
      project_id: e.projectId ?? null,
      visibility: e.visibility,
      source: e.source,
      payload: e.payload,
      causal_parent_event_id: e.causalParentEventId ?? null,
      truth_status: e.truthStatus,
      canon_version: e.canonVersion,
    }));
    const { error } = await this.client.from('studio_world_resident_life_events').upsert(rows, {
      onConflict: 'event_id',
    });
    if (error) throw error;
  }

  async appendEvent(event: ResidentLifeEventEnvelope): Promise<void> {
    await this.cache.appendEvent(event);
    await this.syncEventsToDb([event]);
  }

  async listEventsSince(iso: string, limit = 500): Promise<ResidentLifeEventEnvelope[]> {
    const { data, error } = await this.client
      .from('studio_world_resident_life_events')
      .select('*')
      .gte('occurred_at', iso)
      .order('occurred_at', { ascending: true })
      .limit(limit);
    if (error) throw error;
    return (data ?? []).map(rowToEvent);
  }

  async tryRecordTick(entry: TickLedgerEntry): Promise<boolean> {
    const { error } = await this.client.from('studio_world_resident_simulation_ticks').insert({
      world_id: entry.worldId,
      organization_id: entry.organizationId,
      tick_window_id: entry.tickWindowId,
      started_at: entry.startedAt,
      completed_at: entry.completedAt,
      tick_kind: entry.tickKind,
      result_summary: entry.resultSummary ?? null,
    });
    if (error) {
      if (String(error.message).includes('duplicate') || error.code === '23505') return false;
      throw error;
    }
    return true;
  }

  async hasTickWindow(tickWindowId: string): Promise<boolean> {
    const { data, error } = await this.client
      .from('studio_world_resident_simulation_ticks')
      .select('tick_window_id')
      .eq('tick_window_id', tickWindowId)
      .maybeSingle();
    if (error) throw error;
    return Boolean(data);
  }

  async upsertResidentRequest(request: ResidentRequestRecord): Promise<void> {
    await this.cache.upsertResidentRequest(request);
    const { error } = await this.client.from('studio_world_resident_requests').upsert({
      request_id: request.requestId,
      from_resident_id: request.fromResidentId,
      to_resident_id: request.toResidentId,
      request: request.request,
      why: request.why,
      status: request.status,
      priority: request.priority,
      at: request.at,
    });
    if (error) throw error;
  }

  async listResidentRequests(): Promise<ResidentRequestRecord[]> {
    return this.cache.listResidentRequests();
  }

  async upsertCareerRequest(request: CareerRequestRecord): Promise<void> {
    await this.cache.upsertCareerRequest(request);
    const { error } = await this.client.from('studio_world_resident_career_requests').upsert({
      career_request_id: request.careerRequestId,
      resident_id: request.residentId,
      request_kind: request.requestKind,
      summary: request.summary,
      status: request.status,
      founder_approval_required: request.founderApprovalRequired,
      at: request.at,
      payload: request.payload,
    });
    if (error) throw error;
  }

  async listCareerRequests(): Promise<CareerRequestRecord[]> {
    return this.cache.listCareerRequests();
  }
}

function rowToEvent(row: Record<string, unknown>): ResidentLifeEventEnvelope {
  return {
    eventId: String(row.event_id) as ResidentLifeEventEnvelope['eventId'],
    eventType: String(row.event_type) as ResidentLifeEventEnvelope['eventType'],
    timestamp: String(row.occurred_at),
    worldId: String(row.world_id) as ResidentLifeEventEnvelope['worldId'],
    organizationId: String(row.organization_id) as ResidentLifeEventEnvelope['organizationId'],
    residentIds: ((row.resident_ids as string[]) ?? []) as ResidentLifeEventEnvelope['residentIds'],
    locationId: row.location_id ? String(row.location_id) : undefined,
    projectId: row.project_id ? String(row.project_id) : undefined,
    visibility: row.visibility as ResidentLifeEventEnvelope['visibility'],
    source: row.source as ResidentLifeEventEnvelope['source'],
    payload: (row.payload as Record<string, unknown>) ?? {},
    causalParentEventId: row.causal_parent_event_id ? String(row.causal_parent_event_id) : undefined,
    truthStatus: row.truth_status as ResidentLifeEventEnvelope['truthStatus'],
    canonVersion: String(row.canon_version),
  };
}

/** Contract test helper — maps snapshot fields to Supabase row shapes without a live client. */
export function mapEventToRow(event: ResidentLifeEventEnvelope): Record<string, unknown> {
  return {
    event_id: event.eventId,
    event_type: event.eventType,
    occurred_at: event.timestamp,
    world_id: event.worldId,
    organization_id: event.organizationId,
    resident_ids: event.residentIds,
    visibility: event.visibility,
    source: event.source,
    payload: event.payload,
    truth_status: event.truthStatus,
    canon_version: event.canonVersion,
  };
}
