import type { ConstructionPlan } from '../blueprint-author/construction-plan-schema';

export const NAVIGATION_GRAPH_VIEW_VERSION = 'navigation-graph-view.v1';

export type NavigationGraphView = {
  viewVersion: typeof NAVIGATION_GRAPH_VIEW_VERSION;
  graphId: string;
  walkableSurfaces: string[];
  entryPoints: string[];
  exitPoints: string[];
  walkPaths: string[];
  interactionRadius: string;
  accessibilityRules: string[];
  movementGraph: Array<{ from: string; to: string; label: string }>;
};

export function buildNavigationGraphView(plan: ConstructionPlan): NavigationGraphView {
  const entries = plan.navigationGraph.entryAnchors;
  const paths = plan.navigationGraph.walkPaths;

  const movementGraph = paths.flatMap((path, i) => {
    const from = entries[i] ?? entries[0] ?? 'main-entrance';
    const to = paths[i + 1] ?? 'room-center';
    return [{ from, to, label: path }];
  });

  return {
    viewVersion: NAVIGATION_GRAPH_VIEW_VERSION,
    graphId: plan.navigationGraph.graphId,
    walkableSurfaces: plan.navigationGraph.walkPaths,
    entryPoints: entries,
    exitPoints: entries,
    walkPaths: paths,
    interactionRadius: '2.0m',
    accessibilityRules: plan.accessibilityRules,
    movementGraph: movementGraph.length > 0 ? movementGraph : [{ from: 'main-entrance', to: 'room-center', label: 'default-path' }],
  };
}
