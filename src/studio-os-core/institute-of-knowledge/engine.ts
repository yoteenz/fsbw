import { readInstituteStore } from './persistence/store';
import { THE_INSTITUTE_OF_KNOWLEDGE, getInstituteConstitutionalAuthority } from './institute/registry';
import { listInstituteDivisions, getInstituteDivision } from './divisions';
import {
  listInstitutePublications,
  getInstitutePublication,
  getInstitutePublicationGraphNeighbors,
  listInstituteRelationships,
} from './publications/engine';
import {
  listKnowledgeSubmissions,
  listPendingSubmissions,
  submitProposedKnowledge,
  submitFromProfessionBrain,
  submitFromResearchEngine,
  submitFromMentorAi,
} from './review/pipeline';
import {
  promotePublication,
  advancePublicationPipeline,
  listPromotionCandidates,
} from './validation/promotion';
import { getInstituteCodexGovernance, getInstituteCodexSyncSummary } from './codex/integration';
import { getInstituteWorldGraphSyncPayload } from './world-graph/sync';
import { listChronicleEntries, recordChronicleEvent } from './chronicle/timeline';
import { getResearchQueueStats } from './research/queue';
import { getConstitutionOfficeStats } from './constitution/registry';
import { getHistoricalArchivesStats } from './history/archives';
import { getStandardsBureauStats } from './standards/registry';
import { getProfessionKnowledgeBridgeStats } from './professions/bridge';
import {
  buildInstituteAdvisorLines,
  getInstituteOrbRecommendations,
  resolveInstituteAdvice,
} from './orb/advisor';
import { bootstrapInstituteExpansionHooks, listInstituteExpansionHooks } from './expansion/hooks';
import { getInstituteBootstrapPublicationCount } from './bootstrap/seeds';

export type InstituteStats = {
  totalPublications: number;
  canonicalPublications: number;
  approvedPublications: number;
  draftPublications: number;
  reviewQueue: number;
  pendingSubmissions: number;
  totalRelationships: number;
  chronicleEntries: number;
  divisionCount: number;
};

export function ensureInstituteStore() {
  bootstrapInstituteExpansionHooks();
  return readInstituteStore();
}

export function getInstituteStats(): InstituteStats {
  const store = readInstituteStore();
  const publications = store.publications;

  return {
    totalPublications: publications.length,
    canonicalPublications: publications.filter((p) => p.status === 'Canonical').length,
    approvedPublications: publications.filter((p) => p.status === 'Approved').length,
    draftPublications: publications.filter((p) => p.status === 'Draft').length,
    reviewQueue: publications.filter((p) => p.status === 'Review').length,
    pendingSubmissions: store.submissions.filter(
      (s) => s.status === 'pending' || s.status === 'in-review'
    ).length,
    totalRelationships: store.relationships.length,
    chronicleEntries: store.chronicle.length,
    divisionCount: listInstituteDivisions().length,
  };
}

export function queryInstitutePublications(query: string, limit = 12) {
  const q = query.trim().toLowerCase();
  const browse = listInstitutePublications()
    .slice(0, limit)
    .map((publication) => ({ publication, score: 1, matchReason: 'browse' }));

  if (!q) return browse;

  return listInstitutePublications()
    .map((pub) => {
      let score = 0;
      if (pub.title.toLowerCase().includes(q)) score += 5;
      if (pub.summary.toLowerCase().includes(q)) score += 3;
      if (pub.tags.some((t) => t.toLowerCase().includes(q))) score += 2;
      if (pub.codexArticleIds.some((id) => id.toLowerCase().includes(q))) score += 4;
      return { publication: pub, score, matchReason: score > 0 ? 'semantic' : '' };
    })
    .filter((hit) => hit.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}

export function getInstituteDivisionStats() {
  return {
    research: getResearchQueueStats(),
    constitution: getConstitutionOfficeStats(),
    archives: getHistoricalArchivesStats(),
    standards: getStandardsBureauStats(),
    professions: getProfessionKnowledgeBridgeStats(),
  };
}

export {
  THE_INSTITUTE_OF_KNOWLEDGE,
  getInstituteConstitutionalAuthority,
  listInstituteDivisions,
  getInstituteDivision,
  listInstitutePublications,
  getInstitutePublication,
  getInstitutePublicationGraphNeighbors,
  listInstituteRelationships,
  listKnowledgeSubmissions,
  listPendingSubmissions,
  submitProposedKnowledge,
  submitFromProfessionBrain,
  submitFromResearchEngine,
  submitFromMentorAi,
  promotePublication,
  advancePublicationPipeline,
  listPromotionCandidates,
  getInstituteCodexGovernance,
  getInstituteCodexSyncSummary,
  getInstituteWorldGraphSyncPayload,
  listChronicleEntries,
  recordChronicleEvent,
  buildInstituteAdvisorLines,
  getInstituteOrbRecommendations,
  resolveInstituteAdvice,
  listInstituteExpansionHooks,
  getInstituteBootstrapPublicationCount,
};
