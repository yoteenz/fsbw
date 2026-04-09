/**
 * Product thumbnail for admin review UIs — matches wishlist / cart unit resolution by product title.
 */

export function adminReviewProductThumbSrcFromTitle(productTitle: string): string {
  const raw = (productTitle || '').trim().toUpperCase();
  if (!raw) return '/assets/NOIR/noir-thumb.png';
  if (raw.includes('GIFT CARD')) return '/assets/gift-card asset.png';
  if (raw.includes('SLAY') && raw.includes('STYLING')) return '/assets/neon-tools.png';
  if (raw.includes('WIG CARE')) return '/assets/wig-brush.png';

  const isNoir = /^\s*NOIR\b/.test(raw) || /\bNOIR\b/.test(raw);
  if (isNoir || raw.startsWith('NOIR')) {
    if (raw.includes('PEAK')) return '/assets/noir-peak-thumb.png';
    if (raw.includes('LAGOS')) return '/assets/noir-lagos-thumb.png';
    return '/assets/NOIR/noir-thumb.png';
  }
  if (/^\s*BLANCO\b/.test(raw) || raw.startsWith('BLANCO')) return '/assets/NOIR/blanco-thumb.png';
  if (raw.includes('BEACH WAVE')) return '/assets/NOIR/wave-thumb.png';
  if (raw.includes('SOFT WAVE')) return '/assets/NOIR/wave-thumb.png';
  if (raw.includes('OCEAN CURL') || raw.includes('SOFT CURL')) return '/assets/NOIR/curl-thumb.png';
  return '/assets/NOIR/noir-thumb.png';
}

/** Pending / admin review modal: `3/28/2026 • 3:27PM` when ISO known; else legacy date-only string. */
export function formatAdminReviewSubmittedAtLine(iso: string | undefined, legacyDate: string): string {
  const legacy = (legacyDate || '').trim();
  const s = (iso || '').trim();
  if (s) {
    const d = new Date(s);
    if (!Number.isNaN(d.getTime())) {
      const datePart = d.toLocaleDateString('en-US', { month: 'numeric', day: 'numeric', year: 'numeric' });
      const timeRaw = d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
      const timePart = timeRaw.replace(/\s+/g, '');
      return `${datePart} • ${timePart}`;
    }
  }
  return legacy || '—';
}
