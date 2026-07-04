import { emailAssetUrl, resolveSiteOrigin } from './brandAssets.js';
import {
  emailTdStyleCss,
  emailTextStyleCss,
  resolveEmailLayerStyle,
  type EmailLayoutDebugStore,
  type EmailTemplateCopyOverrides,
} from './emailLayoutConfig.js';
import { emailUpper } from './emailTypography.js';

export const EMAIL_PRODUCT_PROMO_TITLE = 'The Signature Collection';
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
  origin: string;
  collectionNo: string;
};

export type EmailEssentialTile = EmailProductPromoTile & {
  descriptor: string;
};

const FS_RED = '#EB1C24';
const FS_RED_GLOW = 'rgba(235,28,36,0.42)';
const FS_RED_SOFT = 'rgba(235,28,36,0.16)';
const FS_RED_EDGE = 'rgba(235,28,36,0.22)';
const ACRYLIC_BG = 'rgba(255,255,255,0.82)';
const ACRYLIC_BORDER = 'rgba(255,255,255,0.96)';
const CHROME = 'rgba(180,180,180,0.35)';

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

const COLLECTION_NUMBERS: Record<string, string> = {
  Noir: '001',
  Blanco: '002',
  'Soft Wave': '003',
  'Beach Wave': '004',
  'Soft Curl': '005',
  'Ocean Curl': '006',
};

const SIGNATURE_UNIT_SPECS: Record<
  string,
  Pick<EmailSignatureUnitTile, 'length' | 'density' | 'lace' | 'origin'>
> = {
  Noir: { length: '24"', density: '200%', lace: '13×6 HD', origin: 'RAW CAMBODIAN' },
  Blanco: { length: '24"', density: '250%', lace: '13×6 HD', origin: 'RAW CAMBODIAN' },
  'Soft Wave': { length: '24"', density: '200%', lace: '13×6 HD', origin: 'RAW CAMBODIAN' },
  'Beach Wave': { length: '24"', density: '200%', lace: '13×6 HD', origin: 'RAW CAMBODIAN' },
  'Soft Curl': { length: '24"', density: '200%', lace: '13×6 HD', origin: 'RAW CAMBODIAN' },
  'Ocean Curl': { length: '24"', density: '200%', lace: '13×6 HD', origin: 'RAW CAMBODIAN' },
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
    collectionNo: COLLECTION_NUMBERS[tile.label] ?? '000',
  })
);

export const EMAIL_ESSENTIAL_TILES: EmailEssentialTile[] = EMAIL_PRODUCT_PROMO_TILES.slice(6).map((tile) => ({
  ...tile,
  descriptor: ESSENTIAL_DESCRIPTORS[tile.label] ?? tile.label.toUpperCase(),
}));

/** Layered acrylic exhibition panel — email-safe shadows and borders. */
function acrylicExhibitionShell(inner: string): string {
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:separate;border-spacing:0;background:${ACRYLIC_BG};border:1px solid ${FS_RED_EDGE};border-radius:16px;box-shadow:0 0 22px ${FS_RED_SOFT},0 14px 36px rgba(0,0,0,0.05),inset 0 1px 0 ${ACRYLIC_BORDER},inset 0 -1px 0 ${CHROME};">
  <tr>
    <td style="padding:3px 14px 0;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td style="height:2px;font-size:0;line-height:0;background:rgba(255,255,255,0.95);border-radius:1px;">&nbsp;</td></tr></table>
    </td>
  </tr>
  <tr>
    <td style="padding:12px 12px 16px;">
      ${inner}
    </td>
  </tr>
</table>`;
}

function renderPanelEyebrow(text: string, labelCss: string): string {
  return `<p data-email-layer="productPromoLabel" style="margin:0 0 16px;text-align:center;letter-spacing:0.2em;font-size:8px;opacity:0.62;${labelCss}">${escHtml(text)}</p>`;
}

function renderAcrylicChip(text: string, labelCss: string): string {
  return `<td align="center" valign="middle" style="padding:4px 3px;">
    <span style="display:inline-block;padding:7px 11px;font-size:9px;letter-spacing:0.1em;white-space:nowrap;${labelCss};color:#1a1a1a;background:rgba(255,255,255,0.94);border:1px solid rgba(255,255,255,0.98);border-radius:999px;box-shadow:0 1px 0 rgba(255,255,255,1),0 4px 14px rgba(0,0,0,0.05),inset 0 1px 0 rgba(255,255,255,1),0 0 0 1px rgba(235,28,36,0.1);">${escHtml(text)}</span>
  </td>`;
}

function renderSpecChipGrid(unit: EmailSignatureUnitTile, labelCss: string): string {
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:260px;margin:14px auto 0;border-collapse:collapse;">
    <tr>
      ${renderAcrylicChip(unit.length, labelCss)}
      ${renderAcrylicChip(unit.density, labelCss)}
    </tr>
    <tr>
      ${renderAcrylicChip(unit.lace, labelCss)}
      ${renderAcrylicChip(unit.origin, labelCss)}
    </tr>
  </table>`;
}

