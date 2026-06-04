/**
 * Copy debug — template defaults from catalogs + localStorage overrides applied at runtime.
 * Edit on /tools/copy-debug; saves persist in this browser and update live nudges/alerts.
 */
import {
  flattenAccountAlertsCatalog,
  getAccountAlertsCatalog,
  type AccountAlertCatalogEntry,
} from './accountAlertsCatalog';
import {
  flattenPsaProactiveNudgeCatalog,
  getPsaProactiveNudgeCatalog,
  type PsaNudgeCatalogEntry,
} from './psaProactiveNudgeCatalog';

export const COPY_DEBUG_UPDATED_EVENT = 'copyDebugOverridesUpdated';

const NUDGE_OVERRIDE_KEY = 'copy_debug_nudge_overrides';
const ALERT_OVERRIDE_KEY = 'copy_debug_alert_overrides';

export type CopyVars = Record<string, string | number | undefined>;

/** Sample values for preview + reverse-mapping catalog text → `{placeholder}` templates. */
export const COPY_DEBUG_SAMPLE_VARS: CopyVars = {
  orderNumber: '332',
  orderRef: 'ORDER #332',
  hoursLeft: '18',
  productName: 'NOIR',
  unitLabel: 'NOIR',
  unitName: 'NOIR',
  status: 'PREPARING',
  notificationMessage: 'ORDER #332 IS COMPLETE.',
  stageLabel: 'CONSTRUCTING UNIT',
  trackingNote: 'YOUR UNIT IS BEING BUILT.',
  adminAlertTitle: 'MEMBERSHIP PERK UNLOCKED',
  title: 'MEMBERSHIP PERK UNLOCKED',
  tierDisplay: 'RED',
  tier: 'RED',
  voucherCount: '3',
  voucherType: 'COLOR',
  typeLabel: 'COLOR',
  timeLabel: '24 HOURS',
  balance: '125.00',
  loyaltyPoints: '2,450',
  affiliatePoints: '180',
  referralCode: 'SLAY24',
  activeOrders: '2',
  pastOrders: '5',
  activeCount: '2',
  pastCount: '5',
  num: 'ORDER #332',
  adminHeader: 'MEMBERSHIP · PERK',
  adminBody: 'YOU UNLOCKED EARLY ACCESS TO THE DROP.',
  note: 'YOUR UNIT IS BEING BUILT.',
  message: 'YOUR UNIT IS BEING BUILT.',
  adminText: 'MEMBERSHIP · PERK — YOU UNLOCKED EARLY ACCESS TO THE DROP.',
};

export type NudgeCopyTemplates = {
  headline: string;
  body: string;
  prefilledMessage: string;
  actionLabel: string;
};

export type AlertCopyTemplates = {
  title: string;
  message: string;
  actionText: string;
};

export type NudgeCopyOverride = Partial<NudgeCopyTemplates>;
export type AlertCopyOverride = Partial<AlertCopyTemplates>;

export function interpolateCopy(template: string, vars: CopyVars): string {
  if (!template) return '';
  const merged = { ...COPY_DEBUG_SAMPLE_VARS, ...vars };
  return template.replace(/\{(\w+)\}/g, (_, key: string) => {
    const v = merged[key];
    return v == null ? '' : String(v);
  });
}

function textToTemplate(text: string | undefined, sample: CopyVars): string {
  if (!text) return '';
  let result = text;
  const entries = Object.entries(sample)
    .filter(([, v]) => v != null && String(v).length > 0)
    .sort((a, b) => String(b[1]).length - String(a[1]).length);
  for (const [key, val] of entries) {
    const s = String(val);
    if (result.includes(s)) {
      result = result.split(s).join(`{${key}}`);
    }
  }
  return result;
}

function nudgeEntryToTemplates(entry: PsaNudgeCatalogEntry): NudgeCopyTemplates {
  const sample = COPY_DEBUG_SAMPLE_VARS;
  return {
    headline: textToTemplate(entry.headline, sample) || entry.headline,
    body: textToTemplate(entry.body, sample) || entry.body || '',
    prefilledMessage: textToTemplate(entry.prefilledMessage, sample) || entry.prefilledMessage || '',
    actionLabel: textToTemplate(entry.actionLabel, sample) || entry.actionLabel,
  };
}

function alertEntryToTemplates(entry: AccountAlertCatalogEntry): AlertCopyTemplates {
  const sample = COPY_DEBUG_SAMPLE_VARS;
  return {
    title: textToTemplate(entry.title, sample) || entry.title,
    message: textToTemplate(entry.message, sample) || entry.message,
    actionText: textToTemplate(entry.actionText, sample) || entry.actionText,
  };
}

const nudgeCatalogById = new Map(
  flattenPsaProactiveNudgeCatalog().map((e) => [e.variantId, e] as const)
);

const alertCatalogById = new Map(
  flattenAccountAlertsCatalog().map((e) => [e.variantId, e] as const)
);

function readJsonMap<T>(key: string): Record<string, T> {
  if (typeof window === 'undefined') return {};
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as unknown;
    return parsed && typeof parsed === 'object' ? (parsed as Record<string, T>) : {};
  } catch {
    return {};
  }
}

