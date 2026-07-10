import { detectFollowUpNeeded } from '../follow-up-detector';
import {
  TAX_PREPARATION_FUTURE_PLACEHOLDERS,
  TAX_PREPARATION_QUESTIONS,
  TAX_PREPARATION_ROUTE,
  TAX_PREPARATION_SESSION_KEY,
} from './tax-preparation-constants';
import { buildDefaultExportBundle } from '../export-default';
import { buildSessionSummary } from '../knowledge-extraction';
import { CONSENT_RETENTION_DAYS } from '../constants';
import type { ExpertCaptureProfile } from './profile-types';

function buildTaxFollowUp(transcript: string, question: string): string | null {
  if (!detectFollowUpNeeded(transcript)) return null;
  const lower = transcript.toLowerCase();
  if (lower.includes('depends') || lower.includes('varies')) {
    return 'Which factors determine how you handle this — client type, entity, or complexity?';
  }
  if (lower.includes('document') || lower.includes('missing')) {
    return 'How do you spot missing documents before you start the return?';
  }
  if (lower.includes('extension') || lower.includes('deadline')) {
    return 'Walk me through exactly what you do when a deadline is at risk.';
  }
  return `Can you give me a specific example related to "${question.slice(0, 50)}…"?`;
}

export const TAX_PREPARATION_PROFILE: ExpertCaptureProfile = {
  id: 'tax-preparation-v1',
  companyId: 'tax-preparation',
  interviewTemplateVersion: '1',
  sessionStorageKey: TAX_PREPARATION_SESSION_KEY,
  route: TAX_PREPARATION_ROUTE,
  branding: {
    instituteLabel: 'Studio Institute',
    captureTitle: 'Expert Knowledge Capture',
    profession: 'Tax Preparation Specialist',
    company: 'Tax Preparation Practice',
    sessionLabel: 'Training Session',
    landingDescription:
      'Teach Studio OS how your tax practice operates — one question at a time through natural conversation. You remain the authority; the AI is your apprentice.',
    consentPurpose: 'Capture your tax preparation expertise to train Studio OS workers exactly as you approve.',
  },
  defaultExpertRole: 'Tax Preparation Specialist',
  defaultOrganization: 'Tax Preparation Practice',
  lockRole: true,
  lockOrganization: true,
  questions: TAX_PREPARATION_QUESTIONS.map((q) => ({ ...q })),
  futurePlaceholders: TAX_PREPARATION_FUTURE_PLACEHOLDERS,
  aiIndustryContext:
    'individual and small-business tax preparation — client intake, documentation, return workflow, quality review, software, communication, escalation, and professional judgment',
  minutesPerQuestion: 4,
  buildSessionSummary: buildSessionSummary,
  buildExportBundle: buildDefaultExportBundle,
  buildLocalFollowUp: buildTaxFollowUp,
};

export { CONSENT_RETENTION_DAYS };
