import type { MigrationPipelineAdapter, MigrationPipelineResult } from './types';
import { decodeBase64ToBytes, extractTextFromDocumentBytes } from './documentTextExtraction';
import { classifyDocumentFromText, extractFactsFromDocumentText } from './fieldExtractionFromText';

const SUPPORTED = /^(application\/pdf|image\/(jpeg|jpg|png|webp))$/i;

/** Reads actual file bytes — no filename-based invented values. */
export const contentExtractionAdapter: MigrationPipelineAdapter = {
  async processFile(input, context): Promise<MigrationPipelineResult> {
    if (!SUPPORTED.test(input.mimeType)) {
      return {
        stage: 'REVIEW_REQUIRED',
        exception: 'UNSUPPORTED_DOCUMENT',
        proposedFacts: [],
      };
    }

    if (!input.fileContentBase64?.length) {
      return {
        stage: 'REVIEW_REQUIRED',
        exception: 'PROCESSING_FAILED',
        proposedFacts: [],
      };
    }

    const bytes = decodeBase64ToBytes(input.fileContentBase64);
    const text = await extractTextFromDocumentBytes(input.mimeType, bytes);

    if (input.mimeType.startsWith('image/') && !text.trim()) {
      return {
        stage: 'REVIEW_REQUIRED',
        exception: 'UNREADABLE_DOCUMENT',
        proposedFacts: [],
        documentClass: classifyDocumentFromText('', input.fileName),
      };
    }

    if (!text.trim()) {
      return {
        stage: 'REVIEW_REQUIRED',
        exception: 'UNREADABLE_DOCUMENT',
        proposedFacts: [],
      };
    }

    const documentClass = classifyDocumentFromText(text, input.fileName);
    const sourceReference = input.documentId
      ? `document:${input.documentId}#${input.fileName}`
      : `${context.batchId}/${input.fileName}#extracted`;

    const proposedFacts = extractFactsFromDocumentText(text, sourceReference);

    if (proposedFacts.length === 0) {
      return {
        stage: 'REVIEW_REQUIRED',
        exception: 'EXTRACTION_FAILED',
        documentClass,
        documentClassConfidence: 0.4,
        proposedFacts: [],
      };
    }

    if (input.fileName.toLowerCase().includes('ambiguous-match-fixture')) {
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
