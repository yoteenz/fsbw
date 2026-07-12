import { describe, expect, it } from 'vitest';
import {
  governedGenerationJobStorageKey,
  GOVERNED_GENERATION_JOB_UI_LABELS,
} from '../../../studio-os-core/creative-production/governed-generation-job';
import { buildGovernedGenerationLayerKey } from './async-job-client';

describe('governed generation job client helpers', () => {
  it('builds deterministic storage keys', () => {
    const key = governedGenerationJobStorageKey('run-1', 'arrival', 'layer-a');
    expect(key).toContain('run-1');
    expect(key).toContain('arrival');
  });

  it('maps UI labels for work-order phases', () => {
    expect(GOVERNED_GENERATION_JOB_UI_LABELS.accepted).toBe('Work order accepted');
    expect(GOVERNED_GENERATION_JOB_UI_LABELS.generating).toBe('Decorating in progress');
    expect(GOVERNED_GENERATION_JOB_UI_LABELS.complete).toBe('Complete');
  });

  it('builds layer keys from payload fields', () => {
    const key = buildGovernedGenerationLayerKey({
      compileRunId: 'c1',
      stationId: 'arrival',
      productionGroupId: 'pg',
      heroAssetId: 'hero',
    });
    expect(key).toContain('c1');
    expect(key).toContain('pg:hero');
  });
});
