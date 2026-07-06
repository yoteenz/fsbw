/**
 * Debounced QA intelligence chain — lazy ensure (cache-first) instead of full rebuild storms.
 */
let chainTimer: ReturnType<typeof setTimeout> | null = null;
let pendingOrgId: string | null = null;

const CHAIN_DEBOUNCE_MS = 600;

export function scheduleQaIntelligenceChainSync(organizationId: string): void {
  pendingOrgId = organizationId;
  if (chainTimer) clearTimeout(chainTimer);
  chainTimer = setTimeout(() => {
    const orgId = pendingOrgId;
    chainTimer = null;
    pendingOrgId = null;
    if (orgId) void flushQaIntelligenceChainSync(orgId);
  }, CHAIN_DEBOUNCE_MS);
}

async function flushQaIntelligenceChainSync(organizationId: string): Promise<void> {
  const [
    guardian,
    design,
    prompt,
    experience,
    visual,
    a11y,
    perf,
    regression,
    readiness,
    excellence,
  ] = await Promise.all([
    import('../organizational-guardian/store'),
    import('../design-compliance-engine/store'),
    import('../prompt-qa/store'),
    import('../experience-qa/store'),
    import('../visual-diff-engine/store'),
    import('../accessibility-auditor/store'),
    import('../performance-monitor/store'),
    import('../regression-engine/store'),
    import('../release-readiness/store'),
    import('../engineering-excellence-dashboard/store'),
  ]);

  guardian.ensureOrganizationGuardianProfile(organizationId);
  design.ensureOrganizationDesignComplianceEngineProfile(organizationId);
  prompt.ensureOrganizationPromptQaProfile(organizationId);
  experience.ensureOrganizationExperienceQaProfile(organizationId);
  visual.ensureOrganizationVisualDiffEngineProfile(organizationId);
  a11y.ensureOrganizationAccessibilityAuditorProfile(organizationId);
  perf.ensureOrganizationPerformanceMonitorProfile(organizationId);
  regression.ensureOrganizationRegressionEngineProfile(organizationId);
  readiness.ensureOrganizationReleaseReadinessProfile(organizationId);
  excellence.ensureOrganizationEngineeringExcellenceProfile(organizationId);
}
