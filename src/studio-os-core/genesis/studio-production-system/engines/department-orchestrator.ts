import type { XpsDepartmentAssignment } from '../types';
import {
  XPS_DEPARTMENT_IDS,
  XPS_DEPARTMENT_LABELS,
  type XpsDepartmentId,
  type XpsPlatform,
} from '../constants';
import type { XniNarrativeBlueprint } from '../../narrative-intelligence/types';
import type { XniNarrativeType } from '../../narrative-intelligence/constants';

const SPECIALISTS: Record<XpsDepartmentId, string> = {
  'creative-executive': 'Executive Creative Strategist',
  'executive-producer': 'Production Orchestrator',
  'creative-director': 'Brand Expression Director',
  showrunner: 'Series Architect',
  'story-department': 'Story Editor',
  casting: 'Casting Director',
  'production-design': 'Production Designer',
  lighting: 'Lighting Designer',
  camera: 'Cinematographer',
  audio: 'Sound Designer',
  music: 'Music Supervisor',
  editorial: 'Editor',
  'post-production': 'Post Supervisor',
  'quality-control': 'Brand QA Reviewer',
  distribution: 'Distribution Strategist',
  'performance-analytics': 'Performance Analyst',
};

function departmentsForNarrativeType(type: XniNarrativeType, platform: XpsPlatform): XpsDepartmentId[] {
  const base: XpsDepartmentId[] = [
    'creative-executive',
    'executive-producer',
    'creative-director',
    'story-department',
    'casting',
    'production-design',
    'lighting',
    'camera',
    'audio',
    'music',
    'editorial',
    'post-production',
    'quality-control',
    'distribution',
    'performance-analytics',
  ];
  if (type === 'episode' || type === 'course' || type === 'campaign') {
    return ['showrunner', ...base];
  }
  if (platform === 'podcast') {
    return base.filter((d) => !['lighting', 'camera'].includes(d));
  }
  return base;
}

/** Department Orchestrator™ — assign production departments from narrative + platform */
export function assignProductionDepartments(
  blueprint: XniNarrativeBlueprint,
  platform: XpsPlatform
): XpsDepartmentAssignment[] {
  const ids = departmentsForNarrativeType(blueprint.narrativeType, platform);
  return ids.map((departmentId) => ({
    departmentId,
    label: XPS_DEPARTMENT_LABELS[departmentId],
    specialist: SPECIALISTS[departmentId],
    status: departmentId === 'creative-executive' ? 'complete' : 'pending',
    outputs: defaultOutputs(departmentId, blueprint),
    gateId: departmentGate(departmentId),
  }));
}

function departmentGate(departmentId: XpsDepartmentId) {
  if (departmentId === 'casting') return 'casting' as const;
  if (departmentId === 'production-design') return 'production-design' as const;
  if (['camera', 'audio', 'music', 'post-production'].includes(departmentId)) return 'camera-sound-post' as const;
  if (departmentId === 'editorial') return 'editorial-lock' as const;
  if (departmentId === 'quality-control') return 'qc-pass' as const;
  if (departmentId === 'distribution') return 'distribution' as const;
  return undefined;
}

function defaultOutputs(departmentId: XpsDepartmentId, blueprint: XniNarrativeBlueprint): string[] {
  const map: Partial<Record<XpsDepartmentId, string[]>> = {
    'creative-executive': ['Executive production mandate', 'Risk classification'],
    'executive-producer': ['Production plan', 'Dependency map'],
    'creative-director': ['Creative direction brief', 'Brand guardrails'],
    showrunner: ['Continuity notes', 'Series arc alignment'],
    'story-department': ['Beat sheet', blueprint.hook, ...blueprint.scenes.slice(0, 2).map((s) => s.title)],
    casting: blueprint.characters.map((c) => `${c.role}: ${c.name}`),
    'production-design': [blueprint.environment, blueprint.headquartersRoom],
    lighting: [blueprint.lighting],
    camera: [blueprint.cameraPlan],
    audio: ['Ambient palette', 'Signature sounds'],
    music: [blueprint.music],
    editorial: ['Edit decision list', 'Caption plan'],
    'post-production': ['Color grade plan', 'Export manifest'],
    'quality-control': ['QC scorecard'],
    distribution: blueprint.distributionPlan.map((d) => d.label),
    'performance-analytics': blueprint.successMetrics.map((m) => m.label),
  };
  return map[departmentId] ?? ['Department deliverables'];
}

export function listAllDepartmentIds(): XpsDepartmentId[] {
  return [...XPS_DEPARTMENT_IDS];
}
