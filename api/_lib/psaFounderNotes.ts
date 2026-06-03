/**
 * Founder opinion snippets — not generic AI recs. Injected into PSA knowledge.
 */
export type PsaFounderNote = {
  topic: string;
  opinion: string;
};

export const PSA_FOUNDER_NOTES: PsaFounderNote[] = [
  {
    topic: 'soft wave vs beach wave',
    opinion:
      'Personal opinion: if you are between SOFT WAVE and BEACH WAVE for everyday versatility, I lean BEACH WAVE. More body, still low drama.',
  },
  {
    topic: 'noir texture',
    opinion:
      'NOIR is one of my favorite straight textures we carry. Sleek without looking helmet-stiff when density is right.',
  },
  {
    topic: 'density',
    opinion:
      'Founder take: 200% density is the sweet spot for most Slayers. Higher is not always more luxury, sometimes it reads less natural.',
  },
  {
    topic: 'blanco',
    opinion:
      'BLANCO is for the Slayer who wants that soft straight, lighter line energy. Worth the base price step if that is your everyday vibe.',
  },
  {
    topic: 'maintenance',
    opinion:
      'If you hate daily styling, I will steer you away from high-maintenance looks every time. Protect your time and your edges.',
  },
  {
    topic: 'honesty',
    opinion:
      'If I were spending my own money and you already have a solid rotation unit, I will tell you to skip the duplicate purchase.',
  },
];

export function buildPsaFounderNotesBlock(): string {
  const lines = PSA_FOUNDER_NOTES.map((n) => `- **${n.topic}:** ${n.opinion}`);
  return `## Founder notes (use sparingly — one per reply max, when relevant)\nThese are **founder opinions**, not scripted sales lines. Adapt wording, do not copy every time.\n${lines.join('\n')}`;
}
