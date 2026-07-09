import type { OrbKnowledgeResult } from '../types';
import { orbEngineNow } from '../context/context-engine';

/** Knowledge Retrieval — Institute of Knowledge™ / Knowledge Core™ adapter */
export function buildOrbKnowledgeResults(): OrbKnowledgeResult[] {
  const timestamp = orbEngineNow();
  return [
    {
      resultId: 'know-hq-principles',
      query: 'What is the Headquarters Principle?',
      answer:
        'Studio OS is a Company Headquarters™, not an admin dashboard. Experiences should feel like rooms, wings, and executive environments.',
      sources: [
        { label: 'Headquarters Principles™', system: 'Institute of Knowledge™', confidence: 0.95 },
        { label: 'Executive Headquarters™', system: 'Genesis™', confidence: 0.92 },
      ],
      stale: false,
      generatedAt: timestamp,
    },
    {
      resultId: 'know-orb-doctrine',
      query: 'What is Orb\'s role?',
      answer:
        'Orb is the Executive Intelligence Layer — the founder\'s permanent executive partner, not a chatbot or floating assistant.',
      sources: [{ label: 'Orb™ Architecture', system: 'Genesis™', confidence: 0.98 }],
      stale: false,
      generatedAt: timestamp,
    },
    {
      resultId: 'know-mission-blocker',
      query: 'Why is Knowledge Wing blocked?',
      answer: 'Knowledge Wing audit mission awaits Knowledge Core™ connector maturity.',
      sources: [{ label: 'Mission Engine™ projection', system: 'Mission Engine™', confidence: 0.84 }],
      stale: true,
      generatedAt: timestamp,
    },
  ];
}
