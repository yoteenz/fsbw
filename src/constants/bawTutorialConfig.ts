/** Guest Build-A-Wig tutorial — limited palette, static preview, shareable slay card. */

export type BawTutorialStepId = 'intro' | 'length' | 'density' | 'color' | 'styling' | 'card';

export const BAW_TUTORIAL_STEPS: BawTutorialStepId[] = [
  'intro',
  'length',
  'density',
  'color',
  'styling',
  'card',
];

export type BawTutorialSelections = {
  unit: string;
  capSize: string;
  length: string;
  density: string;
  color: string;
  styling: string;
};

export const BAW_TUTORIAL_DEFAULT_SELECTIONS: BawTutorialSelections = {
  unit: 'NOIR',
  capSize: 'M',
  length: '24"',
  density: '200%',
  color: 'OFF BLACK',
  styling: 'NONE',
};

export const BAW_TUTORIAL_OPTIONS = {
  length: ['22"', '24"', '26"'] as const,
  density: ['200%', '250%'] as const,
  color: ['OFF BLACK', 'JET BLACK', 'CHOCOLATE BROWN'] as const,
  styling: ['NONE', 'LAYERS'] as const,
};

/** Generic in-flow guide copy — not PSA / founder branded. */
export const BAW_TUTORIAL_GUIDE_COPY: Record<BawTutorialStepId, { title: string; body: string }> = {
  intro: {
    title: 'WELCOME TO THE BUILDER',
    body: 'TRY A FEW CHOICES FREE — NO SIGN-IN. FINISH WITH A SHAREABLE SLAY CARD.',
  },
  length: {
    title: 'PICK YOUR LENGTH',
    body: 'LENGTH SETS THE SILHOUETTE. MOST START AROUND 24".',
  },
  density: {
    title: 'PICK YOUR DENSITY',
    body: 'HIGHER DENSITY = FULLER HAIR. 200% IS THE EVERYDAY SWEET SPOT.',
  },
  color: {
    title: 'PICK YOUR COLOR',
    body: 'COLOR IS PREMIUM IN THE FULL BUILDER — TRY IT HERE FIRST.',
  },
  styling: {
    title: 'PICK YOUR STYLING',
    body: 'LAYERS ADD MOVEMENT. SALON STYLES AND BANGS UNLOCK IN THE FULL FLOW.',
  },
  card: {
    title: 'YOUR SLAY CARD',
    body: 'SAVE OR SHARE YOUR LOOK. SIGN IN TO OPEN THE FULL BUILD-A-WIG.',
  },
};

export const BAW_TUTORIAL_ROUTE = '/build-a-wig/try';

export function isBawTutorialPath(pathname: string): boolean {
  const p = pathname.replace(/\/$/, '') || '/';
  return p === BAW_TUTORIAL_ROUTE || p.startsWith(`${BAW_TUTORIAL_ROUTE}/`);
}
