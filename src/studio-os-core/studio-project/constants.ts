import type { StudioProject, ProjectOutput } from './types';
import { STUDIO_PROJECT_001_ID } from './types';

export const PROJECT_001: Pick<StudioProject, 'id' | 'number' | 'displayCode' | 'name' | 'initiativeType'> = {
  id: STUDIO_PROJECT_001_ID,
  number: 1,
  displayCode: 'PROJECT 001',
  name: 'Truth Tuesday · Credit Education',
  initiativeType: 'Educational Series · Instagram-first',
};

/** Pilot deliverable plan — outputs linked to Project 001. */
export const PROJECT_001_OUTPUT_PLAN: Omit<ProjectOutput, 'projectId'>[] = [
  { id: 'out-ig-feed', kind: 'instagram-feed', label: 'Instagram Feed · Project 001', status: 'planned', channel: 'Instagram' },
  { id: 'out-ig-carousel', kind: 'instagram-carousel', label: 'Instagram Carousel', status: 'planned', channel: 'Instagram' },
  { id: 'out-ig-reel', kind: 'instagram-reel', label: 'Instagram Reel', status: 'planned', channel: 'Instagram' },
  { id: 'out-newsletter', kind: 'newsletter', label: 'Newsletter Excerpt', status: 'planned', channel: 'Email' },
  { id: 'out-kb', kind: 'knowledge-base-article', label: 'Credit Score FAQ Node', status: 'planned', channel: 'Knowledge Graph' },
  { id: 'out-blog', kind: 'blog-article', label: 'Long-form Blog Excerpt', status: 'planned', channel: 'Web' },
];

export const DEPARTMENT_OBJECTIVES: Record<string, string> = {
  discover: 'Validate opportunity and approve creative brief',
  development: 'Finalize storyboard and production package',
  assembly: 'Confirm production readiness and dependencies',
  production: 'Complete primary production assets',
  review: 'Pass Studio Intelligence and concierge review',
  expansion: 'Build derivative output library',
  approval: 'Authorize publishing across channels',
  publishing: 'Release outputs to Instagram',
  intelligence: 'Measure production performance',
  learning: 'Capture knowledge for the next production',
};

export const DEPARTMENT_DISPLAY: Record<string, string> = {
  discover: 'Discover Department',
  development: 'Development Department',
  assembly: 'Assembly Department',
  production: 'Production Department',
  review: 'Review Department',
  expansion: 'Expansion Department',
  approval: 'Approval Department',
  publishing: 'Publishing Department',
  intelligence: 'Intelligence Department',
  learning: 'Learning Department',
};
