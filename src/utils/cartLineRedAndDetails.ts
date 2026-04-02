/**
 * Collapsed red subtitle for BCF (`shop-texture-category`) + booking (A/C) lines in cart dropdown,
 * bag, and checkout strip — full specs live under VIEW DETAILS (like unit wigs).
 */

export const CART_RED_LINE_BCF_BOOKING = 'RAW HUMAN HAIR';

function esc(s: string): string {
  return String(s || '')
    .toUpperCase()
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

const APPOINTMENT_ADDON_LABELS: Record<string, string> = {
  braids: 'BRAIDS',
  'brow-clean': 'BROW SCULPTING',
  'brow-tint': 'BROW TINT',
  'mink-lashes': 'MINK LASHES',
  makeup: 'MAKEUP',
  'clean-lace': 'CLEAN LACE',
  travel: 'TRAVEL FEE'
};

/** HTML (uppercase lines, `<br/>`) for booking consult / appointment VIEW DETAILS. */
export function bookingCartViewDetailsHtml(item: {
  type?: string;
  bookingBagSubtitle?: string;
  bookingHairOption?: string;
  bookingNotes?: string;
  bookingInspoFileName?: string;
  bookingInspoFileNames?: string[];
  bookingInstallKind?: string;
  bookingStyle?: string;
  bookingPartDirection?: string;
  bookingAddonIds?: string[];
  bookingMakeupSkinTone?: string;
  bookingMinkLashVolume?: string;
  bookingNewInstallUnitJson?: string;
  bookingAttachedOrderId?: string;
  bookingAttachedOrderSummary?: string;
  bookingPreferredDate?: string;
  bookingPreferredTime?: string;
  bookingTier?: string;
}): string {
  const lines: string[] = [];
  if (item.bookingBagSubtitle) lines.push(esc(item.bookingBagSubtitle));
  if (item.type === 'booking-consult') {
    if (item.bookingHairOption) lines.push(`OPTION: ${esc(item.bookingHairOption)}`);
    if (item.bookingNotes) lines.push(`NOTES: ${esc(item.bookingNotes)}`);
    if (Array.isArray(item.bookingInspoFileNames) && item.bookingInspoFileNames.length > 0) {
      for (const n of item.bookingInspoFileNames) {
        lines.push(`INSPO FILE: ${esc(String(n))}`);
      }
    } else if (item.bookingInspoFileName) {
      lines.push(`INSPO FILE: ${esc(item.bookingInspoFileName)}`);
    }
    if (item.bookingPreferredDate) lines.push(`DATE: ${esc(item.bookingPreferredDate)}`);
    if (item.bookingPreferredTime) lines.push(`TIME: ${esc(item.bookingPreferredTime)}`);
  }
  if (item.type === 'booking-appointment') {
    if (item.bookingInstallKind) {
      lines.push(`SERVICE: ${esc(String(item.bookingInstallKind).replace(/_/g, ' '))}`);
    }
    if (item.bookingStyle) lines.push(`STYLE: ${esc(item.bookingStyle)}`);
    if (item.bookingPartDirection) lines.push(`PART: ${esc(item.bookingPartDirection)}`);
    if (item.bookingNotes) lines.push(`NOTES: ${esc(item.bookingNotes)}`);
    if (Array.isArray(item.bookingInspoFileNames) && item.bookingInspoFileNames.length > 0) {
      for (const n of item.bookingInspoFileNames) {
        lines.push(`INSPO FILE: ${esc(String(n))}`);
      }
    } else if (item.bookingInspoFileName) {
      lines.push(`INSPO FILE: ${esc(item.bookingInspoFileName)}`);
    }
    if (Array.isArray(item.bookingAddonIds) && item.bookingAddonIds.length > 0) {
      const labels = item.bookingAddonIds.map(
        (id) => APPOINTMENT_ADDON_LABELS[id] || String(id).toUpperCase()
      );
      lines.push(`ADD-ONS: ${esc(labels.join(', '))}`);
    }
    if (item.bookingMakeupSkinTone) {
      lines.push(`MAKEUP SHADE: ${esc(item.bookingMakeupSkinTone)}`);
    }
    if (item.bookingMinkLashVolume) {
      lines.push(`MINK VOLUME: ${esc(item.bookingMinkLashVolume)}`);
    }
    if (item.bookingNewInstallUnitJson) {
      try {
        const u = JSON.parse(item.bookingNewInstallUnitJson) as { name?: string; productName?: string; price?: number };
        const nm = u?.productName || u?.name || 'CUSTOM UNIT';
        const pr = typeof u?.price === 'number' ? ` — $${u.price}` : '';
        lines.push(`APPOINTMENT UNIT: ${esc(String(nm))}${esc(pr)}`);
      } catch {
        lines.push('APPOINTMENT UNIT: (CUSTOM BUILD)');
      }
    }
    if (item.bookingAttachedOrderSummary) {
      lines.push(`ATTACHED ORDER: ${esc(item.bookingAttachedOrderSummary)}`);
    } else if (item.bookingAttachedOrderId) {
      lines.push(`ATTACHED ORDER ID: ${esc(item.bookingAttachedOrderId)}`);
    }
    if (item.bookingPreferredDate) lines.push(`DATE: ${esc(item.bookingPreferredDate)}`);
    if (item.bookingPreferredTime) lines.push(`TIME: ${esc(item.bookingPreferredTime)}`);
  }
  if (item.bookingTier === 'premium') lines.push('TIER: PREMIUM');
  return lines.join('<br/>') || 'BOOKING DETAILS';
}

/** HTML for BCF shop line VIEW DETAILS. */
export function bcfCartViewDetailsHtml(item: {
  texture?: string;
  hairOrigin?: string;
  length?: string;
  color?: string;
  lace?: string;
  bcfBundleDeal?: boolean;
  quantity?: number;
}): string {
  const lines: string[] = [];
  if (item.texture) lines.push(`TEXTURE: ${esc(item.texture)}`);
  if (item.hairOrigin) lines.push(`ORIGIN: ${esc(item.hairOrigin)}`);
  if (item.length) lines.push(`LENGTH: ${esc(item.length)}`);
  if (item.color) lines.push(`COLOR: ${esc(item.color)}`);
  if (item.lace) lines.push(`LACE: ${esc(item.lace)}`);
  if (item.bcfBundleDeal) {
    const q = item.quantity ?? 3;
    lines.push(`BUNDLE DEAL: ${q} LINES`);
  }
  return lines.join('<br/>') || 'PRODUCT DETAILS';
}
