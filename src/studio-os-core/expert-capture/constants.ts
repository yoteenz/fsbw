export const EXPERT_CAPTURE_SESSION_KEY = 'studioExpertCaptureSession_v1';
export const EXPERT_CAPTURE_DB_NAME = 'studioExpertCaptureMedia_v1';
export const EXPERT_CAPTURE_DB_STORE = 'blobs';
export const EXPERT_CAPTURE_ROUTE = '/expert-capture';

export const CONSENT_RETENTION_DAYS = 90;

export const FOLLOW_UP_TRIGGERS = [
  'always',
  'usually',
  'sometimes',
  'depends',
  'unless',
  'never',
  'most people',
  'i check',
  'i compare',
  'i verify',
  'i review',
  'i look for',
] as const;

export const BASE_INTERVIEW_QUESTIONS = [
  {
    id: 'q-role',
    text: 'What is your role, and what are you personally responsible for delivering?',
    category: 'Role & Responsibility',
    order: 0,
    optional: false,
  },
  {
    id: 'q-workflow',
    text: 'Walk me through your typical workflow from the moment you start until the work is complete.',
    category: 'Workflow',
    order: 1,
    optional: false,
  },
  {
    id: 'q-quality',
    text: 'What quality checks do you always perform before you consider the work done?',
    category: 'Quality Control',
    order: 2,
    optional: false,
  },
  {
    id: 'q-decisions',
    text: 'What decisions do you make that others rely on — and how do you make them?',
    category: 'Decision Rules',
    order: 3,
    optional: false,
  },
  {
    id: 'q-pushback',
    text: 'When do you say no, push back, or refuse to proceed?',
    category: 'Boundaries',
    order: 4,
    optional: false,
  },
  {
    id: 'q-mistakes',
    text: 'What mistakes do newcomers most often make in your field?',
    category: 'Common Mistakes',
    order: 5,
    optional: false,
  },
  {
    id: 'q-edge',
    text: 'What edge cases or exceptions catch people off guard?',
    category: 'Edge Cases',
    order: 6,
    optional: false,
  },
  {
    id: 'q-verify',
    text: 'What do you always verify, compare, or review before finishing?',
    category: 'Verification',
    order: 7,
    optional: false,
  },
  {
    id: 'q-communication',
    text: 'How do you communicate with clients or stakeholders when something is wrong or unclear?',
    category: 'Communication',
    order: 8,
    optional: false,
  },
  {
    id: 'q-legacy',
    text: 'If you were training an apprentice, what is the one principle they must never forget?',
    category: 'Principles',
    order: 9,
    optional: false,
  },
] as const;
