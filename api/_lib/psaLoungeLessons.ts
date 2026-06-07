/**
 * Lounge TV lesson deep-links for PSA — static map (admin tiles vary; these are stable entry paths).
 */
export type PsaLoungeLesson = {
  keywords: string[];
  title: string;
  path: string;
  note: string;
};

export const PSA_LOUNGE_LESSONS: PsaLoungeLesson[] = [
  {
    keywords: ['lace', 'customization', 'customize lace', 'hairline', 'pluck', 'bleach knots'],
    title: 'LACE CUSTOMIZATION IN THE LOUNGE',
    path: '/lobby/lounge',
    note: 'Send them to VIP Lounge TV → Watch + Learn for install prep before first wear.',
  },
  {
    keywords: ['install', 'installation', 'first install', 'beginner install'],
    title: 'INSTALL BASICS IN THE LOUNGE',
    path: '/lobby/lounge',
    note: 'Pair with booking a consult if they want hands-on help.',
  },
  {
    keywords: ['maintenance', 'wash', 'care routine', 'night routine'],
    title: 'CARE + MAINTENANCE IN THE LOUNGE',
    path: '/lobby/lounge',
    note: 'Use after recommending a unit texture so care matches their pick.',
  },
  {
    keywords: ['styling', 'curl', 'flat iron', 'everyday styling'],
    title: 'STYLING LESSONS IN THE LOUNGE',
    path: '/lobby/lounge',
    note: 'Especially helpful for wavy and curly units.',
  },
];

export function matchPsaLoungeLessons(query: string, limit = 3): PsaLoungeLesson[] {
  const q = query.toLowerCase().trim();
  if (!q) return PSA_LOUNGE_LESSONS.slice(0, limit);

  const scored = PSA_LOUNGE_LESSONS.map((lesson) => {
    let score = 0;
    for (const kw of lesson.keywords) {
      const k = kw.toLowerCase();
      if (q.includes(k) || k.includes(q)) score += 3;
      for (const word of q.split(/\s+/)) {
        if (word.length >= 3 && k.includes(word)) score += 1;
      }
    }
    if (lesson.title.toLowerCase().includes(q)) score += 2;
    return { lesson, score };
  })
    .filter((r) => r.score > 0)
    .sort((a, b) => b.score - a.score);

  return (scored.length ? scored.map((r) => r.lesson) : PSA_LOUNGE_LESSONS).slice(0, limit);
}

export function buildPsaLoungeLessonsBlock(): string {
  const lines = PSA_LOUNGE_LESSONS.map(
    (l) => `- **${l.title}** (${l.path}): ${l.note} Keywords: ${l.keywords.join(', ')}.`
  );
  return `## Lounge curator (underused — use proactively)
PSA is the curator, not a link dump.
- **Before a first unit purchase:** suggest the relevant Lounge lesson (lace, install, or care).
- **After recommending texture or install path:** pair with one Lounge lesson via \`suggest_lounge_lesson\`.
- Example energy: "BEFORE YOU LOCK THIS IN, WATCH THE LACE CUSTOMIZATION LESSON IN THE LOUNGE."

Lessons:
${lines.join('\n')}`;
}
