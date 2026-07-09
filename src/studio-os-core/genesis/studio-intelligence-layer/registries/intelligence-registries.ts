import { readStudioIntelligenceLayerStore } from '../persistence';
import type {
  XsilAudienceDnaRecord,
  XsilCanonCandidate,
  XsilCompanyRecord,
  XsilCreativeNode,
  XsilDecisionDnaRecord,
  XsilExperienceCompileManifest,
  XsilOperatingManualRecord,
  XsilProductDnaRecord,
  XsilTasteGenomeRecord,
} from '../types';

/** Unified intelligence registries */
export function listCompanyRegistry(): XsilCompanyRecord[] {
  return [...readStudioIntelligenceLayerStore().companyRegistry];
}

export function getCompanyById(companyId: string): XsilCompanyRecord | undefined {
  return listCompanyRegistry().find((c) => c.companyId === companyId);
}

export function getDefaultCompany(): XsilCompanyRecord {
  return getCompanyById('studio-os') ?? listCompanyRegistry()[0]!;
}

export function listOperatingManualRegistry(): XsilOperatingManualRecord[] {
  return [...readStudioIntelligenceLayerStore().operatingManualRegistry];
}

export function getOperatingManual(companyId: string): XsilOperatingManualRecord | undefined {
  return listOperatingManualRegistry().find((m) => m.companyId === companyId);
}

export function listDecisionRegistry(): XsilDecisionDnaRecord[] {
  return [...readStudioIntelligenceLayerStore().decisionRegistry];
}

export function getDecisionDna(companyId: string): XsilDecisionDnaRecord | undefined {
  return listDecisionRegistry().find((d) => d.companyId === companyId);
}

export function listTasteRegistry(): XsilTasteGenomeRecord[] {
  return [...readStudioIntelligenceLayerStore().tasteRegistry];
}

export function getTasteGenome(companyId: string): XsilTasteGenomeRecord | undefined {
  return listTasteRegistry().find((t) => t.companyId === companyId);
}

export function listAudienceRegistry(): XsilAudienceDnaRecord[] {
  return [...readStudioIntelligenceLayerStore().audienceRegistry];
}

export function getAudienceDna(companyId: string): XsilAudienceDnaRecord | undefined {
  return listAudienceRegistry().find((a) => a.companyId === companyId);
}

export function listProductRegistry(): XsilProductDnaRecord[] {
  return [...readStudioIntelligenceLayerStore().productRegistry];
}

export function getProductDna(companyId: string): XsilProductDnaRecord | undefined {
  return listProductRegistry().find((p) => p.companyId === companyId);
}

export function listCreativeRegistry(): XsilCreativeNode[] {
  return [...readStudioIntelligenceLayerStore().creativeRegistry];
}

export function listCreativeForCompany(companyId: string): XsilCreativeNode[] {
  return listCreativeRegistry().filter((n) => n.companyId === companyId);
}

export function listCanonRegistry(): XsilCanonCandidate[] {
  return [...readStudioIntelligenceLayerStore().canonRegistry];
}

export function listCanonForCompany(companyId: string): XsilCanonCandidate[] {
  return listCanonRegistry().filter((c) => c.companyId === companyId);
}

export function listExperienceRegistry(): XsilExperienceCompileManifest[] {
  return [...readStudioIntelligenceLayerStore().experienceRegistry];
}

export function searchIntelligenceRegistry(query: string): {
  companies: XsilCompanyRecord[];
  manuals: XsilOperatingManualRecord[];
  creative: XsilCreativeNode[];
} {
  const q = query.trim().toLowerCase();
  if (!q) {
    return { companies: listCompanyRegistry(), manuals: listOperatingManualRegistry(), creative: listCreativeRegistry() };
  }
  return {
    companies: listCompanyRegistry().filter(
      (c) => c.companyName.toLowerCase().includes(q) || c.companyId.includes(q)
    ),
    manuals: listOperatingManualRegistry().filter((m) => m.operatingPhilosophy.toLowerCase().includes(q)),
    creative: listCreativeRegistry().filter(
      (n) => n.title.toLowerCase().includes(q) || n.tags.some((t) => t.includes(q))
    ),
  };
}
