/**
 * Global Atlas Layer™ — location-adaptive Atlas context.
 */

import { resolveCompanyRoute } from '../company-routes/resolve';
import { STUDIO_COMPANIES_BASE } from '../company-routes/constants';
import type { AtlasMapMode } from '../studio-world-atlas/types';
import type { StudioWorldFlagshipId } from '../studio-world/types';
import type { GlobalAtlasLocationContext } from './types';

const CONTEXT_BY_FLAGSHIP: Record<StudioWorldFlagshipId, GlobalAtlasLocationContext> = {
  'creative-direction-studio': {
    flagshipId: 'creative-direction-studio',
    contextLabel: 'Creative Direction Studio™',
    priorityModes: ['creative', 'creative-budget', 'creative-portfolio', 'parallel-futures', 'future-merge'],
    priorityDestinations: [
      'Story Table™',
      'Parallel Futures™',
      'Studio Warehouse™',
      'Golden Build™',
      'Concept Approval™',
    ],
  },
  headquarters: {
    flagshipId: 'headquarters',
    contextLabel: 'Headquarters™',
    priorityModes: ['organization', 'operations', 'creative-equity', 'company-genome'],
    priorityDestinations: [
      'Marketing Headquarters™',
      'Operations Headquarters™',
      'Distribution Headquarters™',
      'Founder Office™',
      'Concierge™',
    ],
  },
  'studio-archives': {
    flagshipId: 'studio-archives',
    contextLabel: 'Studio Archives™',
    priorityModes: ['archives', 'innovation', 'company-genome', 'creative-portfolio'],
    priorityDestinations: [
      'Innovation District™',
      'Warehouse Wing™',
      'Museum Wing™',
      'Hall of Innovation™',
      'Innovation Lineage Gallery™',
      'Blueprint Archive™',
      'Marketplace™',
    ],
  },
  'studio-warehouse': {
    flagshipId: 'studio-warehouse',
    contextLabel: 'Studio Warehouse™',
    priorityModes: ['generation', 'creative-budget', 'construction'],
    priorityDestinations: ['Asset Registry™', 'Generation Bay™', 'Scene Assembly™', 'Golden Build™'],
  },
  marketplace: {
    flagshipId: 'marketplace',
    contextLabel: 'Marketplace™',
    priorityModes: ['marketplace', 'creative-portfolio', 'creative-equity'],
    priorityDestinations: ['Blueprint Marketplace™', 'Asset Packs™', 'Licensing Hall™'],
  },
  'studio-command-center': {
    flagshipId: 'studio-command-center',
    contextLabel: 'Command Center™',
    priorityModes: ['organization', 'operations', 'ai', 'master-planner', 'architectural-blueprint'],
    priorityDestinations: [
      'Mission Control™',
      'Studio World Atlas™',
      'Architecture Observatory™',
      'Constitution Hall™',
    ],
  },
  'expedition-hub': {
    flagshipId: 'expedition-hub',
    contextLabel: 'Expedition Hub™',
    priorityModes: ['future-vision', 'master-planner', 'innovation', 'operations'],
    priorityDestinations: ['Launch Company™', 'Business Discovery™', 'Master Planner™'],
  },
};

const DEFAULT_CONTEXT: GlobalAtlasLocationContext = {
  flagshipId: null,
  contextLabel: 'Studio World™',
  priorityModes: ['architectural-blueprint', 'organization', 'operations'],
  priorityDestinations: ['Mission Control™', 'Creative Direction Studio™', 'Studio Archives™'],
};

