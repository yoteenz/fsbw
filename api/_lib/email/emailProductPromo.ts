import { EMAIL_BRAND, emailAssetUrl, resolveSiteOrigin } from './brandAssets.js';
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
const FS_RED_EDGE = 'rgba(235,28,36,0.28)';
const GLASS_FILL = 'rgba(255,255,255,0.18)';
const ACRYLIC_FRAME = 'rgba(255,255,255,0.38)';

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

const MARBLE_BG = EMAIL_BRAND.marbleBackground;

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

/** Layer 5 — floating metadata chip (independent shadow plane). */
function renderOrbitingChip(text: string, labelCss: string): string {
  return `<span style="display:inline-block;padding:7px 11px;font-size:8px;letter-spacing:0.12em;line-height:1.2;white-space:nowrap;${labelCss};color:#1a1a1a;background:rgba(255,255,255,0.94);border:1px solid rgba(255,255,255,0.98);border-radius:999px;box-shadow:0 10px 22px rgba(0,0,0,0.1),0 0 14px ${FS_RED_SOFT},inset 0 1px 0 rgba(255,255,255,1);">${escHtml(text)}</span>`;
}

/** Layer 6 — floating acrylic capsule CTA. */
function renderFloatingCapsuleCta(href: string, label: string, ctaCss: string, compact = false): string {
  const pad = compact ? '10px 22px' : '14px 32px';
  const fontSize = compact ? '9px' : '10px';
  return `<a href="${escHtml(href)}" style="display:inline-block;padding:${pad};${ctaCss};font-size:${fontSize};letter-spacing:0.16em;text-decoration:none;color:${FS_RED};background:rgba(255,255,255,0.97);border:1px solid ${FS_RED_GLOW};border-radius:999px;box-shadow:0 12px 28px rgba(0,0,0,0.1),0 0 18px ${FS_RED_SOFT},inset 0 1px 0 rgba(255,255,255,1);">${escHtml(label)}</a>`;
}

/**
 * Layers 2–8: marble chamber → acrylic frame → glass inset → floating bust → orbiting chips → CTA → reflections → shadow.
 * Table orbit layout keeps chips email-safe without absolute positioning.
 */
