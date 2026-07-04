import { emailAssetUrl, resolveSiteOrigin } from './brandAssets.js';
import {
  emailTdStyleCss,
  emailTextStyleCss,
  resolveEmailLayerStyle,
  type EmailLayoutDebugStore,
  type EmailTemplateCopyOverrides,
} from './emailLayoutConfig.js';
import { emailUpper } from './emailTypography.js';

export const EMAIL_PRODUCT_PROMO_TITLE = 'Explore the collection';
export const EMAIL_PRODUCT_PROMO_CTA_LABEL = 'Shop all';
export const EMAIL_PRODUCT_PROMO_CTA_PATH = '/home/shop';

export type EmailProductPromoTile = {
  label: string;
  href: string;
  imageUrl: string;
};

export type EmailSignatureUnitTile = EmailProductPromoTile & {
  length: string;
  density: string;
  lace: string;
};

export type EmailEssentialTile = EmailProductPromoTile & {
  descriptor: string;
};

const FS_RED = '#EB1C24';
const FS_RED_GLOW = 'rgba(235,28,36,0.42)';
const FS_RED_SOFT = 'rgba(235,28,36,0.16)';
const ACRYLIC_BG = 'rgba(255,255,255,0.78)';
const ACRYLIC_BORDER = 'rgba(255,255,255,0.95)';

function escHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function absoluteUrl(pathOrUrl: string): string {
  const raw = (pathOrUrl || '').trim();
  if (!raw) return resolveSiteOrigin();
  if (/^https?:\/\//i.test(raw)) return raw;
  const origin = resolveSiteOrigin();
  return `${origin}${raw.startsWith('/') ? raw : `/${raw}`}`;
}

/** BCF straight-texture thumbs — site `/assets/` PNGs (reliable in email; same pattern as unit tiles). */
const BCF_THUMB_SRC = {
  bundles: emailAssetUrl('bundle-straight.png', { preferSite: true }),
  closures: emailAssetUrl('closure-straight.png', { preferSite: true }),
  frontals: emailAssetUrl('frontal-straight.png', { preferSite: true }),
} as const;

/** Canonical cross-promo tiles: six wig units + bundles, closures, frontals. */
export const EMAIL_PRODUCT_PROMO_TILES: EmailProductPromoTile[] = [
  {
    label: 'Noir',
    href: '/straight/noir',
    imageUrl: emailAssetUrl('natural front.png', { preferSite: true }),
  },
  {
    label: 'Blanco',
    href: '/straight/blanco',
    imageUrl: emailAssetUrl('2D BLANCO FRONT.png', { preferSite: true }),
  },
  {
    label: 'Soft Wave',
    href: '/wavy/soft-wave',
    imageUrl: emailAssetUrl('2D WAVY FRONT.png', { preferSite: true }),
  },
  {
    label: 'Beach Wave',
    href: '/wavy/beach-wave',
    imageUrl: emailAssetUrl('2D WAVY FRONT.png', { preferSite: true }),
  },
  {
    label: 'Soft Curl',
    href: '/curly/soft-curl',
    imageUrl: emailAssetUrl('2D CURLY FRONT.png', { preferSite: true }),
  },
  {
    label: 'Ocean Curl',
    href: '/curly/ocean-curl',
    imageUrl: emailAssetUrl('2D CURLY FRONT.png', { preferSite: true }),
  },
  {
    label: 'Bundles',
    href: '/shop/bundles',
    imageUrl: BCF_THUMB_SRC.bundles,
  },
  {
    label: 'Closures',
    href: '/shop/closures',
    imageUrl: BCF_THUMB_SRC.closures,
  },
  {
    label: 'Frontals',
    href: '/shop/frontals',
    imageUrl: BCF_THUMB_SRC.frontals,
  },
];

const SIGNATURE_UNIT_SPECS: Record<string, Pick<EmailSignatureUnitTile, 'length' | 'density' | 'lace'>> = {
  Noir: { length: '24"', density: '200%', lace: '13X6' },
  Blanco: { length: '24"', density: '250%', lace: '13X6' },
  'Soft Wave': { length: '24"', density: '200%', lace: '13X6' },
  'Beach Wave': { length: '24"', density: '200%', lace: '13X6' },
  'Soft Curl': { length: '24"', density: '200%', lace: '13X6' },
  'Ocean Curl': { length: '24"', density: '200%', lace: '13X6' },
};

const ESSENTIAL_DESCRIPTORS: Record<string, string> = {
  Bundles: 'RAW VIRGIN BUNDLES',
  Closures: 'LACE CLOSURES',
  Frontals: 'HD LACE FRONTALS',
};

export const EMAIL_SIGNATURE_UNITS: EmailSignatureUnitTile[] = EMAIL_PRODUCT_PROMO_TILES.slice(0, 6).map(
  (tile) => ({
    ...tile,
    ...SIGNATURE_UNIT_SPECS[tile.label],
  })
);

export const EMAIL_ESSENTIAL_TILES: EmailEssentialTile[] = EMAIL_PRODUCT_PROMO_TILES.slice(6).map((tile) => ({
  ...tile,
  descriptor: ESSENTIAL_DESCRIPTORS[tile.label] ?? tile.label.toUpperCase(),
}));

function holographicPanelShell(inner: string): string {
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:separate;border-spacing:0;background:${ACRYLIC_BG};border:1px solid ${FS_RED_GLOW};border-radius:14px;box-shadow:0 0 18px ${FS_RED_SOFT},inset 0 1px 0 ${ACRYLIC_BORDER},0 6px 20px rgba(0,0,0,0.04);">
  <tr>
    <td style="padding:14px 12px 16px;">
      ${inner}
    </td>
  </tr>
</table>`;
}

function renderPanelLabel(text: string, labelCss: string): string {
  return `<p data-email-layer="productPromoLabel" style="margin:0 0 14px;text-align:center;letter-spacing:0.14em;${labelCss}">${escHtml(text)}</p>`;
}

function renderGlowCta(href: string, label: string, ctaCss: string, compact = false): string {
  const pad = compact ? '10px 18px' : '12px 24px';
  const fontSize = compact ? '10px' : '11px';
  return `<a href="${escHtml(href)}" style="display:inline-block;margin-top:12px;padding:${pad};${ctaCss};font-size:${fontSize};letter-spacing:0.12em;text-decoration:none;color:${FS_RED};background:rgba(255,255,255,0.92);border:1px solid ${FS_RED_GLOW};border-radius:999px;box-shadow:0 0 10px ${FS_RED_SOFT},inset 0 1px 0 rgba(255,255,255,0.95);">${escHtml(label)}</a>`;
}

function renderUnitSpecRow(label: string, value: string, labelCss: string): string {
  return `<tr>
    <td style="padding:3px 0;font-size:10px;letter-spacing:0.1em;opacity:0.72;${labelCss}">${escHtml(label)}</td>
    <td align="right" style="padding:3px 0;font-size:10px;letter-spacing:0.08em;${labelCss}">${escHtml(value)}</td>
  </tr>`;
}

function renderSignatureHeroSlide(
  unit: EmailSignatureUnitTile,
  index: number,
  labelCss: string,
  ctaCss: string
): string {
  const href = escHtml(absoluteUrl(unit.href));
  const imgUrl = escHtml(unit.imageUrl);
  const name = escHtml(emailUpper(unit.label));
  const display = index === 0 ? 'block' : 'none';

  return `<div data-collection-slide="${index}" data-collection-href="${href}" style="display:${display};">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:separate;border-spacing:0;background:rgba(255,255,255,0.55);border:1px solid rgba(235,28,36,0.35);border-radius:12px;box-shadow:inset 0 1px 0 rgba(255,255,255,0.9),0 0 14px rgba(235,28,36,0.1);">
      <tr>
        <td align="center" style="padding:12px 10px 8px;">
          <img src="${imgUrl}" width="200" height="260" alt="${name}" style="display:block;width:100%;max-width:200px;height:auto;margin:0 auto;border:0;background-color:#f4f4f4;border-radius:8px;"/>
        </td>
      </tr>
      <tr>
        <td align="center" style="padding:4px 14px 14px;">
          <div data-email-layer="productPromoLabel" style="margin:0 0 8px;font-size:13px;letter-spacing:0.14em;${labelCss}">${name}</div>
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:220px;margin:0 auto;border-collapse:collapse;">
            ${renderUnitSpecRow('LENGTH', unit.length, labelCss)}
            ${renderUnitSpecRow('DENSITY', unit.density, labelCss)}
            ${renderUnitSpecRow('LACE', unit.lace, labelCss)}
          </table>
          ${renderGlowCta(href, 'VIEW UNIT', ctaCss)}
        </td>
      </tr>
    </table>
  </div>`;
}

function renderSignatureThumb(unit: EmailSignatureUnitTile, index: number, labelCss: string): string {
  const href = escHtml(absoluteUrl(unit.href));
  const imgUrl = escHtml(unit.imageUrl);
  const name = escHtml(unit.label);
  const activeBorder = index === 0 ? `border:1px solid ${FS_RED};box-shadow:0 0 8px ${FS_RED_SOFT};` : 'border:1px solid rgba(0,0,0,0.1);';

  return `<td align="center" valign="top" width="16.66%" style="padding:4px 3px;">
    <a data-collection-thumb="${index}" href="${href}" style="text-decoration:none;color:inherit;display:block;${activeBorder}border-radius:8px;padding:4px;background:rgba(255,255,255,0.7);">
      <img src="${imgUrl}" width="52" height="68" alt="${name}" style="display:block;width:100%;max-width:52px;height:auto;margin:0 auto;border:0;border-radius:4px;background-color:#f4f4f4;"/>
      <div style="margin-top:4px;font-size:8px;letter-spacing:0.06em;line-height:1.2;${labelCss}">${escHtml(emailUpper(unit.label))}</div>
    </a>
  </td>`;
}

function renderSignatureUnitsPanel(labelCss: string, ctaCss: string): string {
  const slides = EMAIL_SIGNATURE_UNITS.map((unit, i) =>
    renderSignatureHeroSlide(unit, i, labelCss, ctaCss)
  ).join('\n');

  const thumbs = EMAIL_SIGNATURE_UNITS.map((unit, i) => renderSignatureThumb(unit, i, labelCss)).join('\n');

  const carouselControls = `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 8px;border-collapse:collapse;">
    <tr>
      <td width="36" align="left" valign="middle">
        <button type="button" data-collection-prev="signature-units" aria-label="Previous unit" style="display:none;width:32px;height:32px;border:1px solid ${FS_RED_GLOW};border-radius:50%;background:rgba(255,255,255,0.9);color:${FS_RED};font-size:16px;line-height:1;cursor:pointer;box-shadow:0 0 8px ${FS_RED_SOFT};">&lsaquo;</button>
      </td>
      <td align="center" valign="middle" style="font-size:9px;letter-spacing:0.14em;opacity:0.65;${labelCss}">
        <span data-collection-indicator="signature-units">1 / ${EMAIL_SIGNATURE_UNITS.length}</span>
      </td>
      <td width="36" align="right" valign="middle">
        <button type="button" data-collection-next="signature-units" aria-label="Next unit" style="display:none;width:32px;height:32px;border:1px solid ${FS_RED_GLOW};border-radius:50%;background:rgba(255,255,255,0.9);color:${FS_RED};font-size:16px;line-height:1;cursor:pointer;box-shadow:0 0 8px ${FS_RED_SOFT};">&rsaquo;</button>
      </td>
    </tr>
  </table>`;

  const inner = `${renderPanelLabel('SIGNATURE UNITS', labelCss)}
${carouselControls}
<div data-email-collection="signature-units" data-collection-count="${EMAIL_SIGNATURE_UNITS.length}">
${slides}
</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:12px;border-collapse:collapse;">
  <tr>
${thumbs}
  </tr>
</table>`;

  return holographicPanelShell(inner);
}

function renderEssentialCard(tile: EmailEssentialTile, labelCss: string, ctaCss: string): string {
  const href = escHtml(absoluteUrl(tile.href));
  const imgUrl = escHtml(tile.imageUrl);
  const name = escHtml(emailUpper(tile.label));
  const descriptor = escHtml(tile.descriptor);

  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:10px;border-collapse:separate;border-spacing:0;background:rgba(255,255,255,0.55);border:1px solid rgba(235,28,36,0.3);border-radius:10px;box-shadow:inset 0 1px 0 rgba(255,255,255,0.88),0 0 10px rgba(235,28,36,0.08);">
    <tr>
      <td width="72" align="center" valign="middle" style="padding:10px 8px;">
        <img src="${imgUrl}" width="56" height="72" alt="${name}" style="display:block;width:56px;height:auto;border:0;border-radius:6px;background-color:#f4f4f4;"/>
      </td>
      <td valign="middle" style="padding:10px 12px 10px 4px;">
        <div data-email-layer="productPromoLabel" style="margin:0 0 4px;font-size:11px;letter-spacing:0.12em;${labelCss}">${name}</div>
        <div style="margin:0 0 6px;font-size:9px;letter-spacing:0.08em;opacity:0.72;${labelCss}">${descriptor}</div>
        ${renderGlowCta(href, 'SHOP', ctaCss, true)}
      </td>
    </tr>
  </table>`;
}

function renderEssentialsPanel(labelCss: string, ctaCss: string): string {
  const cards = EMAIL_ESSENTIAL_TILES.map((tile) => renderEssentialCard(tile, labelCss, ctaCss)).join('\n');
  const inner = `${renderPanelLabel('EXTENSIONS ESSENTIALS', labelCss)}
<div data-email-collection="essentials">
${cards}
</div>`;
  return holographicPanelShell(inner);
}

function renderCollectionShowcaseStyles(): string {
  return `<style type="text/css">
    .fs-collection-stack td.fs-collection-col {
      display: inline-block;
      width: 100%;
      max-width: 100%;
      vertical-align: top;
    }
    @media only screen and (min-width: 520px) {
      .fs-collection-stack td.fs-collection-col-signature {
        width: 58%;
        max-width: 58%;
        padding-right: 10px !important;
      }
      .fs-collection-stack td.fs-collection-col-essentials {
        width: 42%;
        max-width: 42%;
        padding-left: 6px !important;
      }
    }
    @media only screen and (max-width: 519px) {
      .fs-collection-stack td.fs-collection-col {
        display: block;
        width: 100% !important;
        max-width: 100% !important;
        padding-left: 0 !important;
        padding-right: 0 !important;
      }
      .fs-collection-stack td.fs-collection-col-essentials {
        padding-top: 16px !important;
      }
    }
  </style>`;
}

export function renderEmailProductPromo(input: {
  layoutDebug?: EmailLayoutDebugStore | null;
  copyOverrides?: EmailTemplateCopyOverrides;
}): string {
  const layoutDebug = input.layoutDebug;
  const copy = input.copyOverrides;

  const containerStyle = resolveEmailLayerStyle('productPromo', layoutDebug?.globalLayers);
  const titleStyle = resolveEmailLayerStyle('productPromoTitle', layoutDebug?.globalLayers);
  const labelStyle = resolveEmailLayerStyle('productPromoLabel', layoutDebug?.globalLayers);
  const ctaStyle = resolveEmailLayerStyle('productPromoCta', layoutDebug?.globalLayers);

  const titleRaw = copy?.productPromoTitle ?? EMAIL_PRODUCT_PROMO_TITLE;
  const ctaLabelRaw = copy?.productPromoCtaLabel ?? EMAIL_PRODUCT_PROMO_CTA_LABEL;
  const ctaUrl = absoluteUrl(EMAIL_PRODUCT_PROMO_CTA_PATH);

  const title = escHtml(emailUpper(titleRaw));
  const ctaLabel = escHtml(emailUpper(ctaLabelRaw));
  const labelCss = emailTextStyleCss(labelStyle);
  const titleCss = emailTextStyleCss(titleStyle);
  const ctaCss = emailTextStyleCss(ctaStyle);
  const containerTd = emailTdStyleCss(containerStyle);

  const signaturePanel = renderSignatureUnitsPanel(labelCss, ctaCss);
  const essentialsPanel = renderEssentialsPanel(labelCss, ctaCss);

  return `<tr>
            <td style="border-top:1px solid rgba(0,0,0,0.08);padding:0;">
              <div data-email-layer="productPromo" style="${containerTd}">
                ${renderCollectionShowcaseStyles()}
                <p data-email-copy="productPromoTitle" data-email-layer="productPromoTitle" style="margin:0 0 22px;text-align:center;letter-spacing:0.16em;${titleCss}">${title}</p>
                <table role="presentation" class="fs-collection-stack" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;max-width:540px;margin:0 auto;">
                  <tr>
                    <td class="fs-collection-col fs-collection-col-signature" valign="top" style="padding:0 6px 0 0;">
                      ${signaturePanel}
                    </td>
                    <td class="fs-collection-col fs-collection-col-essentials" valign="top" style="padding:0 0 0 6px;">
                      ${essentialsPanel}
                    </td>
                  </tr>
                </table>
                <p style="margin:26px 0 0;text-align:center;">
                  <a data-email-copy="productPromoCtaLabel" data-email-layer="productPromoCta" href="${escHtml(ctaUrl)}" style="${ctaCss};display:inline-block;padding:12px 28px;letter-spacing:0.14em;text-decoration:none;color:${ctaStyle.color ?? FS_RED};background:rgba(255,255,255,0.92);border:1px solid ${FS_RED_GLOW};border-radius:999px;box-shadow:0 0 12px ${FS_RED_SOFT},inset 0 1px 0 rgba(255,255,255,0.95);">${ctaLabel}</a>
                </p>
              </div>
            </td>
          </tr>`;
}
