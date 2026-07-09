import { readBrandDiscoveryEngineStore } from '../persistence';
import type { XbdBrandDnaRecord } from '../types';

/** Brand DNA Registry™ — canonical strategic Brand DNA store */
export function listBrandDnaRegistry(): XbdBrandDnaRecord[] {
  return [...readBrandDiscoveryEngineStore().brandRegistry];
}

export function getBrandDnaById(brandId: string): XbdBrandDnaRecord | undefined {
  return readBrandDiscoveryEngineStore().brandRegistry.find((b) => b.brandId === brandId);
}

export function getDefaultBrandDna(): XbdBrandDnaRecord {
  const registry = listBrandDnaRegistry();
  return (
    registry.find((b) => b.brandId === 'studio-os') ??
    registry[0] ??
    ({
      brandId: 'studio-os',
      companyId: 'studio-os-platform',
      brandName: 'Studio OS™',
      brandPhilosophy: '',
      mission: '',
      vision: '',
      values: [],
      audienceProfile: {
        primaryAudience: '',
        secondaryAudiences: [],
        psychology: '',
        customerDesire: '',
        identitySignals: [],
      },
      emotionalTerritory: [],
      visualPersonality: [],
      writingVoice: {
        tone: '',
        cadence: '',
        vocabulary: [],
        forbiddenLanguage: [],
        sampleLine: '',
      },
      colorSystem: {
        primary: '#EB1C24',
        secondary: '#1A1A1A',
        accent: '#C9A962',
        background: '#F8F6F3',
        textPrimary: '#1A1A1A',
        textSecondary: '#808080',
      },
      typography: {
        displayFont: 'sans-serif',
        labelFont: 'sans-serif',
        bodyFont: 'sans-serif',
        displaySize: '18px',
        labelSize: '10px',
        bodySize: '14px',
      },
      materials: [],
      photographyStyle: '',
      packagingStyle: '',
      contentStyle: '',
      luxuryLevel: 50,
      positioning: '',
      competitors: [],
      antiPatterns: [],
      brandRules: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      version: '1.0.0',
      status: 'draft',
    } satisfies XbdBrandDnaRecord)
  );
}

export function searchBrandDnaRegistry(query: string): XbdBrandDnaRecord[] {
  const q = query.trim().toLowerCase();
  if (!q) return listBrandDnaRegistry();
  return listBrandDnaRegistry().filter(
    (b) =>
      b.brandId.includes(q) ||
      b.brandName.toLowerCase().includes(q) ||
      b.positioning.toLowerCase().includes(q) ||
      b.mission.toLowerCase().includes(q)
  );
}

export function listBrandsByCompany(companyId: string): XbdBrandDnaRecord[] {
  return listBrandDnaRegistry().filter((b) => b.companyId === companyId);
}