function renderExhibitInstallation(
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
  const marbleUrl = escHtml(MARBLE_BG);

  return `<div data-collection-slide="${index}" data-collection-href="${href}" style="display:${display};">
    <!-- Layer 1: marble environment -->
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:separate;border-spacing:0;background-color:#f8f8f8;background-image:url('${marbleUrl}');background-repeat:repeat;background-size:contain;border-radius:18px;box-shadow:0 22px 48px rgba(0,0,0,0.09),inset 0 1px 0 rgba(255,255,255,0.85);">
      <tr>
        <td align="center" style="padding:18px 8px 20px;">
          <!-- Identity plaque (above exhibit, not under product) -->
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 12px;border-collapse:collapse;">
            <tr>
              <td align="center">
                <div data-email-layer="productPromoLabel" style="margin:0 0 5px;font-size:7px;letter-spacing:0.24em;opacity:0.58;${labelCss}">THE SIGNATURE COLLECTION</div>
                <div data-email-layer="productPromoLabel" style="margin:0 0 3px;font-size:17px;letter-spacing:0.18em;font-weight:600;${labelCss}">${name}</div>
                <div style="margin:0;font-size:8px;letter-spacing:0.2em;opacity:0.68;${labelCss}">${collectionLine}</div>
              </td>
            </tr>
          </table>

          <!-- Layer 2: floating acrylic outer frame -->
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:300px;margin:0 auto;border-collapse:separate;border-spacing:0;background:${ACRYLIC_FRAME};border:1px solid ${FS_RED_EDGE};border-radius:16px;box-shadow:0 0 28px ${FS_RED_SOFT},0 16px 40px rgba(0,0,0,0.11),inset 0 1px 0 rgba(255,255,255,0.92),inset 0 -2px 8px rgba(0,0,0,0.04);">
            <tr>
              <td style="padding:10px 8px 14px;">
                <!-- Chrome highlight strip -->
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 8px;"><tr><td style="height:2px;font-size:0;line-height:0;background:linear-gradient(90deg,transparent 0%,rgba(255,255,255,0.95) 50%,transparent 100%);border-radius:1px;">&nbsp;</td></tr></table>

                <!-- Orbit stage: chips flank floating product (Layer 3–5) -->
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;">
                  <tr>
                    <td width="24%" align="right" valign="middle" style="padding:0 4px 0 0;">
                      ${renderOrbitingChip(unit.length, labelCss)}
                    </td>
                    <td width="52%" rowspan="2" align="center" valign="middle" style="padding:0 2px;">
                      <!-- Layer 3: inner glass panel -->
                      <table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 auto;border-collapse:separate;border-spacing:0;border:1px solid rgba(255,255,255,0.82);border-radius:12px;background:${GLASS_FILL};box-shadow:inset 0 2px 12px rgba(255,255,255,0.65),inset 0 -3px 10px rgba(0,0,0,0.05),0 8px 24px rgba(0,0,0,0.08);">
                        <tr>
                          <td align="center" style="padding:10px 6px 0;overflow:hidden;line-height:0;">
                            <!-- Layer 4: floating editorial bust — clip stand, overlap frame -->
                            <img src="${imgUrl}" width="168" height="220" alt="${name}" style="display:block;width:100%;max-width:168px;height:auto;margin:0 auto -36px;border:0;background:transparent;object-fit:cover;object-position:center top;"/>
                          </td>
                        </tr>
                      </table>
                      <!-- Layer 7: reflection -->
                      <table role="presentation" width="72%" cellpadding="0" cellspacing="0" style="margin:-28px auto 0;border-collapse:collapse;opacity:0.28;">
                        <tr><td style="height:10px;font-size:0;line-height:0;background:linear-gradient(180deg,#bbbbbb 0%,transparent 100%);border-radius:0 0 8px 8px;">&nbsp;</td></tr>
                      </table>
                      <!-- Layer 8: ambient floor shadow -->
                      <table role="presentation" width="64%" cellpadding="0" cellspacing="0" style="margin:4px auto 0;border-collapse:collapse;opacity:0.35;">
                        <tr><td style="height:7px;font-size:0;line-height:0;background:#999999;border-radius:999px;">&nbsp;</td></tr>
                      </table>
                    </td>
                    <td width="24%" align="left" valign="top" style="padding:8px 0 0 4px;">
                      ${renderOrbitingChip(unit.density, labelCss)}
                    </td>
                  </tr>
                  <tr>
                    <td align="right" valign="bottom" style="padding:0 4px 6px 0;">
                      ${renderOrbitingChip(unit.lace, labelCss)}
                    </td>
                    <td align="left" valign="bottom" style="padding:0 0 6px 4px;">
                      ${renderOrbitingChip(unit.origin, labelCss)}
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>

          <!-- Layer 6: CTA on its own floating plane -->
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:16px;border-collapse:collapse;">
            <tr>
              <td align="center">${renderFloatingCapsuleCta(href, 'VIEW UNIT', ctaCss)}</td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </div>`;
}

