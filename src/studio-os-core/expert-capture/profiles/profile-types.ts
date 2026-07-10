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

export type ExpertCaptureProfile = {
  id: string;
  sessionStorageKey: string;
  route: string;
  branding: ExpertCaptureBranding;
  defaultExpertRole: string;
  defaultOrganization: string;
  lockRole: boolean;
  lockOrganization: boolean;
  questions: ExpertCaptureQuestion[];
  futurePlaceholders: readonly string[];
  aiIndustryContext: string;
  minutesPerQuestion: number;
  buildSessionSummary: (session: ExpertCaptureSession) => SessionSummaryReport;
  buildExportBundle: (session: ExpertCaptureSession) => Record<string, string>;
  buildLocalFollowUp?: (transcript: string, question: string) => string | null;
};
