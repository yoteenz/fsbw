import type { DeliverableWorkflowStatus } from '../campaign-engine/types';
import type { NdxbookPage } from '../ndxbook/types';
import type { MasterContentLifecycleStageId } from './types';

/** Map Campaign Engine deliverable workflow → nearest lifecycle stage (migration bridge). */
export function mapDeliverableWorkflowToLifecycle(
  workflowStatus: DeliverableWorkflowStatus,
  hasResearch = false
): MasterContentLifecycleStageId {
  switch (workflowStatus) {
    case 'draft':
      return hasResearch ? 'internal-editing' : 'master-content-creation';
    case 'review':
      return 'concierge-review-board';
    case 'approved':
      return 'content-expansion';
    case 'scheduled':
      return 'scheduling';
    case 'published':
      return 'performance-evaluation';
    case 'learning':
      return 'studio-intelligence-learning';
    default:
      return 'master-content-creation';
  }
}

/** Map NDXBook registry page status → lifecycle stage (Page 001 = Master Content Asset). */
export function mapNdxbookPageToLifecycle(page: NdxbookPage | null): MasterContentLifecycleStageId {
  if (!page) return 'master-content-creation';
  if (page.status === 'published') return 'knowledge-library';
  if (page.status === 'scheduled') return 'scheduling';
  if (page.pipeline?.approvedAt) return 'content-expansion';
  if (page.status === 'review' || page.pipeline?.studioReview) return 'concierge-review-board';
  return 'master-content-creation';
}

/** Legacy label bridge — "page" in UI copy should read as Master Content Asset when flagged. */
export function formatMasterContentLabel(pageLabel: string): string {
  return pageLabel.replace(/^page\s/i, 'Master Content Asset · page ');
}
