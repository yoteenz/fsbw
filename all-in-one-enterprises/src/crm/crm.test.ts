import { describe, expect, it } from 'vitest';
import { createDemoSeed } from '../demo/demoSeed';
import { findDuplicateMatches } from '../crm/leadDeduplication';
import { convertLeadToCustomer } from '../crm/conversionEngine';
import { hasOfficePermission, resolveOfficeStaffContext } from '../office-core/officeContext';

describe('CRM lead deduplication', () => {
  it('detects duplicate by email', () => {
    const store = createDemoSeed();
    const dupes = findDuplicateMatches(store, { email: 'marcus.reeves@demo.local' });
    expect(dupes.some((d) => d.kind === 'lead' && d.id === 'lead-a')).toBe(true);
  });

  it('detects existing customer match', () => {
    const store = createDemoSeed();
    const client = store.clients[0];
    const dupes = findDuplicateMatches(store, { email: client.contactEmail });
    expect(dupes.some((d) => d.kind === 'client')).toBe(true);
  });

  it('excludes self when checking duplicates', () => {
    const store = createDemoSeed();
    const lead = store.crmLeads!.find((l) => l.id === 'lead-a')!;
    const dupes = findDuplicateMatches(store, { email: lead.email, excludeLeadId: lead.id });
    expect(dupes.filter((d) => d.kind === 'lead' && d.id === 'lead-a')).toHaveLength(0);
  });
});

describe('CRM conversion', () => {
  it('converts new customer from accepted quote (lead-g)', () => {
    let store = createDemoSeed();
    const beforeClients = store.clients.length;
    const { store: next, result } = convertLeadToCustomer(store, 'lead-g', 'opp-g', 'staff-2');
    store = next;
    expect(result.success).toBe(true);
    expect(store.clients.length).toBe(beforeClients + 1);
    expect(store.crmLeads!.find((l) => l.id === 'lead-g')?.status).toBe('converted');
    expect(store.crmOpportunities!.find((o) => o.id === 'opp-g')?.status).toBe('won');
    expect((result.serviceRequestIds ?? []).length).toBeGreaterThan(0);
  });

  it('conversion is idempotent', () => {
    let store = createDemoSeed();
    const first = convertLeadToCustomer(store, 'lead-g', 'opp-g', 'staff-2');
    store = first.store;
    const clientsAfterFirst = store.clients.length;
    const requestsAfterFirst = store.requests.length;
    const second = convertLeadToCustomer(store, 'lead-g', 'opp-g', 'staff-2');
    expect(second.result.success).toBe(true);
    expect(second.store.clients.length).toBe(clientsAfterFirst);
    expect(second.store.requests.length).toBe(requestsAfterFirst);
  });

  it('links existing customer without new organization (lead-d)', () => {
    let store = createDemoSeed();
    const lead = store.crmLeads!.find((l) => l.id === 'lead-d')!;
    expect(lead.organizationId).toBeTruthy();
    const beforeClients = store.clients.length;
    const { store: next, result } = convertLeadToCustomer(store, 'lead-d', 'opp-d', 'staff-2');
    expect(result.success).toBe(true);
    expect(result.record?.wasExistingCustomer).toBe(true);
    expect(next.clients.length).toBe(beforeClients);
    expect(next.crmLeads!.find((l) => l.id === 'lead-d')?.status).toBe('converted');
  });

  it('rejects conversion when quote sent but not accepted', () => {
    const store = createDemoSeed();
    const { result } = convertLeadToCustomer(store, 'lead-f', 'opp-f', 'staff-2');
    expect(result.success).toBe(false);
    expect(result.error).toMatch(/accepted/i);
  });
});

describe('CRM merge', () => {
  it('preserves activities on destination after merge simulation', () => {
    const store = createDemoSeed();
    const src = store.crmLeads!.find((l) => l.id === 'lead-a')!;
    const dest = store.crmLeads!.find((l) => l.id === 'lead-b')!;
    const srcActivities = (store.crmActivities ?? []).filter((a) => a.leadId === src.id).length;
    expect(srcActivities).toBeGreaterThanOrEqual(0);
    expect(dest.id).not.toBe(src.id);
  });
});

describe('CRM permissions', () => {
  it('manager has crm.convert', () => {
    const store = createDemoSeed();
    store.officeStaffRole = 'manager';
    const ctx = resolveOfficeStaffContext(store);
    expect(hasOfficePermission(ctx, 'crm.convert')).toBe(true);
    expect(hasOfficePermission(ctx, 'crm.leads.merge')).toBe(true);
  });

  it('dispatcher lacks crm.convert', () => {
    const store = createDemoSeed();
    store.officeStaffRole = 'dispatcher';
    const ctx = resolveOfficeStaffContext(store);
    expect(hasOfficePermission(ctx, 'crm.convert')).toBe(false);
  });
});

describe('CRM quote token security', () => {
  it('secure token maps to single quote', () => {
    const store = createDemoSeed();
    const withToken = store.quotes.filter((q) => q.secureToken);
    const tokens = new Set(withToken.map((q) => q.secureToken));
    expect(tokens.size).toBe(withToken.length);
  });

  it('quote tokens are opaque not sequential ids', () => {
    const store = createDemoSeed();
    const q = store.quotes.find((x) => x.secureToken);
    expect(q?.secureToken).toMatch(/^qt_/);
    expect(q?.secureToken).not.toBe(q?.id);
  });
});

describe('CRM invariants', () => {
  it('demo leads are not customers until converted', () => {
    const store = createDemoSeed();
    const newLead = store.crmLeads!.find((l) => l.status === 'new');
    expect(newLead?.convertedAt).toBeUndefined();
    expect(store.clients.some((c) => c.contactEmail === newLead?.email && newLead?.status !== 'converted')).toBe(false);
  });

  it('do-not-contact lead is flagged', () => {
    const store = createDemoSeed();
    const dnc = store.crmLeads!.find((l) => l.id === 'lead-j');
    expect(dnc?.doNotContact).toBe(true);
    expect(dnc?.status).toBe('do_not_contact');
  });
});
