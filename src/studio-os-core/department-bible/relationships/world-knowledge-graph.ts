import type { CanonicalMainDepartmentId } from '../../canonical-studio-world/canonical-department-registry';
import { DEPARTMENT_BIBLE_REGISTRY } from '../registry/bible-registry';
import { resolveAiWorkersForDepartment } from '../registry/ai-workforce-directory';
import { queryDownstream, queryUpstream } from './relationship-graph';
import { resolveDepartmentPermissionModel } from '../permissions/permission-model';
import { resolveDepartmentLifecycleModel } from '../lifecycles/lifecycle-model';

export const WORLD_KNOWLEDGE_GRAPH_VERSION = 'world-knowledge-graph.v1' as const;

export type WorldKnowledgeNode = {
  departmentId: CanonicalMainDepartmentId;
  officialName: string;
  mission: string;
  serves: CanonicalMainDepartmentId[];
  dependsOn: CanonicalMainDepartmentId[];
  dependedOnBy: CanonicalMainDepartmentId[];
  ownedWorkflows: string[];
  ownedAssets: string[];
  aiWorkers: string[];
  permissions: string[];
  lifecycleStates: string[];
};

export type WorldKnowledgeGraph = {
  graphVersion: typeof WORLD_KNOWLEDGE_GRAPH_VERSION;
  graphRevision: number;
  nodes: WorldKnowledgeNode[];
};

export function buildWorldKnowledgeGraph(): WorldKnowledgeGraph {
  const nodes: WorldKnowledgeNode[] = Object.keys(DEPARTMENT_BIBLE_REGISTRY).map((id) => {
    const departmentId = id as CanonicalMainDepartmentId;
    const bible = DEPARTMENT_BIBLE_REGISTRY[departmentId];
    const workers = resolveAiWorkersForDepartment(departmentId);
    const permissions = resolveDepartmentPermissionModel(departmentId);
    const lifecycle = resolveDepartmentLifecycleModel(departmentId);

    return {
      departmentId,
      officialName: bible.officialName,
      mission: bible.mission,
      serves: bible.downstreamDepartments,
      dependsOn: queryUpstream(departmentId),
      dependedOnBy: queryDownstream(departmentId),
      ownedWorkflows: bible.responsibilities,
      ownedAssets: bible.requiredInfrastructure,
      aiWorkers: workers.map((w) => w.workerId),
      permissions: permissions.grants.flatMap((g) => g.capabilities.map((c) => `${g.role}:${c}`)),
      lifecycleStates: [...lifecycle.states],
    };
  });

  return { graphVersion: WORLD_KNOWLEDGE_GRAPH_VERSION, graphRevision: 1, nodes };
}

export function queryKnowledgeNode(departmentId: CanonicalMainDepartmentId): WorldKnowledgeNode | undefined {
  return buildWorldKnowledgeGraph().nodes.find((n) => n.departmentId === departmentId);
}
