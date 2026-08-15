import {
  demoServiceRequestRepository,
} from '../data/repositories/demoRepositories';

export type { ServiceRequest, TimelineStep, RequestStatus } from '../demo/demoTypes';
export type { SubmitRequestPayload } from '../data/repositories/types';

/** @deprecated Prefer useAioRepositories() for backend-aware access */
export const serviceRequestRepository = demoServiceRequestRepository;
