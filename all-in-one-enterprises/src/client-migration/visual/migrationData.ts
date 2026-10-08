/**
 * Live-data derivations for the propagated migration screens. Everything shown on those screens comes from the store
 * through these helpers; where the store has nothing, the screens say so instead of showing authority sample data.
 */
import type { Client, DemoStore } from '../../demo/demoTypes';
import type { ArchiveMigrationBatchFile } from '../../vault/archiveMigrationTypes';
import type { VaultDocument } from '../../vault/vaultTypes';
import { FILE_POLICY } from '../../vault/vaultConfig';
import type { ClientLifecycleState, ExtractedFactRecord, ReviewSectionCode } from '../types';
import type { IcoName } from './AioMigrationKit';

export type SectionKey = 'COMPANY' | 'PEOPLE' | 'VEHICLES' | 'SERVICES' | 'DOCUMENTS';

export const SECTION_ICON: Record<SectionKey, IcoName> = {
  COMPANY: 'company',
  PEOPLE: 'people',
  VEHICLES: 'truck',
  SERVICES: 'settings',
  DOCUMENTS: 'summary',
};

/** Review-section code used by the activation records for each section. */
export const SECTION_CODE: Record<SectionKey, ReviewSectionCode> = {
  COMPANY: 'COMPANY',
  PEOPLE: 'PEOPLE',
  VEHICLES: 'VEHICLES',
  SERVICES: 'ACTIVE_SERVICES',
  DOCUMENTS: 'DOCUMENTS',
};

/** Which section an extracted fact belongs to (fixture + server entity types). */
export function factSection(fact: ExtractedFactRecord): SectionKey {
  const t = fact.entityType.toLowerCase();
  if (/person|people|owner|driver|contact|member|officer/.test(t)) return 'PEOPLE';
  if (/vehicle|unit|truck|trailer|equipment/.test(t)) return 'VEHICLES';
  if (/service|registration|filing|authority_service/.test(t)) return 'SERVICES';
  if (/document|insurance|certificate|permit|file/.test(t)) return 'DOCUMENTS';
  return 'COMPANY';
}

const LEVEL_RANK = { CONFLICT: 0, LOW: 1, MEDIUM: 2, HIGH: 3 } as const;
export type ConfidenceLevel = keyof typeof LEVEL_RANK;

/** The weakest confidence recorded on a set of facts (null when nothing was extracted). */
export function weakestConfidence(facts: ExtractedFactRecord[]): ConfidenceLevel | null {
  if (!facts.length) return null;
  return facts.reduce<ConfidenceLevel>((worst, fact) => (LEVEL_RANK[fact.confidence] < LEVEL_RANK[worst] ? fact.confidence : worst), 'HIGH');
}

export function lifecycleLabel(state: ClientLifecycleState | undefined): string {
  return (state ?? 'KNOWN_UNMIGRATED').replaceAll('_', ' ');
}

export function isActive(client: Client | undefined): boolean {
  return client?.clientLifecycle === 'ACTIVE';
}

export function plural(n: number, one: string, many = `${one}s`): string {
  return `${n} ${n === 1 ? one : many}`;
}

/** Glyph for one extracted field (phone, email, address fields), else its section's glyph. */
export function factIcon(fact: ExtractedFactRecord): IcoName {
  const k = fact.fieldKey.toLowerCase();
  if (k.includes('phone')) return 'phone';
  if (k.includes('email')) return 'letter';
  if (k.includes('address')) return 'pin';
  return SECTION_ICON[factSection(fact)];
}

