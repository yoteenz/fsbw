import {
  CLOSING_DURATION_MAX_SEC,
  CLOSING_DURATION_MIN_SEC,
  DEFAULT_PSA_SPEECH_RATE_WPS,
  FULL_BROADCAST_DURATION_SEC,
  FULL_BROADCAST_MAX_SPOKEN_SEC,
  FULL_BROADCAST_SILENT_HOLD_MIN_SEC,
  OPENING_DURATION_MAX_SEC,
  OPENING_DURATION_MIN_SEC,
} from './constants.js';
import { slayForecastGenerationConfig } from './generationConfig.js';
import type { ScriptDurationEstimate } from './types.js';

export function countWords(text: string): number {
  return text
    .trim()
    .split(/\s+/)
    .filter(Boolean).length;
}

export function estimateScriptDuration(
  script: string,
  speechRateWps = DEFAULT_PSA_SPEECH_RATE_WPS,
  minSec = OPENING_DURATION_MIN_SEC,
  maxSec = OPENING_DURATION_MAX_SEC,
): ScriptDurationEstimate {
  const wordCount = countWords(script);
  const estimatedSeconds = wordCount > 0 ? wordCount / speechRateWps : 0;
  const withinRange = estimatedSeconds >= minSec && estimatedSeconds <= maxSec;
  let warning: string | undefined;
  if (wordCount === 0) {
    warning = 'Script is empty.';
  } else if (estimatedSeconds > maxSec) {
    warning = `Script may be too long for a ~${maxSec}s clip (${estimatedSeconds.toFixed(1)}s estimated). Shorten before generation.`;
  } else if (estimatedSeconds < minSec && wordCount > 0) {
    warning = `Script is short (${estimatedSeconds.toFixed(1)}s estimated) — may feel sparse in a ${minSec}–${maxSec}s clip.`;
  }
  return { wordCount, estimatedSeconds, withinRange, minSeconds: minSec, maxSeconds: maxSec, warning };
}

export function validateOpeningScript(script: string): ScriptDurationEstimate {
  return estimateScriptDuration(script, DEFAULT_PSA_SPEECH_RATE_WPS, OPENING_DURATION_MIN_SEC, OPENING_DURATION_MAX_SEC);
}

export function validateClosingScript(script: string): ScriptDurationEstimate {
  return estimateScriptDuration(
    script,
    DEFAULT_PSA_SPEECH_RATE_WPS,
    CLOSING_DURATION_MIN_SEC,
    CLOSING_DURATION_MAX_SEC,
  );
}

export type FullBroadcastScriptValidation = {
  opening: ScriptDurationEstimate;
  closing: ScriptDurationEstimate;
  totalSpokenSec: number;
  silentHoldSec: number;
  fitsInDuration: boolean;
  blockingError?: string;
  warning?: string;
};

/** Validates opening + closing fit inside 15s with required silent hold intact. */
export function validateFullBroadcastScript(
  openingDialogue: string,
  closingDialogue: string,
): FullBroadcastScriptValidation {
  const opening = validateOpeningScript(openingDialogue);
  const closing = validateClosingScript(closingDialogue);
  const totalSpokenSec = opening.estimatedSeconds + closing.estimatedSeconds;
  const silentHoldSec = FULL_BROADCAST_DURATION_SEC - totalSpokenSec;
  const silentHoldOk = silentHoldSec >= FULL_BROADCAST_SILENT_HOLD_MIN_SEC;
  const spokenOk = totalSpokenSec <= FULL_BROADCAST_MAX_SPOKEN_SEC;

  let blockingError: string | undefined;
  let warning: string | undefined;

  if (opening.wordCount === 0 || closing.wordCount === 0) {
    blockingError = 'Opening and closing dialogue are both required.';
  } else if (!silentHoldOk || !spokenOk) {
    blockingError = `SCRIPT TOO LONG FOR ${FULL_BROADCAST_DURATION_SEC}-SECOND FORECAST — shorten dialogue to preserve the silent hold.`;
  } else if (opening.warning || closing.warning) {
    warning = [opening.warning, closing.warning].filter(Boolean).join(' ');
  } else if (silentHoldSec < slayForecastGenerationConfig.silentHoldMinSec + 1) {
    warning = 'Silent hold is tight — consider shortening dialogue for safer pacing.';
  }

  return {
    opening,
    closing,
    totalSpokenSec,
    silentHoldSec,
    fitsInDuration: !blockingError,
    blockingError,
    warning,
  };
}

export function validateSignalScriptConsistency(
  openingScript: string,
  signalCount: number,
): string | null {
  const match = openingScript.match(/\b(\d+)\s+signals?\b/i);
  if (!match) return null;
  const mentioned = parseInt(match[1], 10);
  if (Number.isFinite(mentioned) && mentioned !== signalCount) {
    return `Opening mentions ${mentioned} signal(s) but edition has ${signalCount}.`;
  }
  return null;
}
