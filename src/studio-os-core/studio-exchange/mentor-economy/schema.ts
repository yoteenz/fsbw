export type MentorEligibilityRecord = {
  eligible: boolean;
  mentorLevel: 'none' | 'apprentice-mentor' | 'journeyman-mentor' | 'master-mentor';
  requiredCertificationIds: string[];
  satisfiedCertificationIds: string[];
  teachingRights: string[];
};

export type MentorApprenticeAssignment = {
  assignmentId: string;
  mentorLicenseId: string;
  apprenticeLicenseId: string;
  careerWorldId: string;
  assignedAt: string;
  status: 'active' | 'completed' | 'paused';
};

export type MentorPointsLedgerEntry = {
  entryId: string;
  mentorLicenseId: string;
  points: number;
  reason: string;
  recordedAt: string;
};

export type MentorReputationSnapshot = {
  mentorLicenseId: string;
  industryReputation: number;
  communityPrestige: number;
  communityInfluence: number;
  totalMentorPoints: number;
  apprenticeCount: number;
};
