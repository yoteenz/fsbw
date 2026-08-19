import { getAioSupabase } from '../data/supabase/client';
import type {
  ShipperFreightRepository,
  ShipperFreightResult,
} from './shipperFreightRepositoryTypes';
import { SHIPPER_FREIGHT_UNAVAILABLE_MESSAGE } from './shipperFreightRepositoryTypes';
import {
  mapInvoiceRow,
  mapLoadRow,
  mapQuoteRow,
  mapShipmentRequestRow,
  mapShipmentRequestToInsert,
  mapStatusHistoryRow,
  mapTemplateRow,
  type QuoteRevisionRow,
  type QuoteRow,
} from './supabaseShipperFreightMappers';

function ok<T>(data: T): ShipperFreightResult<T> {
  return { ok: true, data };
}

function fail(
  code: 'UNAVAILABLE' | 'QUERY_FAILED' | 'FORBIDDEN' | 'VALIDATION',
  message: string,
): ShipperFreightResult<never> {
  return { ok: false, error: { code, message } };
}

async function nextRequestNumber(supabase: NonNullable<ReturnType<typeof getAioSupabase>>): Promise<string> {
  const year = new Date().getFullYear();
  const { count } = await supabase
    .from('aio_shipment_requests')
    .select('*', { count: 'exact', head: true });
  const seq = (count ?? 0) + 1;
  return `SR-${year}-${String(seq).padStart(4, '0')}`;
}

async function recordAudit(
  supabase: NonNullable<ReturnType<typeof getAioSupabase>>,
  entityType: string,
  entityId: string,
  action: string,
  actorType: string,
  actorId?: string,
  note?: string,
  payload?: Record<string, unknown>,
): Promise<void> {
  await supabase.from('aio_brokerage_audit_events').insert({
    entity_type: entityType,
    entity_id: entityId,
    action,
    actor_type: actorType,
    actor_id: actorId ?? null,
    note: note ?? null,
    payload: payload ?? null,
  });
}

async function fetchQuoteWithRevisions(
  supabase: NonNullable<ReturnType<typeof getAioSupabase>>,
  quoteId: string,
): Promise<{ quote: QuoteRow; revisions: QuoteRevisionRow[] } | null> {
  const { data: quote, error } = await supabase
    .from('aio_shipper_freight_quotes')
    .select('*')
    .eq('id', quoteId)
    .maybeSingle();
  if (error || !quote) return null;

  const { data: revisions } = await supabase
    .from('aio_brokerage_quote_revisions')
    .select('*')
    .eq('quote_id', quoteId)
    .order('version', { ascending: true });

  return { quote: quote as QuoteRow, revisions: (revisions ?? []) as QuoteRevisionRow[] };
}

