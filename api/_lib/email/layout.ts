import { EMAIL_BRAND } from './brandAssets.js';
import { heroIconSvg } from './heroIcons.js';
import type { EmailDataRow, EmailHeroIcon, EmailTemplateVariables } from './types.js';

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

export interface RenderEmailLayoutInput {
  scriptAccent: string;
  headline: string;
  bodyParagraphs: string[];
  heroIcon: EmailHeroIcon;
  dataRows?: EmailDataRow[];
  ctaLabel?: string;
  ctaUrl?: string;
  variables: EmailTemplateVariables;
  preheader?: string;
  /** Newsletter / custom HTML body (inside marble card). */
  customHtmlBody?: string;
}

export function renderEmailLayout(input: RenderEmailLayoutInput): string {
  const vars = input.variables;
  const scriptAccent = escHtml(interpolateCopy(input.scriptAccent, vars));
  const headline = escHtml(interpolateCopy(input.headline, vars).toUpperCase());
  const preheader = escHtml(interpolateCopy(input.preheader || headline, vars));
  const paragraphs = input.bodyParagraphs.map((p) =>
    escHtml(interpolateCopy(p, vars).toUpperCase())
  );
  const ctaLabel = escHtml((input.ctaLabel || 'VIEW DETAILS').toUpperCase());
  const ctaUrl = escHtml(input.ctaUrl || '#');

  const dataRowsHtml =
    input.dataRows && input.dataRows.length > 0
      ? `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:24px auto 0;max-width:420px;border-collapse:collapse;background:rgba(255,255,255,0.72);border:1px solid rgba(156,163,175,0.9);border-radius:4px;">
${input.dataRows
  .map((row) => {
    const label = escHtml(row.label.toUpperCase());
    const value = escHtml(resolveRowValue(row, vars).toUpperCase());
    return `<tr>
  <td style="padding:12px 16px 4px;font-family:Arial,Helvetica,sans-serif;font-size:9px;letter-spacing:0.12em;color:${EMAIL_BRAND.gray};text-transform:uppercase;">${label}</td>
</tr>
<tr>
  <td style="padding:0 16px 12px;font-family:Arial,Helvetica,sans-serif;font-size:13px;font-weight:600;color:${EMAIL_BRAND.black};text-transform:uppercase;">${value}</td>
</tr>`;
  })
  .join('\n')}
</table>`
      : '';

  const bodyHtml =
    input.customHtmlBody ||
    paragraphs
      .map(
        (p) =>
          `<p style="margin:0 0 14px;font-family:Arial,Helvetica,sans-serif;font-size:11px;line-height:1.65;letter-spacing:0.06em;color:${EMAIL_BRAND.gray};text-transform:uppercase;text-align:center;">${p}</p>`
      )
      .join('');

  const heroSvg = heroIconSvg(input.heroIcon);

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1"/>
  <meta name="color-scheme" content="light"/>
  <meta name="supported-color-schemes" content="light"/>
  <title>${headline}</title>
  <link href="https://fonts.googleapis.com/css2?family=Great+Vibes&display=swap" rel="stylesheet"/>
  <!--[if mso]><style>body,table,td{font-family:Arial,Helvetica,sans-serif!important;}</style><![endif]-->
</head>
<body style="margin:0;padding:0;background-color:#ececec;">
  <div style="display:none;max-height:0;overflow:hidden;mso-hide:all;">${preheader}&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;</div>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#ececec;">
    <tr>
      <td align="center" style="padding:24px 12px;">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;border-collapse:collapse;background-color:${EMAIL_BRAND.white};background-image:url('${EMAIL_BRAND.marbleBackground}');background-repeat:repeat;background-position:center top;border:1px solid #ddd;">
          <tr>
            <td style="padding:32px 28px 12px;text-align:center;">
              <div style="font-family:Georgia,'Times New Roman',serif;font-size:13px;letter-spacing:0.35em;color:${EMAIL_BRAND.black};text-transform:uppercase;">
                FRONTAL <span style="color:${EMAIL_BRAND.red};">SLAYER</span>
              </div>
            </td>
          </tr>
          <tr>
            <td style="padding:8px 28px 0;text-align:center;">
              <div style="font-family:'Great Vibes',cursive,Georgia,serif;font-size:28px;line-height:1.2;color:${EMAIL_BRAND.black};">${scriptAccent}</div>
            </td>
          </tr>
          <tr>
            <td style="padding:8px 28px 20px;text-align:center;">
              <div style="font-family:Georgia,'Times New Roman',serif;font-size:22px;line-height:1.25;letter-spacing:0.08em;color:${EMAIL_BRAND.red};font-weight:700;text-transform:uppercase;">${headline}</div>
            </td>
          </tr>
          <tr>
            <td align="center" style="padding:0 28px 8px;">
              <table role="presentation" cellpadding="0" cellspacing="0" style="border-collapse:collapse;">
                <tr>
                  <td align="center" style="width:140px;height:140px;background:rgba(255,255,255,0.55);border:1px solid rgba(255,255,255,0.85);border-radius:8px;box-shadow:0 8px 32px rgba(0,0,0,0.08);">
                    ${heroSvg}
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td align="center" style="padding:4px 28px 8px;">
              <img src="${EMAIL_BRAND.roseAccent}" width="20" height="20" alt="" style="display:inline-block;margin:0 6px;vertical-align:middle;"/>
              <img src="${EMAIL_BRAND.diamondAccent}" width="16" height="16" alt="" style="display:inline-block;margin:0 6px;vertical-align:middle;"/>
            </td>
          </tr>
          <tr>
            <td style="padding:12px 36px 8px;text-align:center;">
              ${bodyHtml}
              ${dataRowsHtml}
            </td>
          </tr>
          ${
            ctaUrl && ctaUrl !== '#'
              ? `<tr>
            <td align="center" style="padding:28px 28px 12px;">
              <a href="${ctaUrl}" style="display:inline-block;background-color:${EMAIL_BRAND.red};color:#ffffff;font-family:Arial,Helvetica,sans-serif;font-size:11px;font-weight:700;letter-spacing:0.14em;text-decoration:none;text-transform:uppercase;padding:14px 32px;border-radius:0;">${ctaLabel}</a>
            </td>
          </tr>`
              : ''
          }
          <tr>
            <td style="padding:32px 28px 28px;text-align:center;border-top:1px solid rgba(0,0,0,0.08);">
              <div style="font-family:Arial,Helvetica,sans-serif;font-size:9px;letter-spacing:0.22em;color:${EMAIL_BRAND.gray};text-transform:uppercase;margin-bottom:12px;">LUXURY WITHOUT LIMITS.</div>
              <img src="${EMAIL_BRAND.fsMonogram}" width="24" height="24" alt="FS" style="display:inline-block;opacity:0.85;"/>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}
