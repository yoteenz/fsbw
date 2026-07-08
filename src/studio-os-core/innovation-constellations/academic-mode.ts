import type { AcademicModeView } from './types';
import type { OrganizationInnovationLineageProfile } from '../innovation-lineage/types';

export function buildAcademicModeViews(
  lineage: OrganizationInnovationLineageProfile | null
): AcademicModeView[] {
  if (!lineage || lineage.galleryExhibits.length === 0) {
    return [
      {
        innovationId: 'INNOV-DEMO',
        title: 'Studio World Innovation',
        originalInspiration: 'Founder Intent™ + collaborative invention',
        evolutionTimeline: ['Spark', 'Architecture', 'Prototype', 'Published', 'Adopted'],
        contributors: ['Founder'],
        forks: 0,
        merges: 0,
        businessImpact: 'Emerging',
        marketplaceAdoption: 'Early',
        knowledgeGraphSummary: 'Connected to World Graph™ W-INC nodes',
      },
    ];
  }

  return lineage.galleryExhibits.map((exhibit) => ({
    innovationId: exhibit.graph.nodes.find((n) => n.marketplaceBestseller)?.innovationId ?? exhibit.title,
    title: exhibit.title,
    originalInspiration: exhibit.originalVision,
    evolutionTimeline: exhibit.timeline.map((t) => t.label),
    contributors: exhibit.collaborators,
    forks: exhibit.majorForks.length,
    merges: exhibit.graph.edges.filter((e) => e.relationType === 'merged-with').length,
    businessImpact: `${exhibit.companiesUsing.toLocaleString()} companies · Influence ${exhibit.equity.influenceScore}`,
    marketplaceAdoption: exhibit.marketplaceSuccess,
    knowledgeGraphSummary: exhibit.currentEvolution,
  }));
}
