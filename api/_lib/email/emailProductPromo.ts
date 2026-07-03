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

/** BCF transparent cutouts — same public URLs as home/shop grid (`shopTextureCategoryThumb.ts`). */
const BCF_THUMB_SRC = {
  bundles:
    'https://hyycomvcaqxxvyrfupes.supabase.co/storage/v1/object/public/live-preview/BCF/image%20(43).png',
  closures:
    'https://hyycomvcaqxxvyrfupes.supabase.co/storage/v1/object/public/live-preview/BCF/image%20(46).png',
  frontals:
    'https://hyycomvcaqxxvyrfupes.supabase.co/storage/v1/object/public/live-preview/BCF/image%20(49).png',
} as const;

/** Canonical 3×3 cross-promo grid: six wig units + bundles, closures, frontals. */
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

function renderPromoTile(
  tile: EmailProductPromoTile,
  labelStyleCss: string
): string {
  const imgUrl = escHtml(tile.imageUrl);
  const href = escHtml(absoluteUrl(tile.href));
  const label = escHtml(tile.label);
  return `<td align="center" valign="top" width="33.33%" style="padding:10px 8px 4px;">
    <a href="${href}" style="text-decoration:none;color:inherit;display:block;">
      <img src="${imgUrl}" width="168" height="224" alt="${label}" style="display:block;width:100%;max-width:168px;height:auto;margin:0 auto;border:0;background-color:#f7f7f7;"/>
      <div data-email-layer="productPromoLabel" style="margin-top:10px;${labelStyleCss};text-decoration:underline;">${label}</div>
    </a>
  </td>`;
}

function chunkTiles<T>(items: T[], size: number): T[][] {
  const rows: T[][] = [];
  for (let i = 0; i < items.length; i += size) rows.push(items.slice(i, i + size));
  return rows;
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

  const gridRows = chunkTiles(EMAIL_PRODUCT_PROMO_TILES, 3)
    .map(
      (row) => `<tr>
${row.map((tile) => renderPromoTile(tile, labelCss)).join('\n')}
</tr>`
    )
    .join('\n');

  return `<tr>
            <td style="border-top:1px solid rgba(0,0,0,0.08);padding:0;">
              <div data-email-layer="productPromo" style="${containerTd}">
                <p data-email-copy="productPromoTitle" data-email-layer="productPromoTitle" style="margin:0 0 20px;${titleCss}">${title}</p>
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;max-width:540px;margin:0 auto;">
${gridRows}
                </table>
                <p style="margin:24px 0 0;text-align:center;">
                  <a data-email-copy="productPromoCtaLabel" data-email-layer="productPromoCta" href="${escHtml(ctaUrl)}" style="${ctaCss};text-decoration:underline;color:${ctaStyle.color ?? '#111111'};">${ctaLabel}</a>
                </p>
              </div>
            </td>
          </tr>`;
}