export function resolveAtlasContextForPath(pathname: string): GlobalAtlasLocationContext {
  const p = pathname.toLowerCase();
  if (p.includes(`${STUDIO_COMPANIES_BASE}/`)) {
    const resolution = resolveCompanyRoute(pathname);
    if (resolution.company) {
      if (p.includes('creative-direction')) {
        return {
          ...CONTEXT_BY_FLAGSHIP['creative-direction-studio'],
          contextLabel: `${resolution.company.companyName} · Creative Direction Studio™`,
        };
      }
      if (p.includes('/departments/')) {
        return {
          ...CONTEXT_BY_FLAGSHIP.headquarters,
          contextLabel: `${resolution.company.companyName} · ${resolution.displayLabel}`,
          priorityModes: ['organization', 'operations', 'creative-equity', 'company-genome'],
        };
      }
      return {
        ...CONTEXT_BY_FLAGSHIP.headquarters,
        contextLabel: `${resolution.company.companyName} · ${resolution.displayLabel}`,
      };
    }
  }
  if (p.includes('creative-direction') || p.includes('/department/creative')) {
    return CONTEXT_BY_FLAGSHIP['creative-direction-studio'];
  }
  if (p.includes('studio-warehouse') || p.includes('/world/warehouse')) {
    return CONTEXT_BY_FLAGSHIP['studio-warehouse'];
  }
  if (p.includes('innovation-lineage-gallery') || p.includes('lineage-gallery')) {
    return {
      ...CONTEXT_BY_FLAGSHIP['studio-archives'],
      contextLabel: 'Innovation Lineage Gallery™',
      priorityModes: ['innovation', 'archives', 'marketplace', 'company-genome'],
      priorityDestinations: [
        'Innovation Lineage Gallery™',
        'Museum Wing™',
        'Innovation District™',
        'Marketplace Pavilion™',
        'Blueprint Archive™',
      ],
    };
  }
  if (p.includes('innovation-constellations') || p.includes('constellations-observatory')) {
    return {
      ...CONTEXT_BY_FLAGSHIP['studio-archives'],
      contextLabel: 'Innovation Constellations™',
      priorityModes: ['innovation', 'archives', 'marketplace', 'company-genome'],
      priorityDestinations: [
        'Innovation Constellations™',
        'Innovation Lineage Gallery™',
        'Innovation District™',
        'Marketplace Pavilion™',
        'Hall of Innovation™',
      ],
    };
  }
  if (p.includes('innovation-expeditions') || p.includes('expeditions-hall')) {
    return {
      ...CONTEXT_BY_FLAGSHIP['studio-archives'],
      contextLabel: 'Innovation Expeditions™',
      priorityModes: ['innovation', 'archives', 'marketplace', 'company-genome'],
      priorityDestinations: [
        'Innovation Expeditions™',
        'Innovation Constellations™',
        'World Atlas™',
        'Innovation Lineage Gallery™',
        'Marketplace Pavilion™',
      ],
    };
  }
  if (p.includes('innovation-district')) {
    return {
      ...CONTEXT_BY_FLAGSHIP['studio-archives'],
      contextLabel: 'Innovation District™',
      priorityModes: ['innovation', 'marketplace', 'company-genome', 'future-merge'],
      priorityDestinations: [
        'Innovation District™',
        'Story Table™',
        'Future Merge™',
        'Marketplace Pavilion™',
        'Hall of Innovation™',
      ],
    };
  }
  if (p.includes('studio-archives') || p.includes('studio-museum') || p.includes('museum')) {
    return CONTEXT_BY_FLAGSHIP['studio-archives'];
  }
  if (p.includes('marketplace')) {
    return CONTEXT_BY_FLAGSHIP.marketplace;
  }
  if (p.includes('expansion') || p.includes('expedition')) {
    return CONTEXT_BY_FLAGSHIP['expedition-hub'];
  }
  if (p.includes('/headquarters')) {
    return CONTEXT_BY_FLAGSHIP.headquarters;
  }
  if (
    p.includes('/studio/overview') ||
    p.includes('command-center') ||
    p.includes('world-atlas') ||
    p.includes('/studio/atlas') ||
    p.includes('constitution')
  ) {
    if (p.includes('world-atlas')) {
      return {
        ...CONTEXT_BY_FLAGSHIP['studio-command-center'],
        contextLabel: 'Mission Control™',
        priorityModes: ['architectural-blueprint', 'organization', 'innovation', 'marketplace', 'future-merge'],
        priorityDestinations: [
          'Mission Control™',
          'Atlas Table™',
          'Executive Atrium™',
          'Innovation Constellations™',
          'Innovation Expeditions™',
        ],
      };
    }
    return CONTEXT_BY_FLAGSHIP['studio-command-center'];
  }
  return DEFAULT_CONTEXT;
}

export function pickDefaultMapMode(context: GlobalAtlasLocationContext): AtlasMapMode {
  return context.priorityModes[0] ?? 'architectural-blueprint';
}
