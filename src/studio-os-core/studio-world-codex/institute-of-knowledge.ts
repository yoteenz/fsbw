/**
 * Backward-compatible re-exports — canonical implementation lives in
 * `src/studio-os-core/institute-of-knowledge/`.
 */
export {
  INSTITUTE_DIVISIONS as INSTITUTE_KNOWLEDGE_DIVISIONS,
  INSTITUTE_PUBLICATION_TYPES,
  listInstituteDivisions as listInstituteKnowledgeDivisions,
  getInstituteDivision as getInstituteKnowledgeDivision,
  THE_INSTITUTE_OF_KNOWLEDGE,
} from '../institute-of-knowledge';

export type {
  InstituteDivisionId as InstituteKnowledgeDivisionId,
  InstituteDivision as InstituteKnowledgeDivision,
  InstitutePublicationType,
} from '../institute-of-knowledge/types';

export type { InstituteOfKnowledgeRegistry as InstituteOfKnowledge } from '../institute-of-knowledge/institute/registry';
