import { FAT_PASS_THRESHOLD } from '../constants';
import type { FatWithdrawalTestResult } from '../types';
import { getValidationRecord } from '../validation/registry';

const WITHDRAWAL_CRITERIA_TOTAL = 8;

/** Withdrawal Test™ — would the founder immediately miss this system? */
export function evaluateWithdrawalTest(systemId: string): FatWithdrawalTestResult {
  const record = getValidationRecord(systemId);
  if (record?.withdrawalTest.completedAt) {
    return record.withdrawalTest;
  }

  const score = record?.founderAcceptanceScore ?? 0;
  const delight = record?.delight.present ?? false;
  const replacement = record?.replacementTest.passed ?? false;

  let criteriaMet = 0;
  const notes: string[] = [];

  if (score >= 70) {
    criteriaMet += 1;
    notes.push('Founder reaches for the system without prompting.');
  }
  if (replacement) {
    criteriaMet += 1;
    notes.push('Old workflow feels friction without Studio OS.');
  }
  if (score >= FAT_PASS_THRESHOLD) {
    criteriaMet += 1;
    notes.push('Real missions slow down without the system.');
  }
  if (delight) {
    criteriaMet += 1;
    notes.push('Founder loses context or confidence without it.');
  }
  if (record?.metrics.some((m) => m.metricId === 'daily-usage' && m.score >= 65)) {
    criteriaMet += 1;
    notes.push('Repeat daily usage signal present.');
  }
  if (record?.metrics.some((m) => m.metricId === 'time-saved' && m.score >= 70)) {
    criteriaMet += 1;
    notes.push('Founder can name specific time saved.');
  }
  if (record?.genesisFeedback.learningSummary) {
    criteriaMet += 1;
    notes.push('Founder can articulate value in their own words.');
  }

  const passed = criteriaMet >= 4;

  return {
    testId: `withdrawal-${systemId}`,
    systemId,
    passed,
    criteriaMet,
    criteriaTotal: WITHDRAWAL_CRITERIA_TOTAL,
    founderWouldMiss: passed,
    frictionWithoutSystem: passed
      ? 'Founder workflow regresses — context, speed, and confidence drop.'
      : 'System is optional today — founder can revert without major friction.',
    notes,
  };
}

export function listFailedWithdrawalTests(): FatWithdrawalTestResult[] {
  return ['executive-headquarters', 'orb', 'identity-engine', 'build-order', 'founder-acceptance-testing']
    .map(evaluateWithdrawalTest)
    .filter((t) => !t.passed);
}