/** Miniature acrylic collectible — active rises, inactive recedes. */
function renderCollectibleThumb(unit: EmailSignatureUnitTile, index: number, labelCss: string): string {
  const href = escHtml(absoluteUrl(unit.href));
  const imgUrl = escHtml(unit.imageUrl);
  const name = escHtml(emailUpper(unit.label));
  const collectionNo = escHtml(`NO. ${unit.collectionNo}`);
  const isActive = index === 0;
  const activeClass = isActive ? 'collection-thumb-active' : '';
  const padTop = isActive ? '0' : '12px';
  const thumbScale = isActive ? '52' : '44';
  const opacity = isActive ? '1' : '0.42';
  const activeGlow = isActive
    ? `box-shadow:0 0 18px ${FS_RED_SOFT},0 12px 28px rgba(0,0,0,0.12),inset 0 1px 0 rgba(255,255,255,0.95);border:1px solid ${FS_RED};`
    : 'box-shadow:0 4px 12px rgba(0,0,0,0.05),inset 0 1px 0 rgba(255,255,255,0.85);border:1px solid rgba(0,0,0,0.08);';

  return `<td align="center" valign="bottom" width="16.66%" style="padding:0 2px;">
    <a data-collection-thumb="${index}" href="${href}" class="${activeClass}" style="text-decoration:none;color:inherit;display:block;padding-top:${padTop};opacity:${opacity};${activeGlow}border-radius:11px;padding-left:3px;padding-right:3px;padding-bottom:5px;background:${ACRYLIC_FRAME};">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:separate;border-spacing:0;border:1px solid rgba(255,255,255,0.75);border-radius:8px;background:${GLASS_FILL};box-shadow:inset 0 1px 6px rgba(255,255,255,0.5);">
        <tr>
          <td align="center" style="padding:4px 2px 2px;line-height:0;overflow:hidden;">
            <img src="${imgUrl}" width="${thumbScale}" height="58" alt="${name}" style="display:block;width:100%;max-width:${thumbScale}px;height:auto;margin:0 auto -10px;border:0;background:transparent;object-fit:cover;object-position:center top;"/>
          </td>
        </tr>
      </table>
      <div style="margin-top:4px;font-size:5px;letter-spacing:0.14em;line-height:1.2;opacity:0.62;${labelCss}">${collectionNo}</div>
      <div style="margin-top:1px;font-size:6px;letter-spacing:0.08em;line-height:1.2;${labelCss}">${name}</div>
    </a>
  </td>`;
}

function renderSignatureShowroom(labelCss: string, ctaCss: string): string {
  const slides = EMAIL_SIGNATURE_UNITS.map((unit, i) =>
    renderExhibitInstallation(unit, i, labelCss, ctaCss)
  ).join('\n');

  const thumbs = EMAIL_SIGNATURE_UNITS.map((unit, i) => renderCollectibleThumb(unit, i, labelCss)).join('\n');

  const carouselControls = `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 12px;border-collapse:collapse;">
    <tr>
      <td width="36" align="left" valign="middle">
        <button type="button" data-collection-prev="signature-units" aria-label="Previous unit" style="display:none;width:34px;height:34px;border:1px solid ${FS_RED_GLOW};border-radius:50%;background:rgba(255,255,255,0.94);color:${FS_RED};font-size:17px;line-height:1;cursor:pointer;box-shadow:0 0 10px ${FS_RED_SOFT},inset 0 1px 0 rgba(255,255,255,1);">&lsaquo;</button>
      </td>
      <td align="center" valign="middle" style="font-size:7px;letter-spacing:0.2em;opacity:0.5;${labelCss}">
        <span data-collection-indicator="signature-units">1 / ${EMAIL_SIGNATURE_UNITS.length}</span>
      </td>
      <td width="36" align="right" valign="middle">
        <button type="button" data-collection-next="signature-units" aria-label="Next unit" style="display:none;width:34px;height:34px;border:1px solid ${FS_RED_GLOW};border-radius:50%;background:rgba(255,255,255,0.94);color:${FS_RED};font-size:17px;line-height:1;cursor:pointer;box-shadow:0 0 10px ${FS_RED_SOFT},inset 0 1px 0 rgba(255,255,255,1);">&rsaquo;</button>
      </td>
    </tr>
  </table>`;

  return `${carouselControls}
<div data-email-collection="signature-units" data-collection-count="${EMAIL_SIGNATURE_UNITS.length}">
${slides}
</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:18px;border-collapse:collapse;">
  <tr valign="bottom">
${thumbs}
  </tr>
</table>`;
}

