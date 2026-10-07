import type { Client, DemoStore } from '../../demo/demoTypes';

/** "Jordan Lee" → "JORDAN L." (header identity line, authority format). */
export function shortPersonName(full: string | undefined): string {
  const parts = (full ?? '').trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return '';
  const first = parts[0].toUpperCase();
  const last = parts.length > 1 ? ` ${parts[parts.length - 1][0].toUpperCase()}.` : '';
  return `${first}${last}`;
}

export function initialsOf(name: string | undefined): string {
  const words = (name ?? '').replace(/[^A-Za-z0-9 ]/g, ' ').trim().split(/\s+/).filter(Boolean);
  if (!words.length) return 'AIO';
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  return (words[0][0] + words[1][0]).toUpperCase();
}

export type MigrationViewer = { name: string; role: string; initials: string };

/** Who is looking at the screen: office staff on intake routes, the client contact on activation routes. */
export function staffViewer(store: DemoStore, sessionUserId?: string | null): MigrationViewer {
  const id = sessionUserId ?? store.officeStaffId ?? 'staff-2';
  const member = store.staff.find((s) => s.id === id) ?? store.staff.find((s) => s.id === store.officeStaffId) ?? store.staff[0];
  return { name: shortPersonName(member?.name) || 'AIO STAFF', role: 'AIO STAFF', initials: member?.initials ?? initialsOf(member?.name) };
}

export function clientViewer(client: Client | undefined): MigrationViewer {
  return { name: shortPersonName(client?.contactName) || 'CLIENT', role: 'CLIENT', initials: initialsOf(client?.contactName) };
}

/** Strong identifiers for a client, from its Road Ready profile (USDOT · MC), else the AIO customer number. */
export function clientIdentifiers(store: DemoStore, client: Client | undefined): string[] {
  if (!client) return [];
  const profile = (store.roadReadyProfiles ?? []).find((p) => p.organizationId === client.id);
  const usdot = profile?.authority?.usdotNumber?.trim();
  const mc = profile?.authority?.mcNumber?.replace(/^MC[-\s]?/i, '').trim();
  const ids = [usdot ? `USDOT ${usdot}` : '', mc ? `MC ${mc}` : ''].filter(Boolean);
  if (ids.length) return ids;
  if (client.customerNumber) return [`AIO ${client.customerNumber}`];
  return [client.primaryState ? `${client.primaryState} · ${client.clientType.replaceAll('_', ' ')}` : client.clientType.replaceAll('_', ' ')];
}

export function formatStarted(iso: string | undefined, now = new Date()): string {
  if (!iso) return 'Not started';
  const d = new Date(iso);
  const time = d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  const sameDay = d.toDateString() === now.toDateString();
  if (sameDay) return `Today, ${time}`;
  const y = new Date(now);
  y.setDate(now.getDate() - 1);
  if (d.toDateString() === y.toDateString()) return `Yesterday, ${time}`;
  return `${d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}, ${time}`;
}

export function formatBytes(size: number): string {
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${Math.round(size / 1024)} KB`;
  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
}

export function fileKind(name: string): { ext: string; icon: 'pdf' | 'xlsx' | 'jpg' | 'docx' | 'zip' } {
  const ext = (name.split('.').pop() ?? '').toLowerCase();
  if (ext === 'pdf') return { ext: 'PDF', icon: 'pdf' };
  if (ext === 'xlsx' || ext === 'xls' || ext === 'csv') return { ext: ext.toUpperCase(), icon: 'xlsx' };
  if (ext === 'doc' || ext === 'docx') return { ext: ext.toUpperCase(), icon: 'docx' };
  if (ext === 'zip') return { ext: 'ZIP', icon: 'zip' };
  return { ext: ext.toUpperCase() || 'FILE', icon: 'jpg' };
}
