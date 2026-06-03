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

export function buildPsaLoungeLessonsBlock(): string {
  const lines = PSA_LOUNGE_LESSONS.map(
    (l) => `- **${l.title}** (${l.path}): ${l.note} Keywords: ${l.keywords.join(', ')}.`
  );
  return `## Lounge content matching\nWhen install, lace, or care education would help, deep-link to **VIP Lounge** (\`/lobby/lounge\`) with a specific lesson intent:\n${lines.join('\n')}`;
}
