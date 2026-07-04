import { EMAIL_BRAND } from './brandAssets.js';
import {
  EMAIL_HERO_HEIGHT_PX,
  EMAIL_HERO_PRODUCT_ZONE_PX,
  EMAIL_HERO_WIDTH_PX,
} from './heroDimensions.js';
import {
  emailTdStyleCss,
  emailTextStyleCss,
  resolveEmailLayerStyle,
  type EmailLayoutDebugStore,
  type EmailLayerStyle,
  type EmailTemplateCopyOverrides,
  emailHeroOverlayLayerCss,
} from './emailLayoutConfig.js';
import { EMAIL_SOCIAL_LINKS, resolveEmailSocialIconUrl } from './emailSocialLinks.js';
import { EMAIL_HEADER_NAV_LINKS, resolveEmailHeaderNavUrl } from './emailHeaderNavLinks.js';
import {
  EMAIL_SUPPORT_CTA_LABEL,
  EMAIL_SUPPORT_FOOTER_COPY,
  resolveConciergeMessageUrl,
} from './emailSupportLinks.js';
import {
  EMAIL_FONT_FUTURA_BOOK,
  emailBohemy,
  emailUpper,
  renderEmailFontFaces,
} from './emailTypography.js';
import { emailHeroImageUrl } from './heroImages.js';
import { isEmailHeroReady } from './heroManifest.js';
import { heroIconSvg } from './heroIcons.js';
import { renderEmailProductPromo } from './emailProductPromo.js';
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
function renderFallbackHeroProductScene(heroIcon: EmailHeroIcon): string {
  const iconSvg = heroIconSvg(heroIcon);
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;">
  <tr>
    <td align="center" style="padding:0 12px 8px;">
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

function heroOverlayTextShadow(style: EmailLayerStyle): string {
  if (style.color && style.color.toLowerCase() !== '#ffffff' && style.color.toLowerCase() !== '#fff') {
    return 'text-shadow:0 1px 10px rgba(255,255,255,0.92),0 0 2px rgba(255,255,255,0.85);';
  }
  return 'text-shadow:0 2px 12px rgba(0,0,0,0.45);';
}

function renderHeroOverlayCta(
  ctaLabel: string,
  ctaUrl: string,
  ctaStyle: EmailLayerStyle
): string {
  if (!ctaUrl || ctaUrl === '#') return '';
  const ctaText = emailTextStyleCss(ctaStyle);
  return `<div data-email-layer="cta" style="${emailHeroOverlayLayerCss(ctaStyle)}">
            <a data-email-copy="ctaLabel" href="${ctaUrl}" style="display:inline-block;background-color:${EMAIL_BRAND.red};text-decoration:none;padding:16px 40px;border-radius:0;box-shadow:0 4px 16px rgba(235,28,36,0.35);${ctaText}">${ctaLabel}</a>
          </div>`;
}

/** Tall hero graphic with script accent, headline, and CTA overlaid on the image (reference-style). */
function renderHeroComposite(input: {
  templateType: EmailTemplateType | undefined;
  heroIcon: EmailHeroIcon;
  scriptAccent: string;
  headline: string;
  ctaLabel: string;
  ctaUrl: string;
  scriptStyle: EmailLayerStyle;
  headlineStyle: EmailLayerStyle;
  heroStyle: EmailLayerStyle;
  ctaStyle: EmailLayerStyle;
}): string {
  const heroReady = Boolean(input.templateType && isEmailHeroReady(input.templateType));
  const heroUrl = heroReady && input.templateType ? escHtml(emailHeroImageUrl(input.templateType)) : '';
  const bgImage = heroReady
    ? `background-image:url('${heroUrl}');background-size:100% auto;background-position:center top;background-repeat:no-repeat;background-color:#ffffff;`
    : `background-image:url('${escHtml(EMAIL_BRAND.marbleBackground)}');background-repeat:repeat;background-size:contain;`;
  const vmlFill = heroReady ? `<v:fill type="frame" src="${heroUrl}" color="#ffffff"/>` : `<v:fill type="tile" src="${escHtml(EMAIL_BRAND.marbleBackground)}" color="#ffffff"/>`;
  const scriptText = `${emailTextStyleCss(input.scriptStyle)};${heroOverlayTextShadow(input.scriptStyle)}`;
  const headlineText = `${emailTextStyleCss(input.headlineStyle)};${heroOverlayTextShadow(input.headlineStyle)}`;
  const productScene = heroReady ? '' : renderFallbackHeroProductScene(input.heroIcon);
  const ctaHtml = renderHeroOverlayCta(input.ctaLabel, input.ctaUrl, input.ctaStyle);
  const fallbackSceneHtml = heroReady
    ? ''
    : `<div style="position:absolute;left:0;right:0;bottom:0;height:${EMAIL_HERO_PRODUCT_ZONE_PX}px;display:flex;align-items:flex-end;justify-content:center;padding:0 12px 8px;box-sizing:border-box;z-index:1;">
            ${productScene}
          </div>`;

  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:${EMAIL_HERO_WIDTH_PX}px;margin:0 auto;border-collapse:collapse;border-radius:12px;overflow:hidden;box-shadow:0 12px 36px rgba(0,0,0,0.1);">
  <tr>
    <td align="center" valign="top" background="${heroUrl || escHtml(EMAIL_BRAND.marbleBackground)}" style="padding:0;line-height:normal;${bgImage}">
      <!--[if gte mso 9]>
      <v:rect xmlns:v="urn:schemas-microsoft-com:vml" fill="true" stroke="false" style="width:${EMAIL_HERO_WIDTH_PX}px;height:${EMAIL_HERO_HEIGHT_PX}px;">
        ${vmlFill}
        <v:textbox inset="0,0,0,0" style="mso-fit-shape-to-text:true">
      <![endif]-->
      <div style="position:relative;width:100%;height:${EMAIL_HERO_HEIGHT_PX}px;min-height:${EMAIL_HERO_HEIGHT_PX}px;">
        <div style="position:absolute;inset:0;background:linear-gradient(to bottom, rgba(255,255,255,0.52) 0%, rgba(255,255,255,0.22) 30%, rgba(255,255,255,0) 48%);pointer-events:none;z-index:1;"></div>
        <div data-email-layer="scriptAccent" style="${emailHeroOverlayLayerCss(input.scriptStyle)}${heroOverlayTextShadow(input.scriptStyle)}">
          <div data-email-copy="scriptAccent" style="${scriptText}">${input.scriptAccent}</div>
        </div>
        <div data-email-layer="headline" style="${emailHeroOverlayLayerCss(input.headlineStyle)}${heroOverlayTextShadow(input.headlineStyle)}">
          <div data-email-copy="headline" style="${headlineText}">${input.headline}</div>
        </div>
        ${ctaHtml}
        ${fallbackSceneHtml}
      </div>
      <!--[if gte mso 9]></v:textbox></v:rect><![endif]-->
    </td>
  </tr>
</table>`;
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

/** FRONTAL (Futura) + SLAYER wordmark image inline — scaled together at 70% of debug slay card size. */
const EMAIL_WORDMARK_SCALE = 0.7;
const EMAIL_WORDMARK_LOGO_WIDTH = Math.round(78 * EMAIL_WORDMARK_SCALE);
const EMAIL_WORDMARK_LOGO_HEIGHT = Math.round(52 * EMAIL_WORDMARK_SCALE);

function renderEmailWordmark(brandStyle: EmailLayerStyle): string {
  const logoUrl = escHtml(EMAIL_BRAND.slayerLogo);
  const scaledStyle: EmailLayerStyle = {
    ...brandStyle,
    fontSize: Math.round((brandStyle.fontSize ?? 14) * EMAIL_WORDMARK_SCALE),
  };
  const frontalCss = emailTextStyleCss(scaledStyle);
  return `<table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 auto;border-collapse:collapse;">
  <tr>
    <td align="right" style="vertical-align:middle;padding:0 4px 0 0;${frontalCss};line-height:1;white-space:nowrap;">FRONTAL</td>
    <td align="left" style="vertical-align:middle;padding:0;line-height:0;font-size:0;">
      <img src="${logoUrl}" width="${EMAIL_WORDMARK_LOGO_WIDTH}" height="${EMAIL_WORDMARK_LOGO_HEIGHT}" alt="Slayer" style="display:block;border:0;"/>
    </td>
  </tr>
</table>`;
}

function renderEmailHeaderNav(navStyle: EmailLayerStyle): string {
  const linkCss = emailTextStyleCss(navStyle);
  const cells = EMAIL_HEADER_NAV_LINKS.map((link) => {
    const href = escHtml(resolveEmailHeaderNavUrl(link.path));
    const label = escHtml(link.label.toUpperCase());
    return `    <td style="padding:0 12px;white-space:nowrap;">
      <a href="${href}" target="_blank" rel="noopener noreferrer" style="text-decoration:none;color:${EMAIL_BRAND.black};${linkCss}">${label}</a>
    </td>`;
  }).join('\n');

  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;">
  <tr>
    <td align="center" style="${emailTdStyleCss(navStyle)}">
      <table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 auto;border-collapse:collapse;">
        <tr>
${cells}
        </tr>
      </table>
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
  /** Cross-promo product grid above the support footer (units + BCF). Defaults to true. */
  showProductPromo?: boolean;
  /** Defaults to in-app Concierge priority message form. */
  supportCtaUrl?: string;
  layoutDebug?: EmailLayoutDebugStore | null;
  copyOverrides?: EmailTemplateCopyOverrides;
}

function renderSupportFooter(
  supportCtaUrl: string,
  layoutDebug: EmailLayoutDebugStore | null | undefined,
  copyOverrides?: EmailTemplateCopyOverrides,
  options?: { omitTopBorder?: boolean }
): string {
  const footerStyle = resolveEmailLayerStyle('supportFooter', layoutDebug?.globalLayers);
  const ctaStyle = resolveEmailLayerStyle('supportCta', layoutDebug?.globalLayers);
  const url = escHtml(supportCtaUrl);
  const copyRaw = copyOverrides?.supportFooterCopy ?? EMAIL_SUPPORT_FOOTER_COPY;
  const ctaRaw = copyOverrides?.supportCtaLabel ?? EMAIL_SUPPORT_CTA_LABEL;
  const copy = escHtml(emailUpper(copyRaw));
  const cta = escHtml(emailUpper(ctaRaw));
  const footerTd = emailTdStyleCss(footerStyle);
  const ctaText = emailTextStyleCss(ctaStyle);
  const topBorder = options?.omitTopBorder ? '' : 'border-top:1px solid rgba(0,0,0,0.08);';
  return `<tr>
            <td style="${topBorder}padding:0;">
              <div data-email-layer="supportFooter" style="${footerTd}">
                <p data-email-copy="supportFooterCopy" style="margin:0 0 16px;${emailTextStyleCss(footerStyle)}">${copy}</p>
              </div>
              <div data-email-layer="supportCta" style="${emailTdStyleCss(ctaStyle)}">
                <a data-email-copy="supportCtaLabel" href="${url}" style="display:inline-block;border:1.3px solid ${EMAIL_BRAND.red};background-color:#ffffff;text-decoration:none;padding:12px 28px;${ctaText}">${cta}</a>
              </div>
            </td>
          </tr>`;
}

export function renderEmailLayout(input: RenderEmailLayoutInput): string {
  const vars = input.variables;
  const layoutDebug = input.layoutDebug;
  const copy = input.copyOverrides;

  const brandStyle = resolveEmailLayerStyle('brandHeader', layoutDebug?.globalLayers);
  const headerNavStyle = resolveEmailLayerStyle('headerNav', layoutDebug?.globalLayers);
  const scriptStyle = resolveEmailLayerStyle('scriptAccent', layoutDebug?.globalLayers);
  const headlineStyle = resolveEmailLayerStyle('headline', layoutDebug?.globalLayers);
  const heroStyle = resolveEmailLayerStyle('hero', layoutDebug?.globalLayers);
  const bodyStyle = resolveEmailLayerStyle('body', layoutDebug?.globalLayers);
  const labelStyle = resolveEmailLayerStyle('dataRowLabel', layoutDebug?.globalLayers);
  const valueStyle = resolveEmailLayerStyle('dataRowValue', layoutDebug?.globalLayers);
  const ctaStyle = resolveEmailLayerStyle('cta', layoutDebug?.globalLayers);
  const taglineStyle = resolveEmailLayerStyle('tagline', layoutDebug?.globalLayers);
  const closingStyle = resolveEmailLayerStyle('closing', layoutDebug?.globalLayers);

  const scriptAccentRaw = copy?.scriptAccent ?? input.scriptAccent;
  const headlineRaw = copy?.headline ?? input.headline;
  const bodyParagraphsRaw = copy?.bodyParagraphs ?? input.bodyParagraphs;
  const preheaderRaw = copy?.preheader ?? input.preheader ?? headlineRaw;
  const taglineRaw = copy?.tagline ?? 'luxury without limits.';
  const closingRaw = copy?.closing ?? 'Thank you for being part of the Slay Society.';

  const scriptAccent = escHtml(emailUpper(interpolateCopy(scriptAccentRaw, vars)));
  const headline = escHtml(interpolateCopy(headlineRaw, vars).toUpperCase());
  const preheader = escHtml(interpolateCopy(preheaderRaw, vars));
  const paragraphs = bodyParagraphsRaw.map((p) =>
    escHtml(interpolateCopy(p, vars).toUpperCase())
  );
  const ctaLabel = escHtml((copy?.ctaLabel ?? input.ctaLabel ?? 'VIEW DETAILS').toUpperCase());
  const ctaUrl = escHtml(input.ctaUrl || '#');

  const dataRowsHtml =
    input.dataRows && input.dataRows.length > 0
      ? `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:24px auto 0;max-width:420px;border-collapse:separate;border-spacing:0;background:rgba(255,255,255,0.78);border:1px solid rgba(255,255,255,0.95);border-radius:8px;box-shadow:0 4px 24px rgba(0,0,0,0.06),inset 0 1px 0 rgba(255,255,255,0.9);">
${input.dataRows
  .map((row) => {
    const label = escHtml(row.label.toUpperCase());
    const value = escHtml(resolveRowValue(row, vars).toUpperCase());
    return `<tr>
  <td style="padding:14px 20px 4px;${emailTextStyleCss(labelStyle)}">${label}</td>
</tr>
<tr>
  <td style="padding:0 20px 14px;${emailTextStyleCss(valueStyle)}">${value}</td>
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
          `<p style="margin:0 0 16px;${emailTextStyleCss(bodyStyle)}">${p}</p>`
      )
      .join('');

  const heroHtml = renderHeroComposite({
    templateType: input.templateType,
    heroIcon: input.heroIcon,
    scriptAccent,
    headline,
    ctaLabel,
    ctaUrl,
    scriptStyle,
    headlineStyle,
    heroStyle,
    ctaStyle,
  });
  const memberPerksHtml = input.showMemberPerks ? renderMemberPerksRow() : '';
  const showProductPromo = input.showProductPromo !== false;
  const productPromoHtml = showProductPromo
    ? renderEmailProductPromo({ layoutDebug, copyOverrides: copy })
    : '';
  const supportFooterHtml = renderSupportFooter(
    input.supportCtaUrl || resolveConciergeMessageUrl(),
    layoutDebug,
    copy,
    { omitTopBorder: showProductPromo }
  );
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
            <td data-email-layer="brandHeader" style="${emailTdStyleCss(brandStyle)}">
              ${renderEmailWordmark(brandStyle)}
            </td>
          </tr>
          <tr>
            <td data-email-layer="headerNav" style="padding:0;">
              ${renderEmailHeaderNav(headerNavStyle)}
            </td>
          </tr>
          <tr>
            <td data-email-layer="hero" align="center" style="${emailTdStyleCss(heroStyle)}">
              ${heroHtml}
            </td>
          </tr>
          <tr>
            <td data-email-layer="body" style="${emailTdStyleCss(bodyStyle)}">
              ${bodyHtml}
              ${memberPerksHtml}
              ${dataRowsHtml}
            </td>
          </tr>
          ${productPromoHtml}
          ${supportFooterHtml}
          <tr>
            <td style="padding:28px 32px 0;text-align:center;">
              <div style="height:3px;background-color:${EMAIL_BRAND.red};max-width:120px;margin:0 auto 20px;"></div>
              <div data-email-layer="tagline" style="${emailTdStyleCss(taglineStyle)}">
                <div data-email-copy="tagline" style="${emailTextStyleCss(taglineStyle)}">${escHtml(emailBohemy(taglineRaw))}</div>
              </div>
              ${socialFooterHtml}
            </td>
          </tr>
          <tr>
            <td data-email-layer="closing" style="${emailTdStyleCss(closingStyle)}">
              <div data-email-copy="closing" style="${emailTextStyleCss(closingStyle)}">${escHtml(emailUpper(closingRaw))}</div>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}
