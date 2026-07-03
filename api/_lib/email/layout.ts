import { EMAIL_BRAND } from './brandAssets.js';
import { EMAIL_SOCIAL_LINKS, resolveEmailSocialIconUrl } from './emailSocialLinks.js';
import {
  EMAIL_SUPPORT_CTA_LABEL,
  EMAIL_SUPPORT_FOOTER_COPY,
  resolveConciergeMessageUrl,
} from './emailSupportLinks.js';
import {
  EMAIL_FONT_BOHEMY,
  EMAIL_FONT_FUTURA_BOOK,
  EMAIL_FONT_FUTURA_DEMI,
  EMAIL_FONT_FUTURA_MEDIUM,
  EMAIL_FONT_GRACE,
  emailBohemy,
  emailUpper,
  renderEmailFontFaces,
} from './emailTypography.js';
import { emailHeroImageUrl } from './heroImages.js';
import { isEmailHeroReady } from './heroManifest.js';
import { heroIconSvg } from './heroIcons.js';
import type { EmailDataRow, EmailHeroIcon, EmailTemplateType, EmailTemplateVariables } from './types.js';

function escHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export function interpolateCopy(text: string, vars: EmailTemplateVariables): string {
  return text.replace(/\{\{(\w+)\}\}/g, (_, key: string) => {
    const v = vars[key];
    if (v === undefined || v === null) return '';
    return String(v);
  });
}

function resolveRowValue(row: EmailDataRow, vars: EmailTemplateVariables): string {
  const raw = vars[row.valueKey];
  if (raw !== undefined && raw !== null && String(raw).trim() !== '') return String(raw);
  return row.fallback ?? '—';
}

/** Rich HTML fallback when Fal hero WebP is not yet uploaded — glass cube + roses + diamonds. */
function renderFallbackHeroScene(heroIcon: EmailHeroIcon): string {
  const iconSvg = heroIconSvg(heroIcon);
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;margin:0 auto;border-collapse:collapse;">
  <tr>
    <td align="center" style="padding:16px 12px 8px;background-image:url('${EMAIL_BRAND.marbleBackground}');background-repeat:repeat;background-size:contain;border-radius:12px;border:1px solid rgba(255,255,255,0.9);box-shadow:0 12px 40px rgba(0,0,0,0.08);">
      <table role="presentation" cellpadding="0" cellspacing="0" style="border-collapse:collapse;">
        <tr>
          <td align="center" style="width:200px;height:200px;background:rgba(255,255,255,0.45);border:2px solid rgba(255,255,255,0.95);border-radius:12px;box-shadow:inset 0 0 32px rgba(255,255,255,0.6),0 8px 24px rgba(0,0,0,0.06);">
            ${iconSvg.replace(/width="64"/g, 'width="96"').replace(/height="64"/g, 'height="96"')}
          </td>
        </tr>
      </table>
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:12px;border-collapse:collapse;">
        <tr>
          <td align="center" style="padding:4px 0;">
            <img src="${escHtml(EMAIL_BRAND.roseAccent)}" width="28" height="28" alt="" style="display:inline-block;margin:0 10px;vertical-align:middle;border:0;"/>
            <img src="${escHtml(EMAIL_BRAND.diamondAccent)}" width="22" height="22" alt="" style="display:inline-block;margin:0 10px;vertical-align:middle;border:0;"/>
            <img src="${escHtml(EMAIL_BRAND.diamondAccent)}" width="18" height="18" alt="" style="display:inline-block;margin:0 10px;vertical-align:middle;opacity:0.85;border:0;"/>
            <img src="${escHtml(EMAIL_BRAND.roseAccent)}" width="24" height="24" alt="" style="display:inline-block;margin:0 10px;vertical-align:middle;border:0;"/>
          </td>
        </tr>
      </table>
    </td>
  </tr>
</table>`;
}

function renderHeroSection(templateType: EmailTemplateType | undefined, heroIcon: EmailHeroIcon): string {
  if (templateType && isEmailHeroReady(templateType)) {
    const heroUrl = escHtml(emailHeroImageUrl(templateType));
    return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;margin:0 auto;border-collapse:collapse;">
  <tr>
    <td align="center" style="padding:0;line-height:0;font-size:0;">
      <img src="${heroUrl}" width="520" alt="" style="display:block;width:100%;max-width:520px;height:auto;border:0;border-radius:12px;box-shadow:0 12px 36px rgba(0,0,0,0.1);"/>
    </td>
  </tr>
</table>`;
  }
  return renderFallbackHeroScene(heroIcon);
}

