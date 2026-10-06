import type { MigrationPipelineAdapter, MigrationPipelineResult, ProposedFact } from './types';

/** Deterministic extraction fixture — no external AI provider. */
export const fixtureMigrationPipelineAdapter: MigrationPipelineAdapter = {
  async processFile(input, context): Promise<MigrationPipelineResult> {
    const unsupported = !/^(application\/pdf|image\/(jpeg|jpg|png|webp))$/i.test(input.mimeType);
    if (unsupported) {
      return {
        stage: 'REVIEW_REQUIRED',
        exception: 'UNSUPPORTED_DOCUMENT',
        proposedFacts: [],
      };
    }

    const lower = input.fileName.toLowerCase();
    let documentClass = 'general_correspondence';
    if (lower.includes('coi') || lower.includes('insurance')) documentClass = 'certificate_of_insurance';
    else if (lower.includes('ifta')) documentClass = 'ifta_return';
    else if (lower.includes('registration') || lower.includes('cab')) documentClass = 'vehicle_registration';

    const proposedFacts: ProposedFact[] = [
      {
        entityType: 'company',
        fieldKey: 'legal_name',
        proposedValue: `Extracted from ${input.fileName}`,
        confidence: 'MEDIUM',
        sourceReference: `${context.batchId}/${input.fileName}#p1`,
      },
    ];

    if (documentClass === 'vehicle_registration') {
      proposedFacts.push({
        entityType: 'vehicle',
        fieldKey: 'unit_number',
        proposedValue: 'UNIT-101',
        confidence: 'LOW',
        sourceReference: `${context.batchId}/${input.fileName}#p1`,
      });
    }

    if (lower.includes('ambiguous-match-fixture')) {
      return {
        stage: 'REVIEW_REQUIRED',
        exception: 'AMBIGUOUS_CLIENT_MATCH',
        documentClass,
        documentClassConfidence: 0.72,
        proposedFacts,
        ambiguousClientMatches: ['org-candidate-a', 'org-candidate-b'],
      };
    }

    return {
      stage: 'REVIEW_REQUIRED',
      documentClass,
      documentClassConfidence: 0.88,
      proposedFacts,
    };
  },
};
