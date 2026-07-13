import { describe, expect, it } from 'vitest';
import { BEAUTY_HEADQUARTERS_REGISTRY } from './fixtures';
import { getStudioWorldScene, listMarketplaceEligibleScenes } from './studio-world-registry-helpers';
import { validateZoningPlacement } from './zoning-system';
import { validateBuildingCode } from './building-code-engine';
import { runUtilityInspection } from './utility-inspection';
import { forecastConstructionBudget } from './construction-budget-engine';
import { calculatePermitFee } from './permit-fee-system';
import { reviewCityCouncilPermit } from './city-council';
import { authorizeConstruction, assertSceneIsRegistered } from './municipal-government';
import { validateDepartmentModPublication } from './department-mod-registry';
import { reviewOccupancyPermit, grantOccupancyPermit } from './occupancy-permit';
import { municipalInspectorHalt, validateCdsArchitectureChange } from './integration';
import { buildMunicipalDashboardState } from './municipal-dashboard';

const VALID_BUILDING_CODE = {
  sceneId: 'reception',
  blueprintId: 'reception-blueprint',
  blueprintRevision: 1,
  founderRenderUrl: 'https://cdn.example/render.png',
  constructionPlanId: 'plan-1',
  socketIds: ['reception-desk'],
  dependencyIds: ['grand-lobby'],
  navigationTargets: ['/reception'],
  lightingProfileId: 'executive-reception',
  materialLibraryId: 'founder-material-library',
  unresolvedAssetIds: [],
  duplicateIds: [],
  circularDependencies: [],
};

const VALID_UTILITIES = {
  organizationId: 'frontal-slayer',
  estimatedGpuMinutes: 10,
  estimatedStorageMb: 100,
  estimatedAiCredits: 5,
  availableAiCredits: 100,
  availableStorageMb: 1000,
  queueCapacity: 10,
  currentQueueLoad: 2,
  materialLibraryAvailable: true,
  brandAssetsResolved: true,
  permissionGraphValid: true,
  apiAvailable: true,
  workersAvailable: true,
  memoryHeadroomMb: 512,
  minimumMemoryMb: 256,
};

describe('Studio World Registry™', () => {
  it('registers Beauty Headquarters default scenes', () => {
    expect(BEAUTY_HEADQUARTERS_REGISTRY.scenes.length).toBeGreaterThanOrEqual(10);
    const reception = getStudioWorldScene(BEAUTY_HEADQUARTERS_REGISTRY, 'reception');
    expect(reception?.displayName).toBe('Reception');
    expect(reception?.founderRenderRequired).toBe(true);
  });

  it('lists marketplace-eligible scenes', () => {
    const eligible = listMarketplaceEligibleScenes(BEAUTY_HEADQUARTERS_REGISTRY);
    expect(eligible.some((s) => s.sceneId === 'reception')).toBe(true);
    expect(eligible.some((s) => s.sceneId === 'founder-suite')).toBe(false);
  });

  it('rejects unregistered scenes', () => {
    const result = assertSceneIsRegistered('unknown-scene');
    expect(result.ok).toBe(false);
  });
});

describe('Zoning System™', () => {
  it('allows reception on ground floor', () => {
    const result = validateZoningPlacement({ floor: 'ground-floor', departmentId: 'reception' });
    expect(result.ok).toBe(true);
  });

  it('rejects warehouse on penthouse', () => {
    const result = validateZoningPlacement({ floor: 'penthouse', departmentId: 'shipping-warehouse' });
    expect(result.ok).toBe(false);
  });

  it('rejects manufacturing coexisting with penthouse executive suite context', () => {
    const result = validateZoningPlacement({
      floor: 'penthouse',
      departmentId: 'founder-suite',
      coexistingDepartmentIds: ['shipping-warehouse'],
    });
    expect(result.ok).toBe(false);
  });
});

describe('Building Code Engine™', () => {
  it('passes valid building code inspection', () => {
    const result = validateBuildingCode(VALID_BUILDING_CODE);
    expect(result.ok).toBe(true);
  });

  it('fails without founder render', () => {
    const result = validateBuildingCode({ ...VALID_BUILDING_CODE, founderRenderUrl: null });
    expect(result.ok).toBe(false);
  });
});

describe('Utility Inspection™', () => {
  it('passes when utilities are available', () => {
    const result = runUtilityInspection(VALID_UTILITIES);
    expect(result.ok).toBe(true);
  });

  it('fails when AI credits insufficient', () => {
    const result = runUtilityInspection({ ...VALID_UTILITIES, estimatedAiCredits: 200, availableAiCredits: 10 });
    expect(result.ok).toBe(false);
  });
});