function writeJsonMap<T>(key: string, map: Record<string, T>): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(key, JSON.stringify(map));
  window.dispatchEvent(new Event(COPY_DEBUG_UPDATED_EVENT));
  window.dispatchEvent(new Event('notificationsUpdated'));
  window.dispatchEvent(new Event('storage'));
}

export function dispatchCopyDebugUpdated(): void {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new Event(COPY_DEBUG_UPDATED_EVENT));
}

export function getNudgeCopyTemplates(variantId: string): NudgeCopyTemplates {
  const entry = nudgeCatalogById.get(variantId);
  const defaults = entry ? nudgeEntryToTemplates(entry) : { headline: '', body: '', prefilledMessage: '', actionLabel: '' };
  const override = readJsonMap<NudgeCopyOverride>(NUDGE_OVERRIDE_KEY)[variantId] ?? {};
  return { ...defaults, ...override };
}

export function getAlertCopyTemplates(variantId: string): AlertCopyTemplates {
  const entry = alertCatalogById.get(variantId);
  const defaults = entry ? alertEntryToTemplates(entry) : { title: '', message: '', actionText: '' };
  const override = readJsonMap<AlertCopyOverride>(ALERT_OVERRIDE_KEY)[variantId] ?? {};
  return { ...defaults, ...override };
}

export function resolveNudgeCopy(
  variantId: string,
  vars: CopyVars = {}
): { headline: string; body?: string; prefilledMessage?: string; actionLabel?: string } {
  const t = getNudgeCopyTemplates(variantId);
  const merged = { ...COPY_DEBUG_SAMPLE_VARS, ...vars };
  return {
    headline: interpolateCopy(t.headline, merged),
    body: t.body ? interpolateCopy(t.body, merged) : undefined,
    prefilledMessage: t.prefilledMessage ? interpolateCopy(t.prefilledMessage, merged) : undefined,
    actionLabel: t.actionLabel ? interpolateCopy(t.actionLabel, merged) : undefined,
  };
}

export function resolveAccountAlertCopy(
  variantId: string,
  vars: CopyVars = {}
): { title: string; message: string; actionText: string } {
  const t = getAlertCopyTemplates(variantId);
  const merged = { ...COPY_DEBUG_SAMPLE_VARS, ...vars };
  return {
    title: interpolateCopy(t.title, merged),
    message: interpolateCopy(t.message, merged),
    actionText: interpolateCopy(t.actionText, merged),
  };
}

/** Interpolated preview strings for the debug UI. */
export function previewNudgeCopy(variantId: string): NudgeCopyTemplates {
  const resolved = resolveNudgeCopy(variantId);
  return {
    headline: resolved.headline,
    body: resolved.body ?? '',
    prefilledMessage: resolved.prefilledMessage ?? '',
    actionLabel: resolved.actionLabel ?? '',
  };
}

export function previewAlertCopy(variantId: string): AlertCopyTemplates {
  return resolveAccountAlertCopy(variantId);
}

export function hasNudgeCopyOverride(variantId: string): boolean {
  return Boolean(readJsonMap<NudgeCopyOverride>(NUDGE_OVERRIDE_KEY)[variantId]);
}

export function hasAlertCopyOverride(variantId: string): boolean {
  return Boolean(readJsonMap<AlertCopyOverride>(ALERT_OVERRIDE_KEY)[variantId]);
}

export function saveNudgeCopyOverride(variantId: string, override: NudgeCopyOverride): void {
  const map = readJsonMap<NudgeCopyOverride>(NUDGE_OVERRIDE_KEY);
  map[variantId] = { ...(map[variantId] ?? {}), ...override };
  writeJsonMap(NUDGE_OVERRIDE_KEY, map);
}

export function saveAlertCopyOverride(variantId: string, override: AlertCopyOverride): void {
  const map = readJsonMap<AlertCopyOverride>(ALERT_OVERRIDE_KEY);
  map[variantId] = { ...(map[variantId] ?? {}), ...override };
  writeJsonMap(ALERT_OVERRIDE_KEY, map);
}

export function deleteNudgeCopyOverride(variantId: string): void {
  const map = readJsonMap<NudgeCopyOverride>(NUDGE_OVERRIDE_KEY);
  if (!map[variantId]) return;
  delete map[variantId];
  writeJsonMap(NUDGE_OVERRIDE_KEY, map);
}

export function deleteAlertCopyOverride(variantId: string): void {
  const map = readJsonMap<AlertCopyOverride>(ALERT_OVERRIDE_KEY);
  if (!map[variantId]) return;
  delete map[variantId];
  writeJsonMap(ALERT_OVERRIDE_KEY, map);
}

export function clearAllNudgeCopyOverrides(): void {
  writeJsonMap(NUDGE_OVERRIDE_KEY, {});
}

export function clearAllAlertCopyOverrides(): void {
  writeJsonMap(ALERT_OVERRIDE_KEY, {});
}

export function countNudgeCopyOverrides(): number {
  return Object.keys(readJsonMap<NudgeCopyOverride>(NUDGE_OVERRIDE_KEY)).length;
}

export function countAlertCopyOverrides(): number {
  return Object.keys(readJsonMap<AlertCopyOverride>(ALERT_OVERRIDE_KEY)).length;
}

/** Re-export catalogs for debug page (unchanged structure). */
export { getPsaProactiveNudgeCatalog, getAccountAlertsCatalog };
