import { describe, expect, it } from 'vitest';
import {
  computeRenderPipelineProgress,
  evaluateRenderTerminalComplete,
} from './render-pipeline-progress';

const satisfiedAssembly = {
  shellPhase: 'ready' as const,
  compileSuccess: true,
  layerPipelineActive: false,
  ensureStationActive: false,
  pipelineRunning: false,
  pipelinePhase: 'idle' as const,
  layersComplete: 8,
  layersTotal: 8,
  compositeStatus: 'ready' as const,
};

describe('evaluateRenderTerminalComplete', () => {
  it('accepts completion only when compile and layer assembly invariants agree', () => {
    expect(evaluateRenderTerminalComplete(satisfiedAssembly)).toBe(true);
  });

  it('rejects compile success alone', () => {
    expect(
      evaluateRenderTerminalComplete({
        shellPhase: 'ready',
        compileSuccess: true,
        layerPipelineActive: true,
      })
    ).toBe(false);
  });

  it('rejects layer count mismatch', () => {
    expect(
      evaluateRenderTerminalComplete({
        ...satisfiedAssembly,
        layersComplete: 1,
        layersTotal: 8,
        compositeStatus: 'partial',
      })
    ).toBe(false);
  });

  it('rejects active queue or generating overlay', () => {
    expect(
      evaluateRenderTerminalComplete({
        ...satisfiedAssembly,
        pipelinePhase: 'generating',
        compositeStatus: 'building',
      })
    ).toBe(false);
  });

  it('rejects when Scene Stack composite is not ready', () => {
    expect(
      evaluateRenderTerminalComplete({
        ...satisfiedAssembly,
        compositeStatus: 'building',
      })
    ).toBe(false);
  });

  it('rejects when pipeline is still running at runtime', () => {
    expect(
      evaluateRenderTerminalComplete({
        ...satisfiedAssembly,
        pipelineRunning: true,
      })
    ).toBe(false);
  });
});

describe('computeRenderPipelineProgress completion authority', () => {
  it('does not emit isComplete or 100% when compile succeeded but layers are incomplete', () => {
    const progress = computeRenderPipelineProgress({
      shellPhase: 'ready',
      compileSuccess: true,
      layerPipelineActive: true,
      ensureStationActive: true,
      pipelinePhase: 'generating',
      layersComplete: 1,
      layersTotal: 8,
      compositeStatus: 'building',
    });
    expect(progress.isComplete).toBe(false);
    expect(progress.progressPct).toBeLessThan(100);
    expect(progress.isRunning).toBe(true);
  });

  it('emits isComplete and 100% only when all invariants are satisfied', () => {
    const progress = computeRenderPipelineProgress(satisfiedAssembly);
    expect(progress.isComplete).toBe(true);
    expect(progress.progressPct).toBe(100);
    expect(progress.currentStepId).toBe('complete');
  });

  it('keeps Render complete step pending until terminal invariants pass', () => {
    const progress = computeRenderPipelineProgress({
      shellPhase: 'ready',
      compileSuccess: true,
      layersComplete: 1,
      layersTotal: 8,
      compositeStatus: 'partial',
    });
    const completeStep = progress.steps.find((s) => s.id === 'complete');
    expect(completeStep?.status).not.toBe('done');
    expect(progress.currentStepId).not.toBe('complete');
  });

  it('marks prior shell steps done while layer assembly is still active', () => {
    const progress = computeRenderPipelineProgress({
      shellPhase: 'ready',
      ensureStationActive: true,
      layerPipelineActive: true,
      pipelinePhase: 'queued',
      layersComplete: 0,
      layersTotal: 8,
      compositeStatus: 'building',
    });
    const shellStepIds = ['compile-preview-spec', 'generate-shell', 'register-ephemeral'] as const;
    for (const id of shellStepIds) {
      const step = progress.steps.find((s) => s.id === id);
      expect(step?.status).toBe('done');
    }
    expect(progress.isComplete).toBe(false);
    expect(progress.progressPct).toBeLessThan(100);
  });

  it('keeps isComplete false when compile has not succeeded', () => {
    const progress = computeRenderPipelineProgress({
      shellPhase: 'ready',
      layersComplete: 8,
      layersTotal: 8,
      compositeStatus: 'ready',
    });
    expect(progress.isComplete).toBe(false);
    expect(progress.progressPct).toBeLessThan(100);
  });

  it('fails closed on shell failure without terminal completion', () => {
    const progress = computeRenderPipelineProgress({
      ...satisfiedAssembly,
      shellPhase: 'failed',
      shellFailed: true,
    });
    expect(progress.isFailed).toBe(true);
    expect(progress.isComplete).toBe(false);
    expect(progress.progressPct).toBeLessThan(100);
  });
});

describe('screenshot A/B contradiction guards', () => {
  it('cannot show 100% while layer overlay would read 1/8 generating', () => {
    const progress = computeRenderPipelineProgress({
      shellPhase: 'ready',
      compileSuccess: true,
      pipelinePhase: 'generating',
      layersComplete: 1,
      layersTotal: 8,
      compositeStatus: 'building',
      layerPipelineActive: true,
    });
    expect(progress.progressPct).toBeLessThan(100);
    expect(progress.isComplete).toBe(false);
  });

  it('cannot show 100% while queue reads 0/8', () => {
    const progress = computeRenderPipelineProgress({
      shellPhase: 'ready',
      compileSuccess: true,
      pipelinePhase: 'queued',
      layersComplete: 0,
      layersTotal: 8,
      compositeStatus: 'building',
      ensureStationActive: true,
    });
    expect(progress.progressPct).toBeLessThan(100);
    expect(progress.isComplete).toBe(false);
  });
});
