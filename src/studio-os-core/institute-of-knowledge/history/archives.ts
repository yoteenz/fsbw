import { listInstitutePublications } from '../publications/engine';

export function listHistoricalPublications() {
  return listInstitutePublications().filter(
    (p) => p.status === 'Historical' || p.status === 'Deprecated'
  );
}

export function listArchivedEditions() {
  return listInstitutePublications().flatMap((pub) =>
    pub.revisionHistory.slice(0, -1).map((rev) => ({
      publicationId: pub.publicationId,
      title: pub.title,
      edition: rev.edition,
      revision: rev.revision,
      archivedAt: rev.createdAt,
      author: rev.author,
    }))
  );
}

export function getHistoricalArchivesStats() {
  const historical = listHistoricalPublications();
  const editions = listArchivedEditions();
  return {
    historicalPublications: historical.length,
    archivedEditions: editions.length,
    deprecated: historical.filter((p) => p.status === 'Deprecated').length,
  };
}
