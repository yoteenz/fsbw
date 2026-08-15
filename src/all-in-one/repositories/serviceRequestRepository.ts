import type { IntakeAnswers } from '../intake/intakeTypes';
import type { RoadmapResult } from '../roadmap/roadmapTypes';
import type { ServicePlanItem } from '../repositories/servicePlanRepository';
import { getStore, submitServiceRequest } from '../demo/demoActions';
import { resetDemoStore } from '../demo/demoStore';
import type { ServiceRequest, TimelineStep, RequestStatus } from '../demo/demoTypes';

export type { ServiceRequest, TimelineStep, RequestStatus };

export interface SubmitRequestPayload {
  services: { slug: string; title: string; division: string }[];
  intake: IntakeAnswers;
  roadmap: RoadmapResult | null;
  notes?: string;
}

export interface ServiceRequestRepository {
  loadAll(): ServiceRequest[];
  getById(id: string): ServiceRequest | undefined;
  create(payload: SubmitRequestPayload): ServiceRequest;
  clear(): void;
}

export class LocalDemoServiceRequestRepository implements ServiceRequestRepository {
  loadAll(): ServiceRequest[] {
    return getStore().requests;
  }

  getById(id: string): ServiceRequest | undefined {
    return getStore().requests.find((r) => r.id === id);
  }

  create(payload: SubmitRequestPayload): ServiceRequest {
    const planItems: ServicePlanItem[] = payload.services.map((s) => ({
      slug: s.slug,
      title: s.title,
      division: s.division,
      addedAt: new Date().toISOString(),
    }));
    return submitServiceRequest({
      services: planItems,
      intake: payload.intake,
      roadmap: payload.roadmap,
      notes: payload.notes,
    });
  }

  clear(): void {
    resetDemoStore();
  }
}

export const serviceRequestRepository = new LocalDemoServiceRequestRepository();
