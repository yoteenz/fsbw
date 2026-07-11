import { BASE_INTERVIEW_QUESTIONS, CONSENT_RETENTION_DAYS, EXPERT_CAPTURE_ROUTE } from '../constants';
import { buildSessionSummary as buildDefaultSummary } from '../knowledge-extraction';
import { buildDefaultExportBundle } from '../export-default';
import type { ExpertCaptureProfile } from './profile-types';
import { EXPERT_CAPTURE_FUTURE_PLACEHOLDERS } from '../placeholders';

export const DEFAULT_EXPERT_CAPTURE_PROFILE: ExpertCaptureProfile = {
  id: 'generic-v1',
  companyId: 'studio-os',
  interviewTemplateVersion: '1',
  sessionStorageKey: 'studioExpertCaptureSession_v1',
  route: EXPERT_CAPTURE_ROUTE,
  branding: {
    instituteLabel: 'Studio Institute',
    captureTitle: 'Expert Capture',
    profession: 'Expert',
    company: 'Studio OS',
    sessionLabel: 'Expert Capture Session',
    landingDescription:
      'Teach Studio OS through conversation — one question at a time. You remain the authority; the AI is your apprentice.',
    consentPurpose: 'Capture your professional knowledge to train Studio OS apprentices.',
  },
  defaultExpertRole: 'Professional',
  defaultOrganization: 'Studio OS',
  lockRole: false,
  lockOrganization: false,
  workerDefinition: {
    workerDisplayName: '{organization} Professional',
    isolationPolicy: 'organization',
  },
  questions: BASE_INTERVIEW_QUESTIONS.map((q) => ({ ...q })),
  futurePlaceholders: EXPERT_CAPTURE_FUTURE_PLACEHOLDERS,
  aiIndustryContext: 'general professional expertise',
  minutesPerQuestion: 3,
  buildSessionSummary: buildDefaultSummary,
  buildExportBundle: buildDefaultExportBundle,
};

export { CONSENT_RETENTION_DAYS };
