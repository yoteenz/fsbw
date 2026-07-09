import type { XerInspectorView, XerRuntimeGraph } from '../types';
import { getRuntimeSessionState } from '../runtime-engine/experience-runtime';
import { listStateSlots } from '../runtime-state/session-state';

export function buildRuntimeInspectorView(graph: XerRuntimeGraph): XerInspectorView {
  return {
    platformDna: graph.platformDna,
    brandDna: graph.brand,
    departmentDna: graph.department,
    sceneDna: graph.scene,
    componentDna: graph.components,
    resolvedTokens: graph.resolvedTokens,
    activeOverrides: graph.activeOverrides,
    performance: graph.performance,
    renderNodes: graph.renderNodes,
    stateSlots: listStateSlots(graph.sceneId),
    sessionState: getRuntimeSessionState(),
  };
}
