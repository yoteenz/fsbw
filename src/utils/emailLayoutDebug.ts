/** Client-side email layout debug store (mirrors api/_lib/email/emailLayoutConfig.ts). */

export type EmailFontKey = 'grace' | 'futura-book' | 'futura-medium' | 'futura-demi' | 'bohemy';

export type EmailTextTransform = 'uppercase' | 'lowercase' | 'none';

export type EmailTextAlign = 'left' | 'center' | 'right';

export type EmailLayerStyle = {
  fontFamily?: EmailFontKey;
  fontSize?: number;
  color?: string;
  letterSpacing?: string;
  lineHeight?: number;
  fontWeight?: number | string;
  textTransform?: EmailTextTransform;
  textAlign?: EmailTextAlign;
  paddingTop?: number;
  paddingRight?: number;
  paddingBottom?: number;
  paddingLeft?: number;
};

export type EmailLayoutLayerId =
  | 'brandHeader'
  | 'headerNav'
  | 'scriptAccent'
  | 'headline'
  | 'hero'
  | 'body'
  | 'dataRowLabel'
  | 'dataRowValue'
  | 'cta'
  | 'productPromo'
  | 'productPromoTitle'
  | 'productPromoLabel'
  | 'productPromoCta'
  | 'supportFooter'
  | 'supportCta'
  | 'tagline'
  | 'closing';

export type EmailTemplateCopyOverrides = {
  scriptAccent?: string;
  headline?: string;
  bodyParagraphs?: string[];
  ctaLabel?: string;
  preheader?: string;
  defaultSubject?: string;
  tagline?: string;
  closing?: string;
  supportFooterCopy?: string;
  supportCtaLabel?: string;
  productPromoTitle?: string;
  productPromoCtaLabel?: string;
};

export type EmailLayoutDebugStore = {
  version: 1;
  globalLayers: Partial<Record<EmailLayoutLayerId, EmailLayerStyle>>;
  templates: Partial<Record<string, EmailTemplateCopyOverrides>>;
  updatedAt: number;
};

export const EMAIL_LAYOUT_DEBUG_STORAGE_KEY = 'email_layout_debug_v1';

export const EMAIL_FONT_OPTIONS: Array<{ value: EmailFontKey; label: string }> = [
  { value: 'grace', label: 'Covered By Your Grace' },
  { value: 'futura-book', label: 'Futura PT Book' },
  { value: 'futura-medium', label: 'Futura PT Medium' },
  { value: 'futura-demi', label: 'Futura PT Demi' },
  { value: 'bohemy', label: 'Bohemy' },
];

export const EMAIL_LAYER_OPTIONS: Array<{ id: EmailLayoutLayerId; label: string; group: 'global' | 'copy' }> = [
  { id: 'brandHeader', label: 'Brand header', group: 'global' },
  { id: 'headerNav', label: 'Header nav strip', group: 'global' },
  { id: 'scriptAccent', label: 'Script accent', group: 'global' },
  { id: 'headline', label: 'Headline', group: 'global' },
  { id: 'hero', label: 'Hero spacing', group: 'global' },
  { id: 'body', label: 'Body text', group: 'global' },
  { id: 'dataRowLabel', label: 'Data row label', group: 'global' },
  { id: 'dataRowValue', label: 'Data row value', group: 'global' },
  { id: 'cta', label: 'CTA button', group: 'global' },
  { id: 'productPromo', label: 'Product promo spacing', group: 'global' },
  { id: 'productPromoTitle', label: 'Product promo title', group: 'global' },
  { id: 'productPromoLabel', label: 'Product promo labels', group: 'global' },
  { id: 'productPromoCta', label: 'Product promo CTA', group: 'global' },
  { id: 'supportFooter', label: 'Support footer', group: 'global' },
  { id: 'supportCta', label: 'Support CTA', group: 'global' },
  { id: 'tagline', label: 'Tagline', group: 'global' },
  { id: 'closing', label: 'Closing line', group: 'global' },
];

