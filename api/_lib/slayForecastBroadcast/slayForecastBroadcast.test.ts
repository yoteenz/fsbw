import { describe, expect, it } from 'vitest';
import { slayForecastGenerationConfig } from './generationConfig.js';
import { injectGoldenPromptDialogue, SLAY_FORECAST_GOLDEN_PROMPT_VERSION } from './goldenPrompt.js';
import { suggestBroadcastTimeline, restingHoldDurationSec } from './timeline.js';
import {
  validateFullBroadcastScript,
  validateOpeningScript,
  validateSignalScriptConsistency,
} from './scriptValidation.js';
import { buildPromptSnapshot } from './prompts.js';

describe('slay forecast generation config', () => {
  it('locks MiniMax H3 15s 16:9 production settings', () => {
    expect(slayForecastGenerationConfig.model).toBe('MiniMax-H3');
    expect(slayForecastGenerationConfig.durationSeconds).toBe(15);
    expect(slayForecastGenerationConfig.aspectRatio).toBe('16:9');
    expect(slayForecastGenerationConfig.promptTemplateVersion).toBe('SLAY_FORECAST_GOLDEN_V1');
    expect(slayForecastGenerationConfig.masterImage).toMatch(/F5C94CE3-DF1B-4B42-9ECD-BA3768B93A10/);
  });
});

describe('slay forecast golden prompt', () => {
  it('injects dialogue without altering production instructions', () => {
    const prompt = injectGoldenPromptDialogue({
      openingDialogue: "This week's Slay Forecast? Soft layers are moving in.",
      closingDialogue: 'Looks like the forecast is calling for movement.',
    });
    expect(prompt).toContain('CAMERA COMPLETELY LOCKED');
    expect(prompt).toContain('SILENT FORECAST HOLD');
    expect(prompt).toContain("This week's Slay Forecast? Soft layers are moving in.");
    expect(prompt).toContain('Looks like the forecast is calling for movement.');
    expect(prompt).not.toContain('{{OPENING_DIALOGUE}}');
  });

  it('builds versioned full prompt snapshot', () => {
    const snapshot = buildPromptSnapshot({
      segmentType: 'full',
      script: 'Opening line.',
      closingScript: 'Closing line.',
    });
    expect(snapshot.templateVersion).toBe(SLAY_FORECAST_GOLDEN_PROMPT_VERSION);
    expect(String(snapshot.prompt)).toMatch(/Do not add:/);
    expect(snapshot.durationSec).toBe(15);
  });
});

describe('slay forecast broadcast timeline', () => {
  it('suggests per-signal reveal timing after opening', () => {
    const timeline = suggestBroadcastTimeline(['s1', 's2', 's3']);
    expect(timeline.openingEnd).toBe(4);
    expect(timeline.signals).toHaveLength(3);
    expect(timeline.signals[0].revealAt).toBeGreaterThan(timeline.openingEnd);
    expect(timeline.closingStart).toBe(11);
  });

  it('expands resting hold pacing for more signals', () => {
    expect(restingHoldDurationSec(3)).toBeLessThan(restingHoldDurationSec(6));
  });
});

describe('slay forecast script validation', () => {
  it('warns when opening script alone is too long', () => {
    const long = 'word '.repeat(20).trim();
    const result = validateOpeningScript(long);
    expect(result.withinRange).toBe(false);
    expect(result.warning).toMatch(/too long/i);
  });

  it('blocks dialogue that exceeds 15s with required silent hold', () => {
    const longOpen = 'word '.repeat(18).trim();
    const longClose = 'word '.repeat(18).trim();
    const result = validateFullBroadcastScript(longOpen, longClose);
    expect(result.fitsInDuration).toBe(false);
    expect(result.blockingError).toMatch(/15-SECOND FORECAST/i);
  });

  it('accepts concise weekly dialogue', () => {
    const result = validateFullBroadcastScript(
      "This week's Slay Forecast? Soft layers are moving in.",
      'Looks like the forecast is calling for movement.',
    );
    expect(result.fitsInDuration).toBe(true);
    expect(result.silentHoldSec).toBeGreaterThanOrEqual(5);
  });

  it('flags signal count mismatch', () => {
    const warning = validateSignalScriptConsistency('We are watching 3 signals this week.', 5);
    expect(warning).toMatch(/3 signal/);
  });
});
