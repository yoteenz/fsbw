/**
 * Pre-trip inspection Supabase persistence + FleetCare escalation (idempotent).
 */
import type { SupabaseClient } from '@supabase/supabase-js';
import type { PretripInspection, SubmitPretripInput } from './pretripTypes';
import { shouldEscalateToFleetCare } from './pretripTypes';
import { createFreightAutopilotAdminClient } from '../../freight/autopilot/supabaseFreightAutopilotPersistence';

export function pretripIdempotencyKey(input: SubmitPretripInput): string {
  const parts = [
    input.organizationId,
    input.driverId,
    input.loadId ?? 'no-load',
    input.powerUnitId ?? 'no-unit',
    input.result,
    input.defectSummary ?? '',
  ];
  return `pretrip:${parts.join(':')}`;
}

export async function persistPretripInspectionToSupabase(
  input: SubmitPretripInput,
  inspectionId?: string,
): Promise<PretripInspection | null> {
  const client = createFreightAutopilotAdminClient();
  if (!client) return null;

  const key = pretripIdempotencyKey(input);
  const { data: existing } = await client
    .from('aio_pretrip_inspections')
    .select('*')
    .eq('idempotency_key', key)
    .maybeSingle();

  if (existing) {
    return mapPretripRow(existing as Record<string, unknown>);
  }

  let fleetCareTicketId: string | undefined;
  let escalated = false;

  if (shouldEscalateToFleetCare(input.result)) {
    const ticket = await ensureFleetCareTicketForPretrip(client, input, key);
    fleetCareTicketId = ticket.id;
    escalated = true;
  }

  const { data, error } = await client
    .from('aio_pretrip_inspections')
    .insert({
      id: inspectionId,
      organization_id: input.organizationId,
      driver_id: input.driverId,
      power_unit_id: input.powerUnitId ?? null,
      trailer_id: input.trailerId ?? null,
      load_id: input.loadId ?? null,
      inspection_result: input.result,
      defect_summary: input.defectSummary ?? null,
      odometer_miles: input.odometerMiles ?? null,
      escalated_to_fleetcare: escalated,
      fleetcare_ticket_id: fleetCareTicketId ?? null,
      idempotency_key: key,
      inspected_at: new Date().toISOString(),
    })
    .select('*')
    .single();

  if (error) throw error;
  return mapPretripRow(data as Record<string, unknown>);
}

async function ensureFleetCareTicketForPretrip(
  client: SupabaseClient,
  input: SubmitPretripInput,
  pretripKey: string,
): Promise<{ id: string; created: boolean }> {
  const { data: existingPretrip } = await client
    .from('aio_pretrip_inspections')
    .select('fleetcare_ticket_id')
    .eq('idempotency_key', pretripKey)
    .maybeSingle();

  if (existingPretrip?.fleetcare_ticket_id) {
    return { id: existingPretrip.fleetcare_ticket_id as string, created: false };
  }

  const vehicleUuid =
    input.powerUnitId && /^[0-9a-f-]{36}$/i.test(input.powerUnitId) ? input.powerUnitId : null;

  const { data, error } = await client
    .from('aio_fleetcare_tickets')
    .insert({
      client_organization_id: input.organizationId,
      vehicle_id: vehicleUuid,
      service_category_code: 'pretrip_inspection',
      issue_description: input.defectSummary ?? `Pre-trip defect (${input.result})`,
      drivable_status: input.result === 'OUT_OF_SERVICE' ? 'no' : 'unknown',
      location: { label: 'Pre-trip inspection', pretrip_key: pretripKey },
      urgency: input.result === 'OUT_OF_SERVICE' ? 'roadside_urgent' : 'routine',
      status: 'submitted',
      lead_source: 'aio_marketplace',
      aio_originated: true,
      customer_contact_released: false,
      metadata: { pretrip_key: pretripKey, power_unit_id: input.powerUnitId ?? null },
    })
    .select('id')
    .single();

  if (error) throw error;
  return { id: data!.id as string, created: true };
}

function mapPretripRow(row: Record<string, unknown>): PretripInspection {
  return {
    id: row.id as string,
    organizationId: row.organization_id as string,
    driverId: row.driver_id as string,
    powerUnitId: row.power_unit_id as string | undefined,
    trailerId: row.trailer_id as string | undefined,
    loadId: row.load_id as string | undefined,
    result: row.inspection_result as PretripInspection['result'],
    defectSummary: row.defect_summary as string | undefined,
    odometerMiles: row.odometer_miles as number | undefined,
    inspectedAt: row.inspected_at as string,
    escalatedToFleetCare: Boolean(row.escalated_to_fleetcare),
    fleetCareTicketId: row.fleetcare_ticket_id as string | undefined,
    createdAt: row.created_at as string,
  };
}

export async function fetchPretripInspectionByKey(
  client: SupabaseClient,
  key: string,
): Promise<PretripInspection | undefined> {
  const { data } = await client.from('aio_pretrip_inspections').select('*').eq('idempotency_key', key).maybeSingle();
  if (!data) return undefined;
  return mapPretripRow(data as Record<string, unknown>);
}
