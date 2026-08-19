/**
 * Synthetic QA data factory — demo store only; never real client data.
 */
import { createDemoSeed } from '../../../src/demo/demoSeed';
import { loadDemoStore, saveDemoStore } from '../../../src/demo/demoStore';
import type { DemoStore } from '../../../src/demo/demoTypes';
import { defaultIntakeAnswers } from '../../../src/intake/intakeTypes';
import { createQaRunContext, qaCompanyName, type QaRunContext } from './qa-run-context';

export function seedQaDemoStore(ctx?: QaRunContext): { store: DemoStore; ctx: QaRunContext } {
  const run = ctx ?? createQaRunContext();
  const store = createDemoSeed();
  const qaName = qaCompanyName('Client LLC', run);
  store.intake = {
    ...defaultIntakeAnswers(),
    business: {
      ...defaultIntakeAnswers().business,
      name: qaName,
      structure: 'llc',
      formationState: 'TN',
    },
  };
  saveDemoStore(store);
  return { store: loadDemoStore(), ctx: run };
}

export function cleanupQaDemoRecords(ctx: QaRunContext): { cleaned: string[]; skipped: string[] } {
  const store = loadDemoStore();
  const cleaned: string[] = [];
  const skipped: string[] = [];
  const suffix = ctx.runId.slice(-8);
  const name = store.intake?.business?.name ?? '';

  if (name.includes(suffix) && name.includes('AIO QA')) {
    store.intake = defaultIntakeAnswers();
    cleaned.push('intake');
  } else if (name.includes('AIO QA')) {
    skipped.push('intake:foreign-qa-run');
  }

  saveDemoStore(store);
  return { cleaned, skipped };
}
