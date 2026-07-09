import { XNI_CONSUMER_SYSTEMS, type XniConsumerSystem } from '../constants';
import { evaluateProductionGate } from './production-gate';
import type { XniNarrativeBlueprint } from '../types';

const LABELS: Record<XniConsumerSystem, string> = {
  'creative-direction-studio': 'Creative Direction Studio™',
  'content-engine': 'Content Engine™',
  'experience-engine': 'Experience Engine™',
  'studio-foundry': 'Studio Foundry™',
  'institute-of-knowledge': 'Institute of Knowledge™',
  orb: 'Orb™',
  'campaign-engine': 'Campaign Engine™',
  'course-engine': 'Course Engine™',
  'experience-runtime': 'Experience Runtime™',
  'studio-intelligence-layer': 'Studio Intelligence Layer™',
};

/** Consumer bindings — downstream systems require approved Narrative Blueprint™ */
export function listNarrativeConsumerBindings(
  blueprint?: Pick<XniNarrativeBlueprint, 'status' | 'blueprintId' | 'topic'>
): { system: XniConsumerSystem; status: string; requiresApprovedBlueprint: boolean }[] {
  const gate = blueprint ? evaluateProductionGate(blueprint) : { allowed: false, reason: 'No blueprint selected' };

  return XNI_CONSUMER_SYSTEMS.map((system) => ({
    system,
    requiresApprovedBlueprint: true,
    status: gate.allowed
      ? `${LABELS[system]} · ready — blueprint approved`
      : `${LABELS[system]} · blocked — ${gate.reason}`,
  }));
}

export function getNarrativeConsumerLabel(system: XniConsumerSystem): string {
  return LABELS[system];
}
