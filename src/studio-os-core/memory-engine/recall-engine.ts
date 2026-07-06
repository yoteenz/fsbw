import type {
  MemoryRecallResult,
  MemoryRecord,
  ProjectCompletionArtifact,
  RecallRecommendation,
} from './types';

function tokenize(query: string): string[] {
  return query
    .toLowerCase()
    .split(/\W+/)
    .filter((t) => t.length > 2);
}

function scoreRecord(record: MemoryRecord, tokens: string[]): number {
  const haystack = `${record.title} ${record.summary} ${record.tags.join(' ')}`.toLowerCase();
  let score = 0;
  for (const token of tokens) {
    if (haystack.includes(token)) score += 1;
  }
  if (record.type === 'failure' && /mistake|fail|wrong|avoid/i.test(tokens.join(' '))) score += 2;
  if (record.type === 'success' && /success|win|work/i.test(tokens.join(' '))) score += 1;
  return score;
}

function deriveRecommendation(
  matches: MemoryRecord[],
  artifacts: ProjectCompletionArtifact[]
): { recommendation: RecallRecommendation; reason: string } {
  if (matches.length === 0) {
    return {
      recommendation: 'insufficient-data',
      reason: 'No prior organizational memory matches this query — proceed with caution and document the outcome.',
    };
  }

  const failures = matches.filter((m) => m.outcome === 'failure' || m.wouldRepeat === false);
  const successes = matches.filter((m) => m.outcome === 'success' || m.wouldRepeat === true);

  if (failures.length >= 2) {
    return {
      recommendation: 'avoid',
      reason: `Memory shows ${failures.length} prior failures or do-not-repeat flags for similar work.`,
    };
  }

  if (failures.length === 1 && successes.length === 0) {
    return {
      recommendation: 'cautious',
      reason: 'One prior failure recorded — review artifact mistakes before proceeding.',
    };
  }

  if (successes.length >= 2) {
    const artifact = artifacts.find((a) => successes.some((s) => s.id === a.projectId));
    return {
      recommendation: 'strongly-recommend',
      reason: artifact
        ? `Prior success documented — ${artifact.bestPractices[0]?.slice(0, 80) ?? 'repeat proven pattern'}.`
        : 'Multiple successful prior attempts — Memory supports repeating with documented best practices.',
    };
  }

  if (successes.length === 1) {
    return {
      recommendation: 'recommend',
      reason: 'One prior success — recommend repeating with lessons from archived artifact.',
    };
  }

  return {
    recommendation: 'cautious',
    reason: 'Partial or mixed prior outcomes — review lessons learned before committing.',
  };
}

/** Continuously answers: Have we done this before? What happened? Would we recommend again? */
export function recallOrganizationalMemory(
  query: string,
  records: MemoryRecord[],
  artifacts: ProjectCompletionArtifact[]
): MemoryRecallResult {
  const trimmed = query.trim();
  const tokens = tokenize(trimmed);

  const ranked = records
    .map((r) => ({ record: r, score: scoreRecord(r, tokens) }))
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score);

  const relatedRecords = ranked.slice(0, 5).map((x) => x.record);
  const { recommendation, reason } = deriveRecommendation(relatedRecords, artifacts);

  const whatHappened =
    relatedRecords.length === 0
      ? 'No matching organizational memory yet.'
      : relatedRecords
          .slice(0, 3)
          .map(
            (r) =>
              `${r.title} (${r.outcome}): ${r.summary.slice(0, 90)}${r.summary.length > 90 ? '…' : ''}`
          )
          .join(' · ');

  const priorArtifacts = artifacts.filter((a) =>
    relatedRecords.some((r) => r.id === a.projectId)
  );

  return {
    query: trimmed,
    hasPriorExperience: relatedRecords.length > 0,
    matchCount: relatedRecords.length,
    whatHappened,
    recommendation,
    recommendationReason: reason,
    relatedRecords,
    priorArtifacts,
  };
}