/** "legal_name" → "Legal Name" (field labels on conflict cards). */
export function fieldLabel(key: string): string {
  return key
    .replace(/[_-]+/g, ' ')
    .trim()
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

export function profileOf(store: DemoStore, clientId: string | undefined) {
  return (store.roadReadyProfiles ?? []).find((p) => p.organizationId === clientId);
}

export function membersOf(store: DemoStore, clientId: string | undefined) {
  return (store.organizationMembers ?? []).filter((m) => m.organizationId === clientId);
}

export function unitsOf(store: DemoStore, clientId: string | undefined) {
  return (store.powerUnits ?? []).filter((u) => u.organizationId === clientId);
}

export function trailersOf(store: DemoStore, clientId: string | undefined) {
  return (store.trailers ?? []).filter((t) => t.organizationId === clientId);
}

export function driversOf(store: DemoStore, clientId: string | undefined) {
  return (store.drivers ?? []).filter((d) => d.organizationId === clientId);
}

/** Documents on the client record (the vault, migrated legacy scans included). */
export function documentsOf(store: DemoStore, clientId: string | undefined): VaultDocument[] {
  return store.documents.filter((d) => d.organizationId === clientId);
}

const ROLE_WORD: Record<string, [string, string]> = {
  owner: ['Owner', 'Owners'],
  admin: ['Admin', 'Admins'],
  operations: ['Dispatcher', 'Dispatchers'],
  driver: ['Driver', 'Drivers'],
  accounting: ['Accounting', 'Accounting'],
  viewer: ['Viewer', 'Viewers'],
};

/** "1 Owner | 2 Drivers" from organization members plus fleet drivers on file. */
export function peopleSummary(store: DemoStore, clientId: string | undefined): string[] {
  const counts = new Map<string, number>();
  for (const m of membersOf(store, clientId)) counts.set(m.role, (counts.get(m.role) ?? 0) + 1);
  const memberDrivers = counts.get('driver') ?? 0;
  const fleetDrivers = driversOf(store, clientId).length;
  if (fleetDrivers > memberDrivers) counts.set('driver', fleetDrivers);
  const parts = [...counts.entries()].map(([role, n]) => {
    const [one, many] = ROLE_WORD[role] ?? [role, `${role}s`];
    return `${n} ${n === 1 ? one : many}`;
  });
  return parts;
}

export function vehicleSummary(store: DemoStore, clientId: string | undefined): string[] {
  return [plural(unitsOf(store, clientId).length, 'Power Unit'), plural(trailersOf(store, clientId).length, 'Trailer')];
}

/** Distinct document types on file, most specific first. */
export function documentTypes(store: DemoStore, clientId: string | undefined): string[] {
  return [...new Set(documentsOf(store, clientId).map((d) => d.documentType || d.category).filter(Boolean))] as string[];
}

/** Policy upload types as labels ("PDF, JPG, PNG, WEBP"). */
export function acceptedTypeLabels(): string[] {
  return FILE_POLICY.allowedExtensions.filter((ext) => ext !== '.jpeg').map((ext) => ext.slice(1).toUpperCase());
}

export type FileTone = 'pdf' | 'jpg' | 'png' | 'webp' | 'doc' | 'other';

export function fileTone(name: string): { ext: string; tone: FileTone; icon: IcoName } {
  const ext = (name.split('.').pop() ?? '').toLowerCase();
  if (ext === 'pdf') return { ext: 'PDF', tone: 'pdf', icon: 'pdf' };
  if (ext === 'jpg' || ext === 'jpeg') return { ext: 'JPG', tone: 'jpg', icon: 'image' };
  if (ext === 'png') return { ext: 'PNG', tone: 'png', icon: 'image' };
  if (ext === 'webp') return { ext: 'WEBP', tone: 'webp', icon: 'image' };
  if (['csv', 'xls', 'xlsx', 'doc', 'docx', 'txt'].includes(ext)) return { ext: ext.toUpperCase(), tone: 'doc', icon: 'text' };
  return { ext: ext.toUpperCase() || 'FILE', tone: 'other', icon: 'text' };
}

export function formatDay(iso: string | undefined): string {
  if (!iso) return '';
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

/** The first time the client entered a lifecycle state (from its lifecycle events). */
export function lifecycleEvent(store: DemoStore, clientId: string | undefined, state: ClientLifecycleState) {
  return (store.clientLifecycleEvents ?? []).filter((e) => e.organizationId === clientId && e.toState === state).sort((a, b) => a.createdAt.localeCompare(b.createdAt))[0];
}

export function staffName(store: DemoStore, id: string | undefined): string {
  return store.staff.find((s) => s.id === id)?.name ?? (id ? 'AIO Operations' : '');
}

/** Detection bucket for one client in a batch queue (same rule as the batch screens since RECOVERY1). */
export type BatchBucket = 'READY' | 'NEEDS_REVIEW' | 'UNMATCHED';
export function batchBucket(client: Client): BatchBucket {
  if (client.clientLifecycle === 'MIGRATION_REVIEW_REQUIRED') return 'NEEDS_REVIEW';
  if (client.customerNumber || client.clientLifecycle === 'PREBUILT' || client.clientLifecycle === 'MIGRATION_IN_PROGRESS') return 'READY';
  return 'UNMATCHED';
}

export function batchFilesFor(store: DemoStore, clientId: string): ArchiveMigrationBatchFile[] {
  return (store.archiveMigrationBatchFiles ?? []).filter((f) => f.organizationId === clientId);
}