describe('Permit Engine™ + City Council™', () => {
  it('authorizes full construction workflow', () => {
    const result = authorizeConstruction({
      organizationId: 'frontal-slayer',
      applicantId: 'founder-1',
      sceneId: 'reception',
      departmentId: 'reception',
      action: 'world-generation',
      blueprintId: 'reception-blueprint',
      blueprintRevision: 1,
      founderRenderUrl: 'https://cdn.example/render.png',
      constructionPlanId: 'plan-1',
      assetCount: 8,
      renderCount: 1,
      floor: 'ground-floor',
      buildingCode: VALID_BUILDING_CODE,
      utilities: VALID_UTILITIES,
      immuneReviewPassed: true,
      qualityGuardPassed: true,
    });
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.permit.status).toBe('issued');
      expect(result.budget.totalProjectedCostUsd).toBeGreaterThan(0);
      expect(result.ledger.entries.length).toBeGreaterThan(0);
    }
  });

  it('denies construction when immune review fails', () => {
    const result = authorizeConstruction({
      organizationId: 'frontal-slayer',
      applicantId: 'founder-1',
      sceneId: 'reception',
      departmentId: 'reception',
      action: 'world-generation',
      blueprintId: 'reception-blueprint',
      blueprintRevision: 1,
      founderRenderUrl: 'https://cdn.example/render.png',
      constructionPlanId: 'plan-1',
      assetCount: 8,
      renderCount: 1,
      floor: 'ground-floor',
      buildingCode: VALID_BUILDING_CODE,
      utilities: VALID_UTILITIES,
      immuneReviewPassed: false,
      qualityGuardPassed: true,
    });
    expect(result.ok).toBe(false);
  });

  it('forecasts construction budget before approval', () => {
    const budget = forecastConstructionBudget({
      permitType: 'building',
      assetCount: 10,
      renderCount: 1,
      includesWorldGeneration: true,
    });
    expect(budget.expectedAssetCount).toBe(10);
    expect(budget.totalProjectedCostUsd).toBeGreaterThan(2);
  });

  it('calculates permit fees', () => {
    const fee = calculatePermitFee('building', undefined, { priorityReview: true });
    expect(fee.amountUsd).toBe(25);
  });
});

describe('Department Mod Registry™', () => {
  it('rejects mods with secrets', () => {
    const result = validateDepartmentModPublication({
      modId: 'mod-1',
      modVersion: '1.0.0',
      baseDepartmentId: 'marketing-department',
      baseDepartmentVersion: '1.0.0',
      creatorOrganizationId: 'creator-org',
      creatorDisplayName: 'Creator',
      dependencies: [],
      modifiedComponents: ['api_key=secret'],
      compatibility: ['studio-os.v1'],
      license: 'community',
      marketplaceMetadata: { title: 'Mod', description: 'Test', category: 'ops' },
      approvalStatus: 'submitted',
      certificationTier: 'community-mod',
      supportStatus: 'community',
      upgradePath: null,
      registryVersion: 'department-mod-registry.v1',
    });
    expect(result.ok).toBe(false);
  });
});

describe('Occupancy Permit™', () => {
  it('grants occupancy after all reviews pass', () => {
    const review = reviewOccupancyPermit({
      occupancyPermitId: 'occ-1',
      organizationId: 'frontal-slayer',
      sceneId: 'reception',
      departmentId: 'reception',
      inspectionPassed: true,
      qualityGuardPassed: true,
      immunePassed: true,
      performancePassed: true,
      accessibilityPassed: true,
      compatibilityPassed: true,
      marketplaceCompliant: true,
      brandGroundingPassed: true,
    });
    expect(review.ok).toBe(true);
    expect(review.occupancyState).toBe('open');

    const permit = grantOccupancyPermit({
      occupancyPermitId: 'occ-1',
      organizationId: 'frontal-slayer',
      sceneId: 'reception',
      departmentId: 'reception',
      status: review.status,
      grantedAt: null,
      engineVersion: 'occupancy-permit.v1',
    });
    expect(permit.grantedAt).toBeTruthy();
  });
});

describe('Integration hooks', () => {
  it('CDS requires renovation permit for structural changes', () => {
    const result = validateCdsArchitectureChange({ permit: null, changeType: 'structural' });
    expect(result.ok).toBe(false);
  });

  it('municipal inspector halts on missing permit', () => {
    const result = municipalInspectorHalt({
      permitValid: false,
      zoningValid: true,
      buildingCodeValid: true,
      budgetWithinLimit: true,
      constructionDriftDetected: false,
    });
    expect(result.ok).toBe(false);
  });
});

describe('Municipal Dashboard™ contract', () => {
  it('builds dashboard state with city health score', () => {
    const dashboard = buildMunicipalDashboardState({
      organizationId: 'frontal-slayer',
      pendingPermits: [],
      approvedPermits: [],
      deniedPermits: [],
      departmentsUnderConstruction: ['reception'],
      inspectionQueue: [],
      occupancyQueue: ['reception'],
      failedInspections: [],
      budgetUsageUsd: 10,
      budgetLimitUsd: 50,
      aiUtilizationPct: 40,
      infrastructureHealth: 'healthy',
      recentLedgerEntries: [],
      openOccupancyPermits: [],
    });
    expect(dashboard.cityHealthScore).toBeGreaterThan(0);
    expect(dashboard.dashboardVersion).toBe('municipal-dashboard.v1');
  });
});

describe('City Council™ budget gate', () => {
  it('denies when budget exceeds council limit', () => {
    const decision = reviewCityCouncilPermit({
      permit: {
        permitId: 'p1',
        permitType: 'building',
        status: 'submitted',
        organizationId: 'org',
        applicantId: 'a',
        sceneId: 'reception',
        departmentId: 'reception',
        blueprintId: null,
        blueprintRevision: null,
        founderRenderUrl: null,
        constructionPlanId: null,
        submittedAt: null,
        issuedAt: null,
        expiresAt: null,
        denialReason: null,
        engineVersion: 'permit-engine.v1',
      },
      budget: forecastConstructionBudget({ permitType: 'large-world-expansion', assetCount: 100, renderCount: 10, includesWorldGeneration: true }),
      immunePassed: true,
      qualityGuardPassed: true,
      securityPassed: true,
      compatibilityPassed: true,
      performancePassed: true,
      maxBudgetUsd: 5,
    });
    expect(decision.approved).toBe(false);
  });
});