export const DEFAULT_EMAIL_LAYER_STYLES: Record<EmailLayoutLayerId, EmailLayerStyle> = {
  brandHeader: {
    fontFamily: 'futura-medium',
    fontSize: 14,
    color: '#111111',
    letterSpacing: '0.38em',
    textTransform: 'uppercase',
    textAlign: 'center',
    paddingTop: 36,
    paddingRight: 32,
    paddingBottom: 8,
    paddingLeft: 32,
    fontWeight: 500,
  },
  headerNav: {
    fontFamily: 'futura-book',
    fontSize: 11,
    color: '#111111',
    letterSpacing: '0.14em',
    textTransform: 'uppercase',
    textAlign: 'center',
    paddingTop: 0,
    paddingRight: 24,
    paddingBottom: 14,
    paddingLeft: 24,
    fontWeight: 400,
  },
  scriptAccent: {
    fontFamily: 'grace',
    fontSize: 34,
    color: '#111111',
    lineHeight: 1.15,
    textTransform: 'uppercase',
    textAlign: 'center',
    paddingTop: 28,
    paddingRight: 28,
    paddingBottom: 4,
    paddingLeft: 28,
  },
  headline: {
    fontFamily: 'futura-demi',
    fontSize: 26,
    color: '#EB1C24',
    letterSpacing: '0.06em',
    lineHeight: 1.2,
    textTransform: 'uppercase',
    textAlign: 'center',
    fontWeight: 600,
    paddingTop: 8,
    paddingRight: 28,
    paddingBottom: 12,
    paddingLeft: 28,
  },
  hero: {
    paddingTop: 0,
    paddingRight: 24,
    paddingBottom: 20,
    paddingLeft: 24,
    textAlign: 'center',
  },
  body: {
    fontFamily: 'futura-book',
    fontSize: 11,
    color: '#808080',
    letterSpacing: '0.08em',
    lineHeight: 1.75,
    textTransform: 'uppercase',
    textAlign: 'center',
    paddingTop: 8,
    paddingRight: 40,
    paddingBottom: 4,
    paddingLeft: 40,
  },
  dataRowLabel: {
    fontFamily: 'futura-book',
    fontSize: 9,
    color: '#808080',
    letterSpacing: '0.14em',
    textTransform: 'uppercase',
    textAlign: 'left',
  },
  dataRowValue: {
    fontFamily: 'futura-demi',
    fontSize: 14,
    color: '#111111',
    letterSpacing: '0.04em',
    textTransform: 'uppercase',
    textAlign: 'left',
    fontWeight: 600,
  },
  cta: {
    fontFamily: 'futura-medium',
    fontSize: 11,
    color: '#ffffff',
    letterSpacing: '0.16em',
    textTransform: 'uppercase',
    textAlign: 'center',
    fontWeight: 700,
    paddingTop: 0,
    paddingRight: 28,
    paddingBottom: 28,
    paddingLeft: 28,
  },
  productPromo: {
    fontFamily: 'futura-book',
    fontSize: 10,
    color: '#111111',
    textAlign: 'center',
    paddingTop: 32,
    paddingRight: 24,
    paddingBottom: 28,
    paddingLeft: 24,
  },
  productPromoTitle: {
    fontFamily: 'futura-demi',
    fontSize: 12,
    color: '#111111',
    letterSpacing: '0.1em',
    textTransform: 'uppercase',
    textAlign: 'center',
    fontWeight: 600,
  },
  productPromoLabel: {
    fontFamily: 'futura-book',
    fontSize: 9,
    color: '#111111',
    letterSpacing: '0.04em',
    textTransform: 'none',
    textAlign: 'center',
    lineHeight: 1.4,
  },
  productPromoCta: {
    fontFamily: 'futura-medium',
    fontSize: 10,
    color: '#111111',
    letterSpacing: '0.14em',
    textTransform: 'uppercase',
    textAlign: 'center',
    fontWeight: 700,
  },
  supportFooter: {
    fontFamily: 'futura-book',
    fontSize: 10,
    color: '#808080',
    letterSpacing: '0.06em',
    lineHeight: 1.65,
    textTransform: 'uppercase',
    textAlign: 'center',
    paddingTop: 28,
    paddingRight: 32,
    paddingBottom: 12,
    paddingLeft: 32,
  },
  supportCta: {
    fontFamily: 'futura-medium',
    fontSize: 10,
    color: '#EB1C24',
    letterSpacing: '0.14em',
    textTransform: 'uppercase',
    textAlign: 'center',
    fontWeight: 700,
  },
  tagline: {
    fontFamily: 'bohemy',
    fontSize: 14,
    color: '#808080',
    letterSpacing: '0.04em',
    textTransform: 'lowercase',
    textAlign: 'center',
  },
  closing: {
    fontFamily: 'futura-book',
    fontSize: 7,
    color: '#aaaaaa',
    letterSpacing: '0.12em',
    textTransform: 'uppercase',
    textAlign: 'center',
    paddingTop: 8,
    paddingRight: 32,
    paddingBottom: 28,
    paddingLeft: 32,
  },
};

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function coerceLayerStyle(value: unknown): EmailLayerStyle | null {
  if (!isObject(value)) return null;
  const out: EmailLayerStyle = {};
  if (typeof value.fontFamily === 'string') out.fontFamily = value.fontFamily as EmailFontKey;
  if (typeof value.fontSize === 'number') out.fontSize = value.fontSize;
  if (typeof value.color === 'string') out.color = value.color;
  if (typeof value.letterSpacing === 'string') out.letterSpacing = value.letterSpacing;
  if (typeof value.lineHeight === 'number') out.lineHeight = value.lineHeight;
  if (typeof value.fontWeight === 'number' || typeof value.fontWeight === 'string') {
    out.fontWeight = value.fontWeight;
  }
  if (value.textTransform === 'uppercase' || value.textTransform === 'lowercase' || value.textTransform === 'none') {
    out.textTransform = value.textTransform;
  }
  if (value.textAlign === 'left' || value.textAlign === 'center' || value.textAlign === 'right') {
    out.textAlign = value.textAlign;
  }
  if (typeof value.paddingTop === 'number') out.paddingTop = value.paddingTop;
  if (typeof value.paddingRight === 'number') out.paddingRight = value.paddingRight;
  if (typeof value.paddingBottom === 'number') out.paddingBottom = value.paddingBottom;
  if (typeof value.paddingLeft === 'number') out.paddingLeft = value.paddingLeft;
  return out;
}

