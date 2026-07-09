import { generateNarrativeBlueprint, saveNarrativeBlueprint } from '../../narrative-intelligence/engines/narrative-blueprint-generator';
import { buildHeadquartersEnvironment } from '../../narrative-intelligence/engines/narrative-intelligence-engine';
import { evaluateProductionGate } from '../../narrative-intelligence/engines/production-gate';
import { getNarrativeBlueprint } from '../../narrative-intelligence/engines/narrative-blueprint-generator';
import type { XpsPlaygroundInput, XpsProductionPackage } from '../types';
import { assignProductionDepartments } from './department-orchestrator';
import { buildDefaultApprovalGates, canGenerateAssets } from './approval-engine';
import { buildProductionTimeline } from './production-timeline';
import { buildAssetChecklist } from './asset-tracker';
import { buildPublishingPlan } from './distribution-engine';
import { evaluateCreativeExecutiveFit } from './creative-executive-engine';
import { evaluateShowrunnerContinuity } from './showrunner-engine';
import { mutateStudioProductionSystemStore, readStudioProductionSystemStore } from '../persistence';
import { autoConveneBoardMeetingForProduction, ensureCreativeOperatingSystemSubsystem, recordProductionToMemory } from '../../creative-operating-system/engine';
import type { XniNarrativeType } from '../../narrative-intelligence/constants';

function narrativeTypeForPlatform(platform: XpsPlaygroundInput['platform']): XniNarrativeType {
  if (platform === 'course') return 'course';
  if (platform === 'podcast') return 'episode';
  if (platform === 'email') return 'campaign';
  return 'episode';
}

/** Production Coordinator™ — assembles Production Package™ from intelligence layers */
export function coordinateProduction(input: XpsPlaygroundInput): XpsProductionPackage {
  const now = new Date().toISOString();
  const blueprint = generateNarrativeBlueprint({
    topic: input.topic,
    brandId: input.brandId,
    companyId: input.companyId,
    narrativeType: narrativeTypeForPlatform(input.platform),
  });

  const enrichedBlueprint = {
    ...blueprint,
    audience: input.audience,
    objective: input.goal,
    desiredEmotion: input.desiredEmotion,
  };
  saveNarrativeBlueprint(enrichedBlueprint);

  const executive = evaluateCreativeExecutiveFit(enrichedBlueprint, input.goal);
  const showrunner = evaluateShowrunnerContinuity(enrichedBlueprint);
  const departments = assignProductionDepartments(enrichedBlueprint, input.platform);
  const timeline = buildProductionTimeline(now);
  const assets = buildAssetChecklist(enrichedBlueprint, departments);
  const publishing = buildPublishingPlan(enrichedBlueprint, input.platform);
  const hqEnv = buildHeadquartersEnvironment(enrichedBlueprint);

  let approvals = buildDefaultApprovalGates(enrichedBlueprint.status === 'approved');
  if (executive.approved) {
    approvals = approvals.map((a) =>
      a.gateId === 'strategic-fit' ? { ...a, status: 'approved', decidedAt: now } : a
    );
  }

  const pkg: XpsProductionPackage = {
    packageId: `pkg-${input.brandId}-${Date.now()}`,
    blueprintId: enrichedBlueprint.blueprintId,
    brandId: input.brandId,
    companyId: input.companyId,
    topic: input.topic,
    goal: input.goal,
    audience: input.audience,
    platform: input.platform,
    desiredEmotion: input.desiredEmotion,
    currentStage: executive.approved ? 'pre-production' : 'team-assembly',
    departments,
    approvals,
    blockingIssues: [...executive.blockingIssues, ...showrunner.blockingIssues],
    timeline,
    assets,
    publishing,
    virtualSet: {
      room: hqEnv.room,
      environment: enrichedBlueprint.environment,
      atmosphere: hqEnv.atmosphere,
      focalObject: hqEnv.focalObject,
    },
    createdAt: now,
    updatedAt: now,
    version: '1.0.0',
  };

  mutateStudioProductionSystemStore((store) => ({
    ...store,
    packageRegistry: [pkg, ...store.packageRegistry.filter((p) => p.packageId !== pkg.packageId)],
  }));

  try {
    ensureCreativeOperatingSystemSubsystem();
    autoConveneBoardMeetingForProduction(pkg);
    recordProductionToMemory(pkg);
  } catch {
    // Creative OS optional during bootstrap
  }

  return pkg;
}

export function listProductionPackages(): XpsProductionPackage[] {
  return readStudioProductionSystemStore().packageRegistry;
}

export function getProductionPackage(packageId: string): XpsProductionPackage | undefined {
  return listProductionPackages().find((p) => p.packageId === packageId);
}

export function saveProductionPackage(pkg: XpsProductionPackage): void {
  mutateStudioProductionSystemStore((store) => {
    const idx = store.packageRegistry.findIndex((p) => p.packageId === pkg.packageId);
    const next = [...store.packageRegistry];
    if (idx >= 0) next[idx] = pkg;
    else next.unshift(pkg);
    return { ...store, packageRegistry: next };
  });
}

export function evaluatePackageProductionGate(pkg: XpsProductionPackage): { allowed: boolean; reason: string } {
  const blueprint = getNarrativeBlueprint(pkg.blueprintId);
  const narrativeGate = evaluateProductionGate(
    blueprint ?? { status: 'draft', blueprintId: pkg.blueprintId, topic: pkg.topic }
  );
  if (!narrativeGate.allowed) return narrativeGate;
  const assetGate = canGenerateAssets(pkg.approvals);
  if (!assetGate.allowed) return assetGate;
  if (pkg.blockingIssues.some((i) => i.severity === 'blocker')) {
    return { allowed: false, reason: 'Blocking issues must be resolved before production proceeds.' };
  }
  return { allowed: true, reason: 'Production gates open — departments may proceed.' };
}
