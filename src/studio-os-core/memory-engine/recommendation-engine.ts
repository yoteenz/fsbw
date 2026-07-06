import type { CompoundingRecommendation, MemoryRecord, ProjectCompletionArtifact } from './types';

export function buildCompoundingRecommendations(
  records: MemoryRecord[],
  artifacts: ProjectCompletionArtifact[]
): CompoundingRecommendation[] {
  const recommendations: CompoundingRecommendation[] = [];

  const failures = records.filter((r) => r.outcome === 'failure' || r.wouldRepeat === false);
  for (const f of failures.slice(0, 2)) {
    recommendations.push({
      id: `rec-avoid-${f.id}`,
      title: `Avoid repeating: ${f.title}`,
      rationale: f.summary.slice(0, 140),
      basedOnRecordIds: [f.id],
      confidencePct: 85,
      category: 'avoid-failure',
    });
  }

  const successes = records.filter((r) => r.outcome === 'success' && r.wouldRepeat !== false);
  for (const s of successes.slice(0, 2)) {
    recommendations.push({
      id: `rec-repeat-${s.id}`,
      title: `Repeat proven success: ${s.title}`,
      rationale: s.summary.slice(0, 140),
      basedOnRecordIds: [s.id],
      confidencePct: 78,
      category: 'repeat-success',
    });
  }

  for (const artifact of artifacts.slice(0, 2)) {
    if (artifact.lessonsLearned[0]) {
      recommendations.push({
        id: `rec-lesson-${artifact.projectId}`,
        title: `Apply lesson from ${artifact.projectTitle}`,
        rationale: artifact.lessonsLearned[0],
        basedOnRecordIds: [artifact.projectId],
        confidencePct: 72,
        category: 'apply-lesson',
      });
    }
  }

  const workflows = records.filter((r) => r.type === 'workflow-improvement');
  if (workflows[0]) {
    recommendations.push({
      id: `rec-workflow-${workflows[0].id}`,
      title: 'Implement documented workflow improvement',
      rationale: workflows[0].summary.slice(0, 140),
      basedOnRecordIds: [workflows[0].id],
      confidencePct: 70,
      category: 'improve-workflow',
    });
  }

  return recommendations.slice(0, 6);
}

export function computeMemoryDepthScore(records: MemoryRecord[], artifactCount: number): number {
  const typeCoverage = new Set(records.map((r) => r.type)).size;
  const maxTypes = 12;
  const depth = Math.min(100, Math.round((records.length / 15) * 50 + (typeCoverage / maxTypes) * 30 + artifactCount * 4));
  return depth;
}
