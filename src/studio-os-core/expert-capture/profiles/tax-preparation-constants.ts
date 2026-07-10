import type { ExpertCaptureQuestion } from '../types';

export const TAX_PREPARATION_ROUTE = '/expert-capture/tax-preparation';
export const TAX_PREPARATION_SESSION_KEY = 'studioExpertCaptureSession_taxPreparation_v1';

export const TAX_PREPARATION_QUESTIONS: ExpertCaptureQuestion[] = [
  {
    id: 't-overview',
    text: 'Give me an overview of your tax preparation practice — who do you serve and what services do you offer?',
    category: 'Business Overview',
    order: 0,
    optional: false,
  },
  {
    id: 't-intake',
    text: 'Walk me through your first interaction with a new tax client — from initial contact through understanding what they need.',
    category: 'Customer Intake',
    order: 1,
    optional: false,
  },
  {
    id: 't-documents',
    text: 'What documents do you request first — and how do you know when a client file is incomplete?',
    category: 'Required Documentation',
    order: 2,
    optional: false,
  },
  {
    id: 't-workflow',
    text: 'Walk me through your typical return workflow from document receipt through filing.',
    category: 'Workflow',
    order: 3,
    optional: false,
  },
  {
    id: 't-decisions',
    text: 'What tax decisions do you make that others rely on — and how do you make them?',
    category: 'Decision Rules',
    order: 4,
    optional: false,
  },
  {
    id: 't-qa',
    text: 'What quality checks do you always perform before a return is filed?',
    category: 'Quality Assurance',
    order: 5,
    optional: false,
  },
  {
    id: 't-software',
    text: 'What software and document storage systems do you use — and what naming conventions do you follow?',
    category: 'Software & Storage',
    order: 6,
    optional: false,
  },
  {
    id: 't-communication',
    text: 'How do you communicate with clients when something is missing, delayed, or needs clarification?',
    category: 'Customer Communication',
    order: 7,
    optional: false,
  },
  {
    id: 't-exceptions',
    text: 'What exception handling rules do you follow when a return falls outside the normal workflow?',
    category: 'Exception Handling',
    order: 8,
    optional: false,
  },
  {
    id: 't-escalation',
    text: 'What situations require escalation — and who gets involved at each level?',
    category: 'Escalation Rules',
    order: 9,
    optional: false,
  },
  {
    id: 't-mistakes',
    text: 'What mistakes do clients and inexperienced preparers usually make?',
    category: 'Common Mistakes',
    order: 10,
    optional: false,
  },
  {
    id: 't-lessons',
    text: 'What has experience taught you that is not written in any tax guide or software manual?',
    category: 'Lessons Learned',
    order: 11,
    optional: false,
  },
];

export const TAX_PREPARATION_FUTURE_PLACEHOLDERS = [
  'Tax Knowledge Graph',
  'Return Status Tracker',
  'Document Checklist Generator',
  'Studio Tax Worker',
  'Scenario Testing',
  'Certification',
  'Competency Testing',
  'Worker Graduation',
  'Multi-Expert Knowledge Merging',
  'Studio HR',
  'Studio Institute',
] as const;
