import type { OrganizationProfessionBrain, OrganizationProfessionBrainProfile } from '../profession-brain/types';
import type { InstituteLearningArtifactType, InstituteLearningAudience } from './learning-types';
import type { InstituteLearningArtifact } from './types';

function artifact(
  partial: Omit<InstituteLearningArtifact, 'syncedFromBrainAt' | 'brainVersion'>
): InstituteLearningArtifact {
  return {
    ...partial,
    syncedFromBrainAt: new Date().toISOString(),
    brainVersion: 1,
  };
}

function audiencesForBrain(brainId: string): InstituteLearningAudience[] {
  const base: InstituteLearningAudience[] = ['employee', 'manager', 'ai-concierge'];
  if (brainId === 'marketing' || brainId === 'hair-color') {
    return [...base, 'customer', 'student'];
  }
  if (brainId === 'fuel-tax' || brainId === 'bookkeeping' || brainId === 'permit') {
    return [...base, 'customer', 'partner'];
  }
  return base;
}

function generateFromBrain(brain: OrganizationProfessionBrain): InstituteLearningArtifact[] {
  const artifacts: InstituteLearningArtifact[] = [];
  const audiences = audiencesForBrain(brain.definitionId);

  artifacts.push(
    artifact({
      id: `course-${brain.id}`,
      brainId: brain.id,
      type: 'course',
      title: `${brain.label} · Mastery Course`,
      summary: `Structured learning from organizational ${brain.label} expertise — teachable, repeatable, transferable.`,
      audiences,
      durationMinutes: 45,
      sourceEntryIds: brain.knowledgeEntries.slice(0, 6).map((e) => e.id),
    })
  );

  for (const entry of brain.knowledgeEntries.slice(0, 8)) {
    artifacts.push(
      artifact({
        id: `lesson-${brain.id}-${entry.id}`,
        brainId: brain.id,
        type: 'lesson',
        title: entry.title,
        summary: `${entry.what} — ${entry.why}`,
        audiences,
        durationMinutes: 8,
        sourceEntryIds: [entry.id],
      })
    );
  }

  artifacts.push(
    artifact({
      id: `path-${brain.id}-employees`,
      brainId: brain.id,
      type: 'learning-path',
      title: `${brain.label} · Employee Path`,
      summary: 'Role-ready progression from fundamentals to judgment — generated from Profession Brain.',
      audiences: ['employee', 'contractor'],
      durationMinutes: 120,
      sourceEntryIds: brain.knowledgeEntries.map((e) => e.id),
    })
  );

  artifacts.push(
    artifact({
      id: `checklist-${brain.id}`,
      brainId: brain.id,
      type: 'checklist',
      title: `${brain.label} · Operational Checklist`,
      summary: 'Daily execution checklist derived from best practices and business rules.',
      audiences: ['employee', 'manager'],
      durationMinutes: 5,
      sourceEntryIds: brain.knowledgeEntries.filter((e) => e.kind === 'best-practice' || e.kind === 'business-rule').map((e) => e.id),
    }),
    artifact({
      id: `playbook-${brain.id}`,
      brainId: brain.id,
      type: 'playbook',
      title: `${brain.label} · Decision Playbook`,
      summary: 'When exceptions arise — professional judgment captured from institutional memory.',
      audiences: ['manager', 'executive'],
      durationMinutes: 25,
      sourceEntryIds: brain.knowledgeEntries.filter((e) => e.kind === 'judgment' || e.kind === 'exception').map((e) => e.id),
    }),
    artifact({
      id: `reference-${brain.id}`,
      brainId: brain.id,
      type: 'reference-guide',
      title: `${brain.label} · Reference Library`,
      summary: 'Searchable terminology, regulations, and templates — one source of truth.',
      audiences,
      durationMinutes: 15,
      sourceEntryIds: brain.knowledgeEntries.filter((e) => e.kind === 'regulation' || e.kind === 'terminology' || e.kind === 'template').map((e) => e.id),
    }),
    artifact({
      id: `micro-${brain.id}`,
      brainId: brain.id,
      type: 'micro-lesson',
      title: `${brain.label} · Five-Minute Brief`,
      summary: 'Quick organizational update — ideal for Command Dock learning moments.',
      audiences: ['employee', 'manager', 'executive', 'ai-concierge'],
      durationMinutes: 5,
      sourceEntryIds: brain.knowledgeEntries.slice(0, 2).map((e) => e.id),
    }),
    artifact({
      id: `article-${brain.id}`,
      brainId: brain.id,
      type: 'knowledge-article',
      title: `${brain.label} · Knowledge Article`,
      summary: 'Deep-dive article synthesized from preserved expertise.',
      audiences,
      durationMinutes: 12,
      sourceEntryIds: brain.knowledgeEntries.slice(0, 4).map((e) => e.id),
    }),
    artifact({
      id: `sim-${brain.id}`,
      brainId: brain.id,
      type: 'operational-simulation',
      title: `${brain.label} · Operational Simulation`,
      summary: 'Practice realistic workflows — decision-making, not memorization.',
      audiences: ['employee', 'manager'],
      durationMinutes: 30,
      sourceEntryIds: brain.judgmentPatterns.map((j) => j.id),
    }),
    artifact({
      id: `cert-prog-${brain.id}`,
      brainId: brain.id,
      type: 'certification-program',
      title: `${brain.label} · Certification Program`,
      summary: 'Organization-specific certification track — progress tracked inside Studio Institute.',
      audiences: ['employee', 'manager', 'executive'],
      durationMinutes: 180,
      sourceEntryIds: brain.knowledgeEntries.map((e) => e.id),
    })
  );

  return artifacts;
}

export function generateInstituteArtifactsFromProfile(
  profile: OrganizationProfessionBrainProfile
): InstituteLearningArtifact[] {
  return profile.brains.flatMap(generateFromBrain);
}

export function countArtifactsByType(
  artifacts: InstituteLearningArtifact[]
): Record<InstituteLearningArtifactType, number> {
  const counts = {} as Record<InstituteLearningArtifactType, number>;
  for (const a of artifacts) {
    counts[a.type] = (counts[a.type] ?? 0) + 1;
  }
  return counts;
}