function renderLuxuryCapsuleCta(href: string, label: string, ctaCss: string, compact = false): string {
  const pad = compact ? '10px 20px' : '13px 28px';
  const fontSize = compact ? '9px' : '10px';
  return `<a href="${escHtml(href)}" style="display:inline-block;margin-top:14px;padding:${pad};${ctaCss};font-size:${fontSize};letter-spacing:0.14em;text-decoration:none;color:${FS_RED};background:rgba(255,255,255,0.96);border:1px solid ${FS_RED_GLOW};border-radius:999px;box-shadow:0 0 14px ${FS_RED_SOFT},0 6px 18px rgba(0,0,0,0.06),inset 0 1px 0 rgba(255,255,255,1),inset 0 -1px 0 rgba(235,28,36,0.08);">${escHtml(label)}</a>`;
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
  const collectionLine = escHtml(`COLLECTION NO. ${unit.collectionNo}`);
  const display = index === 0 ? 'block' : 'none';

  return `<div data-collection-slide="${index}" data-collection-href="${href}" style="display:${display};">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:separate;border-spacing:0;background:rgba(255,255,255,0.88);border:1px solid ${FS_RED_EDGE};border-radius:14px;box-shadow:0 0 26px ${FS_RED_SOFT},0 10px 32px rgba(0,0,0,0.06),inset 0 1px 0 rgba(255,255,255,0.98);">
      <tr>
        <td align="center" style="padding:14px 12px 6px;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:separate;border-spacing:0;background-color:#fafafa;border-radius:12px;border:1px solid rgba(255,255,255,0.92);box-shadow:inset 0 2px 10px rgba(0,0,0,0.04),0 0 24px rgba(255,255,255,0.85);">
            <tr>
              <td align="center" style="padding:16px 10px 10px;">
                <table role="presentation" cellpadding="0" cellspacing="0" style="border-collapse:separate;border-spacing:0;border:1px solid rgba(235,28,36,0.14);border-radius:10px;background:rgba(255,255,255,0.72);box-shadow:0 6px 20px rgba(0,0,0,0.06),inset 0 1px 0 rgba(255,255,255,1),0 0 16px rgba(235,28,36,0.06);">
                  <tr>
                    <td style="padding:10px 8px;">
                      <img src="${imgUrl}" width="210" height="272" alt="${name}" style="display:block;width:100%;max-width:210px;height:auto;margin:0 auto;border:0;background-color:#f6f6f6;border-radius:6px;"/>
                    </td>
                  </tr>
                </table>
                <table role="presentation" width="62%" cellpadding="0" cellspacing="0" style="margin:6px auto 0;border-collapse:collapse;opacity:0.22;">
                  <tr><td style="height:6px;font-size:0;line-height:0;background:#cccccc;border-radius:0 0 6px 6px;">&nbsp;</td></tr>
                </table>
              </td>
            </tr>
          </table>
        </td>
      </tr>
      <tr>
        <td align="center" style="padding:6px 14px 18px;">
          <div data-email-layer="productPromoLabel" style="margin:0 0 6px;font-size:8px;letter-spacing:0.22em;opacity:0.58;${labelCss}">THE SIGNATURE COLLECTION</div>
          <div data-email-layer="productPromoLabel" style="margin:0 0 4px;font-size:16px;letter-spacing:0.16em;font-weight:600;${labelCss}">${name}</div>
          <div style="margin:0 0 2px;font-size:9px;letter-spacing:0.18em;opacity:0.72;${labelCss}">${collectionLine}</div>
          ${renderSpecChipGrid(unit, labelCss)}
          ${renderLuxuryCapsuleCta(href, 'VIEW UNIT', ctaCss)}
        </td>
      </tr>
    </table>
  </div>`;
}

