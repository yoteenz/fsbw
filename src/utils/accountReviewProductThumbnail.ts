/**
 * Product thumbnails for Account → Reviews and matching admin surfaces (2D mannequin assets).
 */

export function accountReviewProductThumbnailSrc(productName: string): string {
  switch (productName.toUpperCase()) {
    case 'BLANCO':
      return '/assets/2D BLANCO FRONT.png';
    case 'SOFT WAVE':
    case 'BEACH WAVE':
      return '/assets/2D WAVY FRONT.png';
    case 'SOFT CURL':
    case 'OCEAN CURL':
      return '/assets/2D CURLY FRONT.png';
    case 'NOIR':
      return '/assets/natural front.png';
    default:
      return '/assets/natural front.png';
  }
}

/**
 * Map admin/API full product line (e.g. `NOIR 24" RAW RUSSIAN`) to the same keys as Account → Reviews.
 */
export function accountReviewBaseProductKeyFromTitle(title: string): string {
  const u = (title || '').trim().toUpperCase();
  if (!u) return '';
  if (u.includes('GIFT CARD')) return 'GIFT CARD';
  if (u.includes('BEACH WAVE')) return 'BEACH WAVE';
  if (u.includes('SOFT WAVE')) return 'SOFT WAVE';
  if (u.includes('OCEAN CURL')) return 'OCEAN CURL';
  if (u.includes('SOFT CURL')) return 'SOFT CURL';
  if (/\bBLANCO\b/.test(u)) return 'BLANCO';
  if (/\bNOIR\b/.test(u)) return 'NOIR';
  return '';
}

export function accountReviewThumbnailFromProductTitle(title: string): string {
  const key = accountReviewBaseProductKeyFromTitle(title);
  if (key === 'GIFT CARD') return '/assets/gift-card asset.png';
  if (!key) return '/assets/natural front.png';
  return accountReviewProductThumbnailSrc(key);
}

/** `3/28/2026 • 3:27PM` — uses ISO when present, else parses `M/D/YYYY` for a stable noon local time. */
export function formatReviewSubmittedDateTimeLine(iso: string | undefined, legacyDate: string): string {
  const legacy = (legacyDate || '').trim();
  const s = (iso || '').trim();
  let d: Date | null = null;
  if (s) {
    const parsed = new Date(s);
    if (!Number.isNaN(parsed.getTime())) d = parsed;
  }
  if (!d && legacy) {
    const m = legacy.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
    if (m) {
      const tryD = new Date(Number(m[3]), Number(m[1]) - 1, Number(m[2]), 12, 0, 0);
      if (!Number.isNaN(tryD.getTime())) d = tryD;
    }
  }
  if (d) {
    const datePart = d.toLocaleDateString('en-US', { month: 'numeric', day: 'numeric', year: 'numeric' });
    const timeRaw = d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
    const timePart = timeRaw.replace(/\s+/g, '');
    return `${datePart} • ${timePart}`;
  }
  return legacy || '—';
}