function coerceCopyOverrides(value: unknown): EmailTemplateCopyOverrides | null {
  if (!isObject(value)) return null;
  const out: EmailTemplateCopyOverrides = {};
  if (typeof value.scriptAccent === 'string') out.scriptAccent = value.scriptAccent;
  if (typeof value.headline === 'string') out.headline = value.headline;
  if (Array.isArray(value.bodyParagraphs)) {
    out.bodyParagraphs = value.bodyParagraphs.filter((p): p is string => typeof p === 'string');
  }
  if (typeof value.ctaLabel === 'string') out.ctaLabel = value.ctaLabel;
  if (typeof value.preheader === 'string') out.preheader = value.preheader;
  if (typeof value.defaultSubject === 'string') out.defaultSubject = value.defaultSubject;
  if (typeof value.tagline === 'string') out.tagline = value.tagline;
  if (typeof value.closing === 'string') out.closing = value.closing;
  if (typeof value.supportFooterCopy === 'string') out.supportFooterCopy = value.supportFooterCopy;
  if (typeof value.supportCtaLabel === 'string') out.supportCtaLabel = value.supportCtaLabel;
  if (typeof value.productPromoTitle === 'string') out.productPromoTitle = value.productPromoTitle;
  if (typeof value.productPromoCtaLabel === 'string') out.productPromoCtaLabel = value.productPromoCtaLabel;
  return out;
}

export function createDefaultEmailLayoutDebugStore(): EmailLayoutDebugStore {
  return {
    version: 1,
    globalLayers: {},
    templates: {},
    updatedAt: Date.now(),
  };
}

export function coerceEmailLayoutDebugStore(raw: unknown): EmailLayoutDebugStore {
  const base = createDefaultEmailLayoutDebugStore();
  if (!isObject(raw)) return base;

  const globalLayers: Partial<Record<EmailLayoutLayerId, EmailLayerStyle>> = {};
  if (isObject(raw.globalLayers)) {
    for (const key of Object.keys(raw.globalLayers) as EmailLayoutLayerId[]) {
      const style = coerceLayerStyle(raw.globalLayers[key]);
      if (style && Object.keys(style).length > 0) globalLayers[key] = style;
    }
  }

  const templates: Partial<Record<string, EmailTemplateCopyOverrides>> = {};
  if (isObject(raw.templates)) {
    for (const [type, val] of Object.entries(raw.templates)) {
      const copy = coerceCopyOverrides(val);
      if (copy && Object.keys(copy).length > 0) templates[type] = copy;
    }
  }

  return {
    version: 1,
    globalLayers,
    templates,
    updatedAt: typeof raw.updatedAt === 'number' ? raw.updatedAt : Date.now(),
  };
}

export function loadEmailLayoutDebugStore(): EmailLayoutDebugStore {
  try {
    const raw = localStorage.getItem(EMAIL_LAYOUT_DEBUG_STORAGE_KEY);
    if (!raw) return createDefaultEmailLayoutDebugStore();
    return coerceEmailLayoutDebugStore(JSON.parse(raw));
  } catch {
    return createDefaultEmailLayoutDebugStore();
  }
}

