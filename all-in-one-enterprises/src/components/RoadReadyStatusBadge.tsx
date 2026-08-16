import type { RoadReadyItemStatus, VerificationStatus } from '../road-ready/roadReadyTypes';

const statusLabels: Record<RoadReadyItemStatus, string> = {
  not_started: 'Not Started',
  action_needed: 'Action Needed',
  in_progress: 'In Progress',
  needs_review: 'Needs Review',
  completed: 'Complete',
  optional: 'Optional',
  not_applicable: 'N/A',
};

const verificationLabels: Record<VerificationStatus, string> = {
  unverified: 'Unverified',
  self_reported: 'Self-Reported',
  pending_review: 'Pending Review',
  verified: 'Verified',
  rejected: 'Rejected',
  expired: 'Expired',
};

const statusClass: Record<RoadReadyItemStatus, string> = {
  not_started: 'aio-rr-badge--muted',
  action_needed: 'aio-rr-badge--warn',
  in_progress: 'aio-rr-badge--progress',
  needs_review: 'aio-rr-badge--review',
  completed: 'aio-rr-badge--complete',
  optional: 'aio-rr-badge--optional',
  not_applicable: 'aio-rr-badge--muted',
};

const verificationClass: Record<VerificationStatus, string> = {
  unverified: 'aio-rr-badge--muted',
  self_reported: 'aio-rr-badge--self',
  pending_review: 'aio-rr-badge--review',
  verified: 'aio-rr-badge--verified',
  rejected: 'aio-rr-badge--warn',
  expired: 'aio-rr-badge--warn',
};

type Props =
  | { kind: 'status'; value: RoadReadyItemStatus }
  | { kind: 'verification'; value: VerificationStatus };

export function RoadReadyStatusBadge(props: Props) {
  if (props.kind === 'status') {
    return (
      <span className={`aio-rr-badge ${statusClass[props.value]}`}>
        {statusLabels[props.value]}
      </span>
    );
  }
  return (
    <span className={`aio-rr-badge ${verificationClass[props.value]}`}>
      {verificationLabels[props.value]}
    </span>
  );
}
