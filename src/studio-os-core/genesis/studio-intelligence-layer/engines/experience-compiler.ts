import { compileExperienceBrandDnaId } from '../../brand-discovery-engine/engines/brand-application-engine';
import { assembleExperienceRuntime } from '../../experience-runtime/runtime-engine/experience-runtime';
import { readStudioIntelligenceLayerStore, mutateStudioIntelligenceLayerStore } from '../persistence';
import {
  getAudienceDna,
  getDecisionDna,
  getOperatingManual,
  getProductDna,
  getTasteGenome,
} from '../registries/intelligence-registries';
import type { XsilExperienceCompileManifest } from '../types';

export type XsilCompileInput = {
  companyId: string;
  mission: string;
  role?: string;
  device?: string;
};

/** Experience Compiler™ — intelligence-aware experience assembly */
export function compileExperienceEnvironment(input: XsilCompileInput): XsilExperienceCompileManifest {
  const brandId = compileExperienceBrandDnaId(input.companyId);
  const runtime = assembleExperienceRuntime({ brandId, departmentId: `dept-${brandId}`, sceneId: 'hq-master-demonstration-v1' });

  const manual = getOperatingManual(input.companyId);
  const decision = getDecisionDna(input.companyId);
  const taste = getTasteGenome(input.companyId);
  const audience = getAudienceDna(input.companyId);
  const product = getProductDna(input.companyId);

  const layersUsed = [
    'Platform DNA',
    'Brand DNA',
    'Department DNA',
    'Scene DNA',
    'Component DNA',
    'Motion DNA',
    'Interaction DNA',
    manual ? 'Operating Manual' : null,
    decision ? 'Decision DNA' : null,
    taste ? 'Taste Genome' : null,
    audience ? 'Audience DNA' : null,
    product ? 'Product DNA' : null,
    'State',
  ].filter(Boolean) as string[];

  const explainTrace = [
    `Mission: ${input.mission}`,
    `Role: ${input.role ?? 'founder'} · Device: ${input.device ?? 'desktop'}`,
    `Brand compile: ${input.companyId} → ${brandId}`,
    `Runtime graph: ${runtime.graphId}`,
    manual ? `Manual canon: ${manual.canonStatus}` : 'Manual: missing',
    decision ? `Decision principles: ${decision.learnedPrinciples.slice(0, 2).join(', ')}` : '',
    taste ? `Taste luxury floor: ${taste.luxuryLevel}` : '',
    audience ? `Audience: ${audience.segmentName}` : '',
    product ? `Product: ${product.productName}` : '',
  ].filter(Boolean);

  const manifest: XsilExperienceCompileManifest = {
    manifestId: `compile-${input.companyId}-${Date.now()}`,
    companyId: input.companyId,
    mission: input.mission,
    role: input.role ?? 'founder',
    device: input.device ?? 'desktop',
    layersUsed,
    explainTrace,
    compiledAt: new Date().toISOString(),
  };

  mutateStudioIntelligenceLayerStore((s) => ({
    ...s,
    experienceRegistry: [manifest, ...s.experienceRegistry].slice(0, 24),
  }));

  return manifest;
}

export function getLatestCompileManifest(companyId: string): XsilExperienceCompileManifest | undefined {
  return readStudioIntelligenceLayerStore().experienceRegistry.find((m) => m.companyId === companyId);
}
