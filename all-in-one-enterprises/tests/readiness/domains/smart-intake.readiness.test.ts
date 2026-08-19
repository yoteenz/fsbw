import { describe, expect, it, beforeAll, beforeEach } from 'vitest';
import { defaultIntakeAnswers } from '../../../src/intake/intakeTypes';
import { intakeRepository } from '../../../src/intake/intakeState';
import { getFieldValue } from '../../../src/intake/intakeRules';
import { intakeSections } from '../../../src/intake/intakeConfig';
import { createQaRunContext, qaCompanyName } from '../lib/qa-run-context';
import { seedQaDemoStore, cleanupQaDemoRecords } from '../lib/synthetic-data-factory';

describe('Smart Intake readiness', () => {
  beforeAll(() => {
    const storage = new Map<string, string>();
    Object.defineProperty(globalThis, 'window', {
      value: {
        localStorage: {
          getItem: (k: string) => storage.get(k) ?? null,
          setItem: (k: string, v: string) => storage.set(k, v),
          removeItem: (k: string) => storage.delete(k),
        },
        dispatchEvent: () => undefined,
      },
      configurable: true,
    });
  });

  beforeEach(() => {
    seedQaDemoStore(createQaRunContext(`intake-${Date.now()}`));
  });

  it('persists save/resume through intake repository', () => {
    const ctx = createQaRunContext(`save-${Date.now()}`);
    const answers = {
      ...defaultIntakeAnswers(),
      business: {
        ...defaultIntakeAnswers().business,
        name: qaCompanyName('Shipper LLC', ctx),
        structure: 'llc' as const,
        formationState: 'TN',
      },
    };
    intakeRepository.save(answers);
    const loaded = intakeRepository.load();
    expect(String(getFieldValue(loaded, 'business.name'))).toContain('AIO QA');
    expect(getFieldValue(loaded, 'business.formationState')).toBe('TN');
  });

  it('defines intake sections for portal handoff', () => {
    expect(intakeSections.length).toBeGreaterThan(2);
  });

  it('cleans up QA-marked intake safely', () => {
    const ctx = createQaRunContext(`cleanup-${Date.now()}`);
    seedQaDemoStore(ctx);
    const result = cleanupQaDemoRecords(ctx);
    expect(result.cleaned).toContain('intake');
  });
});
