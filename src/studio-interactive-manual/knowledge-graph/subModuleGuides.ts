import { type KnowledgePageGuide } from '../../utils/adminStudioKnowledgeHubDemo';
import { SUB_MODULE_GRAPH_NODES } from './seedGraph';

/** Sub-module page guides from immutable seed graph — no registry dependency. */
export function getSubModulePageGuides(): Partial<KnowledgePageGuide>[] {
  return SUB_MODULE_GRAPH_NODES.map((n) => ({
    moduleId: n.moduleId!,
    title: n.name,
    route: n.route!,
    purpose: n.description,
    whyItExists: n.purpose ?? n.description,
    whenToUse: [`When working in ${n.name}`],
    bestPractices: ['Follow Creative DNA before generating', 'Verify Smart Asset Registry after factory runs'],
    commonMistakes: ['Skipping approval gates', 'Ignoring FALLBACK_USED warnings'],
    relatedPages: [],
    exampleWorkflows: [],
    relatedAssets: [],
    ownersManualChapter: n.relatedManualChapter ?? `CHAPTER · ${n.name}`,
    tourSteps: [
      'Review module purpose and status',
      'Walk through each tab on the live workspace',
      'Confirm connected modules in the Knowledge Graph',
    ],
  }));
}
