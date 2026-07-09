import { XSIL_CONSUMER_SYSTEMS, type XsilConsumerSystem } from '../constants';

const LABELS: Record<XsilConsumerSystem, string> = {
  orb: 'Orb™',
  'mission-engine': 'Mission Engine™',
  'content-engine': 'Content Engine™',
  'experience-runtime': 'Experience Runtime™',
  'studio-foundry': 'Studio Foundry™',
  'brand-discovery': 'Brand Discovery Engine™',
  'company-genome': 'Company Genome™',
  'institute-of-knowledge': 'Institute of Knowledge™',
};

/** Consumer bindings — downstream systems use Studio Intelligence Layer™ */
export function listIntelligenceConsumerBindings(companyId: string): { system: XsilConsumerSystem; status: string }[] {
  return XSIL_CONSUMER_SYSTEMS.map((system) => ({
    system,
    status: `${LABELS[system]} · bound to ${companyId} intelligence`,
  }));
}

export function getIntelligenceConsumerLabel(system: XsilConsumerSystem): string {
  return LABELS[system];
}
