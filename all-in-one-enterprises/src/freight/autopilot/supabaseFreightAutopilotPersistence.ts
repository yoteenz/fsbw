/**
 * Supabase persistence for Freight Autopilot — service-role writes in CI/live tests;
 * client paths use authenticated user where applicable.
 */
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import type { DocumentCompletenessResult } from './documentCompleteness';
import type { BillingPackage } from './billingPackageTypes';
import type { FreightExceptionType } from './freightExceptionTypes';
import { billingPackageIdempotencyKey } from './billingPackageTypes';
import { settlementIdempotencyKey } from '../../settlements/driverSettlementEngine';
import { autopilotAuditIdempotencyKey } from './freightAutopilotAudit';
import type { FreightAutopilotEventType } from './freightAutopilotTypes';

export function createFreightAutopilotAdminClient(): SupabaseClient | null {
  const url = process.env.AIO_STAGING_SUPABASE_URL ?? process.env.VITE_AIO_SUPABASE_URL;
  const key = process.env.AIO_SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key, { auth: { persistSession: false } });
}

export async function recordAutopilotEvent(
  client: SupabaseClient,
  input: {
    organizationId: string;
    loadId: string;
    eventType: FreightAutopilotEventType;
    idempotencyKey: string;
    processingStatus?: string;
    payload?: Record<string, unknown>;
    outcome?: string;
  },
): Promise<{ id: string; created: boolean }> {
  const { data: existing } = await client
    .from('aio_freight_autopilot_events')
    .select('id')
    .eq('idempotency_key', input.idempotencyKey)
    .maybeSingle();

  if (existing) return { id: existing.id, created: false };

  const { data, error } = await client
    .from('aio_freight_autopilot_events')
    .insert({
      organization_id: input.organizationId,
      load_id: input.loadId,
      event_type: input.eventType,
      idempotency_key: input.idempotencyKey,
      processing_status: input.processingStatus ?? 'COMPLETED',
      payload: input.payload ?? {},
      outcome: input.outcome,
      processed_at: new Date().toISOString(),
    })
    .select('id')
    .single();

  if (error) throw error;
  return { id: data!.id as string, created: true };
}

export async function upsertDocumentCompleteness(
  client: SupabaseClient,
  organizationId: string,
  loadId: string,
  result: DocumentCompletenessResult,
): Promise<void> {
  const { error } = await client.from('aio_freight_document_completeness').upsert(
    {
      load_id: loadId,
      organization_id: organizationId,
      package_status: result.status,
      requirements_json: result.items,
      missing_labels: result.missingLabels,
      ready_for_billing: result.readyForBilling,
      ready_for_factoring: result.readyForFactoring,
      ready_for_settlement: result.readyForSettlement,
      computed_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'load_id' },
  );
  if (error) throw error;
}

export async function ensureBillingPackageRow(
  client: SupabaseClient,
  organizationId: string,
  loadId: string,
  shipperOrganizationId?: string,
): Promise<{ id: string; created: boolean }> {
  const key = billingPackageIdempotencyKey(loadId);
  const { data: existing } = await client
    .from('aio_freight_billing_packages')
    .select('id')
    .eq('load_id', loadId)
    .maybeSingle();

  if (existing) return { id: existing.id as string, created: false };

  const { data, error } = await client
    .from('aio_freight_billing_packages')
    .insert({
      load_id: loadId,
      organization_id: organizationId,
      shipper_organization_id: shipperOrganizationId ?? null,
      status: 'ready',
      idempotency_key: key,
    })
    .select('id')
    .single();

  if (error) throw error;
  return { id: data!.id as string, created: true };
}

export async function ensureShipperInvoiceRow(
  client: SupabaseClient,
  loadId: string,
  shipperOrganizationId: string,
  invoiceNumber: string,
  totalMinor: number,
): Promise<{ id: string; created: boolean }> {
  const { data: existing } = await client
    .from('aio_brokerage_shipper_invoices')
    .select('id')
    .eq('load_id', loadId)
    .maybeSingle();

  if (existing) return { id: existing.id as string, created: false };

  const { data, error } = await client
    .from('aio_brokerage_shipper_invoices')
    .insert({
      load_id: loadId,
      shipper_organization_id: shipperOrganizationId,
      invoice_number: invoiceNumber,
      base_freight_charge_minor: totalMinor,
      total_minor: totalMinor,
      balance_minor: totalMinor,
      status: 'issued',
      invoice_date: new Date().toISOString().slice(0, 10),
    })
    .select('id')
    .single();

  if (error) throw error;
  return { id: data!.id as string, created: true };
}