export function saveEmailLayoutDebugStore(store: EmailLayoutDebugStore): void {
  const next = { ...store, updatedAt: Date.now() };
  localStorage.setItem(EMAIL_LAYOUT_DEBUG_STORAGE_KEY, JSON.stringify(next));
}

export function mergeEmailLayoutDebugStore(
  local: EmailLayoutDebugStore,
  remote: EmailLayoutDebugStore | null
): EmailLayoutDebugStore {
  if (!remote) return local;
  if (remote.updatedAt >= local.updatedAt) return remote;
  return local;
}

export function resolveLayerStyle(
  layerId: EmailLayoutLayerId,
  store: EmailLayoutDebugStore
): EmailLayerStyle {
  const base = DEFAULT_EMAIL_LAYER_STYLES[layerId];
  const patch = store.globalLayers[layerId];
  if (!patch) return { ...base };
  return { ...base, ...patch };
}

export function patchGlobalLayer(
  store: EmailLayoutDebugStore,
  layerId: EmailLayoutLayerId,
  patch: Partial<EmailLayerStyle>
): EmailLayoutDebugStore {
  const current = store.globalLayers[layerId] ?? {};
  const merged = { ...current, ...patch };
  const hasValues = Object.keys(merged).length > 0;
  const globalLayers = { ...store.globalLayers };
  if (hasValues) globalLayers[layerId] = merged;
  else delete globalLayers[layerId];
  return { ...store, globalLayers, updatedAt: Date.now() };
}

export function resetGlobalLayer(store: EmailLayoutDebugStore, layerId: EmailLayoutLayerId): EmailLayoutDebugStore {
  const globalLayers = { ...store.globalLayers };
  delete globalLayers[layerId];
  return { ...store, globalLayers, updatedAt: Date.now() };
}

export function resetAllGlobalLayers(store: EmailLayoutDebugStore): EmailLayoutDebugStore {
  return { ...store, globalLayers: {}, updatedAt: Date.now() };
}

export function patchTemplateCopy(
  store: EmailLayoutDebugStore,
  templateType: string,
  patch: Partial<EmailTemplateCopyOverrides>
): EmailLayoutDebugStore {
  const current = store.templates[templateType] ?? {};
  const merged = { ...current, ...patch };
  const templates = { ...store.templates };
  const hasValues = Object.values(merged).some((v) => {
    if (Array.isArray(v)) return v.some((p) => p.trim());
    return typeof v === 'string' && v.trim();
  });
  if (hasValues) templates[templateType] = merged;
  else delete templates[templateType];
  return { ...store, templates, updatedAt: Date.now() };
}

export function resetTemplateCopy(store: EmailLayoutDebugStore, templateType: string): EmailLayoutDebugStore {
  const templates = { ...store.templates };
  delete templates[templateType];
  return { ...store, templates, updatedAt: Date.now() };
}

export function applyBatchTypographyPreset(store: EmailLayoutDebugStore): EmailLayoutDebugStore {
  return {
    ...store,
    globalLayers: {
      scriptAccent: { fontFamily: 'grace', textTransform: 'uppercase' },
      headline: { fontFamily: 'futura-demi', color: '#EB1C24', textTransform: 'uppercase' },
      body: { fontFamily: 'futura-book', color: '#808080', textTransform: 'uppercase' },
      dataRowLabel: { fontFamily: 'futura-book', textTransform: 'uppercase' },
      dataRowValue: { fontFamily: 'futura-demi', textTransform: 'uppercase' },
      cta: { fontFamily: 'futura-medium', textTransform: 'uppercase' },
      productPromo: { fontFamily: 'futura-book', textTransform: 'none' },
      productPromoTitle: { fontFamily: 'futura-demi', textTransform: 'uppercase' },
      productPromoLabel: { fontFamily: 'futura-book', textTransform: 'none' },
      productPromoCta: { fontFamily: 'futura-medium', textTransform: 'uppercase' },
      supportFooter: { fontFamily: 'futura-book', textTransform: 'uppercase' },
      supportCta: { fontFamily: 'futura-medium', textTransform: 'uppercase' },
      tagline: { fontFamily: 'bohemy', textTransform: 'lowercase' },
      closing: { fontFamily: 'futura-book', textTransform: 'uppercase' },
      brandHeader: { fontFamily: 'futura-medium', textTransform: 'uppercase' },
    },
    updatedAt: Date.now(),
  };
}