/** Extensions — floating acrylic module on marble (complements, does not compete). */
function renderEssentialExhibit(tile: EmailEssentialTile, labelCss: string, ctaCss: string): string {
  const href = escHtml(absoluteUrl(tile.href));
  const imgUrl = escHtml(tile.imageUrl);
  const name = escHtml(emailUpper(tile.label));
  const descriptor = escHtml(tile.descriptor);
  const marbleUrl = escHtml(MARBLE_BG);

  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:14px;border-collapse:separate;border-spacing:0;background-color:#f8f8f8;background-image:url('${marbleUrl}');background-repeat:repeat;background-size:contain;border-radius:14px;box-shadow:0 14px 32px rgba(0,0,0,0.07),inset 0 1px 0 rgba(255,255,255,0.8);">
    <tr>
      <td align="center" style="padding:14px 10px 16px;">
        <table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 auto;border-collapse:separate;border-spacing:0;border:1px solid ${FS_RED_EDGE};border-radius:12px;background:${ACRYLIC_FRAME};box-shadow:0 0 16px ${FS_RED_SOFT},0 10px 24px rgba(0,0,0,0.08),inset 0 1px 0 rgba(255,255,255,0.9);">
          <tr>
            <td align="center" style="padding:12px 16px 6px;line-height:0;">
              <img src="${imgUrl}" width="58" height="74" alt="${name}" style="display:block;width:58px;height:auto;border:0;background:transparent;"/>
            </td>
          </tr>
        </table>
        <table role="presentation" width="56%" cellpadding="0" cellspacing="0" style="margin:2px auto 0;opacity:0.24;"><tr><td style="height:5px;font-size:0;background:#bbb;border-radius:999px;">&nbsp;</td></tr></table>
        <div data-email-layer="productPromoLabel" style="margin:10px 0 3px;font-size:10px;letter-spacing:0.14em;font-weight:600;${labelCss}">${name}</div>
        <div style="margin:0 0 4px;font-size:7px;letter-spacing:0.12em;opacity:0.66;${labelCss}">${descriptor}</div>
        ${renderFloatingCapsuleCta(href, 'SHOP', ctaCss, true)}
      </td>
    </tr>
  </table>`;
}

function renderEssentialsGallery(labelCss: string, ctaCss: string): string {
  const exhibits = EMAIL_ESSENTIAL_TILES.map((tile) => renderEssentialExhibit(tile, labelCss, ctaCss)).join('\n');
  return `<p data-email-layer="productPromoLabel" style="margin:0 0 14px;text-align:center;letter-spacing:0.2em;font-size:8px;opacity:0.62;${labelCss}">EXTENSIONS ESSENTIALS</p>
<div data-email-collection="essentials">
${exhibits}
</div>`;
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
        padding-top: 20px !important;
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

  const signatureShowroom = renderSignatureShowroom(labelCss, ctaCss);
  const essentialsGallery = renderEssentialsGallery(labelCss, ctaCss);

  return `<tr>
            <td style="border-top:1px solid rgba(0,0,0,0.05);padding:0;">
              <div data-email-layer="productPromo" style="${containerTd}">
                ${renderCollectionShowcaseStyles()}
                <p data-email-copy="productPromoTitle" data-email-layer="productPromoTitle" style="margin:0 0 6px;text-align:center;letter-spacing:0.22em;${titleCss}">${title}</p>
                <p data-email-layer="productPromoLabel" style="margin:0 0 28px;text-align:center;font-size:7px;letter-spacing:0.2em;opacity:0.52;${labelCss}">FRONTAL SLAYER FLAGSHIP SHOWROOM</p>
                <table role="presentation" class="fs-collection-stack" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;max-width:540px;margin:0 auto;">
                  <tr>
                    <td class="fs-collection-col fs-collection-col-signature" valign="top" style="padding:0 6px 0 0;">
                      ${signatureShowroom}
                    </td>
                    <td class="fs-collection-col fs-collection-col-essentials" valign="top" style="padding:0 0 0 6px;">
                      ${essentialsGallery}
                    </td>
                  </tr>
                </table>
                <p style="margin:32px 0 0;text-align:center;">
                  <a data-email-copy="productPromoCtaLabel" data-email-layer="productPromoCta" href="${escHtml(ctaUrl)}" style="${ctaCss};display:inline-block;padding:14px 34px;letter-spacing:0.16em;text-decoration:none;color:${ctaStyle.color ?? FS_RED};background:rgba(255,255,255,0.97);border:1px solid ${FS_RED_GLOW};border-radius:999px;box-shadow:0 14px 32px rgba(0,0,0,0.1),0 0 18px ${FS_RED_SOFT},inset 0 1px 0 rgba(255,255,255,1);">${ctaLabel}</a>
                </p>
              </div>
            </td>
          </tr>`;
}
