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
const CUSTOM_NUDGES_KEY = 'copy_debug_custom_nudges';
const CUSTOM_ALERTS_KEY = 'copy_debug_custom_alerts';

export type CustomNudgeVariant = {
  variantId: string;
  label: string;
  /** When set, Save also applies templates as a live override on this catalog variant. */
  linkedVariantId?: string;
  templates: NudgeCopyTemplates;
  meta: {
    kind?: string;
    actionPath?: string;
    priority?: number;
    pageContexts?: string[];
    duplicatedFrom?: string;
  };
  createdAt: number;
};

export type CustomAlertVariant = {
  variantId: string;
  label: string;
  linkedVariantId?: string;
  templates: AlertCopyTemplates;
  meta: {
    rowVariant?: AccountAlertCatalogEntry['rowVariant'];
    actionRoute?: string;
    idPattern?: string;
    duplicatedFrom?: string;
  };
  createdAt: number;
};

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

function readJsonArray<T>(key: string): T[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed) ? (parsed as T[]) : [];
  } catch {
    return [];
  }
}

function writeJsonArray<T>(key: string, items: T[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(key, JSON.stringify(items));
  window.dispatchEvent(new Event(COPY_DEBUG_UPDATED_EVENT));
  window.dispatchEvent(new Event('notificationsUpdated'));
  window.dispatchEvent(new Event('storage'));
}

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
  const custom = listCustomNudgeVariants().find((v) => v.variantId === variantId);
  if (custom) return { ...custom.templates };
  const entry = nudgeCatalogById.get(variantId);
  const defaults = entry ? nudgeEntryToTemplates(entry) : { headline: '', body: '', prefilledMessage: '', actionLabel: '' };
  const override = readJsonMap<NudgeCopyOverride>(NUDGE_OVERRIDE_KEY)[variantId] ?? {};
  return { ...defaults, ...override };
}

export function getAlertCopyTemplates(variantId: string): AlertCopyTemplates {
  const custom = listCustomAlertVariants().find((v) => v.variantId === variantId);
  if (custom) return { ...custom.templates };
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

function slugifyId(label: string): string {
  return label
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_|_$/g, '')
    .slice(0, 40);
}

function newCustomNudgeId(label: string): string {
  const slug = slugifyId(label) || 'new';
  return `custom.nudge.${slug}_${Date.now().toString(36)}`;
}

function newCustomAlertId(label: string): string {
  const slug = slugifyId(label) || 'new';
  return `custom.alert.${slug}_${Date.now().toString(36)}`;
}

export function listCustomNudgeVariants(): CustomNudgeVariant[] {
  return readJsonArray<CustomNudgeVariant>(CUSTOM_NUDGES_KEY).sort((a, b) => b.createdAt - a.createdAt);
}

export function listCustomAlertVariants(): CustomAlertVariant[] {
  return readJsonArray<CustomAlertVariant>(CUSTOM_ALERTS_KEY).sort((a, b) => b.createdAt - a.createdAt);
}

export function saveCustomNudgeVariant(variant: CustomNudgeVariant): void {
  const list = listCustomNudgeVariants().filter((v) => v.variantId !== variant.variantId);
  writeJsonArray(CUSTOM_NUDGES_KEY, [variant, ...list]);
}

export function saveCustomAlertVariant(variant: CustomAlertVariant): void {
  const list = listCustomAlertVariants().filter((v) => v.variantId !== variant.variantId);
  writeJsonArray(CUSTOM_ALERTS_KEY, [variant, ...list]);
}

export function deleteCustomNudgeVariant(variantId: string): void {
  writeJsonArray(
    CUSTOM_NUDGES_KEY,
    listCustomNudgeVariants().filter((v) => v.variantId !== variantId)
  );
}

export function deleteCustomAlertVariant(variantId: string): void {
  writeJsonArray(
    CUSTOM_ALERTS_KEY,
    listCustomAlertVariants().filter((v) => v.variantId !== variantId)
  );
}

export function createBlankCustomNudge(label: string): CustomNudgeVariant {
  const variant: CustomNudgeVariant = {
    variantId: newCustomNudgeId(label),
    label: label.trim() || 'New nudge',
    templates: { headline: '', body: '', prefilledMessage: '', actionLabel: '' },
    meta: {},
    createdAt: Date.now(),
  };
  saveCustomNudgeVariant(variant);
  return variant;
}

