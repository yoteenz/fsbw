import type { AioRoadmapItemStatus } from '../types';

const statusLabels: Record<AioRoadmapItemStatus, string> = {
  complete: 'Complete',
  'in-progress': 'In Progress',
  needed: 'Needed',
  optional: 'Optional',
  available: 'Available',
};

const statusClass: Record<AioRoadmapItemStatus, string> = {
  complete: 'aio-badge--complete',
  'in-progress': 'aio-badge--progress',
  needed: 'aio-badge--needed',
  optional: 'aio-badge--optional',
  available: 'aio-badge--optional',
};

type Props = {
  status: AioRoadmapItemStatus;
};

export function AIOStatusBadge({ status }: Props) {
  return <span className={`aio-badge ${statusClass[status]}`}>{statusLabels[status]}</span>;
}
