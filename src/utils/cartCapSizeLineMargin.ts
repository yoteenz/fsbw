/** Margin above gray CAP SIZE line (cart dropdown + shopping bag cards). */
export function cartCapSizeLineMarginTop(item: {
  name?: string;
  density?: string;
  lace?: string;
  texture?: string;
  color?: string;
  hairline?: string;
  styling?: string;
  addOns?: string[];
}): string {
  const isWavyProduct = item.name === 'SOFT WAVE' || item.name === 'BEACH WAVE';
  const isCurlyProduct = item.name === 'SOFT CURL' || item.name === 'OCEAN CURL';
  const defaultTexture = isWavyProduct ? 'WAVY' : isCurlyProduct ? 'CURLY' : 'SILKY';
  const hasSpecs =
    (item.density && item.density !== '200%') ||
    (item.lace && item.lace !== '13X6') ||
    (item.texture && item.texture !== defaultTexture) ||
    (item.color && item.color !== (item.name === 'BLANCO' ? 'PLATINUM' : 'OFF BLACK')) ||
    (item.hairline && item.hairline !== 'NATURAL') ||
    (item.styling && item.styling !== 'NONE') ||
    (item.addOns && item.addOns.length > 0);

  let px = hasSpecs ? 2 : 0;
  if (item.name === 'SOFT WAVE' || item.name === 'SOFT CURL') px += 2;
  if (item.name === 'OCEAN CURL') px += 2;
  px += 2;
  return `${px}px`;
}
