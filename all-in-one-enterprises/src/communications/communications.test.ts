import { describe, expect, it } from 'vitest';
import { createDemoSeed } from '../demo/demoSeed';
import {
  addInternalNote,
  getConversationMessages,
} from '../demo/communicationActions';
import { getAvailableSlots } from '../demo/appointmentActions';
import { convertLeadToCustomer } from '../crm/conversionEngine';
import {
  authorizeConversationAccess,
  canCustomerViewMessage,
  computeNeedsReply,
  afterInboundCustomerMessage,
} from '../communications/communicationEngine';
import { tryBookSlot } from '../appointments/availabilityEngine';
import { renderTemplate } from '../demo/communicationActions';
import { canSendChannel, getPreference } from '../communications/communicationEngine';

describe('Communications visibility', () => {
  it('internal notes are hidden from customer view', () => {
    const store = createDemoSeed();
    const internal = store.commMessages!.find((m) => m.visibility === 'internal_only');
    expect(internal).toBeTruthy();
    expect(canCustomerViewMessage(internal!)).toBe(false);
    const customerMsgs = getConversationMessages(internal!.conversationId, store, true);
    expect(customerMsgs.every((m) => m.visibility === 'customer_visible')).toBe(true);
  });

  it('customer cannot access another org conversation', () => {
    const store = createDemoSeed();
    const conv = store.commConversations!.find((c) => c.organizationId === 'client-a');
    expect(conv).toBeTruthy();
    const denied = authorizeConversationAccess(store, conv!.id, { organizationId: 'client-b' });
    expect(denied).toBeUndefined();
    const allowed = authorizeConversationAccess(store, conv!.id, { organizationId: 'client-a' });
    expect(allowed?.id).toBe(conv!.id);
  });
});

describe('Needs reply logic', () => {
  it('flags waiting_on_staff conversations', () => {
    const store = createDemoSeed();
    const conv = store.commConversations!.find((c) => c.id === 'conv-a');
    expect(conv?.status).toBe('waiting_on_staff');
    expect(computeNeedsReply(conv!)).toBe(true);
  });

  it('portal customer reply moves conversation to waiting on staff', () => {
    const store = createDemoSeed();
    const conv = store.commConversations!.find((c) => c.id === 'conv-b')!;
    const updated = afterInboundCustomerMessage(conv, new Date().toISOString());
    expect(updated.status).toBe('waiting_on_staff');
    expect(updated.responseResponsibility).toBe('staff');
  });
});

describe('Lead conversion continuity', () => {
  it('preserves lead conversations on conversion', () => {
    let store = createDemoSeed();
    const leadConvsBefore = store.commConversations!.filter((c) => c.leadId === 'lead-g').length;
    const { store: next } = convertLeadToCustomer(store, 'lead-g', 'opp-g', 'staff-2');
    store = next;
    const linked = store.commConversations!.filter((c) => c.leadId === 'lead-g' || c.organizationId === store.crmLeads!.find((l) => l.id === 'lead-g')?.organizationId);
    expect(linked.length).toBeGreaterThanOrEqual(leadConvsBefore);
  });
});

describe('Template variables', () => {
  it('substitutes approved variables only', () => {
    const out = renderTemplate('Hello {{first_name}} at {{business_name}}', { first_name: 'Jordan', business_name: 'Roadline' });
    expect(out).toBe('Hello Jordan at Roadline');
    expect(renderTemplate('{{unknown}}', {})).toBe('');
  });
});

describe('Consent', () => {
  it('unknown preference does not grant email by default', () => {
    expect(canSendChannel(undefined, 'email', 'transactional')).toBe(false);
    expect(canSendChannel(undefined, 'portal', 'transactional')).toBe(true);
  });

  it('marketing SMS blocked when declined', () => {
    const store = createDemoSeed();
    const pref = getPreference(store, { leadId: 'lead-a' });
    expect(canSendChannel(pref, 'sms', 'marketing')).toBe(false);
    expect(canSendChannel(pref, 'email', 'transactional')).toBe(true);
  });
});

describe('Appointment booking', () => {
  it('generates slots for appointment type', () => {
    const store = createDemoSeed();
    const type = store.appointmentTypes![0];
    const date = new Date();
    date.setDate(date.getDate() + 2);
    while (date.getDay() === 0 || date.getDay() === 6) date.setDate(date.getDate() + 1);
    const slots = getAvailableSlots(type.id, date.toISOString().slice(0, 10), 'test-session', store);
    expect(slots.length).toBeGreaterThan(0);
  });

  it('rejects double booking on same slot', () => {
    const store = createDemoSeed();
    const existing = store.appointments!.find((a) => a.status === 'confirmed')!;
    const check = tryBookSlot(store.appointments ?? [], [], existing.scheduledStart, 'other-session');
    expect(check.ok).toBe(false);
  });
});

describe('Internal note isolation', () => {
  it('addInternalNote never sets customer_visible', () => {
    const msg = addInternalNote('conv-a', 'Staff only test note', 'staff-1', 'Staff');
    expect(msg).toBeTruthy();
    expect(msg!.visibility).toBe('internal_only');
    expect(msg!.direction).toBe('internal');
  });
});
