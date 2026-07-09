import { XBD_CONSUMER_SYSTEMS, type XbdConsumerSystem } from '../constants';
import { getBrandDnaById } from './brand-dna-registry';

const CONSUMER_LABELS: Record<XbdConsumerSystem, string> = {
  'experience-runtime': 'Experience Runtime™',
  'studio-foundry': 'Studio Foundry™',
  'content-engine': 'Content Engine™',
  'packaging-engine': 'Packaging Engine™',
  'audience-engine': 'Audience Engine™',
  orb: 'Orb™',
  headquarters: 'Headquarters™',
  'institute-of-knowledge': 'Institute of Knowledge™',
  'company-genome': 'Company Genome™',
  'scene-generator': 'Scene Generator™',
  'marketing-engine': 'Marketing Engine™',
};

/** Maps strategic Brand DNA to Experience Engine brand IDs (1:1 for demo brands) */
export function compileExperienceBrandDnaId(strategicBrandId: string): string {
  const canonical = ['studio-os', 'frontal-slayer', 'ndx'];
  if (canonical.includes(strategicBrandId)) return strategicBrandId;
  return 'studio-os';
}

/** Brand Application Engine™ — exposes Brand DNA to downstream Studio OS systems */
export function listConsumerBindings(brandId: string): { system: XbdConsumerSystem; status: string }[] {
  const brand = getBrandDnaById(brandId);
  const compiledId = compileExperienceBrandDnaId(brandId);
  const isCanonical = brand?.status === 'canonical';

  return XBD_CONSUMER_SYSTEMS.map((system) => {
    let status = 'bound';
    if (system === 'experience-runtime') {
      status = isCanonical ? `compiled → ${compiledId}` : 'awaiting canonical approval';
    } else if (system === 'orb') {
      status = brand ? `voice: ${brand.writingVoice.tone}` : 'unbound';
    } else if (system === 'headquarters') {
      status = brand ? `HQ direction ready` : 'unbound';
    } else if (!brand) {
      status = 'unbound';
    } else if (brand.status === 'draft') {
      status = 'draft binding';
    }
    return { system, status: `${CONSUMER_LABELS[system]} · ${status}` };
  });
}

export function getConsumerLabel(system: XbdConsumerSystem): string {
  return CONSUMER_LABELS[system];
}
