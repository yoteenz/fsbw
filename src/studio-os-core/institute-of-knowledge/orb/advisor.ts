import { listCanonicalPublications } from '../publications/schema';
import {
  getInstitutePublication,
  listInstitutePublications,
  findRelatedPublicationIds,
} from '../publications/engine';
import { listPendingSubmissions } from '../review/pipeline';
import { resolveConstitutionalSourcesForQuery } from '../codex/integration';
import { THE_INSTITUTE_OF_KNOWLEDGE } from '../institute/registry';
import type { InstituteOrbCitation, InstituteOrbRecommendation, InstitutePublication } from '../types';

function toCitation(publication: InstitutePublication): InstituteOrbCitation {
  return {
    publicationId: publication.publicationId,
    title: publication.title,
    edition: publication.edition,
    revision: publication.revision,
    status: publication.status,
    constitutionalArticleIds: publication.constitutionalArticleIds,
    codexArticleIds: publication.codexArticleIds,
  };
}

/** Orb retrieves canonical answers from The Institute of Knowledge™. */
export function buildInstituteAdvisorLines(): string[] {
  const publications = listInstitutePublications();
  const canonical = listCanonicalPublications(publications);
  const pending = listPendingSubmissions();

  return [
    `${THE_INSTITUTE_OF_KNOWLEDGE.title} governs ${publications.length} official publications.`,
    canonical.length
      ? `Canonical sources: ${canonical.slice(0, 2).map((p) => p.title).join(' · ')}`
      : 'Canonical publications await Institute approval.',
    pending.length
      ? `${pending.length} knowledge submissions await review before canon promotion.`
      : 'Review queue clear — Institute gates AI knowledge before canon.',
    'The Orb cites edition, revision, and constitutional sources — not disconnected files.',
  ];
}

export function getInstituteOrbRecommendations(
  query?: string,
  publicationId?: string,
  limit = 8
): InstituteOrbRecommendation[] {
  const recommendations: InstituteOrbRecommendation[] = [];
  const publications = listInstitutePublications();
  const canonical = listCanonicalPublications(publications);

  if (publicationId) {
    const pub = getInstitutePublication(publicationId);
    if (pub) {
      recommendations.push({
        kind: 'canonical-publication',
        title: pub.title,
        detail: `${pub.type} · Edition ${pub.edition} · Rev ${pub.revision} · ${pub.status}`,
        publicationId: pub.publicationId,
        citation: toCitation(pub),
      });

      for (const relatedId of findRelatedPublicationIds(publicationId).slice(0, 3)) {
        const related = getInstitutePublication(relatedId);
        if (!related) continue;
        recommendations.push({
          kind: 'related-publication',
          title: related.title,
          detail: related.summary,
          publicationId: related.publicationId,
          citation: toCitation(related),
        });
      }
    }
  } else if (query?.trim()) {
    const constitutional = resolveConstitutionalSourcesForQuery(query);
    for (const pub of constitutional.slice(0, 3)) {
      recommendations.push({
        kind: 'constitutional-source',
        title: pub.title,
        detail: pub.summary,
        publicationId: pub.publicationId,
        citation: toCitation(pub),
      });
    }
  } else {
    for (const pub of canonical.slice(0, 3)) {
      recommendations.push({
        kind: 'canonical-publication',
        title: pub.title,
        detail: pub.summary,
        publicationId: pub.publicationId,
        citation: toCitation(pub),
      });
    }
  }

  const pending = listPendingSubmissions();
  if (pending.length) {
    recommendations.push({
      kind: 'pending-review',
      title: 'Knowledge Review Queue',
      detail: `${pending.length} proposed knowledge items await Institute validation.`,
    });
  }

  recommendations.push({
    kind: 'division-guidance',
    title: THE_INSTITUTE_OF_KNOWLEDGE.title,
    detail: THE_INSTITUTE_OF_KNOWLEDGE.canonGate,
  });

  return recommendations.slice(0, limit);
}

export function resolveInstituteOrbLine(query: string): string | null {
  const q = query.trim().toLowerCase();
  if (!q) return null;

  if (/institute|canon|canonical|publication|govern/i.test(q)) {
    const pubs = listInstitutePublications();
    const canonical = pubs.filter((p) => p.status === 'Canonical').length;
    return `${THE_INSTITUTE_OF_KNOWLEDGE.title} holds ${pubs.length} publications. ${canonical} are Canonical™ — the Orb cites edition and constitutional sources.`;
  }

  if (/review|validation|approve|promote/i.test(q)) {
    const pending = listPendingSubmissions().length;
    return pending
      ? `${pending} knowledge submissions await Institute review before canon promotion.`
      : 'Institute review queue is clear. AI knowledge must pass validation before canon.';
  }

  if (/constitution|constitutional/i.test(q)) {
    const sources = resolveConstitutionalSourcesForQuery(q);
    if (sources.length) {
      const first = sources[0];
      return `Constitutional source: ${first.title} (Edition ${first.edition}, Rev ${first.revision}).`;
    }
  }

  return null;
}

export type InstituteOrbAdvice = {
  response: string;
  concierge: 'Institute Advisor™';
  citations: InstituteOrbCitation[];
  publicationCount: number;
};

export function resolveInstituteAdvice(input: string): InstituteOrbAdvice | null {
  const line = resolveInstituteOrbLine(input);
  if (!line) return null;

  const recommendations = getInstituteOrbRecommendations(input, undefined, 5);
  const citations = recommendations
    .filter((r) => r.citation)
    .map((r) => r.citation!)
    .slice(0, 3);

  return {
    response: line,
    concierge: 'Institute Advisor™',
    citations,
    publicationCount: listInstitutePublications().length,
  };
}
