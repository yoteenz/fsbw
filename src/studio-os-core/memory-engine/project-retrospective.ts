import type { MemoryRecord, ProjectCompletionArtifact } from './types';

export function generateProjectCompletionArtifact(
  project: MemoryRecord,
  relatedRecords: MemoryRecord[]
): ProjectCompletionArtifact {
  const outcome = project.outcome === 'unknown' ? 'partial' : project.outcome;
  const success = outcome === 'success';
  const failure = outcome === 'failure';

  const lessonsLearned = [
    `${project.title}: ${project.summary.slice(0, 120)}`,
    success
      ? 'Document what worked before scaling — Memory proves outcomes, not assumptions.'
      : failure
        ? 'Capture failure context while details are fresh — prevents institutional amnesia.'
        : 'Partial outcomes need explicit follow-up criteria before repeating.',
  ];

  const relatedLessons = relatedRecords
    .filter((r) => r.type === 'lesson' || r.type === 'professional-insight')
    .slice(0, 2)
    .map((r) => r.summary.slice(0, 100));

  const bestPractices = success
    ? [
        `Repeat proven pattern: ${project.tags.slice(0, 3).join(' · ') || 'documented workflow'}.`,
        'Consult Organization Genome before customer-facing outputs.',
        ...relatedLessons,
      ]
    : ['Establish success metrics before launch.', 'Sync Profession Brain scope before regulated deliverables.'];

  const mistakesToAvoid = failure
    ? [
        `Avoid repeating without review: ${project.summary.slice(0, 80)}.`,
        'Do not skip Memory recall when a similar initiative is proposed.',
      ]
    : success
      ? ['Avoid scaling before artifact review is complete.']
      : ['Avoid treating partial outcomes as full success.'];

  const recommendations = [
    project.wouldRepeat === false
      ? 'Do not repeat without structural changes.'
      : project.wouldRepeat === true
        ? 'Recommend repeating with documented improvements.'
        : 'Gather one more data point before firm recommendation.',
    'Add outcome to Memory Engine before closing project record.',
  ];

  const futureImprovements = [
    'Automate artifact generation on project completion.',
    'Link artifact to Studio Institute scenario for training.',
    'Surface recall in Command Dock when similar commands appear.',
  ];

  return {
    projectId: project.id,
    projectTitle: project.title,
    completedAt: project.occurredAt,
    outcome,
    lessonsLearned,
    bestPractices,
    mistakesToAvoid,
    recommendations,
    futureImprovements,
  };
}

export function buildArtifactsFromCompletedProjects(
  records: MemoryRecord[]
): ProjectCompletionArtifact[] {
  const completedTypes = new Set(['project', 'campaign', 'experiment']);
  return records
    .filter(
      (r) =>
        completedTypes.has(r.type) &&
        (r.outcome === 'success' || r.outcome === 'failure' || r.outcome === 'partial')
    )
    .map((project) => generateProjectCompletionArtifact(project, records));
}
