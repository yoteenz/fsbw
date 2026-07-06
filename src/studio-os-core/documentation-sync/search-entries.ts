import { DOCUMENTATION_FAQ_REGISTRY } from './faq-registry';
import { expandSemanticQuery } from './semantic-search';
import { DOCUMENTATION_SYSTEM_REGISTRY } from './system-registry';

export type RegistrySearchEntry = {
  id: string;
  query: string;
  keywords: string[];
  moduleId: string;
  label: string;
  snippet: string;
};

/** Search entries derived from documentation registry — consumed by Interactive Manual search. */
export function buildRegistrySearchEntries(): RegistrySearchEntry[] {
  const entries: RegistrySearchEntry[] = [];

  for (const sys of DOCUMENTATION_SYSTEM_REGISTRY) {
    entries.push({
      id: `doc-sys-${sys.id}`,
      query: sys.label,
      keywords: [
        ...sys.searchKeywords,
        ...sys.aliases,
        sys.purpose.toLowerCase(),
        ...sys.capabilities.map((c) => c.toLowerCase()),
      ],
      moduleId: sys.moduleId ?? sys.id,
      label: sys.label,
      snippet: sys.overview.slice(0, 140),
    });

    for (const alias of sys.aliases.slice(0, 2)) {
      const { relatedSystemIds } = expandSemanticQuery(alias);
      for (const relId of relatedSystemIds.slice(0, 3)) {
        const rel = DOCUMENTATION_SYSTEM_REGISTRY.find((s) => s.id === relId);
        if (rel && rel.id !== sys.id) {
          entries.push({
            id: `doc-rel-${sys.id}-${relId}`,
            query: alias,
            keywords: [alias, rel.label.toLowerCase(), ...rel.searchKeywords.slice(0, 4)],
            moduleId: rel.moduleId ?? rel.id,
            label: `${rel.label} (related to "${alias}")`,
            snippet: rel.overview.slice(0, 120),
          });
        }
      }
    }
  }

  for (const faq of DOCUMENTATION_FAQ_REGISTRY) {
    entries.push({
      id: `doc-faq-${faq.id}`,
      query: faq.question,
      keywords: [faq.question.toLowerCase(), faq.category, ...faq.relatedSystemIds],
      moduleId: faq.moduleId ?? 'knowledge-hub',
      label: `FAQ · ${faq.question}`,
      snippet: faq.answer.slice(0, 140),
    });
  }

  return entries;
}
