import type { FatReplacementTestResult } from '../types';
import { getValidationRecord } from '../validation/registry';

const REPLACEMENT_MAP: Record<string, { replaced: string[]; retained: string[]; comparison: string }> =
  {
    'executive-headquarters': {
      replaced: ['Scattered admin tabs', 'Manual mission tracking'],
      retained: ['External calendar for scheduling'],
      comparison: 'Executive Atrium consolidates daily operating context into one spatial HQ.',
    },
    orb: {
      replaced: ['Ad-hoc ChatGPT threads', 'Separate briefing notes'],
      retained: ['Deep research in external tools when needed'],
      comparison: 'Orb becomes the default executive intelligence surface inside Studio OS.',
    },
    'identity-engine': {
      replaced: ['Manual role spreadsheets', 'Ad-hoc permission notes'],
      retained: ['Supabase auth for credentials'],
      comparison: 'Identity graph replaces informal ownership tracking.',
    },
    'build-order': {
      replaced: ['Informal build sequencing docs'],
      retained: ['Architecture articles in Genesis'],
      comparison: 'Build Order registry is the live source of Launch Stack sequencing.',
    },
    'founder-acceptance-testing': {
      replaced: ['One-time checklists', 'Vibes-only approval'],
      retained: ['Genesis review for architecture'],
      comparison: 'FAT replaces ad-hoc validation with measurable founder evidence.',
    },
  };

/** Replacement Test™ — what existing tools does the system replace? */
export function evaluateReplacementTest(systemId: string): FatReplacementTestResult {
  const record = getValidationRecord(systemId);
  if (record?.replacementTest.completedAt) {
    return record.replacementTest;
  }

  const mapped = REPLACEMENT_MAP[systemId] ?? {
    replaced: [],
    retained: ['Prior workflow tools'],
    comparison: 'Replacement evidence pending founder operating sessions.',
  };

  const passed = mapped.replaced.length >= 1;

  return {
    testId: `replacement-${systemId}`,
    systemId,
    passed,
    replacedTools: mapped.replaced,
    retainedTools: mapped.retained,
    workflowComparison: mapped.comparison,
  };
}
