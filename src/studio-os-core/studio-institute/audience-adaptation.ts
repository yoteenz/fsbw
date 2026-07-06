import type { InstituteLearningArtifact } from './types';
import type { InstituteLearningAudience } from './learning-types';

const AUDIENCE_VOICE: Record<InstituteLearningAudience, string> = {
  employee: 'Hands-on execution — what to do and why it matters to the team.',
  manager: 'Oversight and judgment — coach your team with institutional reasoning.',
  executive: 'Strategic framing — decisions that protect legacy and compliance.',
  contractor: 'Field-ready steps — portable expertise for external contributors.',
  customer: 'Educational guidance — learn, prepare, become informed before services.',
  student: 'Foundational learning — structured progression with clear outcomes.',
  partner: 'Aligned collaboration — shared standards without exposing private ops.',
  'franchise-owner': 'Replication playbook — scale expertise across locations.',
  'future-family': 'Legacy inheritance — wisdom preserved for future generations.',
  'ai-concierge': 'Digital Staff calibration — concierges reference Brain, never invent policy.',
};

export function adaptArtifactForAudience(
  artifact: InstituteLearningArtifact,
  audience: InstituteLearningAudience
): { title: string; presentation: string } {
  if (!artifact.audiences.includes(audience)) {
    return {
      title: artifact.title,
      presentation: `Adapted overview — this topic is primarily designed for ${artifact.audiences.join(', ')}.`,
    };
  }
  return {
    title: artifact.title,
    presentation: AUDIENCE_VOICE[audience],
  };
}

export function listAudienceAdaptations(
  artifacts: InstituteLearningArtifact[]
): { audience: InstituteLearningAudience; artifactCount: number }[] {
  const counts = new Map<InstituteLearningAudience, number>();
  for (const a of artifacts) {
    for (const aud of a.audiences) {
      counts.set(aud, (counts.get(aud) ?? 0) + 1);
    }
  }
  return [...counts.entries()].map(([audience, artifactCount]) => ({ audience, artifactCount }));
}
