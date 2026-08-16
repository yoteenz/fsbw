import { isBackendMode } from '../../config/dataMode';
import { useAIOAuth } from '../../auth/AIOAuthProvider';
import {
  demoIntakeRepository,
  demoOperationalDataRepository,
  demoRoadmapRepository,
  demoServicePlanRepository,
  demoServiceRequestRepository,
} from './demoRepositories';
import { createBackendRepositories } from './supabaseRepositories';

export function useAioRepositories() {
  const { session, isInternal } = useAIOAuth();

  if (!isBackendMode() || !session?.organization) {
    return {
      mode: 'demo' as const,
      intake: demoIntakeRepository,
      roadmap: demoRoadmapRepository,
      servicePlan: demoServicePlanRepository,
      serviceRequests: demoServiceRequestRepository,
      operational: demoOperationalDataRepository,
    };
  }

  const backend = createBackendRepositories({
    orgId: session.organization.id,
    userId: session.user.id,
    orgName: session.organization.name,
    isInternal,
  });

  return {
    mode: 'backend' as const,
    intake: backend.intake,
    roadmap: backend.roadmap,
    servicePlan: backend.servicePlan,
    serviceRequests: backend.serviceRequests,
    operational: backend.operational,
  };
}

/** Singleton demo exports for legacy imports during migration */
export {
  demoIntakeRepository as intakeRepository,
  demoRoadmapRepository as roadmapRepository,
  demoServicePlanRepository as servicePlanRepository,
  demoServiceRequestRepository as serviceRequestRepository,
};
