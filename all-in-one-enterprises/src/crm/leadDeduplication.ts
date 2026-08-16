import type { DemoStore } from '../demo/demoTypes';
import type { CrmLead } from './crmTypes';

export interface DuplicateMatch {
  kind: 'lead' | 'client';
  id: string;
  label: string;
  confidence: 'high' | 'medium';
  reason: string;
}

function norm(s?: string): string {
  return (s ?? '').trim().toLowerCase();
}

export function findDuplicateMatches(store: DemoStore, partial: {
  email?: string;
  phone?: string;
  businessName?: string;
  excludeLeadId?: string;
}): DuplicateMatch[] {
  const out: DuplicateMatch[] = [];
  const email = norm(partial.email);
  const phone = norm(partial.phone?.replace(/\D/g, ''));
  const biz = norm(partial.businessName);

  for (const lead of store.crmLeads ?? []) {
    if (lead.id === partial.excludeLeadId || lead.mergedIntoLeadId) continue;
    if (email && norm(lead.email) === email) {
      out.push({ kind: 'lead', id: lead.id, label: lead.businessName ?? `${lead.firstName} ${lead.lastName}`, confidence: 'high', reason: 'Same email' });
    } else if (phone && norm(lead.phone?.replace(/\D/g, '')) === phone && phone.length >= 10) {
      out.push({ kind: 'lead', id: lead.id, label: lead.businessName ?? `${lead.firstName} ${lead.lastName}`, confidence: 'high', reason: 'Same phone' });
    } else if (biz && norm(lead.businessName) === biz && biz.length > 3) {
      out.push({ kind: 'lead', id: lead.id, label: lead.businessName!, confidence: 'medium', reason: 'Same business name' });
    }
  }

  for (const client of store.clients) {
    if (email && norm(client.contactEmail) === email) {
      out.push({ kind: 'client', id: client.id, label: client.companyName, confidence: 'high', reason: 'Existing customer email' });
    } else if (phone && norm(client.contactPhone?.replace(/\D/g, '')) === phone && phone.length >= 10) {
      out.push({ kind: 'client', id: client.id, label: client.companyName, confidence: 'high', reason: 'Existing customer phone' });
    } else if (biz && norm(client.companyName) === biz && biz.length > 3) {
      out.push({ kind: 'client', id: client.id, label: client.companyName, confidence: 'medium', reason: 'Existing customer business name' });
    }
  }

  const seen = new Set<string>();
  return out.filter((m) => {
    const k = `${m.kind}:${m.id}`;
    if (seen.has(k)) return false;
    seen.add(k);
    return true;
  });
}

export function linkLeadToOrganization(lead: CrmLead, organizationId: string): CrmLead {
  return { ...lead, organizationId, updatedAt: new Date().toISOString() };
}
