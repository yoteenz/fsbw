import type { AssetDnaRecord } from '../manufacturing-engine/asset-dna';

export const DNA_INSPECTOR_VERSION = 'dna-inspector.v1';

export type DnaInspectorPanel = {
  inspectorVersion: typeof DNA_INSPECTOR_VERSION;
  assetId: string;
  assetRevision: string;
  silhouette: string;
  geometry: string;
  materials: string[];
  transparency: string;
  reflection: number;
  sockets: string[];
  cameraRules: string[];
  lightingRules: string[];
  allowedVariations: string[];
  forbiddenVariations: string[];
  forbiddenMaterials: string[];
  forbiddenGenerations: string[];
  repairRules: string[];
  versionHistory: string[];
  inspectionHistory: string[];
  healthHistory: string[];
  assetSignatureHash: string;
};

export function buildDnaInspector(dna: AssetDnaRecord): DnaInspectorPanel {
  return {
    inspectorVersion: DNA_INSPECTOR_VERSION,
    assetId: dna.assetId,
    assetRevision: dna.assetRevision,
    silhouette: dna.visualDna.silhouette,
    geometry: `${dna.physical.widthM}×${dna.physical.heightM}×${dna.physical.depthM}m`,
    materials: dna.materialIds,
    transparency: dna.visualDna.transparency,
    reflection: dna.visualDna.reflection,
    sockets: dna.socketCompatibility,
    cameraRules: dna.cameraRules,
    lightingRules: [dna.visualDna.illuminationProfile],
    allowedVariations: dna.allowedVariations,
    forbiddenVariations: dna.forbiddenVariations,
    forbiddenMaterials: dna.negativeDna.forbiddenMaterials,
    forbiddenGenerations: dna.negativeDna.forbiddenGenerations,
    repairRules: dna.repairRules,
    versionHistory: [dna.assetRevision],
    inspectionHistory: dna.inspectionRules,
    healthHistory: dna.healthHistory,
    assetSignatureHash: dna.assetSignatureHash,
  };
}
