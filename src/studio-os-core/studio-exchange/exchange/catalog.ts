import { EXCHANGE_ASSET_CLASSES, STUDIO_EXCHANGE_ENGINE_VERSION } from '../constants';
import { listAllCareerExpansions } from '../expansions/registry';
import { listAllExchangeCertifications } from '../certifications/registry';
import { listExchangeCareerWorldListings } from '../career-worlds/registry';
import type { StudioExchangeCatalog } from './schema';

export function buildStudioExchangeCatalog(): StudioExchangeCatalog {
  const listings = [
    ...listExchangeCareerWorldListings().map((world) => ({
      listingId: world.licenseProductId,
      assetClass: 'professional-license' as const,
      targetId: world.careerWorldId,
      displayName: `${world.displayName} Professional License™`,
      summary: world.summary,
      careerWorldId: world.careerWorldId,
      profession: world.profession,
    })),
    ...listAllCareerExpansions().map((expansion) => ({
      listingId: expansion.id,
      assetClass: 'career-expansion' as const,
      targetId: expansion.id,
      displayName: expansion.displayName,
      summary: expansion.summary,
      careerWorldId: expansion.careerWorldId,
    })),
    ...listAllExchangeCertifications().map((cert) => ({
      listingId: cert.id,
      assetClass: 'certification' as const,
      targetId: cert.id,
      displayName: cert.displayName,
      summary: `Certification with ceremony template ${cert.ceremonyTemplateId}`,
      careerWorldId: cert.careerWorldId,
    })),
  ];

  return {
    version: STUDIO_EXCHANGE_ENGINE_VERSION,
    listings,
    assetClasses: [...EXCHANGE_ASSET_CLASSES],
  };
}
