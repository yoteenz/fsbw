import type { ExpertDiscoveryQuery, ExpertProfile } from './types';

export function discoverExperts(catalog: ExpertProfile[], query: ExpertDiscoveryQuery): ExpertProfile[] {
  let results = catalog.filter((e) => e.published);

  if (query.industry) {
    const q = query.industry.toLowerCase();
    results = results.filter((e) => e.industries.some((i) => i.toLowerCase().includes(q)));
  }
  if (query.profession || query.specialty) {
    const q = (query.profession ?? query.specialty ?? '').toLowerCase();
    results = results.filter(
      (e) =>
        e.specialties.some((s) => s.toLowerCase().includes(q)) ||
        e.expertName.toLowerCase().includes(q)
    );
  }
  if (query.topic) {
    const q = query.topic.toLowerCase();
    results = results.filter(
      (e) =>
        e.knowledgeAreas.some((k) => k.toLowerCase().includes(q)) ||
        e.services.some((s) => s.toLowerCase().includes(q))
    );
  }
  if (query.organization) {
    const q = query.organization.toLowerCase();
    results = results.filter((e) => e.organizationName.toLowerCase().includes(q));
  }

  return results.sort((a, b) => b.rating - a.rating);
}

export function listDiscoverySuggestions(industryId?: string): string[] {
  return [
    industryId ? `Find a ${industryId.replace(/-/g, ' ')} expert` : 'Find a trusted expert',
    'Hair Color Expert near me',
    'Fuel Tax filing guidance',
    'Bookkeeping templates',
  ];
}