export async function upsertFreightException(
  client: SupabaseClient,
  input: {
    loadId: string;
    organizationId: string;
    exceptionType: FreightExceptionType;
    severity: string;
    summary: string;
  },
): Promise<{ id: string; created: boolean }> {
  const { data: open } = await client
    .from('aio_freight_exceptions')
    .select('id')
    .eq('load_id', input.loadId)
    .eq('exception_type', input.exceptionType)
    .eq('status', 'OPEN')
    .maybeSingle();

  if (open) return { id: open.id as string, created: false };

  const { data, error } = await client
    .from('aio_freight_exceptions')
    .insert({
      load_id: input.loadId,
      organization_id: input.organizationId,
      exception_type: input.exceptionType,
      severity: input.severity,
      summary: input.summary,
      status: 'OPEN',
    })
    .select('id')
    .single();

  if (error) throw error;
  return { id: data!.id as string, created: true };
}

export async function resolveFreightException(
  client: SupabaseClient,
  loadId: string,
  exceptionType: FreightExceptionType,
): Promise<void> {
  await client
    .from('aio_freight_exceptions')
    .update({
      status: 'RESOLVED',
      resolved_at: new Date().toISOString(),
      resolution: 'auto_resolved',
    })
    .eq('load_id', loadId)
    .eq('exception_type', exceptionType)
    .eq('status', 'OPEN');
}

export async function ensureDriverSettlementRow(
  client: SupabaseClient,
  input: {
    loadId: string;
    organizationId: string;
    driverId: string;
    totalMinor: number;
    loadedMiles: number;
    emptyMiles: number;
  },
): Promise<{ id: string; created: boolean }> {
  const key = settlementIdempotencyKey(input.loadId, input.driverId);
  const { data: existing } = await client
    .from('aio_driver_settlements')
    .select('id')
    .eq('idempotency_key', key)
    .maybeSingle();

  if (existing) return { id: existing.id as string, created: false };

  const { data, error } = await client
    .from('aio_driver_settlements')
    .insert({
      load_id: input.loadId,
      organization_id: input.organizationId,
      driver_id: input.driverId,
      compensation_model: 'PER_MILE',
      loaded_miles: input.loadedMiles,
      empty_miles: input.emptyMiles,
      base_compensation_minor: input.totalMinor,
      total_minor: input.totalMinor,
      status: 'CALCULATED',
      idempotency_key: key,
    })
    .select('id')
    .single();

  if (error) throw error;
  return { id: data!.id as string, created: true };
}

export async function ensureCarrierSettlementRow(
  client: SupabaseClient,
  input: {
    loadId: string;
    organizationId: string;
    carrierOrganizationId?: string;
    totalPayableMinor: number;
  },
): Promise<{ id: string; created: boolean }> {
  const key = `carrier-settlement:${input.loadId}`;
  const { data: existing } = await client
    .from('aio_carrier_settlements')
    .select('id')
    .eq('load_id', input.loadId)
    .maybeSingle();

  if (existing) return { id: existing.id as string, created: false };

  const { data, error } = await client
    .from('aio_carrier_settlements')
    .insert({
      load_id: input.loadId,
      organization_id: input.organizationId,
      carrier_organization_id: input.carrierOrganizationId ?? null,
      agreed_carrier_rate_minor: input.totalPayableMinor,
      total_payable_minor: input.totalPayableMinor,
      lifecycle_status: 'READY_FOR_REVIEW',
      required_paperwork_complete: true,
      idempotency_key: key,
    })
    .select('id')
    .single();

  if (error) throw error;
  return { id: data!.id as string, created: true };
}

export function eventIdempotencyKey(loadId: string, event: FreightAutopilotEventType, action: string): string {
  return autopilotAuditIdempotencyKey(loadId, event, action);
}

export type { BillingPackage };
