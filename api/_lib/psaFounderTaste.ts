/**
 * Founder Taste Engine — structured conviction picks per catalog unit.
 * Luxury brands sell taste, not spec sheets. PSA uses this for "MY PERSONAL PICK" energy.
 */
export type PsaFounderTasteEntry = {
  unitId: string;
  unitName: string;
  confidence: number;
  personalPick: string;
  notes: string[];
  whenToSteerAway?: string;
};

export const PSA_FOUNDER_TASTE: PsaFounderTasteEntry[] = [
  {
    unitId: 'noir',
    unitName: 'NOIR',
    confidence: 10,
    personalPick:
      'If I had to send one unit to a first-time Slayer who wants everyday luxury straight hair, I would pick NOIR.',
    notes: [
      'Most versatile straight texture in our line',
      'Best everyday luxury straight option',
      'Usually my recommendation for first-time custom unit buyers',
      'Sleek without helmet-stiff when density is right',
    ],
    whenToSteerAway: 'If they want a softer, lighter straight line every day, BLANCO may fit better.',
  },
  {
    unitId: 'blanco',
    unitName: 'BLANCO',
    confidence: 9,
    personalPick:
      'BLANCO is my pick when someone wants that soft straight, lighter-line energy without fighting the hair daily.',
    notes: [
      'Softer straight aesthetic than NOIR',
      'Worth the base step if that lighter line is their everyday vibe',
      'Great for low-drama straight wear',
    ],
    whenToSteerAway: 'If budget is tight and they want maximum versatility, NOIR still slays.',
  },
  {
    unitId: 'soft-wave',
    unitName: 'SOFT WAVE',
    confidence: 8,
    personalPick:
      'Between our wavy units, SOFT WAVE is my balanced pick for office-to-dinner versatility.',
    notes: [
      'Polished wave pattern with less daily fight than tighter curls',
      'Strong middle ground for beginners who want movement',
    ],
    whenToSteerAway: 'If they want more beachy body, BEACH WAVE usually wins.',
  },
  {
    unitId: 'beach-wave',
    unitName: 'BEACH WAVE',
    confidence: 9,
    personalPick:
      'If they are between SOFT WAVE and BEACH WAVE for everyday versatility, I lean BEACH WAVE. More body, still low drama.',
    notes: [
      'More body than SOFT WAVE',
      'Holds a curl better for humid or event-heavy weeks',
      'Strong pick for Miami-style heat and humidity',
    ],
    whenToSteerAway: 'If they hate any wave maintenance, steer to straight units instead.',
  },
  {
    unitId: 'soft-curl',
    unitName: 'SOFT CURL',
    confidence: 8,
    personalPick: 'SOFT CURL is my pick when they want curl pattern without full glam maintenance every morning.',
    notes: [
      'Defined but wearable curl',
      'Less aggressive than OCEAN CURL for everyday rotation',
    ],
    whenToSteerAway: 'If they want maximum curl drama for events, look at OCEAN CURL.',
  },
  {
    unitId: 'ocean-curl',
    unitName: 'OCEAN CURL',
    confidence: 7,
    personalPick:
      'OCEAN CURL is gorgeous when they are honest about maintenance. I would not pick it for a low-effort daily rotation.',
    notes: [
      'Highest maintenance energy in our curly line',
      'Best when they want statement curl and will protect the style',
    ],
    whenToSteerAway:
      'If they hate daily styling or humid-weather fight, say so clearly and point to SOFT CURL or a wave unit.',
  },
];

const GLOBAL_TASTE_RULES = [
  '200% density is the sweet spot for most Slayers. Higher is not always more luxury.',
  'If they hate daily styling, steer away from high-maintenance textures every time.',
  'If they already have a solid rotation unit, tell them to skip a duplicate purchase.',
  'When you disagree with a choice (e.g. 250% density, wrong texture for lifestyle), say so directly with one clear reason.',
];

export function searchFounderTaste(query: string, limit = 3): PsaFounderTasteEntry[] {
  const q = query.toLowerCase().trim();
  if (!q) return PSA_FOUNDER_TASTE.slice(0, limit);

  const scored = PSA_FOUNDER_TASTE.map((entry) => {
    let score = 0;
    const blob = `${entry.unitId} ${entry.unitName} ${entry.personalPick} ${entry.notes.join(' ')}`.toLowerCase();
    if (entry.unitId.includes(q) || entry.unitName.toLowerCase().includes(q)) score += 10;
    for (const word of q.split(/\s+/)) {
      if (word.length < 3) continue;
      if (blob.includes(word)) score += 2;
    }
    return { entry, score };
  })
    .filter((r) => r.score > 0)
    .sort((a, b) => b.score - a.score || b.entry.confidence - a.entry.confidence);

  return (scored.length ? scored.map((r) => r.entry) : PSA_FOUNDER_TASTE).slice(0, limit);
}

export function founderTasteForUnitId(unitId: string): PsaFounderTasteEntry | null {
  const id = unitId.trim().toLowerCase();
  return PSA_FOUNDER_TASTE.find((e) => e.unitId === id) ?? null;
}

export function buildPsaFounderTasteBlock(): string {
  const unitLines = PSA_FOUNDER_TASTE.map((e) => {
    const notes = e.notes.map((n) => `    - ${n}`).join('\n');
    return `- **${e.unitName}** (confidence ${e.confidence}/10)\n  - Personal pick: ${e.personalPick}\n${notes}${
      e.whenToSteerAway ? `\n  - Steer away when: ${e.whenToSteerAway}` : ''
    }`;
  }).join('\n');

  const rules = GLOBAL_TASTE_RULES.map((r) => `- ${r}`).join('\n');

  return `## Founder Taste Engine (conviction picks — not generic recs)
When recommending a unit, lead with founder taste when it fits. Say **MY PERSONAL PICK HERE WOULD BE {UNIT}** or **IF I WERE SPENDING MY OWN MONEY TODAY…** — never "based on the information provided."

Use \`get_founder_pick\` or this table before generic catalog blurbs.

${unitLines}

**Global taste rules**
${rules}

After a recommendation, offer \`>>QUICK: WHY THIS? | OPEN BUILD-A-WIG FOR {UNIT} | COMPARE UNITS\` when helpful.`;
}
