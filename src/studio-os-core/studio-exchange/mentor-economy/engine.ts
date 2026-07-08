import type { ProfessionalLicense } from '../licenses/schema';
import type {
  MentorApprenticeAssignment,
  MentorEligibilityRecord,
  MentorPointsLedgerEntry,
  MentorReputationSnapshot,
} from './schema';
import { getExchangeCertification } from '../certifications/registry';

const MASTER_CERT_SUFFIX = ':cert:master';

export function evaluateMentorEligibility(license: ProfessionalLicense): MentorEligibilityRecord {
  const worldCerts = license.certificationProgress.filter((c) => c.certificationId.includes(MASTER_CERT_SUFFIX));
  const earnedMaster = worldCerts.some((c) => c.status === 'earned');
  const masterCertId = license.certificationProgress
    .map((c) => c.certificationId)
    .find((id) => id.endsWith(MASTER_CERT_SUFFIX));

  const required = masterCertId ? [masterCertId] : [];
  const satisfied = license.certificationProgress
    .filter((c) => c.status === 'earned')
    .map((c) => c.certificationId);

  let mentorLevel: MentorEligibilityRecord['mentorLevel'] = 'none';
  if (earnedMaster) mentorLevel = 'master-mentor';
  else if (satisfied.length >= 1) mentorLevel = 'journeyman-mentor';

  return {
    eligible: earnedMaster || satisfied.length >= 2,
    mentorLevel,
    requiredCertificationIds: required,
    satisfiedCertificationIds: satisfied,
    teachingRights: earnedMaster ? ['host-cohort', 'mentor-apprentice', 'industry-briefing'] : [],
  };
}

export function createMentorAssignment(input: {
  mentorLicenseId: string;
  apprenticeLicenseId: string;
  careerWorldId: string;
}): MentorApprenticeAssignment {
  return {
    assignmentId: `mentor-assign-${Date.now()}`,
    mentorLicenseId: input.mentorLicenseId,
    apprenticeLicenseId: input.apprenticeLicenseId,
    careerWorldId: input.careerWorldId,
    assignedAt: new Date().toISOString(),
    status: 'active',
  };
}

export function recordMentorPoints(input: {
  mentorLicenseId: string;
  points: number;
  reason: string;
}): MentorPointsLedgerEntry {
  return {
    entryId: `mentor-points-${Date.now()}`,
    mentorLicenseId: input.mentorLicenseId,
    points: input.points,
    reason: input.reason,
    recordedAt: new Date().toISOString(),
  };
}

export function buildMentorReputationSnapshot(input: {
  mentorLicenseId: string;
  ledger: MentorPointsLedgerEntry[];
  assignments: MentorApprenticeAssignment[];
}): MentorReputationSnapshot {
  const points = input.ledger
    .filter((e) => e.mentorLicenseId === input.mentorLicenseId)
    .reduce((sum, e) => sum + e.points, 0);
  const apprentices = input.assignments.filter(
    (a) => a.mentorLicenseId === input.mentorLicenseId && a.status === 'active',
  ).length;

  return {
    mentorLicenseId: input.mentorLicenseId,
    industryReputation: Math.min(100, Math.round(points * 0.4)),
    communityPrestige: Math.min(100, Math.round(points * 0.35)),
    communityInfluence: Math.min(100, Math.round(points * 0.25 + apprentices * 5)),
    totalMentorPoints: points,
    apprenticeCount: apprentices,
  };
}

export function certificationUnlocksMentorship(certificationId: string): boolean {
  const def = getExchangeCertification(certificationId);
  return def?.unlocks.some((u) => u.kind === 'mentorship') ?? false;
}
