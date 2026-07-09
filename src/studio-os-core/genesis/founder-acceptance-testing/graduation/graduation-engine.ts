import { FAT_PASS_THRESHOLD, type FatValidationLevel } from '../constants';
import type { FatGraduatedSystem, FatValidationRecord } from '../types';
import { evaluateWithdrawalTest } from '../withdrawal-test/withdrawal-engine';
import { evaluateReplacementTest } from '../replacement-test/replacement-engine';
import { isGenesisFeedbackComplete } from '../genesis-feedback/feedback-engine';
import { hasMinimumFounderEvidence } from '../evidence/evidence-engine';
import { listValidationRegistry } from '../validation/registry';

/** Graduation Engine™ — determines Launch Stack graduation eligibility */
export function canGraduateToNextLevel(
  record: FatValidationRecord,
  targetLevel: FatValidationLevel
): { eligible: boolean; blockers: string[] } {
  const blockers: string[] = [];

  if (targetLevel === 'implementation') {
    const arch = record.gates.find((g) => g.level === 'architectural');
    if (arch?.status !== 'accepted' && arch?.status !== 'graduated') {
      blockers.push('Architectural Validation not accepted');
    }
  }

  if (targetLevel === 'founder-acceptance') {
    const impl = record.gates.find((g) => g.level === 'implementation');
    if (impl?.status !== 'accepted' && impl?.status !== 'graduated') {
      blockers.push('Implementation Validation not verified');
    }
  }

  if (targetLevel === 'company') {
    const founder = record.gates.find((g) => g.level === 'founder-acceptance');
    const withdrawal = evaluateWithdrawalTest(record.systemId);
    const replacement = evaluateReplacementTest(record.systemId);

    if (record.founderAcceptanceScore < FAT_PASS_THRESHOLD) {
      blockers.push(`Founder score ${record.founderAcceptanceScore} below ${FAT_PASS_THRESHOLD}`);
    }
    if (!withdrawal.passed) blockers.push('Withdrawal Test not passed');
    if (!replacement.passed) blockers.push('Replacement Test not passed');
    if (!record.delight.present) blockers.push('Delight signal not present');
    if (!hasMinimumFounderEvidence(record.systemId)) {
      blockers.push('Insufficient founder evidence');
    }
    if (!isGenesisFeedbackComplete(record.systemId)) {
      blockers.push('Genesis feedback packet incomplete');
    }
    if (founder?.status !== 'accepted' && founder?.status !== 'graduated') {
      blockers.push('Founder Acceptance gate not accepted');
    }
  }

  return { eligible: blockers.length === 0, blockers };
}

export function resolveGraduationStatus(record: FatValidationRecord): {
  graduated: boolean;
  levelsGraduated: FatValidationLevel[];
} {
  const levelsGraduated: FatValidationLevel[] = [];

  for (const gate of record.gates) {
    if (gate.status === 'graduated' || gate.status === 'accepted') {
      levelsGraduated.push(gate.level);
    }
  }

  const companyCheck = canGraduateToNextLevel(record, 'company');
  const graduated =
    record.graduated ||
    (companyCheck.eligible && levelsGraduated.includes('founder-acceptance'));

  return { graduated, levelsGraduated };
}

export function listGraduatedSystems(): FatGraduatedSystem[] {
  return listValidationRegistry()
    .filter((r) => resolveGraduationStatus(r).graduated)
    .map((r) => {
      const { levelsGraduated } = resolveGraduationStatus(r);
      return {
        systemId: r.systemId,
        officialName: r.officialName,
        graduatedAt: r.graduatedAt ?? r.updatedAt,
        founderAcceptanceScore: r.founderAcceptanceScore,
        levelsGraduated,
        evidenceCount: r.evidence.length,
      };
    })
    .sort((a, b) => new Date(b.graduatedAt).getTime() - new Date(a.graduatedAt).getTime());
}

export function listSystemsAwaitingGraduation(): FatValidationRecord[] {
  return listValidationRegistry().filter((r) => {
    const { graduated } = resolveGraduationStatus(r);
    if (graduated) return false;
    const impl = r.gates.find((g) => g.level === 'implementation');
    return impl?.status === 'accepted' || impl?.status === 'graduated';
  });
}
