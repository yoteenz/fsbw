/** Max chars per every-detail-matters row @ 2048×2560 (~38% slot width) — one line, no wrap. */
export const EVERY_DETAIL_MATTERS_MAX_CHARS = 68;

/** No em dashes, en dashes, or hyphenated compounds in client-facing rose rows. */
export function stripEveryDetailMattersDashes(line: string): string {
  return line
    .replace(/\s*[—–]\s*/g, ' ')
    .replace(/(\p{L})-(\p{L})/gu, '$1 $2')
    .replace(/\s+/g, ' ')
    .trim();
}

export function compactEveryDetailMattersLine(line: string): string {
  const normalized = stripEveryDetailMattersDashes(
    line.trim().toUpperCase().replace(/\s+/g, ' ').replace(/[.!?]+$/g, '')
  );
  if (!normalized) return '';
  if (normalized.length <= EVERY_DETAIL_MATTERS_MAX_CHARS) return normalized;

  const forHead = normalized.split(/\s+FOR\s+/)[0]?.trim();
  if (forHead && forHead.length <= EVERY_DETAIL_MATTERS_MAX_CHARS) return forHead;

  const toHead = normalized.split(/\s+TO\s+/)[0]?.trim();
  if (toHead && toHead.length <= EVERY_DETAIL_MATTERS_MAX_CHARS) return toHead;

  const words = normalized.split(' ');
  let out = '';
  for (const word of words) {
    const next = out ? `${out} ${word}` : word;
    if (next.length > EVERY_DETAIL_MATTERS_MAX_CHARS) break;
    out = next;
  }
  if (out) return out;

  return normalized.slice(0, EVERY_DETAIL_MATTERS_MAX_CHARS).trim();
}

export function compactEveryDetailMattersLines(lines: string[]): string[] {
  return lines.map(compactEveryDetailMattersLine).filter(Boolean);
}
