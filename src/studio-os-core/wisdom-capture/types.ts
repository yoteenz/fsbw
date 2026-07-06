import type { WISDOM_LEARNING_TARGETS, WISDOM_LIBRARY_CATEGORIES } from './constants';

export type WisdomLibraryCategory = (typeof WISDOM_LIBRARY_CATEGORIES)[number];
export type WisdomLearningTarget = (typeof WISDOM_LEARNING_TARGETS)[number];

export type WisdomEntry = {
  id: string;
  wisdom: string;
  whyItMatters: string;
  category: WisdomLibraryCategory;
  department?: string;
  brainId?: string;
  projectId?: string;
  customerContext?: string;
  industryTag?: string;
  capturedAt: string;
  capturedBy: 'founder' | 'employee' | 'concierge' | 'system';
  sourceText: string;
  triggerPattern: string;
  searchableTags: string[];
  syncedTo: WisdomLearningTarget[];
};

export type PendingWisdomDetection = {
  id: string;
  detectedAt: string;
  sourceText: string;
  extractedWisdom: string;
  triggerPattern: string;
  suggestedCategory: WisdomLibraryCategory;
  prompt: string;
  status: 'pending' | 'preserved' | 'dismissed';
};

export type OrganizationalLearningImpact = {
  target: WisdomLearningTarget;
  label: string;
  impactCount: number;
  description: string;
};

export type OrganizationWisdomProfile = {
  organizationId: string;
  companyName: string;
  industryId: string;
  updatedAt: string;
  totalWisdomCaptured: number;
  wisdomDepthScore: number;
  pendingDetections: PendingWisdomDetection[];
  wisdomLibrary: WisdomEntry[];
  learningImpacts: OrganizationalLearningImpact[];
  syncedSources: string[];
};

export type WisdomCaptureStore = {
  version: string;
  profiles: OrganizationWisdomProfile[];
};

export type WisdomDetectionResult = {
  detected: boolean;
  extractedWisdom: string;
  triggerPattern: string;
  suggestedCategory: WisdomLibraryCategory;
  prompt: string;
};

export type WisdomCaptureDockAdvice = {
  response: string;
  concierge: string;
  detection?: WisdomDetectionResult;
  wisdomCount?: number;
};
