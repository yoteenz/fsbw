const ENTITY_SUFFIXES = [
  'limited liability company',
  'l.l.c.',
  'llc',
  'l.l.c',
  'incorporated',
  'inc.',
  'inc',
  'corporation',
  'corp.',
  'corp',
  'company',
  'co.',
  'co',
  'limited partnership',
  'l.p.',
  'lp',
  'professional corporation',
  'p.c.',
  'pc',
];

/** Normalize business name for registry lookup only — does not mutate user input. */
export function normalizeBusinessNameForLookup(raw: string): string {
  let value = raw.trim().replace(/\s+/g, ' ');
  if (!value) return '';

  const lower = value.toLowerCase();
  for (const suffix of ENTITY_SUFFIXES) {
    const pattern = new RegExp(`\\s+${suffix.replace(/\./g, '\\.')}$`, 'i');
    if (pattern.test(lower)) {
      value = value.replace(pattern, '').trim();
      break;
    }
  }

  return value
    .replace(/[.,/#!$%^&*;:{}=\-_`~()'"\\]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .toUpperCase();
}

export function buildNameCheckFingerprint(input: {
  businessNameRaw: string;
  formationState: string;
  entityStructure?: string;
}): string {
  return [
    normalizeBusinessNameForLookup(input.businessNameRaw),
    input.formationState.trim().toUpperCase(),
    (input.entityStructure ?? '').trim().toLowerCase(),
  ].join('|');
}
