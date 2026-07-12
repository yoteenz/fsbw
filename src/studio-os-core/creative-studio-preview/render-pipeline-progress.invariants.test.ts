import { describe, expect, it } from 'vitest';
import { computeRenderPipelineProgress } from './render-pipeline-progress';

/**
 * Regression guards for P0 end-to-end reconciliation sprint.
 * Documents proven premature completion boundaries — not product behavior changes.
 */
describe('render pipeline completion invariants', () => {
  const compileSuccessStages = [
    { stage: 'load-shell' as const, label: 'load-shell', success: true, durationMs: 1, detail: 'ok' },
    { stage: 'lock-shell' as const, label: 'lock-shell', success: true, durationMs: 1, detail: 'ok' },
    { stage: 'mount-landmark' as const, label: 'mount-landmark', success: true, durationMs: 1, detail: 'skipped' },
    { stage: 'render-final-scene' as const, label: 'render-final-scene', success: true, durationMs: 1, detail: 'ok' },
  ];

  it('documents that compileSuccess alone currently forces isComplete and 100% (premature completion boundary)', () => {
    const progress = computeRenderPipelineProgress({
      shellPhase: 'ready',
      compileSuccess: true,
      layerPipelineActive: true,
      ensureStationActive: true,
    });
    expect(progress.isComplete).toBe(true);
    expect(progress.progressPct).toBe(100);
  });

  it('does not require layer pipeline idle before isComplete today (regression sentinel)', () => {
    const withLayersStillRunning = computeRenderPipelineProgress({
      shellPhase: 'ready',
      compileSuccess: true,
      layerPipelineActive: true,
    });
    const withLayersIdle = computeRenderPipelineProgress({
      shellPhase: 'ready',
      compileSuccess: true,
      layerPipelineActive: false,
    });
    expect(withLayersStillRunning.isComplete).toBe(withLayersIdle.isComplete);
    expect(withLayersStillRunning.progressPct).toBe(100);
  });

  it('marks prior steps done optimistically when step index advances (screenshot B shell-green pattern)', () => {
    const progress = computeRenderPipelineProgress({
      shellPhase: 'ready',
      ensureStationActive: true,
      layerPipelineActive: true,
    });
    const shellStepIds = ['compile-preview-spec', 'generate-shell', 'register-ephemeral'] as const;
    for (const id of shellStepIds) {
      const step = progress.steps.find((s) => s.id === id);
      expect(step?.status).toBe('done');
    }
    expect(progress.isComplete).toBe(false);
  });

  it('keeps isComplete false when compile has not succeeded', () => {
    const progress = computeRenderPipelineProgress({
      shellPhase: 'ready',
      compileStages: compileSuccessStages.slice(0, 2),
      layerPipelineActive: false,
    });
    expect(progress.isComplete).toBe(false);
    expect(progress.progressPct).toBeLessThan(100);
  });

  it('fails closed on shell failure even if compileSuccess were true', () => {
    const progress = computeRenderPipelineProgress({
      shellPhase: 'failed',
      shellFailed: true,
      compileSuccess: true,
    });
    expect(progress.isFailed).toBe(true);
    expect(progress.isComplete).toBe(true);
  });
});

describe('compound completion invariant (target contract — not yet enforced in product)', () => {
  function shouldReportTerminalComplete(input: {
    compileSuccess?: boolean;
    layerPipelineActive?: boolean;
    layersComplete: number;
    layersTotal: number;
    compositeReady: boolean;
  }): boolean {
    return Boolean(
      input.compileSuccess &&
        !input.layerPipelineActive &&
        input.layersTotal > 0 &&
        input.layersComplete === input.layersTotal &&
        input.compositeReady
    );
  }

  it('rejects 100% terminal state when layers are incomplete', () => {
    expect(
      shouldReportTerminalComplete({
        compileSuccess: true,
        layerPipelineActive: false,
        layersComplete: 1,
        layersTotal: 8,
        compositeReady: false,
      })
    ).toBe(false);
  });

  it('rejects terminal state when layer pipeline is still active', () => {
    expect(
      shouldReportTerminalComplete({
        compileSuccess: true,
        layerPipelineActive: true,
        layersComplete: 8,
        layersTotal: 8,
        compositeReady: true,
      })
    ).toBe(false);
  });

  it('accepts terminal state only when compile and layer assembly agree', () => {
    expect(
      shouldReportTerminalComplete({
        compileSuccess: true,
        layerPipelineActive: false,
        layersComplete: 8,
        layersTotal: 8,
        compositeReady: true,
      })
    ).toBe(true);
  });
});
