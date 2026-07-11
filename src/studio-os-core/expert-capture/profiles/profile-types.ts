import type { ExpertCaptureQuestion, ExpertCaptureSession, SessionSummaryReport } from '../types';

export type ExpertCaptureBranding = {
  instituteLabel: string;
  captureTitle: string;
  profession: string;
  company: string;
  sessionLabel: string;
  landingDescription: string;
  consentPurpose: string;
};

/** Enterprise-ready worker definition — profession profiles extend this, never hardcode in UI */
export type ExpertCaptureWorkerDefinition = {
  workerDisplayName: string;
  /** Use {organization} token for org-scoped worker title */
  isolationPolicy: 'organization';
};

export type ExpertCaptureProfile = {
  id: string;
  companyId: string;
  interviewTemplateVersion: string;
  sessionStorageKey: string;
  route: string;
  branding: ExpertCaptureBranding;
  defaultExpertRole: string;
  defaultOrganization: string;
  lockRole: boolean;
  lockOrganization: boolean;
  workerDefinition?: ExpertCaptureWorkerDefinition;
  questions: ExpertCaptureQuestion[];
  futurePlaceholders: readonly string[];
  aiIndustryContext: string;
  minutesPerQuestion: number;
  buildSessionSummary: (session: ExpertCaptureSession) => SessionSummaryReport;
  buildExportBundle: (session: ExpertCaptureSession) => Record<string, string>;
  buildLocalFollowUp?: (transcript: string, question: string) => string | null;
};