function renderSignatureThumb(unit: EmailSignatureUnitTile, index: number, labelCss: string): string {
  const href = escHtml(absoluteUrl(unit.href));
  const imgUrl = escHtml(unit.imageUrl);
  const name = escHtml(emailUpper(unit.label));
  const collectionNo = escHtml(`NO. ${unit.collectionNo}`);
  const isActive = index === 0;
  const activeClass = isActive ? ' collection-thumb-active' : '';
  const inactiveOpacity = isActive ? '1' : '0.48';
  const activeBorder = isActive
    ? `border:1px solid ${FS_RED};box-shadow:0 0 14px ${FS_RED_SOFT},0 8px 22px rgba(0,0,0,0.08),inset 0 1px 0 rgba(255,255,255,0.95);`
    : 'border:1px solid rgba(0,0,0,0.08);box-shadow:0 2px 8px rgba(0,0,0,0.03),inset 0 1px 0 rgba(255,255,255,0.88);';

  return `<td align="center" valign="top" width="16.66%" style="padding:5px 3px;">
    <a data-collection-thumb="${index}" href="${href}" class="${activeClass.trim()}" style="text-decoration:none;color:inherit;display:block;opacity:${inactiveOpacity};${activeBorder}border-radius:10px;padding:5px 4px 6px;background:rgba(255,255,255,0.78);">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:separate;border-spacing:0;background-color:#f8f8f8;border-radius:7px;border:1px solid rgba(255,255,255,0.9);box-shadow:inset 0 1px 4px rgba(0,0,0,0.04);">
        <tr>
          <td align="center" style="padding:5px 3px 4px;">
            <img src="${imgUrl}" width="48" height="62" alt="${name}" style="display:block;width:100%;max-width:48px;height:auto;margin:0 auto;border:0;border-radius:4px;background-color:#f0f0f0;"/>
          </td>
        </tr>
      </table>
      <div style="margin-top:5px;font-size:6px;letter-spacing:0.12em;line-height:1.2;opacity:0.65;${labelCss}">${collectionNo}</div>
      <div style="margin-top:2px;font-size:7px;letter-spacing:0.08em;line-height:1.2;${labelCss}">${name}</div>
    </a>
  </td>`;
}

function renderSignatureUnitsPanel(labelCss: string, ctaCss: string): string {
  const slides = EMAIL_SIGNATURE_UNITS.map((unit, i) =>
    renderSignatureHeroSlide(unit, i, labelCss, ctaCss)
  ).join('\n');

  const thumbs = EMAIL_SIGNATURE_UNITS.map((unit, i) => renderSignatureThumb(unit, i, labelCss)).join('\n');

  const carouselControls = `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 10px;border-collapse:collapse;">
    <tr>
      <td width="36" align="left" valign="middle">
        <button type="button" data-collection-prev="signature-units" aria-label="Previous unit" style="display:none;width:34px;height:34px;border:1px solid ${FS_RED_GLOW};border-radius:50%;background:rgba(255,255,255,0.94);color:${FS_RED};font-size:17px;line-height:1;cursor:pointer;box-shadow:0 0 10px ${FS_RED_SOFT},inset 0 1px 0 rgba(255,255,255,1);">&lsaquo;</button>
      </td>
      <td align="center" valign="middle" style="font-size:8px;letter-spacing:0.18em;opacity:0.55;${labelCss}">
        <span data-collection-indicator="signature-units">1 / ${EMAIL_SIGNATURE_UNITS.length}</span>
      </td>
      <td width="36" align="right" valign="middle">
        <button type="button" data-collection-next="signature-units" aria-label="Next unit" style="display:none;width:34px;height:34px;border:1px solid ${FS_RED_GLOW};border-radius:50%;background:rgba(255,255,255,0.94);color:${FS_RED};font-size:17px;line-height:1;cursor:pointer;box-shadow:0 0 10px ${FS_RED_SOFT},inset 0 1px 0 rgba(255,255,255,1);">&rsaquo;</button>
      </td>
    </tr>
  </table>`;

  const inner = `${renderPanelEyebrow('FLAGSHIP EXHIBITION', labelCss)}
${carouselControls}
<div data-email-collection="signature-units" data-collection-count="${EMAIL_SIGNATURE_UNITS.length}">
${slides}
</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:14px;border-collapse:collapse;">
  <tr>
${thumbs}
  </tr>
</table>`;

  return acrylicExhibitionShell(inner);
}

