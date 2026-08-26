import type { BawMaterialScreenAudit, BawMaterialScreenAuditEntry, MaterialScreenRecord } from '../types';

export function auditBawMaterialScreens(
  materialScreens: MaterialScreenRecord[],
  experiencePageId: string,
): BawMaterialScreenAudit {
  const bawScreens = materialScreens.filter((m) => m.experiencePageId === experiencePageId);
  const entries: BawMaterialScreenAuditEntry[] = [];

  const routeCounts = new Map<string, number>();
  for (const m of bawScreens) {
    const norm = m.representativeRoute.replace(/:[^/]+/g, ':param');
    routeCounts.set(norm, (routeCounts.get(norm) ?? 0) + 1);
  }

  for (const m of bawScreens) {
    const norm = m.representativeRoute.replace(/:[^/]+/g, ':param');
    const dupCount = routeCounts.get(norm) ?? 1;
    let classification: BawMaterialScreenAuditEntry['classification'] = 'MATERIAL_SCREEN_KEEP';
    let detail = 'Unique BAW workflow composition';
    let confidence: BawMaterialScreenAuditEntry['confidence'] = 'HIGH';

    if (/edit\/(cap|lace|texture|styling|hairline|addons)/.test(m.representativeRoute)) {
      classification = 'STATE_CANDIDATE';
      detail = 'Configuration sub-step — candidate visual state';
      confidence = 'MEDIUM';
    } else if (/view\/:param\/(cap|lace|texture|styling|hairline|addons)/.test(m.representativeRoute)) {
      classification = 'STATE_CANDIDATE';
      detail = 'View-mode configuration variant';
      confidence = 'MEDIUM';
    } else if (/try\/:param|view\/:param$/.test(m.representativeRoute)) {
      classification = 'INSTANCE_CANDIDATE';
      detail = 'Unit-specific entry/view — candidate instance route';
      confidence = 'MEDIUM';
    } else if (dupCount > 1) {
      classification = 'DUPLICATE_CANDIDATE';
      detail = `Route alias duplicate (${dupCount} screens share ${norm})`;
      confidence = 'HIGH';
    } else if (/customize|edit|hub|step/.test(m.representativeRoute)) {
      classification = 'MATERIAL_SCREEN_KEEP';
      detail = 'Distinct customization stage';
    }

    entries.push({
      materialScreenId: m.materialScreenId,
      displayName: m.displayName,
      representativeRoute: m.representativeRoute,
      classification,
      detail,
      confidence,
    });
  }

  return {
    projectId: 'frontal-slayer',
    inputCount: bawScreens.length,
    keep: entries.filter((e) => e.classification === 'MATERIAL_SCREEN_KEEP').length,
    stateCandidates: entries.filter((e) => e.classification === 'STATE_CANDIDATE').length,
    instanceCandidates: entries.filter((e) => e.classification === 'INSTANCE_CANDIDATE').length,
    duplicateCandidates: entries.filter((e) => e.classification === 'DUPLICATE_CANDIDATE').length,
    finalMaterialScreenCount: bawScreens.length,
    entries,
  };
}
