/**
 * Studio Project™ — canonical platform object (not pages, posts, or files).
 * Users direct productions; outputs are derivatives linked to the Project.
 */

import type { ProductionDepartmentId } from '../content-pipeline/departments';

export const STUDIO_PROJECT_001_ID = 'project-001';

export type ProjectOutputKind =
  | 'website-page'
  | 'landing-page'
  | 'instagram-reel'
  | 'instagram-carousel'
  | 'instagram-feed'
  | 'tiktok'
  | 'facebook-post'
  | 'email'
  | 'newsletter'
  | 'blog-article'
  | 'knowledge-base-article'
  | 'faq'
  | 'pinterest-pin'
  | 'linkedin-post'
  | 'x-thread'
  | 'youtube-short'
  | 'youtube-longform'
  | 'podcast-episode'
  | 'advertisement'
  | 'sales-page'
  | 'print-material'
  | 'presentation';

export type ProjectOutputStatus = 'planned' | 'in-production' | 'in-review' | 'approved' | 'scheduled' | 'published';

export type ProjectOutput = {
  id: string;
  projectId: string;
  kind: ProjectOutputKind;
  label: string;
  status: ProjectOutputStatus;
  channel?: string;
};

export type ProjectTimelineKind =
  | 'project-created'
  | 'creative-direction-updated'
  | 'mood-board-expanded'
  | 'storyboard-approved'
  | 'production-started'
  | 'review-requested'
  | 'marketing-approved'
  | 'publishing-complete'
  | 'performance-review'
  | 'knowledge-captured'
  | 'department-handoff'
  | 'founder-note'
  | 'concierge-review';

export type ProjectTimelineEvent = {
  id: string;
  projectId: string;
  kind: ProjectTimelineKind;
  label: string;
  detail: string;
  createdAt: string;
  departmentId?: ProductionDepartmentId;
};

export type StudioProjectStatus = {
  department: ProductionDepartmentId;
  departmentLabel: string;
  progressPct: number;
  currentObjective: string;
  pendingReview: string | null;
  nextDepartment: ProductionDepartmentId | null;
  nextDepartmentLabel: string | null;
};

export type StudioProject = {
  id: string;
  number: number;
  displayCode: string;
  name: string;
  initiativeType: string;
  status: StudioProjectStatus;
};

export type ProjectDashboardSnapshot = {
  project: StudioProject;
  creativeDirectionBranch: string;
  creativeDirectionNorthStar: string;
  moodBoardHighlight: string;
  openFounderNotes: number;
  conciergeStatus: string;
  pendingReviews: string[];
  productionTimeline: ProjectTimelineEvent[];
  outputsCreated: ProjectOutput[];
  outputsRemaining: ProjectOutput[];
  publishingSchedule: string | null;
  performanceSummary: string;
  aiRecommendations: string[];
};

export const PROJECT_OUTPUT_LABELS: Record<ProjectOutputKind, string> = {
  'website-page': 'Website Page',
  'landing-page': 'Landing Page',
  'instagram-reel': 'Instagram Reel',
  'instagram-carousel': 'Instagram Carousel',
  'instagram-feed': 'Instagram Feed Post',
  tiktok: 'TikTok',
  'facebook-post': 'Facebook Post',
  email: 'Email',
  newsletter: 'Newsletter',
  'blog-article': 'Blog Article',
  'knowledge-base-article': 'Knowledge Base Article',
  faq: 'FAQ',
  'pinterest-pin': 'Pinterest Pin',
  'linkedin-post': 'LinkedIn Post',
  'x-thread': 'X Thread',
  'youtube-short': 'YouTube Short',
  'youtube-longform': 'YouTube Long-form',
  'podcast-episode': 'Podcast Episode',
  advertisement: 'Advertisement',
  'sales-page': 'Sales Page',
  'print-material': 'Print Material',
  presentation: 'Presentation',
};

export const PROJECT_TERMINOLOGY = {
  prefer: ['Project', 'Production', 'Output', 'Creative Direction', 'Production Timeline', 'Deliverable', 'Department', 'Workspace', 'Mission Control'],
  avoid: ['Page', 'Post', 'File', 'Document', 'Screen', 'Task'],
} as const;
