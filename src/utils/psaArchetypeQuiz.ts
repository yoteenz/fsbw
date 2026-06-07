/**
 * Slay Archetype Quiz — client scripted flow (no boring form UI).
 */
import {
  PSA_SLAY_ARCHETYPES,
  type PsaSlayArchetype,
} from '../constants/psaSlayArchetype';

export type ArchetypeQuizScores = Record<PsaSlayArchetype, number>;

const QUIZ_STORAGE_KEY = 'psa_archetype_quiz_state';

type QuizState = {
  step: number;
  scores: ArchetypeQuizScores;
};

const ENTRY_CHIP = 'DISCOVER MY ARCHETYPE';

const ARCHETYPE_LIST = PSA_SLAY_ARCHETYPES as readonly PsaSlayArchetype[];

function emptyScores(): ArchetypeQuizScores {
  return {
    'THE BOARDROOM SLAYER': 0,
    'THE SOFT LIFE SLAYER': 0,
    'THE IT GIRL SLAYER': 0,
    'THE VACATION SLAYER': 0,
    'THE BRIDAL SLAYER': 0,
  };
}

function readState(): QuizState | null {
  try {
    const raw = sessionStorage.getItem(QUIZ_STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as QuizState;
  } catch {
    return null;
  }
}

function writeState(state: QuizState | null): void {
  if (!state) {
    sessionStorage.removeItem(QUIZ_STORAGE_KEY);
    return;
  }
  sessionStorage.setItem(QUIZ_STORAGE_KEY, JSON.stringify(state));
}

export function isArchetypeQuizEntryChip(text: string): boolean {
  return text.trim().toUpperCase() === ENTRY_CHIP;
}

export function isArchetypeQuizActive(): boolean {
  const s = readState();
  return s != null && s.step > 0 && s.step < 4;
}

function addScores(scores: ArchetypeQuizScores, delta: Partial<ArchetypeQuizScores>): ArchetypeQuizScores {
  const next = { ...scores };
  for (const key of ARCHETYPE_LIST) {
    next[key] += delta[key] ?? 0;
  }
  return next;
}

function winner(scores: ArchetypeQuizScores): PsaSlayArchetype {
  let best: PsaSlayArchetype = 'THE SOFT LIFE SLAYER';
  let max = -1;
  for (const key of ARCHETYPE_LIST) {
    if (scores[key] > max) {
      max = scores[key];
      best = key;
    }
  }
  return best;
}

const QUESTIONS: {
  prompt: string;
  options: { label: string; delta: Partial<ArchetypeQuizScores> }[];
}[] = [
  {
    prompt:
      'FIRST QUESTION — WHAT ENERGY ARE YOU USUALLY SERVING?\n\nEVERYDAY POLISHED AND PUT TOGETHER, OR STATEMENT MOMENTS AND MAIN CHARACTER DAYS?',
    options: [
      {
        label: 'EVERYDAY POLISHED',
        delta: {
          'THE BOARDROOM SLAYER': 3,
          'THE SOFT LIFE SLAYER': 2,
        },
      },
      {
        label: 'STATEMENT MOMENTS',
        delta: {
          'THE IT GIRL SLAYER': 3,
          'THE BRIDAL SLAYER': 1,
        },
      },
    ],
  },
  {
    prompt:
      'NEXT — HOW MUCH DAILY STYLING ARE YOU WILLING TO DO?\n\nLOW MAINTENANCE IS NON-NEGOTIABLE, OR I LOVE THE RITUAL?',
    options: [
      {
        label: 'LOW MAINTENANCE',
        delta: {
          'THE SOFT LIFE SLAYER': 3,
          'THE BOARDROOM SLAYER': 2,
        },
      },
      {
        label: 'I LOVE THE RITUAL',
        delta: {
          'THE IT GIRL SLAYER': 2,
          'THE BRIDAL SLAYER': 2,
        },
      },
    ],
  },
  {
    prompt:
      'WHERE DOES YOUR HAIR NEED TO PERFORM MOST?\n\nOFFICE AND EVERYDAY LIFE, TRAVEL AND VACATION, OR EVENTS AND MILESTONES?',
    options: [
      {
        label: 'OFFICE / EVERYDAY',
        delta: { 'THE BOARDROOM SLAYER': 3, 'THE SOFT LIFE SLAYER': 2 },
      },
      {
        label: 'TRAVEL / VACATION',
        delta: { 'THE VACATION SLAYER': 4 },
      },
      {
        label: 'EVENTS / MILESTONES',
        delta: { 'THE BRIDAL SLAYER': 3, 'THE IT GIRL SLAYER': 2 },
      },
    ],
  },
];

export type ArchetypeQuizStepResult = {
  reply: string;
  followUpChips: string[];
  completed?: boolean;
  archetype?: PsaSlayArchetype;
};

export function startArchetypeQuiz(): ArchetypeQuizStepResult {
  writeState({ step: 1, scores: emptyScores() });
  return {
    reply: `LET'S FIND YOUR SLAY ARCHETYPE.\n\nTHIS IS NOT A BORING QUIZ. THREE QUICK TAPS AND I WILL TAILOR EVERYTHING TO YOUR VIBE.\n\n${QUESTIONS[0].prompt}`,
    followUpChips: QUESTIONS[0].options.map((o) => o.label),
  };
}

export function advanceArchetypeQuiz(answerLabel: string): ArchetypeQuizStepResult | null {
  const state = readState();
  if (!state || state.step < 1 || state.step > 3) return null;

  const qIndex = state.step - 1;
  const question = QUESTIONS[qIndex];
  const option = question.options.find(
    (o) => o.label.toUpperCase() === answerLabel.trim().toUpperCase()
  );
  if (!option) return null;

  const scores = addScores(state.scores, option.delta);
  const nextStep = state.step + 1;

  if (nextStep > 3) {
    const result = winner(scores);
    writeState(null);
    return {
      reply: `YOUR SLAY ARCHETYPE IS ${result}.\n\nI WILL USE THIS TO MATCH UNITS, MAINTENANCE ADVICE AND LOUNGE LESSONS TO YOUR VIBE. EVERYTHING GETS MORE CONTEXTUAL FROM HERE.\n\nTELL ME WHAT YOU ARE SHOPPING FOR AND I WILL FILTER THROUGH YOUR ARCHETYPE.`,
      followUpChips: ['WHAT WOULD YOU PICK?', 'HELP ME CHOOSE', 'OPEN BUILD-A-WIG'],
      completed: true,
      archetype: result,
    };
  }

  writeState({ step: nextStep, scores });
  const nextQ = QUESTIONS[nextStep - 1];
  return {
    reply: nextQ.prompt,
    followUpChips: nextQ.options.map((o) => o.label),
  };
}

export function resolveArchetypeQuizMessage(text: string): ArchetypeQuizStepResult | null {
  const trimmed = text.trim();
  if (isArchetypeQuizEntryChip(trimmed)) {
    return startArchetypeQuiz();
  }
  if (isArchetypeQuizActive()) {
    return advanceArchetypeQuiz(trimmed);
  }
  return null;
}

export { ENTRY_CHIP as PSA_ARCHETYPE_QUIZ_ENTRY_CHIP };
