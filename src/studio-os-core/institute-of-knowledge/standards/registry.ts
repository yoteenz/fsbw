import { listInstitutePublications } from '../publications/engine';

export const INSTITUTE_STANDARD_CATEGORIES = [
  'design',
  'engineering',
  'education',
  'simulation',
  'brand',
  'production',
] as const;

export function listStandardsPublications() {
  return listInstitutePublications().filter(
    (p) =>
      p.divisionId === 'standards-bureau' ||
      p.type === 'specification' ||
      p.type === 'manual' ||
      p.tags.some((t) => INSTITUTE_STANDARD_CATEGORIES.some((c) => t.includes(c)))
  );
}

export function getStandardsBureauStats() {
  const standards = listStandardsPublications();
  return {
    total: standards.length,
    canonical: standards.filter((p) => p.status === 'Canonical').length,
    specifications: standards.filter((p) => p.type === 'specification').length,
    manuals: standards.filter((p) => p.type === 'manual').length,
  };
}
