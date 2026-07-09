import { ensureConstitutionStore, readConstitutionStore } from './persistence';
import { getConstitutionRegistryStats, listConstitutionRegistry } from './registry';
import {
  registerConstitutionArticle,
  getConstitutionArticle,
  listConstitutionArticles,
  updateConstitutionArticle,
  listCanonicalConstitutionArticles,
  searchConstitutionArticles,
} from './articles/engine';
import {
  listConstitutionRelationships,
  addConstitutionRelationship,
  syncConstitutionRelationshipsFromArticleFields,
  findConstitutionContradictions,
  getConstitutionGraphNeighbors,
} from './relationships/graph';
import {
  createConstitutionArticleRevision,
  listConstitutionArticleRevisions,
} from './versioning/article-versioning';
import {
  submitConstitutionAmendment,
  listConstitutionAmendments,
  listOpenConstitutionAmendments,
  advanceConstitutionAmendmentStage,
  approveConstitutionAmendment,
  applyConstitutionAmendmentToGenesis,
  completeConstitutionAmendmentArchive,
  listConstitutionAmendmentStages,
} from './amendments/workflow';
import {
  beginConstitutionReview,
  listPendingConstitutionReviews,
  promoteConstitutionArticleToCanonical,
  completeConstitutionReview,
} from './review/pipeline';
import {
  castConstitutionVote,
  summarizeConstitutionVotes,
  listConstitutionVotes,
} from './voting/workflow';
import {
  listConstitutionHistoricalArchive,
  getConstitutionArticleTimeline,
} from './history/archive';
import {
  listConstitutionCrossReferences,
  formatConstitutionCitation,
  validateConstitutionCrossReferences,
} from './cross-references/resolve';
import {
  ingestConstitutionArticlePayload,
  ingestConstitutionArticleBatch,
} from './content/loader';
import {
  CONSTITUTION_SUBSYSTEM_NAME,
  CONSTITUTION_SUBSYSTEM_VERSION,
  CONSTITUTION_AMENDMENT_STAGES,
} from './constants';
import type { ConstitutionRegistryStats } from './types';

export function ensureConstitutionSubsystem() {
  return ensureConstitutionStore();
}

export function getConstitutionPlatformStats(): ConstitutionRegistryStats {
  return getConstitutionRegistryStats();
}

export {
  CONSTITUTION_SUBSYSTEM_NAME,
  CONSTITUTION_SUBSYSTEM_VERSION,
  CONSTITUTION_AMENDMENT_STAGES,
  readConstitutionStore,
  ensureConstitutionStore,
  getConstitutionRegistryStats,
  listConstitutionRegistry,
  registerConstitutionArticle,
  getConstitutionArticle,
  listConstitutionArticles,
  updateConstitutionArticle,
  listCanonicalConstitutionArticles,
  searchConstitutionArticles,
  listConstitutionRelationships,
  addConstitutionRelationship,
  syncConstitutionRelationshipsFromArticleFields,
  findConstitutionContradictions,
  getConstitutionGraphNeighbors,
  createConstitutionArticleRevision,
  listConstitutionArticleRevisions,
  submitConstitutionAmendment,
  listConstitutionAmendments,
  listOpenConstitutionAmendments,
  advanceConstitutionAmendmentStage,
  approveConstitutionAmendment,
  applyConstitutionAmendmentToGenesis,
  completeConstitutionAmendmentArchive,
  listConstitutionAmendmentStages,
  beginConstitutionReview,
  listPendingConstitutionReviews,
  promoteConstitutionArticleToCanonical,
  completeConstitutionReview,
  castConstitutionVote,
  summarizeConstitutionVotes,
  listConstitutionVotes,
  listConstitutionHistoricalArchive,
  getConstitutionArticleTimeline,
  listConstitutionCrossReferences,
  formatConstitutionCitation,
  validateConstitutionCrossReferences,
  ingestConstitutionArticlePayload,
  ingestConstitutionArticleBatch,
};

export type { ConstitutionRegistryStats, ConstitutionArticle, ConstitutionAmendment } from './types';
