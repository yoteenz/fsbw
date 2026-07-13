import type { ManufacturingQueue } from '../manufacturing-engine/manufacturing-queue';

export const DEPENDENCY_VISUALIZER_VERSION = 'dependency-visualizer.v1';

export type DependencyEdge = {
  edgeId: string;
  fromId: string;
  fromLabel: string;
  toId: string;
  toLabel: string;
  dependencyType: 'manufacturing' | 'socket' | 'lighting';
  label: string;
};

export type DependencyGraph = {
  graphVersion: typeof DEPENDENCY_VISUALIZER_VERSION;
  planId: string;
  edges: DependencyEdge[];
};

export function buildDependencyGraph(queue: ManufacturingQueue): DependencyGraph {
  const edges: DependencyEdge[] = [];
  let edgeNum = 0;

  for (const job of queue.jobs) {
    for (const depId of job.dependencies) {
      const depJob = queue.jobs.find((j) => j.jobId === depId);
      if (!depJob) continue;
      edges.push({
        edgeId: `edge-${edgeNum++}`,
        fromId: job.assetId,
        fromLabel: job.assetId,
        toId: depJob.assetId,
        toLabel: depJob.assetId,
        dependencyType: job.jobType === 'lighting' ? 'lighting' : 'manufacturing',
        label: `${job.assetId} depends on ${depJob.assetId}`,
      });
    }
  }

  return {
    graphVersion: DEPENDENCY_VISUALIZER_VERSION,
    planId: queue.planId,
    edges,
  };
}
