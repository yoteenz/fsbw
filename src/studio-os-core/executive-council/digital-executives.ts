import { getOrganizationArchitectureProfile } from '../industry-architecture/store';
import { getPackDefinition } from '../industry-architecture/pack-registry';
import { CORE_DIGITAL_EXECUTIVES } from './constants';
import type { DigitalExecutive } from './org-types';

function slugify(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

export function buildCoreDigitalExecutives(): DigitalExecutive[] {
  return CORE_DIGITAL_EXECUTIVES.map((exec) => ({
    id: exec.id,
    name: exec.name,
    title: exec.title,
    department: exec.department,
    focus: exec.focus,
    source: 'core' as const,
    active: exec.id !== 'chief-concierge',
  }));
}

export function expandExecutivesFromDepartmentPacks(organizationId: string): DigitalExecutive[] {
  const arch = getOrganizationArchitectureProfile(organizationId);
  if (!arch) return [];

  const fromPacks: DigitalExecutive[] = [];
  const seen = new Set<string>();

  for (const installed of arch.installedPacks) {
    const pack = getPackDefinition(installed.packId);
    if (!pack) continue;

    for (const concierge of pack.outcome.conciergesAdded) {
      const id = slugify(`${installed.packId}-${concierge.id}`);
      if (seen.has(id)) continue;
      seen.add(id);
      fromPacks.push({
        id,
        name: concierge.name,
        title: concierge.role,
        department: concierge.departmentId.replace(/-/g, ' ').toUpperCase(),
        focus: concierge.focus,
        source: 'department-pack',
        packId: installed.packId,
        active: true,
      });
    }
  }

  return fromPacks;
}

export function resolveDigitalExecutiveRoster(organizationId: string): DigitalExecutive[] {
  const core = buildCoreDigitalExecutives();
  const packExecs = expandExecutivesFromDepartmentPacks(organizationId);
  const coreIds = new Set(core.map((e) => slugify(e.name)));

  const merged = [...core];
  for (const exec of packExecs) {
    if (coreIds.has(slugify(exec.name))) continue;
    merged.push(exec);
  }

  return merged;
}

export function selectExecutivesForQuery(
  query: string,
  roster: DigitalExecutive[]
): DigitalExecutive[] {
  const q = query.toLowerCase();
  const debaters = roster.filter((e) => e.id !== 'chief-concierge' && e.active);

  const topicMap: { pattern: RegExp; executiveIds: string[] }[] = [
    { pattern: /revenue|monetiz|pricing|sales|subscription|margin/, executiveIds: ['revenue-concierge', 'finance-concierge', 'marketing-concierge', 'strategy-concierge'] },
    { pattern: /market|campaign|brand|audience|demand|growth/, executiveIds: ['marketing-concierge', 'revenue-concierge', 'strategy-concierge', 'cx-concierge'] },
    { pattern: /operat|capacity|workflow|execution|deliver|scale/, executiveIds: ['operations-concierge', 'production-concierge', 'finance-concierge'] },
    { pattern: /customer|experience|retention|trust|support|journey/, executiveIds: ['cx-concierge', 'operations-concierge', 'marketing-concierge'] },
    { pattern: /legal|compliance|contract|regulat|risk/, executiveIds: ['legal-concierge', 'finance-concierge', 'strategy-concierge'] },
    { pattern: /research|competitive|market intel|evidence/, executiveIds: ['research-concierge', 'strategy-concierge', 'marketing-concierge'] },
    { pattern: /produc|launch|render|publish|content/, executiveIds: ['production-concierge', 'operations-concierge', 'marketing-concierge'] },
    { pattern: /strateg|long.term|legacy|direction|invest/, executiveIds: ['strategy-concierge', 'finance-concierge', 'operations-concierge', 'cx-concierge'] },
    { pattern: /profit|cash|cost|budget|finance/, executiveIds: ['finance-concierge', 'revenue-concierge', 'operations-concierge'] },
  ];

  for (const topic of topicMap) {
    if (topic.pattern.test(q)) {
      const selected = topic.executiveIds
        .map((id) => debaters.find((e) => e.id === id))
        .filter((e): e is DigitalExecutive => Boolean(e));
      if (selected.length >= 3) return selected.slice(0, 5);
    }
  }

  return debaters.slice(0, 5);
}
