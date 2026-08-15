import type { IntakeAnswers } from '../../intake/intakeTypes';
import type { RoadmapResult } from '../../roadmap/roadmapTypes';
import type { ServicePlanItem } from '../../repositories/servicePlanRepository';
import type {
  ActivityEvent,
  Client,
  Deadline,
  DemoStore,
  DocumentMetadata,
  FactoringSubmission,
  InternalNote,
  Message,
  Notification,
  ServiceRequest,
  StaffMember,
  Task,
} from '../../demo/demoTypes';

export interface SubmitRequestPayload {
  services: { slug: string; title: string; division: string }[];
  intake: IntakeAnswers;
  roadmap: RoadmapResult | null;
  notes?: string;
}

export interface IntakeRepository {
  load(): IntakeAnswers | null;
  save(answers: IntakeAnswers): Promise<void>;
  clear(): void;
}

export interface RoadmapRepository {
  load(): RoadmapResult | null;
  save(result: RoadmapResult): Promise<void>;
  clear(): void;
}

export interface ServicePlanRepository {
  load(): ServicePlanItem[];
  save(items: ServicePlanItem[]): Promise<void>;
  add(item: ServicePlanItem): Promise<void>;
  remove(slug: string): Promise<void>;
  clear(): void;
}

export interface ServiceRequestRepository {
  loadAll(): Promise<ServiceRequest[]>;
  getById(id: string): Promise<ServiceRequest | undefined>;
  create(payload: SubmitRequestPayload): Promise<ServiceRequest>;
  updateStatus(requestId: string, workflowStep: string, staffId?: string): Promise<ServiceRequest | undefined>;
  assign(requestId: string, staffId: string): Promise<void>;
  clear(): void;
}

export interface OperationalDataRepository {
  /** Full operational snapshot for Office / Portal dashboards */
  loadSnapshot(): Promise<Partial<DemoStore>>;
  isRealtime(): boolean;
}

export type {
  ActivityEvent,
  Client,
  Deadline,
  DocumentMetadata,
  FactoringSubmission,
  InternalNote,
  Message,
  Notification,
  ServiceRequest,
  StaffMember,
  Task,
};
