import { resolveSiteOrigin } from './brandAssets.js';
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

export function renderEmailTemplate(
  templateType: EmailTemplateType,
  variables: EmailTemplateVariables = {},
  subjectOverride?: string
): RenderedEmail {
  const def = EMAIL_TEMPLATE_REGISTRY[templateType];
  if (!def) throw new Error(`Unknown email template: ${templateType}`);

  const vars: EmailTemplateVariables = {
    customerName: 'SLAYER',
    ...variables,
  };

  const ctaUrl = resolveCtaUrl(templateType, vars);
  const ctaLabel = vars.ctaLabel ? String(vars.ctaLabel) : def.defaultCtaLabel;
  const subject = subjectOverride?.trim() || interpolateCopy(def.defaultSubject, vars);

  let customHtmlBody: string | undefined;
  if (templateType === 'newsletter' && vars.htmlBody) {
    customHtmlBody = String(vars.htmlBody);
  }

  const html = renderEmailLayout({
    templateType,
    scriptAccent: def.scriptAccent,
    headline: def.headline,
    bodyParagraphs: def.bodyParagraphs,
    heroIcon: def.heroIcon,
    dataRows: def.dataRows,
    ctaLabel,
    ctaUrl,
    variables: vars,
    preheader: vars.preheader || def.preheader || def.defaultSubject,
    customHtmlBody,
    showMemberPerks: def.showMemberPerks,
  });

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
    'LUXURY WITHOUT LIMITS.',
  ];

  return { html, subject, text: textLines.join('\n') };
}

export function assertTemplateType(value: string): EmailTemplateType {
  if (!isEmailTemplateType(value)) {
    throw new Error(`Invalid templateType "${value}"`);
  }
  return value;
}
