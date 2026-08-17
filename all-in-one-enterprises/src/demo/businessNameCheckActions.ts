import { updateDemoStore } from './demoStore';
import type { BusinessNameCheckStatus } from '../business-formation/businessNameRegistry/types';
import type { BusinessStructure } from '../intake/intakeTypes';
import type { OfficeWorkItem } from '../office-core/officeWorkTypes';
import { OFFICE_WORK_STATUS_LABELS } from '../office-core/officeWorkTypes';

function uid(): string {
  return crypto.randomUUID();
}

export interface BusinessNameReviewInput {
  businessName: string;
  formationState: string;
  entityStructure?: BusinessStructure;
  status: BusinessNameCheckStatus;
  intakeSessionId?: string;
}

export function createBusinessNameReviewTask(input: BusinessNameReviewInput): void {
  updateDemoStore((store) => {
    const existing = (store.officeWorkItems ?? []).find(
      (w) =>
        w.queueId === 'business_name_review' &&
        w.title.includes(input.businessName) &&
        w.description?.includes(input.formationState) &&
        w.status !== 'completed' &&
        w.status !== 'cancelled',
    );
    if (existing) return store;

    const now = new Date().toISOString();
    const workItem: OfficeWorkItem = {
      id: `owi-bname-${uid()}`,
      sourceDomain: 'service_request',
      sourceEntityType: 'business_name_check',
      sourceEntityId: input.intakeSessionId ?? uid(),
      organizationId: store.portalClientId ?? 'prospect-intake',
      title: `Business Name Review — ${input.businessName}`,
      description: `${input.businessName} · ${input.formationState}${input.entityStructure ? ` · ${input.entityStructure}` : ''}`,
      workType: 'verification',
      division: 'permitting_compliance',
      queueId: 'business_name_review',
      priority: 'normal',
      status: 'new',
      statusLabel: OFFICE_WORK_STATUS_LABELS.new,
      waitingOn: 'all_in_one',
      createdAt: now,
      updatedAt: now,
      version: 1,
      isDemo: true,
    };

    store.officeWorkItems = [...(store.officeWorkItems ?? []), workItem];
    store.activity.unshift({
      id: uid(),
      kind: 'TASK_CREATED',
      title: 'Business name manual review queued',
      clientId: workItem.organizationId,
      createdAt: now,
      visibility: 'internal',
    });
    return store;
  });
}

export function getBusinessNameReviewQueue(store: { officeWorkItems?: OfficeWorkItem[] }) {
  return (store.officeWorkItems ?? []).filter(
    (w) => w.queueId === 'business_name_review' && w.status !== 'completed' && w.status !== 'cancelled',
  );
}
