/** Static base-unit fallback when exact color variant is not generated yet. */

export function resolveStaticUnitFallbackUrl(
  productName: string,
  hairline?: string
): string {
  const name = String(productName || 'NOIR')
    .trim()
    .toUpperCase()
    .replace(/\s+/g, ' ');

  if (name === 'NOIR') {
    const hairlineUpper = String(hairline || 'NATURAL').toUpperCase();
    if (hairlineUpper.includes('PEAK')) return '/assets/peak front.png';
    if (hairlineUpper.includes('LAGOS')) return '/assets/lagos front.png';
    return '/assets/natural front.png';
  }

  switch (name) {
    case 'BLANCO':
      return '/assets/2D BLANCO FRONT.png';
    case 'SOFT WAVE':
    case 'BEACH WAVE':
      return '/assets/2D WAVY FRONT.png';
    case 'SOFT CURL':
    case 'OCEAN CURL':
      return '/assets/2D CURLY FRONT.png';
    default:
      return '/assets/natural front.png';
  }
}

export function resolveStaticUnitThumbFallback(productName: string, hairline?: string): string {
  const name = String(productName || 'NOIR').trim().toUpperCase();
  if (name === 'NOIR') {
    const hairlineUpper = String(hairline || 'NATURAL').toUpperCase();
    if (hairlineUpper.includes('PEAK')) return '/assets/noir-peak-thumb.png';
    if (hairlineUpper.includes('LAGOS')) return '/assets/noir-lagos-thumb.png';
    return '/assets/NOIR/noir-thumb.png';
  }
  if (name === 'BLANCO') return '/assets/NOIR/blanco-thumb.png';
  if (name === 'SOFT WAVE' || name === 'BEACH WAVE') return '/assets/NOIR/wave-thumb.png';
  if (name === 'SOFT CURL' || name === 'OCEAN CURL') return '/assets/NOIR/curl-thumb.png';
  return resolveStaticUnitFallbackUrl(productName, hairline);
}
