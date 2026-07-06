import { getAllPolicies } from './registration';
import type { PolicySearchHit } from './types';

/** Search policies by name, category, level, owner, or rules. */
export function queryPolicyEngine(query: string, limit = 12): PolicySearchHit[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];

  const terms = q.split(/\s+/).filter(Boolean);
  const policies = getAllPolicies();
  const hits: PolicySearchHit[] = [];

  for (const entry of policies) {
    const blob = `${entry.name} ${entry.policyId} ${entry.category} ${entry.description} ${entry.owner} ${entry.level} ${entry.rules.join(' ')} ${entry.department ?? ''}`.toLowerCase();
    let score = 0;
    let reason = 'keyword';
    for (const term of terms) {
      if (entry.policyId.includes(term)) score += 12;
      if (entry.category.includes(term)) {
        score += 10;
        reason = 'category';
      }
      if (entry.level.includes(term)) {
        score += 9;
        reason = 'level';
      }
      if (entry.name.toLowerCase().includes(term)) score += 8;
      if (blob.includes(term)) score += 5;
    }
    if (score > 0) hits.push({ entry, score, matchReason: reason });
  }

  return hits.sort((a, b) => b.score - a.score).slice(0, limit);
}

export function explainPolicy(policyId: string): string | null {
  const entry = getAllPolicies().find((p) => p.policyId === policyId);
  if (!entry) return null;
  return `${entry.name} (${entry.level}/${entry.category}) — ${entry.description} Owner: ${entry.owner}. Rules: ${entry.rules.slice(0, 2).join('; ')}. Status: ${entry.status}.`;
}

export function findPolicyForWorkflow(workflowId: string): ReturnType<typeof getAllPolicies> {
  const policies = getAllPolicies();
  const category = workflowId.split('.')[0] ?? '';
  return policies.filter(
    (p) =>
      p.status === 'active' &&
      (p.category.includes(category) ||
        p.appliesTo.some((a) => workflowId.includes(a)) ||
        workflowId.includes(p.category.replace('-', '')))
  );
}
