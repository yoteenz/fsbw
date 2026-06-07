/**
 * Scripted occasion capture — powers Don't Forget Why without a form UI.
 */
import { getPerUserKey, getCurrentUserEmailFromStorage } from './perUserStorage';

const SESSION_KEY = 'psa_occasion_capture_state';
const META_KEY = 'psa_occasion_capture_meta';
const PENDING_CONSULT_KEY = 'psaConsultOccasionPrompt';

export const PSA_SAVE_WHY_CHIP = 'SAVE WHY I BOUGHT THIS';

type OccasionCaptureState = {
  step: 'awaiting_occasion';
  orderNumber?: string;
  unitName?: string;
  unitId?: string;
};

export type PendingConsultOccasionPrompt = {
  orderNumber?: string;
  unitName?: string;
  unitId?: string;
  createdAt: string;
};

function readState(): OccasionCaptureState | null {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as OccasionCaptureState;
  } catch {
    return null;
  }
}

function writeState(state: OccasionCaptureState | null): void {
  if (!state) {
    sessionStorage.removeItem(SESSION_KEY);
    return;
  }
  sessionStorage.setItem(SESSION_KEY, JSON.stringify(state));
}

export function isSaveWhyChip(text: string): boolean {
  return text.trim().toUpperCase() === PSA_SAVE_WHY_CHIP;
}

export function isOccasionCaptureActive(): boolean {
  return readState()?.step === 'awaiting_occasion';
}

export function stashOccasionCaptureMeta(meta: {
  orderNumber?: string;
  unitName?: string;
  unitId?: string;
}): void {
  sessionStorage.setItem(META_KEY, JSON.stringify(meta));
}

export function consumeOccasionCaptureMeta(): {
  orderNumber?: string;
  unitName?: string;
  unitId?: string;
} | null {
  try {
    const raw = sessionStorage.getItem(META_KEY);
    sessionStorage.removeItem(META_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as {
      orderNumber?: string;
      unitName?: string;
      unitId?: string;
    };
  } catch {
    return null;
  }
}

export function startOccasionCapture(meta?: {
  orderNumber?: string;
  unitName?: string;
  unitId?: string;
}): { reply: string; followUpChips: string[] } {
  const resolved = meta ?? consumeOccasionCaptureMeta() ?? undefined;
  writeState({
    step: 'awaiting_occasion',
    orderNumber: resolved?.orderNumber,
    unitName: resolved?.unitName,
    unitId: resolved?.unitId,
  });
  return {
    reply:
      'I WANT TO REMEMBER WHY YOU CHOSE HER.\n\nIN A FEW WORDS, WHAT WAS THIS UNIT FOR? WEDDING, TRIP, EVERYDAY ROTATION, MILESTONE — WHATEVER FITS.',
    followUpChips: [],
  };
}

export function completeOccasionCapture(answer: string): {
  occasion: string;
  orderNumber?: string;
  unitName?: string;
  unitId?: string;
} | null {
  const state = readState();
  if (!state || state.step !== 'awaiting_occasion') return null;
  const occasion = answer.trim().slice(0, 120);
  if (!occasion) return null;
  writeState(null);
  return {
    occasion,
    orderNumber: state.orderNumber,
    unitName: state.unitName,
    unitId: state.unitId,
  };
}

export type OccasionCaptureStepResult = {
  reply: string;
  followUpChips?: string[];
  savePayload?: {
    occasion: string;
    orderNumber?: string;
    unitName?: string;
    unitId?: string;
  };
};

export function resolveOccasionCaptureMessage(text: string): OccasionCaptureStepResult | null {
  if (isSaveWhyChip(text)) {
    return startOccasionCapture();
  }
  if (isOccasionCaptureActive()) {
    const payload = completeOccasionCapture(text);
    if (!payload) return null;
    return {
      reply:
        'LOCKED IN. I WILL REMEMBER WHY YOU CHOSE HER AND CHECK BACK WHEN IT MATTERS.\n\nIF YOU ARE STILL SHOPPING, TELL ME WHAT YOU NEED NEXT.',
      followUpChips: ['WHAT WOULD YOU PICK?', 'HELP ME CHOOSE'],
      savePayload: payload,
    };
  }
  return null;
}

export function consultOccasionPromptStorageKey(): string {
  return getPerUserKey(PENDING_CONSULT_KEY, getCurrentUserEmailFromStorage());
}

export function setPendingConsultOccasionPrompt(meta: {
  orderNumber?: string;
  unitName?: string;
  unitId?: string;
}): void {
  const row: PendingConsultOccasionPrompt = {
    ...meta,
    createdAt: new Date().toISOString(),
  };
  localStorage.setItem(consultOccasionPromptStorageKey(), JSON.stringify(row));
}

export function readPendingConsultOccasionPrompt(): PendingConsultOccasionPrompt | null {
  try {
    const raw = localStorage.getItem(consultOccasionPromptStorageKey());
    if (!raw) return null;
    return JSON.parse(raw) as PendingConsultOccasionPrompt;
  } catch {
    return null;
  }
}

export function clearPendingConsultOccasionPrompt(): void {
  localStorage.removeItem(consultOccasionPromptStorageKey());
}

export function detectConsultOccasionNudge(): {
  id: string;
  headline: string;
  body: string;
  prefilledMessage: string;
  meta: { orderNumber?: string; unitName?: string; unitId?: string };
} | null {
  const pending = readPendingConsultOccasionPrompt();
  if (!pending) return null;
  const unit = pending.unitName ? ` ${pending.unitName}` : '';
  return {
    id: 'consult-occasion-prompt',
    headline: 'WHAT IS THIS UNIT FOR?',
    body: `YOU JUST CLAIMED YOUR OFFER${unit}.`.slice(0, 72),
    prefilledMessage: PSA_SAVE_WHY_CHIP,
    meta: {
      orderNumber: pending.orderNumber,
      unitName: pending.unitName,
      unitId: pending.unitId,
    },
  };
}
