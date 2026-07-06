import type { OrganizationProfessionBrainProfile } from '../profession-brain/types';
import { INSTITUTE_ORG_ROLES, type InstituteOrgRole } from './learning-types';
import type { InstituteRolePath } from './types';

const ROLE_BRAIN_MAP: Partial<Record<InstituteOrgRole, string[]>> = {
  'Fuel Tax Specialist': ['fuel-tax', 'bookkeeping'],
  Bookkeeper: ['bookkeeping', 'fuel-tax'],
  Dispatcher: ['dispatch', 'inventory'],
  'Marketing Coordinator': ['marketing', 'content'],
  'Customer Service Representative': ['marketing', 'hair-color', 'dispatch'],
  'Operations Manager': ['dispatch', 'inventory', 'permit'],
  'Permit Specialist': ['permit', 'painting'],
  'Inventory Manager': ['inventory', 'dispatch'],
  'Hair Color Expert': ['hair-color', 'hair-analysis'],
  'Brand Coordinator': ['marketing'],
};

function resolveRolesForBrain(definitionId: string): InstituteOrgRole[] {
  return INSTITUTE_ORG_ROLES.filter((role) =>
    (ROLE_BRAIN_MAP[role] ?? []).includes(definitionId)
  );
}

export function generateRolePathsFromProfile(
  profile: OrganizationProfessionBrainProfile
): InstituteRolePath[] {
  const paths: InstituteRolePath[] = [];

  for (const brain of profile.brains) {
    const roles = resolveRolesForBrain(brain.definitionId);
    for (const role of roles) {
      paths.push({
        id: `role-path-${brain.id}-${role.replace(/\s+/g, '-').toLowerCase()}`,
        brainId: brain.id,
        role,
        recommendedModules: [
          `course-${brain.id}`,
          `checklist-${brain.id}`,
          `playbook-${brain.id}`,
          `scenario-${brain.id}-${brain.judgmentPatterns[0]?.id ?? 'core'}`,
        ],
        masteryTopics: brain.knowledgeEntries.slice(0, 5).map((e) => e.title),
        progressPct: Math.min(100, brain.maturityPct + 10),
      });
    }
  }

  if (paths.length === 0 && profile.brains[0]) {
    const brain = profile.brains[0];
    paths.push({
      id: `role-path-${brain.id}-general`,
      brainId: brain.id,
      role: 'Operations Manager',
      recommendedModules: [`course-${brain.id}`, `checklist-${brain.id}`],
      masteryTopics: brain.knowledgeEntries.slice(0, 3).map((e) => e.title),
      progressPct: brain.maturityPct,
    });
  }

  return paths;
}
