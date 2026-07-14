import type { EnvironmentAssetPackage } from './EnvironmentAssetPackage';
import { countOutputRegistry } from './EnvironmentPackageOutputs';

export type EnvironmentPackageHealth = {
  generationPercent: number;
  blueprintPercent: number;
  constructionPercent: number;
  lightingPercent: number;
  materialsPercent: number;
  runtimePercent: number;
  marketplacePercent: number;
  overallHealth: number;
};

function outputReady(
  pkg: EnvironmentAssetPackage,
  key: keyof EnvironmentAssetPackage['outputs']
): number {
  const entry = pkg.outputs[key];
  if (!entry) return 0;
  return entry.status === 'generated' || entry.status === 'cached' ? 100 : 0;
}

export function computeEnvironmentPackageHealth(
  pkg: EnvironmentAssetPackage
): EnvironmentPackageHealth {
  const counts = countOutputRegistry(pkg.outputs);
  const generationPercent = counts.total > 0
    ? Math.round((counts.generated / counts.total) * 100)
    : 0;

  const blueprintPercent = outputReady(pkg, 'blueprint');
  const constructionPercent = outputReady(pkg, 'constructionPlan');
  const lightingPercent = outputReady(pkg, 'lightingProfile');
  const materialsPercent = outputReady(pkg, 'materialsProfile');

  const runtimeOutputs = ['desktop', 'mobile', 'tablet'] as const;
  const runtimeReady = runtimeOutputs.filter((k) => outputReady(pkg, k) === 100).length;
  const runtimePercent = Math.round((runtimeReady / runtimeOutputs.length) * 100);

  const marketplacePercent = pkg.marketplaceReady ? 100 : pkg.canonical ? 50 : 0;

  const overallHealth = Math.round(
    (generationPercent
      + blueprintPercent
      + constructionPercent
      + lightingPercent
      + materialsPercent
      + runtimePercent
      + marketplacePercent) / 7
  );

  return {
    generationPercent,
    blueprintPercent,
    constructionPercent,
    lightingPercent,
    materialsPercent,
    runtimePercent,
    marketplacePercent,
    overallHealth,
  };
}
