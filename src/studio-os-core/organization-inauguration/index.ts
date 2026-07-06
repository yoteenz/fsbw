export {
  ORGANIZATION_INAUGURATION_STORAGE_KEY,
  ORGANIZATION_INAUGURATION_VERSION,
  INAUGURATION_PHILOSOPHY,
  INAUGURATION_TAGLINE,
  CEREMONIAL_LINES,
  ENTER_HEADQUARTERS_LABEL,
  FORBIDDEN_CEREMONY_LABELS,
  STUDIO_OS_INAUGURATION_ENTERED,
  STUDIO_OS_BLUEPRINT_READY_FOR_INAUGURATION,
} from './constants';

export type {
  InaugurationPhase,
  OrganizationCharter,
  FounderWelcomeMessage,
  HeadquartersActivationStep,
  WalkthroughStop,
  InaugurationRecommendation,
  FoundingTimelineMilestone,
  FoundingBlueprintSnapshot,
  OrganizationInaugurationProfile,
  OrganizationInaugurationStore,
  InaugurationCeremonyState,
} from './types';

export {
  buildOrganizationCharter,
  resolveFounderName,
} from './charter-generator';

export { buildFounderWelcomeMessage } from './founder-message';

export {
  DEFAULT_ACTIVATION_STEPS,
  buildActivationSteps,
  computeActivationProgress,
} from './headquarters-activation';

export { DEFAULT_WALKTHROUGH_STOPS } from './walkthrough';

export { buildInaugurationRecommendations } from './recommendations';

export { buildFoundingTimeline } from './founding-timeline';

export {
  INAUGURATION_PHASE_ORDER,
  freezeFoundingBlueprint,
  buildInaugurationProfileFromBlueprint,
  getPhaseIndex,
  getNextPhase,
  advanceActivationSteps,
} from './ceremony-engine';

export {
  readOrganizationInaugurationStore,
  writeOrganizationInaugurationStore,
  getOrganizationInaugurationProfile,
  isBlueprintReadyForInauguration,
  getFoundingBlueprintSnapshot,
  ensureInaugurationFromBlueprint,
  upsertOrganizationInaugurationProfile,
  advanceInaugurationPhase,
  setInaugurationPhase,
  tickActivationProgress,
  advanceWalkthroughStop,
  completeHeadquartersEntry,
  buildInaugurationCeremonyState,
  ensureOrganizationInaugurationProfile,
} from './store';

export {
  bootstrapOrganizationInaugurationPlatform,
  bootstrapOrganizationInauguration,
} from './bootstrap';
