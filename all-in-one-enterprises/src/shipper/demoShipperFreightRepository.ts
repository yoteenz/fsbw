import {
  acceptBrokerageQuoteWorkflow,
  duplicateRequestFromTemplate,
  saveShipmentRequestDraft,
  saveShipmentTemplate,
  submitShipmentRequest,
} from '../brokerage/brokerageWorkflow';
import { getShipperQuotes, getShipperRequests } from '../demo/brokerageActions';
import { loadDemoStore, updateDemoStore } from '../demo/demoStore';
import { canTransitionQuoteStatus } from '../brokerage/brokerageRules';
import type {
  ShipperFreightDocument,
  ShipperFreightRepository,
  ShipperFreightResult,
  ShipperShipmentStatusEvent,
} from './shipperFreightRepositoryTypes';

function ok<T>(data: T): ShipperFreightResult<T> {
  return { ok: true, data };
}

function fail(
  code: 'UNAVAILABLE' | 'QUERY_FAILED' | 'FORBIDDEN' | 'VALIDATION',
  message: string,
): ShipperFreightResult<never> {
  return { ok: false, error: { code, message } };
}

export const demoShipperFreightRepository: ShipperFreightRepository = {
  mode: 'demo',

  async saveDraft(orgId, partial, existingId) {
    const id = saveShipmentRequestDraft(orgId, partial, existingId);
    return ok(id);
  },

  async submitRequest(orgId, requestId) {
    if (!submitShipmentRequest(orgId, requestId)) {
      return fail('VALIDATION', 'Could not submit this request.');
    }
    return ok(undefined);
  },

  async listRequests(orgId) {
    const store = loadDemoStore();
    return ok(getShipperRequests(orgId, store));
  },

  async getRequest(orgId, requestId) {
    const store = loadDemoStore();
    const req = store.shipmentRequests.find(
      (r) => r.id === requestId && r.shipperOrganizationId === orgId,
    );
    return ok(req ?? null);
  },

  async listQuotes(orgId) {
    const store = loadDemoStore();
    return ok(getShipperQuotes(orgId, store));
  },

  async getQuote(orgId, quoteId) {
    const store = loadDemoStore();
    const quote = store.brokerageFreightQuotes.find(
      (q) => q.id === quoteId && q.shipperOrganizationId === orgId,
    );
    return ok(quote ?? null);
  },

  async acceptQuote(orgId, quoteId) {
    const loadId = acceptBrokerageQuoteWorkflow(quoteId, orgId);
    if (!loadId) return fail('VALIDATION', 'Could not accept this quote.');
    return ok(loadId);
  },

  async declineQuote(orgId, quoteId) {
    let declined = false;
    updateDemoStore((s) => {
      const q = s.brokerageFreightQuotes.find(
        (x) => x.id === quoteId && x.shipperOrganizationId === orgId,
      );
      if (!q || !canTransitionQuoteStatus(q.status, 'declined')) return s;
      q.status = 'declined';
      q.updatedAt = new Date().toISOString();
      declined = true;
      return s;
    });
    if (!declined) return fail('VALIDATION', 'Could not decline this quote.');
    return ok(undefined);
  },

  async listShipments(orgId) {
    const store = loadDemoStore();
    const loads = store.loads.filter(
      (l) => l.sourceType === 'brokerage' && l.shipperOrganizationId === orgId,
    );
    return ok(loads);
  },

  async getShipment(orgId, loadId) {
    const store = loadDemoStore();
    const load = store.loads.find(
      (l) => l.id === loadId && l.shipperOrganizationId === orgId,
    );
    return ok(load ?? null);
  },

  async getShipmentHistory(orgId, loadId) {
    const store = loadDemoStore();
    const load = store.loads.find(
      (l) => l.id === loadId && l.shipperOrganizationId === orgId,
    );
    if (!load) return ok([]);
    const events: ShipperShipmentStatusEvent[] = (load.timeline ?? []).map((t, i) => ({
      id: `demo-${loadId}-${i}`,
      loadId,
      toStatus: t.operationalStatus ?? load.operationalStatus,
      note: t.label,
      actorLabel: t.actor,
      createdAt: t.createdAt,
    }));
    return ok(events);
  },

  async listInvoices(orgId) {
    const store = loadDemoStore();
    const invoices = store.brokerageShipperInvoices.filter((i) => i.shipperOrganizationId === orgId);
    return ok(invoices);
  },

  async getInvoice(orgId, invoiceId) {
    const store = loadDemoStore();
    const inv = store.brokerageShipperInvoices.find(
      (i) => i.id === invoiceId && i.shipperOrganizationId === orgId,
    );
    return ok(inv ?? null);
  },

  async listAuthorizedDocuments(orgId, context) {
    const store = loadDemoStore();
    const docs: ShipperFreightDocument[] = [];
    if (context.loadId) {
      const load = store.loads.find(
        (l) => l.id === context.loadId && l.shipperOrganizationId === orgId,
      );
      if (load?.podDocumentId) {
        docs.push({
          id: load.podDocumentId,
          loadId: load.id,
          kind: 'pod',
          label: 'Proof of Delivery',
          createdAt: load.updatedAt,
        });
      }
    }
    return ok(docs);
  },

  async saveTemplate(orgId, label, snapshot) {
    const template = saveShipmentTemplate(orgId, label, snapshot);
    return ok(template);
  },

  async listTemplates(orgId) {
    const store = loadDemoStore();
    return ok(
      (store.shipmentRequestTemplates ?? []).filter((t) => t.shipperOrganizationId === orgId),
    );
  },

  async duplicateFromTemplate(orgId, templateId) {
    const id = duplicateRequestFromTemplate(orgId, templateId);
    if (!id) return fail('VALIDATION', 'Template not found.');
    return ok(id);
  },
};
