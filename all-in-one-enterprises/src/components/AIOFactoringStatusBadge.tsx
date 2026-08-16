import type { FactoringInvoiceStatus } from '../services/factoring/factoringTypes';
import { FACTORING_STATUS_LABELS } from '../data/mockFactoring';

const statusClass: Partial<Record<FactoringInvoiceStatus, string>> = {
  eligible: 'aio-badge--complete',
  funded: 'aio-badge--complete',
  approved: 'aio-badge--complete',
  closed: 'aio-badge--needed',
  not_eligible: 'aio-badge--needed',
  rejected: 'aio-badge--alert',
  verification: 'aio-badge--progress',
  submitted: 'aio-badge--progress',
  funding_processing: 'aio-badge--progress',
  additional_documents_required: 'aio-badge--progress',
  not_submitted: 'aio-badge--optional',
};

type Props = {
  status: FactoringInvoiceStatus;
};

export function AIOFactoringStatusBadge({ status }: Props) {
  return (
    <span className={`aio-badge ${statusClass[status] ?? 'aio-badge--needed'}`}>
      {FACTORING_STATUS_LABELS[status]}
    </span>
  );
}
