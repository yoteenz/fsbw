import { AIO_STORAGE_KEYS, readStorage, writeStorage } from '../storage/demoStorage';
import type { IntakeAnswers } from '../intake/intakeTypes';
import type { RoadmapResult } from '../roadmap/roadmapTypes';

export type RequestStatus =
  | 'new_request'
  | 'information_needed'
  | 'documents_needed'
  | 'under_review'
  | 'in_progress'
  | 'submitted'
  | 'awaiting_agency'
  | 'approved'
  | 'completed'
  | 'cancelled';

export interface TimelineStep {
  id: string;
  label: string;
  status: 'completed' | 'current' | 'upcoming';
}

export interface ServiceRequest {
  id: string;
  requestNumber: string;
  services: { slug: string; title: string; division: string }[];
  status: RequestStatus;
  statusLabel: string;
  nextStep: string;
  createdAt: string;
  businessName?: string;
  contactName?: string;
  contactEmail?: string;
  notes?: string;
  roadmapSummary?: string;
  timeline: TimelineStep[];
  documentsNeeded: string[];
  relatedRoadmapItems?: string[];
  isDemo: true;
}

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

const DEFAULT_TIMELINE: Omit<TimelineStep, 'status'>[] = [
  { id: 'received', label: 'Request Received' },
  { id: 'initial_review', label: 'Initial Review' },
  { id: 'documents', label: 'Documents Needed' },
  { id: 'submission', label: 'Submission' },
  { id: 'agency', label: 'Agency Review' },
  { id: 'complete', label: 'Complete' },
];

function buildTimeline(status: RequestStatus): TimelineStep[] {
  const statusIndex: Record<RequestStatus, number> = {
    new_request: 1,
    information_needed: 1,
    documents_needed: 2,
    under_review: 1,
    in_progress: 3,
    submitted: 3,
    awaiting_agency: 4,
    approved: 5,
    completed: 5,
    cancelled: 0,
  };
  const currentIdx = statusIndex[status] ?? 1;
  return DEFAULT_TIMELINE.map((step, i) => ({
    ...step,
    status: i < currentIdx ? 'completed' : i === currentIdx ? 'current' : 'upcoming',
  }));
}

function nextRequestNumber(): string {
  const counter = readStorage(AIO_STORAGE_KEYS.requestCounter, 0) + 1;
  writeStorage(AIO_STORAGE_KEYS.requestCounter, counter);
  return `AIO-DEMO-${String(counter).padStart(4, '0')}`;
}

function statusLabel(status: RequestStatus): string {
  const labels: Record<RequestStatus, string> = {
    new_request: 'New Request',
    information_needed: 'Information Needed',
    documents_needed: 'Documents Needed',
    under_review: 'Under Review',
    in_progress: 'In Progress',
    submitted: 'Submitted',
    awaiting_agency: 'Awaiting Agency',
    approved: 'Approved',
    completed: 'Completed',
    cancelled: 'Cancelled',
  };
  return labels[status];
}

export class LocalDemoServiceRequestRepository implements ServiceRequestRepository {
  loadAll(): ServiceRequest[] {
    return readStorage(AIO_STORAGE_KEYS.requests, []);
  }

  getById(id: string): ServiceRequest | undefined {
    return this.loadAll().find((r) => r.id === id);
  }

  create(payload: SubmitRequestPayload): ServiceRequest {
    const id = crypto.randomUUID();
    const requestNumber = nextRequestNumber();
    const status: RequestStatus = 'new_request';
    const serviceTitles = payload.services.map((s) => s.title).join(' + ');

    const documentsNeeded = ['Business information', 'Contact details'];
    const uniqueDocs = [...new Set(documentsNeeded)];

    const request: ServiceRequest = {
      id,
      requestNumber,
      services: payload.services,
      status,
      statusLabel: statusLabel(status),
      nextStep: 'Initial Review',
      createdAt: new Date().toISOString(),
      businessName: payload.intake.business?.name || payload.intake.shipper?.companyName,
      contactName: payload.intake.contact?.name || payload.intake.shipper?.contactName,
      contactEmail: payload.intake.contact?.email,
      notes: payload.notes,
      roadmapSummary: payload.roadmap
        ? `${payload.roadmap.complianceProgress}% setup progress · ${serviceTitles}`
        : serviceTitles,
      timeline: buildTimeline(status),
      documentsNeeded: uniqueDocs,
      relatedRoadmapItems: payload.roadmap?.items.filter((i) => i.status === 'recommended').map((i) => i.title),
      isDemo: true,
    };

    const all = this.loadAll();
    writeStorage(AIO_STORAGE_KEYS.requests, [request, ...all]);
    return request;
  }

  clear(): void {
    writeStorage(AIO_STORAGE_KEYS.requests, []);
  }
}

export const serviceRequestRepository = new LocalDemoServiceRequestRepository();
