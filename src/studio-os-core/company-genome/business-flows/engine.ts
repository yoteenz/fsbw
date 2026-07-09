import type { BusinessFlow, BusinessFlowType, BusinessSystem, FlowTraversal } from '../business-types';

export function listBusinessFlows(flows: BusinessFlow[], flowType?: BusinessFlowType): BusinessFlow[] {
  const filtered = flowType ? flows.filter((f) => f.flowType === flowType) : flows;
  return [...filtered];
}

export function getBusinessFlow(flows: BusinessFlow[], flowId: string): BusinessFlow | null {
  return flows.find((f) => f.id === flowId) ?? null;
}

export function traverseFlow(flow: BusinessFlow, systems: BusinessSystem[]): FlowTraversal {
  const systemMap = new Map(systems.map((s) => [s.systemId, s]));
  const resolved: BusinessSystem[] = [];
  const missing: string[] = [];
  for (const step of flow.steps) {
    const sys = systemMap.get(step.systemId);
    if (sys) resolved.push(sys);
    else missing.push(step.systemId);
  }
  return { flow, systems: resolved, missingSystemIds: missing };
}

export function getFlowsForSystem(flows: BusinessFlow[], systemId: string): BusinessFlow[] {
  return flows.filter((f) => f.steps.some((step) => step.systemId === systemId));
}

export function validateFlowIntegrity(flows: BusinessFlow[], systems: BusinessSystem[]): string[] {
  const systemIds = new Set(systems.map((s) => s.systemId));
  const issues: string[] = [];
  for (const flow of flows) {
    for (const step of flow.steps) {
      if (!systemIds.has(step.systemId)) {
        issues.push(`Flow "${flow.name}" references missing system "${step.systemId}"`);
      }
    }
    if (flow.steps.length < 2) {
      issues.push(`Flow "${flow.name}" has fewer than 2 steps`);
    }
  }
  return issues;
}
