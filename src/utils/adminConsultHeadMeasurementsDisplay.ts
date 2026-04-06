/**
 * Abbreviated head measurement line for admin consult cards: 19" C · 22" FN · 12" EEC · …
 * Abbrs: C, FN, EEC (ear-to-ear over crown), EEF (ear-to-ear across forehead), TT, NN.
 * Keys match `bookingHeadMeasurements` / checkout consult payload.
 */

export type ConsultHeadMeasurementsRecord = Record<string, string | undefined>;

const ORDER: ReadonlyArray<{ key: keyof ConsultHeadMeasurementsRecord | string; abbr: string }> = [
  { key: 'circumference', abbr: 'C' },
  { key: 'frontToNape', abbr: 'FN' },
  { key: 'verticalTempleToTemple', abbr: 'EEC' },
  { key: 'horizontalTempleToTemple', abbr: 'EEF' },
  { key: 'earToEar', abbr: 'TT' },
  { key: 'napeOfNeck', abbr: 'NN' },
];

function trimInches(raw: unknown): string {
  const s = String(raw ?? '').trim().replace(/"/g, '');
  if (!s) return '';
  return s;
}

function withQuote(inches: string): string {
  if (!inches) return '';
  return `${inches}"`;
}

/** Read head measurements from meeting metadata (API, localStorage, mocks). */
export function consultHeadMeasurementsFromMetadata(meta: Record<string, unknown> | null | undefined): ConsultHeadMeasurementsRecord | null {
  if (!meta || typeof meta !== 'object') return null;
  const direct = meta.headMeasurements ?? meta.bookingHeadMeasurements ?? meta.head_measurements;
  if (direct && typeof direct === 'object' && !Array.isArray(direct)) {
    return direct as ConsultHeadMeasurementsRecord;
  }
  return null;
}

/**
 * Returns red line body e.g. `19" C · 22" FN` or null if nothing to show.
 */
export function formatConsultHeadMeasurementsParenLine(meta: Record<string, unknown> | null | undefined): string | null {
  const hm = consultHeadMeasurementsFromMetadata(meta);
  if (!hm) return null;
  const parts: string[] = [];
  for (const { key, abbr } of ORDER) {
    const v = trimInches(hm[key as string]);
    if (!v) continue;
    parts.push(`${withQuote(v)} ${abbr}`);
  }
  if (parts.length === 0) return null;
  return parts.join(' · ');
}
