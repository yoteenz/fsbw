import type { CanonicalMainDepartmentId } from '../../canonical-studio-world/canonical-department-registry';
import { DEPARTMENT_BIBLE_REGISTRY } from './bible-registry';
import type { AiWorkerDefinition, AiWorkforceDirectory } from '../schemas/ai-workforce';
import { AI_WORKFORCE_DIRECTORY_VERSION } from '../schemas/ai-workforce';

const WORKER_TEMPLATES: Partial<Record<CanonicalMainDepartmentId, string[]>> = {
  'experience-lab': ['Blueprint Architect', 'Architectural Planner', 'Prompt Compiler', 'Lighting Planner'],
  'creative-director-studio': ['Asset Artist', 'Material Artist', 'Lighting Artist', 'Animation Artist'],
  'command-center': ['Operations AI', 'Diagnostics AI', 'Monitoring AI'],
  'immune-system': ['Recovery AI', 'Boundary Enforcer', 'Drift Detector'],
  'city-council': ['Governance AI', 'IP Validator', 'Permit Reviewer'],
  marketplace: ['Commerce AI', 'Licensing Agent', 'Compatibility Checker'],
  'ai-workforce-center': ['Queue Dispatcher', 'Worker Orchestrator', 'Capacity Planner'],
  'quality-guard': ['Parity Inspector', 'Composition Validator'],
  'blueprint-author': ['Specification Author', 'Socket Registry Agent'],
  'world-compiler': ['Scene Stack Compiler', 'Runtime Assembler'],
  'construction-mode': ['Assembly Worker', 'Manufacturing Validator'],
};

function workerId(dept: string, name: string): string {
  return `aiw-${dept}-${name.toLowerCase().replace(/\s+/g, '-')}`;
}

function buildWorkers(departmentId: CanonicalMainDepartmentId): AiWorkerDefinition[] {
  const bible = DEPARTMENT_BIBLE_REGISTRY[departmentId];
  const names = WORKER_TEMPLATES[departmentId] ?? bible.requiredAiWorkers;
  return names.map((displayName) => ({
    workerId: workerId(departmentId, displayName),
    displayName,
    departmentId,
    responsibilities: [`${displayName} operations for ${bible.officialName}`],
    requiredCapabilities: bible.requiredServices.slice(0, 3),
  }));
}

export const AI_WORKFORCE_DIRECTORY: AiWorkforceDirectory = {
  directoryVersion: AI_WORKFORCE_DIRECTORY_VERSION,
  workers: Object.keys(DEPARTMENT_BIBLE_REGISTRY).flatMap((id) =>
    buildWorkers(id as CanonicalMainDepartmentId)
  ),
};

export function resolveAiWorkersForDepartment(departmentId: CanonicalMainDepartmentId): AiWorkerDefinition[] {
  return AI_WORKFORCE_DIRECTORY.workers.filter((w) => w.departmentId === departmentId);
}
