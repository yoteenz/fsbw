import { resolveSiteOrigin } from './brandAssets.js';
import {
  coerceEmailLayoutDebugStore,
  type EmailLayoutDebugStore,
} from './emailLayoutConfig.js';
import { loadEmailLayoutDebugStore } from './emailLayoutConfigStore.js';
import {
  EMAIL_SUPPORT_CTA_LABEL,
  EMAIL_SUPPORT_FOOTER_COPY,
  resolveConciergeMessageUrl,
} from './emailSupportLinks.js';
import {
  EMAIL_PRODUCT_PROMO_CTA_LABEL,
  EMAIL_PRODUCT_PROMO_CTA_PATH,
  EMAIL_PRODUCT_PROMO_TILES,
  EMAIL_PRODUCT_PROMO_TITLE,
} from './emailProductPromo.js';
import { interpolateCopy, renderEmailLayout } from './layout.js';
import { EMAIL_TEMPLATE_REGISTRY, isEmailTemplateType } from './templateRegistry.js';
import type { EmailTemplateType, EmailTemplateVariables } from './types.js';

function absoluteUrl(pathOrUrl: string): string {
  const raw = (pathOrUrl || '').trim();
  if (!raw) return resolveSiteOrigin();
  if (/^https?:\/\//i.test(raw)) return raw;
  const origin = resolveSiteOrigin();
  return `${origin}${raw.startsWith('/') ? raw : `/${raw}`}`;
}

function resolveCtaUrl(templateType: EmailTemplateType, vars: EmailTemplateVariables): string {
  if (vars.ctaUrl && String(vars.ctaUrl).trim()) return absoluteUrl(String(vars.ctaUrl));
  if (vars.trackingLink && String(vars.trackingLink).trim()) {
    if (templateType.includes('ship') || templateType === 'partially_shipped') {
      return absoluteUrl(String(vars.trackingLink));
    }
  }
  if (vars.resetLink && templateType === 'password_reset') return absoluteUrl(String(vars.resetLink));
  if (vars.verifyLink && templateType === 'email_verification') return absoluteUrl(String(vars.verifyLink));
  const def = EMAIL_TEMPLATE_REGISTRY[templateType];
  return absoluteUrl(def.defaultCtaPath);
}

export interface RenderedEmail {
  html: string;
  subject: string;
  text: string;
}

export interface RenderEmailOptions {
  layoutDebug?: EmailLayoutDebugStore | null;
}

export function renderEmailTemplate(
  templateType: EmailTemplateType,
  variables: EmailTemplateVariables = {},
  subjectOverride?: string,
  options?: RenderEmailOptions
): RenderedEmail {
  const def = EMAIL_TEMPLATE_REGISTRY[templateType];
  if (!def) throw new Error(`Unknown email template: ${templateType}`);

  const vars: EmailTemplateVariables = {
    customerName: 'SLAYER',
    ...variables,
  };

  const layoutDebug = options?.layoutDebug ?? null;
  const copyOverrides = layoutDebug?.templates?.[templateType];

  const ctaUrl = resolveCtaUrl(templateType, vars);
  const ctaLabel = copyOverrides?.ctaLabel
    ? String(copyOverrides.ctaLabel)
    : vars.ctaLabel
      ? String(vars.ctaLabel)
      : def.defaultCtaLabel;
  const subject =
    subjectOverride?.trim() ||
    (copyOverrides?.defaultSubject
      ? interpolateCopy(copyOverrides.defaultSubject, vars)
      : interpolateCopy(def.defaultSubject, vars));

  let customHtmlBody: string | undefined;
  if (templateType === 'newsletter' && vars.htmlBody) {
    customHtmlBody = String(vars.htmlBody);
  }

  const html = renderEmailLayout({
    templateType,
    scriptAccent: copyOverrides?.scriptAccent ?? def.scriptAccent,
    headline: copyOverrides?.headline ?? def.headline,
    bodyParagraphs: copyOverrides?.bodyParagraphs ?? def.bodyParagraphs,
    heroIcon: def.heroIcon,
    dataRows: def.dataRows,
    ctaLabel,
    ctaUrl,
    variables: vars,
    preheader: copyOverrides?.preheader ?? vars.preheader ?? def.preheader ?? def.defaultSubject,
    customHtmlBody,
    showMemberPerks: def.showMemberPerks,
    supportCtaUrl: resolveConciergeMessageUrl(),
    layoutDebug,
    copyOverrides,
  });

  const supportUrl = resolveConciergeMessageUrl();
  const promoTitle =
    copyOverrides?.productPromoTitle?.trim() || EMAIL_PRODUCT_PROMO_TITLE;
  const promoCtaLabel =
    copyOverrides?.productPromoCtaLabel?.trim() || EMAIL_PRODUCT_PROMO_CTA_LABEL;
  const textLines = [
    `FRONTAL SLAYER — ${subject.toUpperCase()}`,
    '',
    interpolateCopy(def.scriptAccent, vars),
    interpolateCopy(def.headline, vars).toUpperCase(),
    '',
    ...def.bodyParagraphs.map((p) => interpolateCopy(p, vars)),
    '',
    ctaLabel.toUpperCase() + ': ' + ctaUrl,
    '',
    promoTitle.toUpperCase(),
    ...EMAIL_PRODUCT_PROMO_TILES.map(
      (tile) => `${tile.label}: ${absoluteUrl(tile.href)}`
    ),
    promoCtaLabel.toUpperCase() + ': ' + absoluteUrl(EMAIL_PRODUCT_PROMO_CTA_PATH),
    '',
    EMAIL_SUPPORT_FOOTER_COPY,
    EMAIL_SUPPORT_CTA_LABEL.toUpperCase() + ': ' + supportUrl,
    '',
    'LUXURY WITHOUT LIMITS.',
  ];

  return { html, subject, text: textLines.join('\n') };
}

/** Load persisted layout debug store and render (production sends). */
export async function renderEmailTemplateWithPersistedLayout(
  templateType: EmailTemplateType,
  variables: EmailTemplateVariables = {},
  subjectOverride?: string
): Promise<RenderedEmail> {
  const layoutDebug = await loadEmailLayoutDebugStore();
  return renderEmailTemplate(templateType, variables, subjectOverride, { layoutDebug });
}

export function parseEmailLayoutDebugFromBody(body: unknown): EmailLayoutDebugStore | null {
  if (!body || typeof body !== 'object' || Array.isArray(body)) return null;
  return coerceEmailLayoutDebugStore(body);
}

export function assertTemplateType(value: string): EmailTemplateType {
  if (!isEmailTemplateType(value)) {
    throw new Error(`Invalid templateType "${value}"`);
  }
  return value;
}