function renderEssentialShowcase(tile: EmailEssentialTile, labelCss: string, ctaCss: string): string {
  const href = escHtml(absoluteUrl(tile.href));
  const imgUrl = escHtml(tile.imageUrl);
  const name = escHtml(emailUpper(tile.label));
  const descriptor = escHtml(tile.descriptor);

  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:12px;border-collapse:separate;border-spacing:0;background:rgba(255,255,255,0.72);border:1px solid ${FS_RED_EDGE};border-radius:12px;box-shadow:0 0 16px ${FS_RED_SOFT},0 8px 24px rgba(0,0,0,0.04),inset 0 1px 0 rgba(255,255,255,0.94);">
    <tr>
      <td align="center" style="padding:14px 12px 16px;">
        <table role="presentation" cellpadding="0" cellspacing="0" style="border-collapse:separate;border-spacing:0;background-color:#fafafa;border-radius:9px;border:1px solid rgba(255,255,255,0.92);box-shadow:inset 0 2px 8px rgba(0,0,0,0.03);">
          <tr>
            <td align="center" style="padding:10px 14px 8px;">
              <img src="${imgUrl}" width="64" height="82" alt="${name}" style="display:block;width:64px;height:auto;border:0;border-radius:6px;background-color:#f4f4f4;"/>
            </td>
          </tr>
        </table>
        <div data-email-layer="productPromoLabel" style="margin:10px 0 4px;font-size:11px;letter-spacing:0.14em;font-weight:600;${labelCss}">${name}</div>
        <div style="margin:0 0 2px;font-size:8px;letter-spacing:0.1em;opacity:0.68;${labelCss}">${descriptor}</div>
        ${renderLuxuryCapsuleCta(href, 'SHOP', ctaCss, true)}
      </td>
    </tr>
  </table>`;
}

function renderEssentialsPanel(labelCss: string, ctaCss: string): string {
  const cards = EMAIL_ESSENTIAL_TILES.map((tile) => renderEssentialShowcase(tile, labelCss, ctaCss)).join('\n');
  const inner = `${renderPanelEyebrow('EXTENSIONS ESSENTIALS', labelCss)}
<div data-email-collection="essentials">
${cards}
</div>`;
  return acrylicExhibitionShell(inner);
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
            <td style="border-top:1px solid rgba(0,0,0,0.06);padding:0;">
              <div data-email-layer="productPromo" style="${containerTd}">
                ${renderCollectionShowcaseStyles()}
                <p data-email-copy="productPromoTitle" data-email-layer="productPromoTitle" style="margin:0 0 6px;text-align:center;letter-spacing:0.2em;${titleCss}">${title}</p>
                <p data-email-layer="productPromoLabel" style="margin:0 0 24px;text-align:center;font-size:8px;letter-spacing:0.18em;opacity:0.55;${labelCss}">FRONTAL SLAYER FLAGSHIP UNITS</p>
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
                <p style="margin:28px 0 0;text-align:center;">
                  <a data-email-copy="productPromoCtaLabel" data-email-layer="productPromoCta" href="${escHtml(ctaUrl)}" style="${ctaCss};display:inline-block;padding:13px 32px;letter-spacing:0.16em;text-decoration:none;color:${ctaStyle.color ?? FS_RED};background:rgba(255,255,255,0.96);border:1px solid ${FS_RED_GLOW};border-radius:999px;box-shadow:0 0 16px ${FS_RED_SOFT},0 8px 22px rgba(0,0,0,0.06),inset 0 1px 0 rgba(255,255,255,1);">${ctaLabel}</a>
                </p>
              </div>
            </td>
          </tr>`;
}
