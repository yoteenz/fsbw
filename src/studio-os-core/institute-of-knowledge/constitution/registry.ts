import { listInstitutePublications } from '../publications/engine';

export function listConstitutionalPublications() {
  return listInstitutePublications().filter(
    (p) => p.constitutionalArticleIds.length > 0 || p.divisionId === 'constitution-office'
  );
}

export function getConstitutionOfficeStats() {
  const constitutional = listConstitutionalPublications();
  return {
    total: constitutional.length,
    canonical: constitutional.filter((p) => p.status === 'Canonical').length,
    inReview: constitutional.filter((p) => p.status === 'Review').length,
    amendments: constitutional.filter((p) => p.tags.includes('amendment')).length,
  };
}
