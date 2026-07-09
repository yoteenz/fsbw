import { XPS_CONSUMER_SYSTEMS, type XpsConsumerSystem } from '../constants';
import type { XpsProductionPackage } from '../types';
import { canGenerateAssets } from './approval-engine';

const LABELS: Record<XpsConsumerSystem, string> = {
  'narrative-intelligence': 'Narrative Intelligence™',
  'brand-discovery-engine': 'Brand Intelligence™',
  'studio-intelligence-layer': 'Audience Intelligence™',
  'experience-engine': 'Experience Engine™',
  'studio-foundry': 'Studio Foundry™',
  'content-engine': 'Content Engine™',
  orb: 'Orb™',
  'distribution-network': 'Distribution Network™',
};

export function listProductionConsumerBindings(
  pkg?: XpsProductionPackage
): { system: XpsConsumerSystem; status: string }[] {
  const gate = pkg ? canGenerateAssets(pkg.approvals) : { allowed: false, reason: 'No production package' };

  return XPS_CONSUMER_SYSTEMS.map((system) => ({
    system,
    status: gate.allowed
      ? `${LABELS[system]} · ready for ${pkg?.topic ?? 'production'}`
      : `${LABELS[system]} · blocked — ${gate.reason}`,
  }));
}
