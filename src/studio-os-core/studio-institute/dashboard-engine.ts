import type { OrganizationProfessionBrainProfile } from '../profession-brain/types';
import type { InstituteCustomerCourse, InstituteDashboardMetrics, InstituteKnowledgeUpdate } from './types';
import type { InstituteLearningArtifact } from './types';

export function buildInstituteDashboard(
  profile: OrganizationProfessionBrainProfile,
  artifacts: InstituteLearningArtifact[],
  certificationsEarned: number,
  scenariosCount: number
): InstituteDashboardMetrics {
  const lessons = artifacts.filter((a) => a.type === 'lesson' || a.type === 'micro-lesson').length;
  const courses = artifacts.filter((a) => a.type === 'course').length;
  const customerCourses = artifacts.filter((a) => a.audiences.includes('customer')).length;

  return {
    learningProgressPct: profile.overallMaturityPct,
    completedCertifications: certificationsEarned,
    recommendedLessons: Math.max(1, Math.ceil(lessons * 0.15)),
    knowledgeUpdatesPending: profile.livingSignals.filter((s) => !s.resolved).length,
    recentlyAddedTopics: profile.brains.slice(0, 3).map((b) => b.label),
    employeeProgressPct: Math.min(100, profile.overallMaturityPct + 5),
    customerCoursesAvailable: customerCourses,
    instituteActivitySummary: `${courses} courses · ${lessons} lessons · ${scenariosCount} scenarios · synced from Profession Brain™`,
    totalArtifacts: artifacts.length,
  };
}

export function detectKnowledgeUpdates(
  profile: OrganizationProfessionBrainProfile
): InstituteKnowledgeUpdate[] {
  const updates: InstituteKnowledgeUpdate[] = [];

  for (const signal of profile.livingSignals.filter((s) => !s.resolved)) {
    updates.push({
      id: `update-${signal.id}`,
      brainId: signal.targetBrainId,
      title: 'Profession Brain changed — Institute sync recommended',
      description: signal.phrase,
      affectedArtifacts: ['lessons', 'checklists', 'playbooks', 'certifications'],
      detectedAt: signal.detectedAt,
    });
  }

  for (const brain of profile.brains) {
    updates.push({
      id: `update-evolve-${brain.id}`,
      brainId: brain.id,
      title: `${brain.label} evolved`,
      description: `Last updated ${new Date(brain.lastEvolvedAt).toLocaleDateString()} — courses and role paths refreshed automatically.`,
      affectedArtifacts: ['courses', 'learning-paths', 'role-training'],
      detectedAt: brain.lastEvolvedAt,
    });
  }

  return updates.slice(0, 12);
}

export function generateCustomerCourses(
  profile: OrganizationProfessionBrainProfile,
  artifacts: InstituteLearningArtifact[]
): InstituteCustomerCourse[] {
  return profile.publicSurfaces
    .filter((s) => s.enabled)
    .map((surface) => {
      const related = artifacts.filter((a) => a.brainId === surface.brainId && a.audiences.includes('customer'));
      return {
        id: `customer-course-${surface.id}`,
        brainId: surface.brainId,
        title: surface.publicTitle,
        description: surface.description,
        capabilities: surface.capabilities,
        lessonCount: related.length,
        published: surface.enabled,
      };
    });
}