export function createSupabaseShipperFreightRepository(
  orgId: string,
  userId: string,
): ShipperFreightRepository {
  return {
    mode: 'supabase',

    async saveDraft(orgIdArg, partial, existingId) {
      const supabase = getAioSupabase();
      if (!supabase) return fail('UNAVAILABLE', SHIPPER_FREIGHT_UNAVAILABLE_MESSAGE);
      if (orgIdArg !== orgId) return fail('FORBIDDEN', SHIPPER_FREIGHT_UNAVAILABLE_MESSAGE);

      const now = new Date().toISOString();

      if (existingId) {
        const { data: existing, error: readErr } = await supabase
          .from('aio_shipment_requests')
          .select('id, status, version')
          .eq('id', existingId)
          .eq('shipper_organization_id', orgId)
          .maybeSingle();
        if (readErr || !existing || existing.status !== 'draft') {
          return fail('VALIDATION', 'Draft not found or no longer editable.');
        }

        const patch = mapShipmentRequestToInsert(orgId, partial, '');
        delete patch.request_number;
        delete patch.status;
        patch.updated_at = now;
        patch.version = (existing.version as number) + 1;

        const { error } = await supabase
          .from('aio_shipment_requests')
          .update(patch)
          .eq('id', existingId)
          .eq('shipper_organization_id', orgId);
        if (error) return fail('QUERY_FAILED', SHIPPER_FREIGHT_UNAVAILABLE_MESSAGE);

        await recordAudit(supabase, 'shipment_request', existingId, 'draft_updated', 'shipper', userId);
        return ok(existingId);
      }

      const requestNumber = await nextRequestNumber(supabase);
      const row = mapShipmentRequestToInsert(orgId, partial, requestNumber);
      const { data, error } = await supabase
        .from('aio_shipment_requests')
        .insert(row)
        .select('id')
        .single();
      if (error || !data) return fail('QUERY_FAILED', SHIPPER_FREIGHT_UNAVAILABLE_MESSAGE);

      await recordAudit(supabase, 'shipment_request', data.id, 'draft_created', 'shipper', userId);
      return ok(data.id);
    },

    async submitRequest(orgIdArg, requestId) {
      const supabase = getAioSupabase();
      if (!supabase) return fail('UNAVAILABLE', SHIPPER_FREIGHT_UNAVAILABLE_MESSAGE);
      if (orgIdArg !== orgId) return fail('FORBIDDEN', SHIPPER_FREIGHT_UNAVAILABLE_MESSAGE);

      const { data: req, error: readErr } = await supabase
        .from('aio_shipment_requests')
        .select('id, status, version')
        .eq('id', requestId)
        .eq('shipper_organization_id', orgId)
        .maybeSingle();
      if (readErr || !req) return fail('VALIDATION', 'Request not found.');
      if (!['draft', 'info_required', 'submitted'].includes(req.status as string)) {
        return fail('VALIDATION', 'Request cannot be submitted in its current state.');
      }

      const { error } = await supabase
        .from('aio_shipment_requests')
        .update({
          status: 'under_review',
          updated_at: new Date().toISOString(),
          version: (req.version as number) + 1,
        })
        .eq('id', requestId)
        .eq('shipper_organization_id', orgId);
      if (error) return fail('QUERY_FAILED', SHIPPER_FREIGHT_UNAVAILABLE_MESSAGE);

      await recordAudit(supabase, 'shipment_request', requestId, 'submitted', 'shipper', userId);
      return ok(undefined);
    },

    async listRequests(orgIdArg) {
      const supabase = getAioSupabase();
      if (!supabase) return fail('UNAVAILABLE', SHIPPER_FREIGHT_UNAVAILABLE_MESSAGE);
      if (orgIdArg !== orgId) return fail('FORBIDDEN', SHIPPER_FREIGHT_UNAVAILABLE_MESSAGE);

      const { data, error } = await supabase
        .from('aio_shipment_requests')
        .select('*')
        .eq('shipper_organization_id', orgId)
        .order('updated_at', { ascending: false });
      if (error) return fail('QUERY_FAILED', SHIPPER_FREIGHT_UNAVAILABLE_MESSAGE);
      return ok((data ?? []).map((r) => mapShipmentRequestRow(r as never)));
    },

    async getRequest(orgIdArg, requestId) {
      const supabase = getAioSupabase();
      if (!supabase) return fail('UNAVAILABLE', SHIPPER_FREIGHT_UNAVAILABLE_MESSAGE);
      if (orgIdArg !== orgId) return fail('FORBIDDEN', SHIPPER_FREIGHT_UNAVAILABLE_MESSAGE);

      const { data, error } = await supabase
        .from('aio_shipment_requests')
        .select('*')
        .eq('id', requestId)
        .eq('shipper_organization_id', orgId)
        .maybeSingle();
      if (error) return fail('QUERY_FAILED', SHIPPER_FREIGHT_UNAVAILABLE_MESSAGE);
      return ok(data ? mapShipmentRequestRow(data as never) : null);
    },

    async listQuotes(orgIdArg) {
      const supabase = getAioSupabase();
      if (!supabase) return fail('UNAVAILABLE', SHIPPER_FREIGHT_UNAVAILABLE_MESSAGE);
      if (orgIdArg !== orgId) return fail('FORBIDDEN', SHIPPER_FREIGHT_UNAVAILABLE_MESSAGE);

      const { data, error } = await supabase
        .from('aio_shipper_freight_quotes')
        .select('*')
        .eq('shipper_organization_id', orgId)
        .order('updated_at', { ascending: false });
      if (error) return fail('QUERY_FAILED', SHIPPER_FREIGHT_UNAVAILABLE_MESSAGE);

      const quotes = [];
      for (const row of data ?? []) {
        const { data: revisions } = await supabase
          .from('aio_brokerage_quote_revisions')
          .select('*')
          .eq('quote_id', row.id)
          .order('version', { ascending: true });
        quotes.push(mapQuoteRow(row as QuoteRow, (revisions ?? []) as QuoteRevisionRow[]));
      }
      return ok(quotes);
    },

    async getQuote(orgIdArg, quoteId) {
      const supabase = getAioSupabase();
      if (!supabase) return fail('UNAVAILABLE', SHIPPER_FREIGHT_UNAVAILABLE_MESSAGE);
      if (orgIdArg !== orgId) return fail('FORBIDDEN', SHIPPER_FREIGHT_UNAVAILABLE_MESSAGE);

      const { data, error } = await supabase
        .from('aio_shipper_freight_quotes')
        .select('*')
        .eq('id', quoteId)
        .eq('shipper_organization_id', orgId)
        .maybeSingle();
      if (error) return fail('QUERY_FAILED', SHIPPER_FREIGHT_UNAVAILABLE_MESSAGE);
      if (!data) return ok(null);

      const fetched = await fetchQuoteWithRevisions(supabase, quoteId);
      if (!fetched) return ok(null);
      return ok(mapQuoteRow(fetched.quote, fetched.revisions));
    },

    async acceptQuote(orgIdArg, quoteId) {
      const supabase = getAioSupabase();
      if (!supabase) return fail('UNAVAILABLE', SHIPPER_FREIGHT_UNAVAILABLE_MESSAGE);
      if (orgIdArg !== orgId) return fail('FORBIDDEN', SHIPPER_FREIGHT_UNAVAILABLE_MESSAGE);

      const fetched = await fetchQuoteWithRevisions(supabase, quoteId);
      if (!fetched || fetched.quote.shipper_organization_id !== orgId) {
        return fail('VALIDATION', 'Quote not found.');
      }
      if (!['sent', 'revised', 'viewed'].includes(fetched.quote.status)) {
        return fail('VALIDATION', 'Quote cannot be accepted in its current state.');
      }

      const { data: req } = await supabase
        .from('aio_shipment_requests')
        .select('*')
        .eq('id', fetched.quote.shipment_request_id)
        .eq('shipper_organization_id', orgId)
        .maybeSingle();
      if (!req) return fail('VALIDATION', 'Linked request not found.');

      const latestRevision = fetched.revisions[fetched.revisions.length - 1];
      const loadNumber = `BR-LD-${new Date().getFullYear()}-${String(Date.now()).slice(-4)}`;

      const { data: load, error: loadErr } = await supabase
        .from('aio_dispatch_loads')
        .insert({
          load_number: loadNumber,
          organization_id: orgId,
          shipper_organization_id: orgId,
          source_type: 'brokerage',
          origin_city: req.pickup_city,
          origin_state: req.pickup_state,
          destination_city: req.delivery_city,
          destination_state: req.delivery_state,
          pickup_date: req.pickup_date,
          delivery_date: req.delivery_date,
          equipment_type: req.equipment_type,
          operational_status: 'opportunity',
          coverage_status: 'needs_coverage',
          financial_split_status: 'needs_review',
          currency: 'USD',
        })
        .select('id')
        .single();
      if (loadErr || !load) return fail('QUERY_FAILED', SHIPPER_FREIGHT_UNAVAILABLE_MESSAGE);

      await supabase.from('aio_brokerage_load_financials').insert({
        load_id: load.id,
        shipper_rate_minor: fetched.quote.freight_charge_minor,
        carrier_rate_minor: 0,
        currency: 'USD',
      });

      await supabase
        .from('aio_brokerage_freight_quotes')
        .update({
          status: 'converted',
          accepted_revision_id: latestRevision?.id ?? null,
          converted_load_id: load.id,
          updated_at: new Date().toISOString(),
        })
        .eq('id', quoteId);

      await supabase
        .from('aio_shipment_requests')
        .update({
          status: 'converted_to_load',
          converted_load_id: load.id,
          updated_at: new Date().toISOString(),
        })
        .eq('id', fetched.quote.shipment_request_id);

      await recordAudit(supabase, 'quote', quoteId, 'quote_accepted', 'shipper', userId);
      await recordAudit(supabase, 'load', load.id, 'load_created_from_request', 'system', undefined, req.request_number);

      return ok(load.id as string);
    },

    async declineQuote(orgIdArg, quoteId) {
      const supabase = getAioSupabase();
      if (!supabase) return fail('UNAVAILABLE', SHIPPER_FREIGHT_UNAVAILABLE_MESSAGE);
      if (orgIdArg !== orgId) return fail('FORBIDDEN', SHIPPER_FREIGHT_UNAVAILABLE_MESSAGE);

      const { error } = await supabase
        .from('aio_brokerage_freight_quotes')
        .update({ status: 'declined', updated_at: new Date().toISOString() })
        .eq('id', quoteId)
        .eq('shipper_organization_id', orgId)
        .in('status', ['sent', 'revised', 'viewed']);
      if (error) return fail('QUERY_FAILED', SHIPPER_FREIGHT_UNAVAILABLE_MESSAGE);

      await recordAudit(supabase, 'quote', quoteId, 'quote_declined', 'shipper', userId);
      return ok(undefined);
    },

    async listShipments(orgIdArg) {
      const supabase = getAioSupabase();
      if (!supabase) return fail('UNAVAILABLE', SHIPPER_FREIGHT_UNAVAILABLE_MESSAGE);
      if (orgIdArg !== orgId) return fail('FORBIDDEN', SHIPPER_FREIGHT_UNAVAILABLE_MESSAGE);

      const { data, error } = await supabase
        .from('aio_shipper_freight_shipments')
        .select('*')
        .eq('shipper_organization_id', orgId)
        .order('updated_at', { ascending: false });
      if (error) return fail('QUERY_FAILED', SHIPPER_FREIGHT_UNAVAILABLE_MESSAGE);
      return ok((data ?? []).map((r) => mapLoadRow(r as never)));
    },

    async getShipment(orgIdArg, loadId) {
      const supabase = getAioSupabase();
      if (!supabase) return fail('UNAVAILABLE', SHIPPER_FREIGHT_UNAVAILABLE_MESSAGE);
      if (orgIdArg !== orgId) return fail('FORBIDDEN', SHIPPER_FREIGHT_UNAVAILABLE_MESSAGE);

      const { data, error } = await supabase
        .from('aio_shipper_freight_shipments')
        .select('*')
        .eq('id', loadId)
        .eq('shipper_organization_id', orgId)
        .maybeSingle();
      if (error) return fail('QUERY_FAILED', SHIPPER_FREIGHT_UNAVAILABLE_MESSAGE);
      return ok(data ? mapLoadRow(data as never) : null);
    },

    async getShipmentHistory(orgIdArg, loadId) {
      const supabase = getAioSupabase();
      if (!supabase) return fail('UNAVAILABLE', SHIPPER_FREIGHT_UNAVAILABLE_MESSAGE);
      if (orgIdArg !== orgId) return fail('FORBIDDEN', SHIPPER_FREIGHT_UNAVAILABLE_MESSAGE);

      const { data: load } = await supabase
        .from('aio_shipper_freight_shipments')
        .select('id')
        .eq('id', loadId)
        .eq('shipper_organization_id', orgId)
        .maybeSingle();
      if (!load) return ok([]);

      const { data, error } = await supabase
        .from('aio_load_status_history')
        .select('*')
        .eq('load_id', loadId)
        .order('created_at', { ascending: true });
      if (error) return fail('QUERY_FAILED', SHIPPER_FREIGHT_UNAVAILABLE_MESSAGE);
      return ok((data ?? []).map((r) => mapStatusHistoryRow(r as never)));
    },

    async listInvoices(orgIdArg) {
      const supabase = getAioSupabase();
      if (!supabase) return fail('UNAVAILABLE', SHIPPER_FREIGHT_UNAVAILABLE_MESSAGE);
      if (orgIdArg !== orgId) return fail('FORBIDDEN', SHIPPER_FREIGHT_UNAVAILABLE_MESSAGE);

      const { data, error } = await supabase
        .from('aio_brokerage_shipper_invoices')
        .select('*')
        .eq('shipper_organization_id', orgId)
        .order('invoice_date', { ascending: false });
      if (error) return fail('QUERY_FAILED', SHIPPER_FREIGHT_UNAVAILABLE_MESSAGE);
      return ok((data ?? []).map((r) => mapInvoiceRow(r as never)));
    },

    async getInvoice(orgIdArg, invoiceId) {
      const supabase = getAioSupabase();
      if (!supabase) return fail('UNAVAILABLE', SHIPPER_FREIGHT_UNAVAILABLE_MESSAGE);
      if (orgIdArg !== orgId) return fail('FORBIDDEN', SHIPPER_FREIGHT_UNAVAILABLE_MESSAGE);

      const { data, error } = await supabase
        .from('aio_brokerage_shipper_invoices')
        .select('*')
        .eq('id', invoiceId)
        .eq('shipper_organization_id', orgId)
        .maybeSingle();
      if (error) return fail('QUERY_FAILED', SHIPPER_FREIGHT_UNAVAILABLE_MESSAGE);
      return ok(data ? mapInvoiceRow(data as never) : null);
    },

    async listAuthorizedDocuments(orgIdArg, context) {
      const supabase = getAioSupabase();
      if (!supabase) return fail('UNAVAILABLE', SHIPPER_FREIGHT_UNAVAILABLE_MESSAGE);
      if (orgIdArg !== orgId) return fail('FORBIDDEN', SHIPPER_FREIGHT_UNAVAILABLE_MESSAGE);
      void context;
      return ok([]);
    },

    async saveTemplate(orgIdArg, label, snapshot) {
      const supabase = getAioSupabase();
      if (!supabase) return fail('UNAVAILABLE', SHIPPER_FREIGHT_UNAVAILABLE_MESSAGE);
      if (orgIdArg !== orgId) return fail('FORBIDDEN', SHIPPER_FREIGHT_UNAVAILABLE_MESSAGE);

      const { data, error } = await supabase
        .from('aio_shipment_request_templates')
        .insert({
          shipper_organization_id: orgId,
          label,
          snapshot,
        })
        .select('*')
        .single();
      if (error || !data) return fail('QUERY_FAILED', SHIPPER_FREIGHT_UNAVAILABLE_MESSAGE);
      return ok(mapTemplateRow(data as never));
    },

    async listTemplates(orgIdArg) {
      const supabase = getAioSupabase();
      if (!supabase) return fail('UNAVAILABLE', SHIPPER_FREIGHT_UNAVAILABLE_MESSAGE);
      if (orgIdArg !== orgId) return fail('FORBIDDEN', SHIPPER_FREIGHT_UNAVAILABLE_MESSAGE);

      const { data, error } = await supabase
        .from('aio_shipment_request_templates')
        .select('*')
        .eq('shipper_organization_id', orgId)
        .order('updated_at', { ascending: false });
      if (error) return fail('QUERY_FAILED', SHIPPER_FREIGHT_UNAVAILABLE_MESSAGE);
      return ok((data ?? []).map((r) => mapTemplateRow(r as never)));
    },

    async duplicateFromTemplate(orgIdArg, templateId) {
      const supabase = getAioSupabase();
      if (!supabase) return fail('UNAVAILABLE', SHIPPER_FREIGHT_UNAVAILABLE_MESSAGE);
      if (orgIdArg !== orgId) return fail('FORBIDDEN', SHIPPER_FREIGHT_UNAVAILABLE_MESSAGE);

      const { data: template } = await supabase
        .from('aio_shipment_request_templates')
        .select('snapshot')
        .eq('id', templateId)
        .eq('shipper_organization_id', orgId)
        .maybeSingle();
      if (!template) return fail('VALIDATION', 'Template not found.');

      return createSupabaseShipperFreightRepository(orgId, userId).saveDraft(
        orgId,
        { ...(template.snapshot as object), pickupDate: '', deliveryDate: '' },
      );
    },
  };
}
