import { useMemo } from 'react';
import {
  CREATIVE_DNA_V1_0,
  buildCreativeDnaGenerationPackage,
  resolveCreativeDnaForAssetFactory,
  type CreativeDnaRecord,
  type CreativeDnaGenerationPackage,
} from '../studio-os/product-photography';

export function getCreativeDnaRecord(): CreativeDnaRecord {
  return CREATIVE_DNA_V1_0;
}

export function getCreativeDnaGenerationPackageForUnit(unitSlug: string = 'soft-wave'): CreativeDnaGenerationPackage {
  return resolveCreativeDnaForAssetFactory(unitSlug).package;
}

export function useAdminStudioPhotographyCreativeDna() {
  const dna = useMemo(() => getCreativeDnaRecord(), []);
  const generationPackagePreview = useMemo(
    () => buildCreativeDnaGenerationPackage({
      unitSlug: 'soft-wave',
      unitName: 'SOFT WAVE',
      collectionNumber: '003',
      texture: 'Raw Indian',
      productReferenceImageSrc: dna.benchmarkOutput.heroPortraitSrc,
      length: '24"',
      density: '200%',
      lace: '13×6 Ultra Thin HD Film Lace',
    }),
    [dna.benchmarkOutput.heroPortraitSrc]
  );

  return { dna, generationPackagePreview, assetFactoryContext: resolveCreativeDnaForAssetFactory('soft-wave') };
}
