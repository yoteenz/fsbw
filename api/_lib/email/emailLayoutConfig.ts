import {
  EMAIL_FONT_BOHEMY,
  EMAIL_FONT_FUTURA_BOOK,
  EMAIL_FONT_FUTURA_DEMI,
  EMAIL_FONT_FUTURA_MEDIUM,
  EMAIL_FONT_GRACE,
} from './emailTypography.js';
import { EMAIL_BRAND } from './brandAssets.js';

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

export const EMAIL_LAYOUT_DEBUG_CONFIG_KEY = 'email_layout_debug';

export const DEFAULT_EMAIL_LAYER_STYLES: Record<EmailLayoutLayerId, EmailLayerStyle> = {
  brandHeader: {
    fontFamily: 'futura-medium',
    fontSize: 14,
    color: EMAIL_BRAND.black,
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
    color: EMAIL_BRAND.white,
    letterSpacing: '0.14em',
    textTransform: 'uppercase',
    textAlign: 'center',
    paddingTop: 10,
    paddingRight: 24,
    paddingBottom: 14,
    paddingLeft: 24,
    fontWeight: 500,
  },
  scriptAccent: {
    fontFamily: 'grace',
    fontSize: 34,
    color: EMAIL_BRAND.black,
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
    color: EMAIL_BRAND.red,
    letterSpacing: '0.06em',
    lineHeight: 1.2,
    textTransform: 'uppercase',
    textAlign: 'center',
    fontWeight: 600,
    paddingTop: 76,
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
    color: EMAIL_BRAND.gray,
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
    color: EMAIL_BRAND.gray,
    letterSpacing: '0.14em',
    textTransform: 'uppercase',
    textAlign: 'left',
  },
  dataRowValue: {
    fontFamily: 'futura-demi',
    fontSize: 14,
    color: EMAIL_BRAND.black,
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
    paddingTop: 118,
    paddingRight: 28,
    paddingBottom: 28,
    paddingLeft: 28,
  },
  productPromo: {
    fontFamily: 'futura-book',
    fontSize: 10,
    color: EMAIL_BRAND.black,
    textAlign: 'center',
    paddingTop: 32,
    paddingRight: 24,
    paddingBottom: 28,
    paddingLeft: 24,
  },
  productPromoTitle: {
    fontFamily: 'futura-demi',
    fontSize: 12,
    color: EMAIL_BRAND.black,
    letterSpacing: '0.1em',
    textTransform: 'uppercase',
    textAlign: 'center',
    fontWeight: 600,
  },
  productPromoLabel: {
    fontFamily: 'futura-book',
    fontSize: 9,
    color: EMAIL_BRAND.black,
    letterSpacing: '0.04em',
    textTransform: 'none',
    textAlign: 'center',
    lineHeight: 1.4,
  },
  productPromoCta: {
    fontFamily: 'futura-medium',
    fontSize: 10,
    color: EMAIL_BRAND.black,
    letterSpacing: '0.14em',
    textTransform: 'uppercase',
    textAlign: 'center',
    fontWeight: 700,
  },
  supportFooter: {
    fontFamily: 'futura-book',
    fontSize: 10,
    color: EMAIL_BRAND.gray,
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
    color: EMAIL_BRAND.red,
    letterSpacing: '0.14em',
    textTransform: 'uppercase',
    textAlign: 'center',
    fontWeight: 700,
  },
  tagline: {
    fontFamily: 'bohemy',
    fontSize: 14,
    color: EMAIL_BRAND.gray,
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

export function resolveEmailFontFamily(key: EmailFontKey | undefined): string {
  switch (key) {
    case 'grace':
      return EMAIL_FONT_GRACE;
    case 'futura-medium':
      return EMAIL_FONT_FUTURA_MEDIUM;
    case 'futura-demi':
      return EMAIL_FONT_FUTURA_DEMI;
    case 'bohemy':
      return EMAIL_FONT_BOHEMY;
    case 'futura-book':
    default:
      return EMAIL_FONT_FUTURA_BOOK;
  }
}

export function resolveEmailLayerStyle(
  layerId: EmailLayoutLayerId,
  globalLayers?: Partial<Record<EmailLayoutLayerId, EmailLayerStyle>>
): EmailLayerStyle {
  const base = DEFAULT_EMAIL_LAYER_STYLES[layerId];
  const patch = globalLayers?.[layerId];
  if (!patch) return { ...base };
  return { ...base, ...patch };
}

export function emailLayerPaddingCss(style: EmailLayerStyle): string {
  const t = style.paddingTop ?? 0;
  const r = style.paddingRight ?? 0;
  const b = style.paddingBottom ?? 0;
  const l = style.paddingLeft ?? 0;
  return `${t}px ${r}px ${b}px ${l}px`;
}

export function emailTextStyleCss(style: EmailLayerStyle): string {
  const parts: string[] = [];
  if (style.fontFamily) parts.push(`font-family:${resolveEmailFontFamily(style.fontFamily)}`);
  if (style.fontSize != null) parts.push(`font-size:${style.fontSize}px`);
  if (style.color) parts.push(`color:${style.color}`);
  if (style.letterSpacing) parts.push(`letter-spacing:${style.letterSpacing}`);
  if (style.lineHeight != null) parts.push(`line-height:${style.lineHeight}`);
  if (style.fontWeight != null) parts.push(`font-weight:${style.fontWeight}`);
  if (style.textTransform) parts.push(`text-transform:${style.textTransform}`);
  if (style.textAlign) parts.push(`text-align:${style.textAlign}`);
  return parts.join(';');
}

export function emailTdStyleCss(style: EmailLayerStyle): string {
  const text = emailTextStyleCss(style);
  const pad = emailLayerPaddingCss(style);
  return text ? `${text};padding:${pad}` : `padding:${pad}`;
}

/** Hero overlay text (scriptAccent, headline, cta) — padding maps to absolute top/left/right so layers move independently. */
export function emailHeroOverlayLayerCss(style: EmailLayerStyle): string {
  const top = style.paddingTop ?? 0;
  const left = style.paddingLeft ?? 0;
  const right = style.paddingRight ?? 0;
  const text = emailTextStyleCss(style);
  return `${text};position:absolute;top:${top}px;left:${left}px;right:${right}px;z-index:2;box-sizing:border-box;margin:0;`;
}

export const EMAIL_HERO_OVERLAY_LAYER_IDS = ['scriptAccent', 'headline', 'cta'] as const;

export type EmailHeroOverlayLayerId = (typeof EMAIL_HERO_OVERLAY_LAYER_IDS)[number];

export function isEmailHeroOverlayLayer(layerId: string): layerId is EmailHeroOverlayLayerId {
  return (EMAIL_HERO_OVERLAY_LAYER_IDS as readonly string[]).includes(layerId);
}

export function createDefaultEmailLayoutDebugStore(): EmailLayoutDebugStore {
  return {
    version: 1,
    globalLayers: {},
    templates: {},
    updatedAt: Date.now(),
  };
}

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

export function mergeEmailLayoutDebugStore(
  local: EmailLayoutDebugStore,
  remote: EmailLayoutDebugStore | null
): EmailLayoutDebugStore {
  if (!remote) return local;
  if (remote.updatedAt >= local.updatedAt) return remote;
  return local;
}
