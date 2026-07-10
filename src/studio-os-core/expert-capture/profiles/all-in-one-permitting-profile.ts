import { detectFollowUpNeeded } from '../follow-up-detector';
import {
  ALL_IN_ONE_PERMITTING_FUTURE_PLACEHOLDERS,
  ALL_IN_ONE_PERMITTING_QUESTIONS,
  ALL_IN_ONE_PERMITTING_ROUTE,
  ALL_IN_ONE_PERMITTING_SESSION_KEY,
} from './permitting-constants';
import { buildPermittingExportBundle } from '../export-permitting';
import { buildPermittingSessionSummary } from './permitting-summary';
import { CONSENT_RETENTION_DAYS } from '../constants';
import type { ExpertCaptureProfile } from './profile-types';

function buildPermittingFollowUp(transcript: string, question: string): string | null {
  if (!detectFollowUpNeeded(transcript)) return null;
  const lower = transcript.toLowerCase();
  if (lower.includes('depends') || lower.includes('varies')) {
    return 'Which factors determine how you handle this — jurisdiction, project type, or something else?';
  }
  if (lower.includes('city') || lower.includes('municipality') || lower.includes('county')) {
    return 'Can you give me a specific example of how one jurisdiction handles this differently from another?';
  }
  if (lower.includes('inspector') || lower.includes('inspection')) {
    return 'Walk me through exactly when you reach out to an inspector and what you say.';
  }
  if (lower.includes('missing') || lower.includes('incomplete')) {
    return 'How do you spot that something is missing before submission — what is your checklist?';
  }
  if (lower.includes('reject')) {
    return 'What is the most common reason permits get rejected, and how do you prevent it?';
  }
  return `You mentioned something important about "${question.slice(0, 50)}…" — can you walk me through a real example?`;
}

export const ALL_IN_ONE_PERMITTING_PROFILE: ExpertCaptureProfile = {
  id: 'all-in-one-permitting-v1',
  sessionStorageKey: ALL_IN_ONE_PERMITTING_SESSION_KEY,
  route: ALL_IN_ONE_PERMITTING_ROUTE,
  branding: {
    instituteLabel: 'Studio Institute',
    captureTitle: 'Expert Knowledge Capture',
    profession: 'Permitting Specialist',
    company: 'All In One',
    sessionLabel: 'Training Session',
    landingDescription:
      'Teach Studio OS how All In One performs permitting work — one question at a time through natural conversation. You remain the authority; the AI is your apprentice.',
    consentPurpose:
      'Capture your permitting expertise to train Studio OS permit workers exactly as you approve.',
  },
  defaultExpertRole: 'Permitting Specialist',
  defaultOrganization: 'All In One',
  lockRole: true,
  lockOrganization: true,
  questions: ALL_IN_ONE_PERMITTING_QUESTIONS.map((q) => ({ ...q })),
  futurePlaceholders: ALL_IN_ONE_PERMITTING_FUTURE_PLACEHOLDERS,
  aiIndustryContext:
    'residential and commercial permitting for All In One — permit packages, municipalities, inspections, contractor coordination, customer communication, and quality control',
  minutesPerQuestion: 4,
  buildSessionSummary: buildPermittingSessionSummary,
  buildExportBundle: buildPermittingExportBundle,
  buildLocalFollowUp: buildPermittingFollowUp,
};

export { CONSENT_RETENTION_DAYS };