export function createBlankCustomAlert(label: string): CustomAlertVariant {
  const variant: CustomAlertVariant = {
    variantId: newCustomAlertId(label),
    label: label.trim() || 'New alert',
    templates: { title: '', message: '', actionText: '' },
    meta: { rowVariant: 'standard', actionRoute: '/account/alerts', idPattern: 'custom' },
    createdAt: Date.now(),
  };
  saveCustomAlertVariant(variant);
  return variant;
}

export function duplicateCustomNudgeFromCatalog(sourceVariantId: string, label?: string): CustomNudgeVariant {
  const entry = nudgeCatalogById.get(sourceVariantId);
  const templates = getNudgeCopyTemplates(sourceVariantId);
  const variant: CustomNudgeVariant = {
    variantId: newCustomNudgeId(label || `${entry?.variantLabel || sourceVariantId} copy`),
    label: label?.trim() || `${entry?.variantLabel || sourceVariantId} (copy)`,
    linkedVariantId: sourceVariantId,
    templates: { ...templates },
    meta: entry
      ? {
          kind: entry.kind,
          actionPath: entry.actionPath,
          priority: entry.priority,
          pageContexts: [...entry.pageContexts],
          duplicatedFrom: sourceVariantId,
        }
      : { duplicatedFrom: sourceVariantId },
    createdAt: Date.now(),
  };
  saveCustomNudgeVariant(variant);
  return variant;
}

export function duplicateCustomNudgeFromCustom(source: CustomNudgeVariant, label?: string): CustomNudgeVariant {
  const variant: CustomNudgeVariant = {
    ...source,
    variantId: newCustomNudgeId(label || `${source.label} copy`),
    label: label?.trim() || `${source.label} (copy)`,
    templates: { ...source.templates },
    meta: { ...source.meta, duplicatedFrom: source.variantId },
    createdAt: Date.now(),
  };
  saveCustomNudgeVariant(variant);
  return variant;
}

export function duplicateCustomAlertFromCatalog(sourceVariantId: string, label?: string): CustomAlertVariant {
  const entry = alertCatalogById.get(sourceVariantId);
  const templates = getAlertCopyTemplates(sourceVariantId);
  const variant: CustomAlertVariant = {
    variantId: newCustomAlertId(label || `${entry?.variantLabel || sourceVariantId} copy`),
    label: label?.trim() || `${entry?.variantLabel || sourceVariantId} (copy)`,
    linkedVariantId: sourceVariantId,
    templates: { ...templates },
    meta: entry
      ? {
          rowVariant: entry.rowVariant,
          actionRoute: entry.actionRoute,
          idPattern: entry.idPattern,
          duplicatedFrom: sourceVariantId,
        }
      : { duplicatedFrom: sourceVariantId },
    createdAt: Date.now(),
  };
  saveCustomAlertVariant(variant);
  return variant;
}

export function duplicateCustomAlertFromCustom(source: CustomAlertVariant, label?: string): CustomAlertVariant {
  const variant: CustomAlertVariant = {
    ...source,
    variantId: newCustomAlertId(label || `${source.label} copy`),
    label: label?.trim() || `${source.label} (copy)`,
    templates: { ...source.templates },
    meta: { ...source.meta, duplicatedFrom: source.variantId },
    createdAt: Date.now(),
  };
  saveCustomAlertVariant(variant);
  return variant;
}

/** Save custom draft + optional live override on linked catalog variant. */
export function saveCustomNudgeVariantAndLive(variant: CustomNudgeVariant): void {
  saveCustomNudgeVariant(variant);
  if (variant.linkedVariantId) {
    saveNudgeCopyOverride(variant.linkedVariantId, variant.templates);
  }
}

export function saveCustomAlertVariantAndLive(variant: CustomAlertVariant): void {
  saveCustomAlertVariant(variant);
  if (variant.linkedVariantId) {
    saveAlertCopyOverride(variant.linkedVariantId, variant.templates);
  }
}

export function formatNudgeCopyBlock(
  variantId: string,
  label: string,
  templates: NudgeCopyTemplates,
  extraLines: string[] = []
): string {
  const preview = {
    headline: interpolateCopy(templates.headline, COPY_DEBUG_SAMPLE_VARS),
    body: interpolateCopy(templates.body, COPY_DEBUG_SAMPLE_VARS),
    prefilledMessage: interpolateCopy(templates.prefilledMessage, COPY_DEBUG_SAMPLE_VARS),
    actionLabel: interpolateCopy(templates.actionLabel, COPY_DEBUG_SAMPLE_VARS),
  };
  const lines = [
    `VARIANT: ${variantId}`,
    `LABEL: ${label}`,
    ...extraLines,
    `HEADLINE: ${preview.headline}`,
    `HEADLINE_TEMPLATE: ${templates.headline}`,
    `BODY: ${preview.body}`,
    `BODY_TEMPLATE: ${templates.body}`,
    `PREFILLED: ${preview.prefilledMessage}`,
    `PREFILLED_TEMPLATE: ${templates.prefilledMessage}`,
    `ACTION LABEL: ${preview.actionLabel}`,
    `ACTION_LABEL_TEMPLATE: ${templates.actionLabel}`,
  ];
  return lines.join('\n');
}

