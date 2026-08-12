import { describe, expect, it } from 'vitest';
import {
  computeCrossSourceScore,
  computeNumericVelocity,
  deriveEditorialConfidence,
  deriveMomentumFromSignals,
  mapSourceTypeToLayer,
} from './scoring.js';
import { assertProductionPublishAllowed, canonicalizeSourceUrl } from './validation.js';

describe('trend intelligence scoring', () => {
  it('maps source types to layers', () => {
    expect(mapSourceTypeToLayer('editorial')).toBe('editorial');
    expect(mapSourceTypeToLayer('tiktok_observation')).toBe('social');
    expect(mapSourceTypeToLayer('fs_first_party')).toBe('fs_first_party');
  });

  it('computes cross-source score without punishing missing layers as zero', () => {
    expect(computeCrossSourceScore(0)).toBe(0);
    expect(computeCrossSourceScore(1)).toBeGreaterThan(0);
    expect(computeCrossSourceScore(4)).toBeGreaterThan(computeCrossSourceScore(2));
  });

  it('derives momentum from numeric velocity', () => {
    const momentum = deriveMomentumFromSignals([
      { change_percent: 40, qualitative_strength: null, observed_value: 40, previous_value: 28 },
    ]);
    expect(momentum).toBe('accelerating');
  });

  it('explains editorial confidence from coverage', () => {
    const result = deriveEditorialConfidence(
      {
        source_layer_coverage: ['search', 'editorial', 'social'],
        signal_strength: 'STRONG',
        editorial_confidence: null,
      },
      3,
    );
    expect(result.confidence).toBe('medium_high');
    expect(result.strengths.length).toBeGreaterThan(0);
  });

  it('computes numeric velocity', () => {
    expect(computeNumericVelocity(50, 25)).toBe(1);
    expect(computeNumericVelocity(null, 25)).toBeNull();
  });
});

describe('trend intelligence validation', () => {
  it('blocks demo publish in production', () => {
    expect(() =>
      assertProductionPublishAllowed({
        isDemo: true,
        evidenceSnapshotIds: ['snap-1'],
        approvedBy: 'editor@example.com',
        nodeEnv: 'production',
      }),
    ).toThrow(/Demo/);
  });

  it('requires evidence snapshots in production', () => {
    expect(() =>
      assertProductionPublishAllowed({
        isDemo: false,
        evidenceSnapshotIds: [],
        approvedBy: 'editor@example.com',
        nodeEnv: 'production',
      }),
    ).toThrow(/evidence snapshot/);
  });

  it('canonicalizes URLs', () => {
    expect(canonicalizeSourceUrl('https://example.com/a#frag')).toBe('https://example.com/a');
  });
});
