import { getMemoryPipelineStatus } from './pipeline';
import { buildMemoryGraph } from './memory-graph';
import type { OrganizationMemorySystemProfile } from './types';

export function buildOrganizationMemorySystemProfile(
  organizationId: string
): OrganizationMemorySystemProfile {
  const status = getMemoryPipelineStatus();
  const graph = buildMemoryGraph();

  return {
    organizationId,
    syncedAt: new Date().toISOString(),
    archiveCount: status.archiveCount,
    extractionCount: status.extractionCount,
    pendingReviewCount: status.pendingReviewCount,
    publishedCount: status.publishedCount,
    memoryGraphNodeCount: graph.nodes.length,
    archivistLines: [
      `Memory System™ — ${status.archiveCount} archives · ${status.extractionCount} extractions · ${status.publishedCount} approved.`,
      `${status.pendingReviewCount} extraction reports await founder review.`,
      'Conversations are history. Knowledge is understanding. Canon is approval.',
    ],
  };
}

export function getOrganizationMemorySystemProfile(
  organizationId: string
): OrganizationMemorySystemProfile {
  return buildOrganizationMemorySystemProfile(organizationId);
}

export function syncMemorySystemFromSources(organizationId: string): OrganizationMemorySystemProfile {
  return buildOrganizationMemorySystemProfile(organizationId);
}
