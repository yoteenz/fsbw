import type { DemoStore } from '../demo/demoTypes';
import { lastEndedQuarter, quarterKey, quarterLabel } from './iftaDates';
import type { IftaQuarterCase } from './iftaTypes';

export function parseQuarterKey(key: string): { year: number; quarter: number } | null {
  const m = /^(\d{4})-Q([1-4])$/.exec(key.trim());
  if (!m) return null;
  return { year: Number(m[1]), quarter: Number(m[2]) };
}

export function quartersForOrg(store: DemoStore, organizationId: string): IftaQuarterCase[] {
  return (store.iftaQuarters ?? []).filter((q) => q.organizationId === organizationId);
}

export function findOrgQuarter(store: DemoStore, organizationId: string, key: string): IftaQuarterCase | undefined {
  const parsed = parseQuarterKey(key);
  if (!parsed) return undefined;
  return quartersForOrg(store, organizationId).find((q) => q.year === parsed.year && q.quarter === parsed.quarter);
}

export function findCaseById(store: DemoStore, caseId: string): IftaQuarterCase | undefined {
  return (store.iftaQuarters ?? []).find((q) => q.id === caseId);
}

/** Default filing-room quarter: the calendar filing quarter if present, else the latest by period. */
export function defaultQuarterKeyForOrg(store: DemoStore, organizationId: string, now = new Date()): string | null {
  const orgQuarters = quartersForOrg(store, organizationId);
  if (!orgQuarters.length) return null;
  const filing = lastEndedQuarter(now);
  const match = orgQuarters.find((q) => q.year === filing.year && q.quarter === filing.quarter);
  if (match) return quarterKey(match);
  const sorted = [...orgQuarters].sort((a, b) => b.periodStart.localeCompare(a.periodStart));
  return quarterKey(sorted[0]!);
}

export function orgHasIftaWorkspace(store: DemoStore, organizationId: string): boolean {
  return quartersForOrg(store, organizationId).length > 0;
}

export function companyName(store: DemoStore, organizationId: string): string {
  return store.clients.find((c) => c.id === organizationId)?.companyName ?? organizationId;
}

export function quarterTitle(q: IftaQuarterCase): string {
  return quarterLabel(q);
}