export function formatAlertCopyBlock(
  variantId: string,
  label: string,
  templates: AlertCopyTemplates,
  extraLines: string[] = []
): string {
  const preview = {
    title: interpolateCopy(templates.title, COPY_DEBUG_SAMPLE_VARS),
    message: interpolateCopy(templates.message, COPY_DEBUG_SAMPLE_VARS),
    actionText: interpolateCopy(templates.actionText, COPY_DEBUG_SAMPLE_VARS),
  };
  const lines = [
    `VARIANT: ${variantId}`,
    `LABEL: ${label}`,
    ...extraLines,
    `TITLE: ${preview.title}`,
    `TITLE_TEMPLATE: ${templates.title}`,
    `MESSAGE: ${preview.message}`,
    `MESSAGE_TEMPLATE: ${templates.message}`,
    `ACTION: ${preview.actionText}`,
    `ACTION_TEMPLATE: ${templates.actionText}`,
  ];
  return lines.join('\n');
}

export function formatAllNudgesForClipboard(): string {
  const blocks: string[] = [];
  for (const cat of getPsaProactiveNudgeCatalog()) {
    blocks.push(`# ${cat.label.toUpperCase()}\n${cat.description}`);
    for (const entry of cat.entries) {
      const templates = getNudgeCopyTemplates(entry.variantId);
      blocks.push(
        formatNudgeCopyBlock(entry.variantId, entry.variantLabel, templates, [
          `KIND: ${entry.kind}`,
          `PRIORITY: ${entry.priority}`,
          `PAGE CONTEXTS: ${entry.pageContexts.join(', ')}`,
          `ACTION PATH: ${entry.actionPath}`,
        ])
      );
    }
  }
  for (const custom of listCustomNudgeVariants()) {
    blocks.push(
      formatNudgeCopyBlock(custom.variantId, custom.label, custom.templates, [
        'TYPE: custom draft',
        custom.linkedVariantId ? `LINKED LIVE: ${custom.linkedVariantId}` : 'LINKED LIVE: (none)',
        custom.meta.duplicatedFrom ? `DUPLICATED FROM: ${custom.meta.duplicatedFrom}` : '',
      ].filter(Boolean))
    );
  }
  return blocks.join('\n\n---\n\n');
}

export function formatAllAlertsForClipboard(): string {
  const blocks: string[] = [];
  for (const cat of getAccountAlertsCatalog()) {
    blocks.push(`# ${cat.sortOrder}. ${cat.label.toUpperCase()}\n${cat.description}`);
    for (const entry of cat.entries) {
      const templates = getAlertCopyTemplates(entry.variantId);
      blocks.push(
        formatAlertCopyBlock(entry.variantId, entry.variantLabel, templates, [
          `ID PATTERN: ${entry.idPattern}`,
          `ROW VARIANT: ${entry.rowVariant}`,
          `ROUTE: ${entry.actionRoute}`,
        ])
      );
    }
  }
  for (const custom of listCustomAlertVariants()) {
    blocks.push(
      formatAlertCopyBlock(custom.variantId, custom.label, custom.templates, [
        'TYPE: custom draft',
        custom.linkedVariantId ? `LINKED LIVE: ${custom.linkedVariantId}` : 'LINKED LIVE: (none)',
        custom.meta.actionRoute ? `ROUTE: ${custom.meta.actionRoute}` : '',
        custom.meta.duplicatedFrom ? `DUPLICATED FROM: ${custom.meta.duplicatedFrom}` : '',
      ].filter(Boolean))
    );
  }
  return blocks.join('\n\n---\n\n');
}

export function listCatalogNudgeVariantIds(): string[] {
  return flattenPsaProactiveNudgeCatalog().map((e) => e.variantId);
}

export function listCatalogAlertVariantIds(): string[] {
  return flattenAccountAlertsCatalog().map((e) => e.variantId);
}

/** Re-export catalogs for debug page (unchanged structure). */
export { getPsaProactiveNudgeCatalog, getAccountAlertsCatalog };
