import {
  buildDiscoveryTimeline,
  buildFounderJourney,
  computeGenomeCompletion,
} from '../discovery-progress/calculator';
import { buildDependencyGraphPreview } from '../genome-builder/generator';
import type { DiscoverySession, DiscoveryVisualExperience } from '../types';

export function buildDiscoveryVisualExperience(session: DiscoverySession): DiscoveryVisualExperience {
  return {
    discoveryTimeline: buildDiscoveryTimeline(session),
    interactiveProgress: session.progress,
    businessGenomePreview: session.companyGenome,
    dependencyGraph: buildDependencyGraphPreview(session),
    founderJourney: buildFounderJourney(session),
    genomeCompletionPercent: session.genomeCompletionPercent || computeGenomeCompletion(session),
    headquartersPreview: session.generatedHeadquarters,
  };
}
