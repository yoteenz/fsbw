import type { NdxbookPage } from '../types';
import type { FounderInstinctAnalysis, FounderInstinctInsight, ProductionConciergeId } from './types';

function insight(
  label: string,
  likelihood: FounderInstinctInsight['likelihood'],
  detail: string,
  suggestedConcierge: ProductionConciergeId
): FounderInstinctInsight {
  return {
    id: `ins-${label.toLowerCase().replace(/\s+/g, '-')}`,
    label,
    likelihood,
    detail,
    suggestedConcierge,
  };
}

export function analyzeFounderInstinct(
  assetId: string,
  page: NdxbookPage | null,
  noteId: string | null
): FounderInstinctAnalysis {
  const insights: FounderInstinctInsight[] = [];

  if (!page) {
    insights.push(
      insight(
        'Asset not registered',
        'high',
        'No Master Content Asset exists yet — direction may feel abstract until Production creates Page 001.',
        'studio-orb'
      )
    );
  } else {
    if (page.hook.length < 40) {
      insights.push(
        insight(
          'Hook may lack authority',
          'medium',
          'Short hooks can read generic. Editorial Concierge can strengthen the opening line.',
          'editorial'
        )
      );
    }
    if (/panic|alarm|crisis|disaster/i.test(page.script + page.caption)) {
      insights.push(
        insight(
          'Tone may feel alarmist',
          'high',
          'Credit education should stay calm. Consider softening urgency in caption and script.',
          'editorial'
        )
      );
    }
    if (!page.pipeline?.studioReview) {
      insights.push(
        insight(
          'Pre-review quality unknown',
          'medium',
          'Studio Intelligence has not scored clarity, brand, or accuracy yet.',
          'studio-orb'
        )
      );
    }
    if (/score|credit|debt/i.test(page.script) && !/utilization|reporting lag/i.test(page.script)) {
      insights.push(
        insight(
          'Claim precision',
          'medium',
          'Educational credit claims may need Legal Concierge review before publish.',
          'legal'
        )
      );
    }
    insights.push(
      insight(
        'Visual direction',
        'low',
        'Confirm NDXBook indigo frame and educational carousel rhythm match Creative DNA.',
        'visual-design'
      )
    );
  }

  if (insights.length === 0) {
    insights.push(
      insight(
        'Mixed signal',
        'low',
        'Studio Orb recommends a brief Editorial + Brand pass before formal Review.',
        'studio-orb'
      )
    );
  }

  return {
    id: `instinct-${Date.now()}`,
    assetId,
    noteId,
    createdAt: new Date().toISOString(),
    summary: 'Studio Intelligence triage — likely issues based on asset state and founder instinct.',
    insights: insights.slice(0, 4),
  };
}