function renderMemberPerksRow(): string {
  const perks = [
    { icon: EMAIL_BRAND.perksPoints, label: 'Earn Loyalty Points' },
    { icon: EMAIL_BRAND.perksUnlock, label: 'Unlock Exclusive Perks' },
    { icon: EMAIL_BRAND.perksMember, label: 'Member Only Access' },
  ];
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:20px auto 0;max-width:460px;border-collapse:collapse;">
  <tr>
${perks
  .map(
    (p) => `    <td align="center" width="33%" style="padding:8px 4px;vertical-align:top;">
      <img src="${escHtml(p.icon)}" width="24" height="24" alt="" style="display:block;margin:0 auto 6px;border:0;"/>
      <div style="font-family:${EMAIL_FONT_FUTURA_BOOK};font-size:8px;letter-spacing:0.08em;color:${EMAIL_BRAND.gray};text-transform:uppercase;line-height:1.4;">${escHtml(emailUpper(p.label))}</div>
    </td>`
  )
  .join('\n')}
  </tr>
</table>`;
}

/** FRONTAL (Futura) + red SLAYER wordmark image inline — matches debug slay card asset. */
function renderEmailWordmark(): string {
  const logoUrl = escHtml(EMAIL_BRAND.slayerLogo);
  return `<table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 auto;border-collapse:collapse;">
  <tr>
    <td align="right" style="vertical-align:middle;padding:0 4px 0 0;font-family:${EMAIL_FONT_FUTURA_MEDIUM};font-size:14px;letter-spacing:0.12em;color:${EMAIL_BRAND.black};text-transform:uppercase;font-weight:500;line-height:1;white-space:nowrap;">FRONTAL</td>
    <td align="left" style="vertical-align:middle;padding:0;line-height:0;font-size:0;">
      <img src="${logoUrl}" width="78" height="52" alt="Slayer" style="display:block;border:0;"/>
    </td>
  </tr>
</table>`;
}

function renderSocialFooterRow(): string {
  return `<table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 auto 8px;border-collapse:collapse;">
                <tr>
${EMAIL_SOCIAL_LINKS.map(
  (link) => `                  <td style="padding:0 10px;">
                    <a href="${escHtml(link.href)}" target="_blank" rel="noopener noreferrer" style="text-decoration:none;">
                      <img src="${escHtml(resolveEmailSocialIconUrl(link.iconPath))}" width="20" height="20" alt="${escHtml(link.label)}" style="display:block;border:0;"/>
                    </a>
                  </td>`
).join('\n')}
                </tr>
              </table>`;
}

export interface RenderEmailLayoutInput {
  templateType?: EmailTemplateType;
  scriptAccent: string;
  headline: string;
  bodyParagraphs: string[];
  heroIcon: EmailHeroIcon;
  dataRows?: EmailDataRow[];
  ctaLabel?: string;
  ctaUrl?: string;
  variables: EmailTemplateVariables;
  preheader?: string;
  customHtmlBody?: string;
  showMemberPerks?: boolean;
  /** Defaults to in-app Concierge priority message form. */
  supportCtaUrl?: string;
}

function renderSupportFooter(supportCtaUrl: string): string {
  const url = escHtml(supportCtaUrl);
  const copy = escHtml(emailUpper(EMAIL_SUPPORT_FOOTER_COPY));
  const cta = escHtml(emailUpper(EMAIL_SUPPORT_CTA_LABEL));
  return `<tr>
            <td style="padding:28px 32px 12px;text-align:center;border-top:1px solid rgba(0,0,0,0.08);">
              <p style="margin:0 0 16px;font-family:${EMAIL_FONT_FUTURA_BOOK};font-size:10px;line-height:1.65;letter-spacing:0.06em;color:${EMAIL_BRAND.gray};text-transform:uppercase;">${copy}</p>
              <a href="${url}" style="display:inline-block;border:1.3px solid ${EMAIL_BRAND.red};color:${EMAIL_BRAND.red};background-color:#ffffff;font-family:${EMAIL_FONT_FUTURA_MEDIUM};font-size:10px;font-weight:700;letter-spacing:0.14em;text-decoration:none;text-transform:uppercase;padding:12px 28px;">${cta}</a>
            </td>
          </tr>`;
}

export function renderEmailLayout(input: RenderEmailLayoutInput): string {
  const vars = input.variables;
  const scriptAccent = escHtml(emailUpper(interpolateCopy(input.scriptAccent, vars)));
  const headline = escHtml(interpolateCopy(input.headline, vars).toUpperCase());
  const preheader = escHtml(interpolateCopy(input.preheader || headline, vars));
  const paragraphs = input.bodyParagraphs.map((p) =>
    escHtml(interpolateCopy(p, vars).toUpperCase())
  );
  const ctaLabel = escHtml((input.ctaLabel || 'VIEW DETAILS').toUpperCase());
  const ctaUrl = escHtml(input.ctaUrl || '#');

  const dataRowsHtml =
    input.dataRows && input.dataRows.length > 0
      ? `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:24px auto 0;max-width:420px;border-collapse:separate;border-spacing:0;background:rgba(255,255,255,0.78);border:1px solid rgba(255,255,255,0.95);border-radius:8px;box-shadow:0 4px 24px rgba(0,0,0,0.06),inset 0 1px 0 rgba(255,255,255,0.9);">
${input.dataRows
  .map((row) => {
    const label = escHtml(row.label.toUpperCase());
    const value = escHtml(resolveRowValue(row, vars).toUpperCase());
    return `<tr>
  <td style="padding:14px 20px 4px;font-family:${EMAIL_FONT_FUTURA_BOOK};font-size:9px;letter-spacing:0.14em;color:${EMAIL_BRAND.gray};text-transform:uppercase;">${label}</td>
</tr>
<tr>
  <td style="padding:0 20px 14px;font-family:${EMAIL_FONT_FUTURA_DEMI};font-size:14px;font-weight:600;color:${EMAIL_BRAND.black};text-transform:uppercase;letter-spacing:0.04em;">${value}</td>
</tr>`;
  })
  .join('\n')}
</table>`
      : '';

  const bodyHtml =
    input.customHtmlBody ||
    paragraphs
      .filter((p) => p.trim())
      .map(
        (p) =>
          `<p style="margin:0 0 16px;font-family:${EMAIL_FONT_FUTURA_BOOK};font-size:11px;line-height:1.75;letter-spacing:0.08em;color:${EMAIL_BRAND.gray};text-transform:uppercase;text-align:center;">${p}</p>`
      )
      .join('');

  const heroHtml = renderHeroSection(input.templateType, input.heroIcon);
  const memberPerksHtml = input.showMemberPerks ? renderMemberPerksRow() : '';
  const supportFooterHtml = renderSupportFooter(input.supportCtaUrl || resolveConciergeMessageUrl());
  const socialFooterHtml = renderSocialFooterRow();
  const fontFaces = renderEmailFontFaces();

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1"/>
  <meta name="color-scheme" content="light"/>
  <meta name="supported-color-schemes" content="light"/>
  <title>${headline}</title>
  ${fontFaces}
  <!--[if mso]><style>body,table,td{font-family:Arial,Helvetica,sans-serif!important;}</style><![endif]-->
</head>
<body style="margin:0;padding:0;background-color:#ececec;">
  <div style="display:none;max-height:0;overflow:hidden;mso-hide:all;">${preheader}&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;</div>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#ececec;">
    <tr>
      <td align="center" style="padding:24px 12px;">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;border-collapse:collapse;background-color:${EMAIL_BRAND.white};border:1px solid #ddd;box-shadow:0 4px 24px rgba(0,0,0,0.06);">
          <tr>
            <td style="padding:36px 32px 16px;text-align:center;">
              ${renderEmailWordmark()}
            </td>
          </tr>
          <tr>
            <td style="padding:4px 32px 0;text-align:center;">
              <div style="font-family:${EMAIL_FONT_GRACE};font-size:34px;line-height:1.15;color:${EMAIL_BRAND.black};text-transform:uppercase;">${scriptAccent}</div>
            </td>
          </tr>
          <tr>
            <td style="padding:10px 32px 24px;text-align:center;">
              <div style="font-family:${EMAIL_FONT_FUTURA_DEMI};font-size:26px;line-height:1.2;letter-spacing:0.06em;color:${EMAIL_BRAND.red};font-weight:600;text-transform:uppercase;">${headline}</div>
            </td>
          </tr>
          <tr>
            <td align="center" style="padding:0 24px 20px;">
              ${heroHtml}
            </td>
          </tr>
          <tr>
            <td style="padding:8px 40px 4px;text-align:center;">
              ${bodyHtml}
              ${memberPerksHtml}
              ${dataRowsHtml}
            </td>
          </tr>
          ${
            ctaUrl && ctaUrl !== '#'
              ? `<tr>
            <td align="center" style="padding:32px 32px 16px;">
              <a href="${ctaUrl}" style="display:inline-block;background-color:${EMAIL_BRAND.red};color:#ffffff;font-family:${EMAIL_FONT_FUTURA_MEDIUM};font-size:11px;font-weight:700;letter-spacing:0.16em;text-decoration:none;text-transform:uppercase;padding:16px 40px;border-radius:0;box-shadow:0 4px 12px rgba(235,28,36,0.25);">${ctaLabel}</a>
            </td>
          </tr>`
              : ''
          }
          ${supportFooterHtml}
          <tr>
            <td style="padding:28px 32px 0;text-align:center;">
              <div style="height:3px;background-color:${EMAIL_BRAND.red};max-width:120px;margin:0 auto 20px;"></div>
              <div style="font-family:${EMAIL_FONT_BOHEMY};font-size:14px;letter-spacing:0.04em;color:${EMAIL_BRAND.gray};text-transform:lowercase;margin-bottom:16px;">${escHtml(emailBohemy('luxury without limits.'))}</div>
              ${socialFooterHtml}
            </td>
          </tr>
          <tr>
            <td style="padding:8px 32px 28px;text-align:center;">
              <div style="font-family:${EMAIL_FONT_FUTURA_BOOK};font-size:7px;letter-spacing:0.12em;color:#aaa;text-transform:uppercase;">${escHtml(emailUpper('Thank you for being part of the Slay Society.'))}</div>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}
