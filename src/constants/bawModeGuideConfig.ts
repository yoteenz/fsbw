/** Build-a-Wig mode header + BUILD GUIDE copy (try, customize, edit). */

export type BawBuildMode = 'TRY' | 'CUSTOMIZE' | 'EDIT' | 'HUB';

export type BawGuideStepId =
  | 'intro'
  | 'cap'
  | 'length'
  | 'density'
  | 'lace'
  | 'texture'
  | 'color'
  | 'hairline'
  | 'styling'
  | 'addons';

export const BAW_TRY_FLOW_STEPS: BawGuideStepId[] = [
  'intro',
  'length',
  'density',
  'color',
  'styling',
];

export const BAW_BUILDER_FLOW_STEPS: BawGuideStepId[] = [
  'intro',
  'cap',
  'length',
  'density',
  'lace',
  'texture',
  'color',
  'hairline',
  'styling',
  'addons',
];

type GuideCopy = { title: string; body: string };

const STEP_COPY: Record<BawGuideStepId, GuideCopy> = {
  intro: {
    title: 'WELCOME TO THE BUILDER',
    body: 'EXPLORE OPTIONS ON THE HUB. CONFIRM EACH STEP TO BUILD YOUR UNIT.',
  },
  cap: {
    title: 'PICK YOUR CAP SIZE',
    body: 'CAP SIZE SETS THE FIT. MOST CLIENTS START WITH MEDIUM.',
  },
  length: {
    title: 'PICK YOUR LENGTH',
    body: 'LENGTH SETS THE SILHOUETTE. MOST START AROUND 24".',
  },
  density: {
    title: 'PICK YOUR DENSITY',
    body: 'HIGHER DENSITY = FULLER HAIR. 200% IS THE EVERYDAY SWEET SPOT.',
  },
  lace: {
    title: 'PICK YOUR LACE',
    body: 'LACE TYPE SHAPES THE HAIRLINE AND PARTING OPTIONS.',
  },
  texture: {
    title: 'PICK YOUR TEXTURE',
    body: 'TEXTURE MATCHES YOUR NATURAL HAIR OR YOUR DESIRED FINISH.',
  },
  color: {
    title: 'PICK YOUR COLOR',
    body: 'COLOR IS A PREMIUM OPTION — MEMBERS UNLOCK THE FULL PALETTE.',
  },
  hairline: {
    title: 'PICK YOUR HAIRLINE',
    body: 'HAIRLINE STYLE DEFINES THE FRONT PROFILE OF YOUR UNIT.',
  },
  styling: {
    title: 'PICK YOUR STYLING',
    body: 'LAYERS AND SALON STYLES ADD MOVEMENT AND FINISHING.',
  },
  addons: {
    title: 'PICK YOUR ADD-ONS',
    body: 'ADD-ONS FINISH YOUR BUILD WITH EXTRA CUSTOM TOUCHES.',
  },
};

const MODE_INTRO_OVERRIDES: Partial<Record<BawBuildMode, GuideCopy>> = {
  TRY: {
    title: 'WELCOME TO BUILD-A-WIG!',
    body: 'TRY THIS FEATURE FREE OF CHARGE AND EXPLORE OUR CUSTOMIZATION OPTIONS, NO SIGN-IN REQUIRED. FINISH WITH A SHAREABLE SLAY CARD.',
  },
  CUSTOMIZE: {
    title: 'CUSTOMIZE YOUR UNIT',
    body: 'CONFIRM EACH SELECTION. LIVE PREVIEW UPDATES AS YOU BUILD.',
  },
  EDIT: {
    title: 'EDIT YOUR UNIT',
    body: 'UPDATE YOUR SAVED SELECTIONS. SAVE CHANGES WHEN YOU ARE DONE.',
  },
  HUB: {
    title: 'WELCOME TO THE BUILDER',
    body: 'REVIEW YOUR UNIT. OPEN CUSTOMIZE OR EDIT TO CHANGE OPTIONS.',
  },
};

export function getBawModeGuideCopy(mode: BawBuildMode, step: BawGuideStepId): GuideCopy {
  if (step === 'intro' && MODE_INTRO_OVERRIDES[mode]) {
    return MODE_INTRO_OVERRIDES[mode]!;
  }
  return STEP_COPY[step];
}

export function bawBuildModeLabel(mode: BawBuildMode): string {
  switch (mode) {
    case 'TRY':
      return 'BUILD-A-WIG VIEW MODE';
    case 'CUSTOMIZE':
      return 'BUILD-A-WIG CUSTOMIZE MODE';
    case 'EDIT':
      return 'BUILD-A-WIG EDIT MODE';
    case 'HUB':
      return 'BUILD-A-WIG';
  }
}
