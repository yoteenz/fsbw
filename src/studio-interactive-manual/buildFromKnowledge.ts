import type { KnowledgePageGuide } from '../utils/adminStudioKnowledgeHubDemo';
import { KNOWLEDGE_PAGE_GUIDES } from '../utils/adminStudioKnowledgeHubDemo';
import type { ManualModuleDefinitionV2, ManualNodeDef } from './schema';
import {
  CONTENT,
  HEADER,
  INFO,
  MODULE_MANUAL_ENRICHMENTS,
  NAV,
  type ModuleManualEnrichment,
} from './moduleEnrichments';
import { getWhatsNewForModule } from './whatsNew';

function baseNode(
  partial: Partial<ManualNodeDef> & Pick<ManualNodeDef, 'id' | 'kind' | 'title' | 'body' | 'benefit'>
): ManualNodeDef {
  return {
    animationType: 'glow',
    position: 'bottom',
    spotlight: false,
    ...partial,
  };
}

function buildDefinition(guide: KnowledgePageGuide, enrichment?: ModuleManualEnrichment): ManualModuleDefinitionV2 {
  const route = guide.route.split('?')[0];
  const nodes: ManualNodeDef[] = [];
  const linearNodeIds: string[] = [];
  const push = (node: ManualNodeDef) => {
    nodes.push(node);
    linearNodeIds.push(node.id);
  };

  const whatsNew = getWhatsNewForModule(guide.moduleId);
  const estMinutes = Math.max(3, Math.ceil((guide.tourSteps.length + 8) / 3));

  push(
    baseNode({
      id: 'overview',
      kind: 'section',
      sectionId: 'overview',
      title: `${guide.title} — OVERVIEW`,
      body: guide.purpose,
      benefit: 'Understand what this module does before you touch controls.',
      position: 'center',
      animationType: 'transition',
      knowledgeLevel: 'intro',
    })
  );

  push(
    baseNode({
      id: 'purpose',
      kind: 'section',
      sectionId: 'purpose',
      title: 'PURPOSE',
      body: guide.purpose,
      benefit: 'Know the job this module is designed to do.',
      knowledgeLevel: 'intro',
    })
  );

  push(
    baseNode({
      id: 'why-exists',
      kind: 'section',
      sectionId: 'why-exists',
      title: 'WHY IT EXISTS',
      body: guide.whyItExists,
      benefit: 'Connect the module to the larger StudioOS operating model.',
      knowledgeLevel: 'intro',
    })
  );

  if (enrichment?.architecture) {
    push(
      baseNode({
        id: 'architecture',
        kind: 'section',
        sectionId: 'architecture',
        title: 'ARCHITECTURE',
        body: enrichment.architecture,
        benefit: 'See how this module connects upstream and downstream.',
        knowledgeLevel: 'intermediate',
      })
    );
  }

  push(
    baseNode({
      id: 'workspace-tour-intro',
      kind: 'section',
      sectionId: 'workspace-tour',
      title: 'WORKSPACE TOUR',
      body: 'The next steps highlight the live interface — follow the spotlight on the actual controls.',
      benefit: 'Learn by using StudioOS, not reading static screenshots.',
      position: 'center',
      animationType: 'transition',
    })
  );

  push(
    baseNode({
      id: 'module-header',
      kind: 'widget',
      widgetId: 'module-header',
      title: 'MODULE HEADER',
      body: `This is ${guide.title}. The metric badge shows live demo status for this workspace.`,
      benefit: 'Always confirm you are in the right module.',
      targetSelector: HEADER,
      animationType: 'pulse',
      spotlight: true,
      route,
    })
  );

  push(
    baseNode({
      id: 'info-button',
      kind: 'widget',
      widgetId: 'info-button',
      title: 'INTERACTIVE MANUAL (ⓘ)',
      body: 'Tap ⓘ anytime to reopen this walkthrough or resume where you left off.',
      benefit: 'Help is always one tap away.',
      targetSelector: INFO,
      animationType: 'arrow',
      spotlight: true,
      route,
    })
  );

  push(
    baseNode({
      id: 'nav-tabs',
      kind: 'widget',
      widgetId: 'nav-tabs',
      title: 'DEPARTMENT NAVIGATION',
      body: 'Tabs group related modules — switch departments without leaving the Studio shell.',
      benefit: 'Navigate the mansion without losing context.',
      targetSelector: NAV,
      animationType: 'glow',
      spotlight: true,
      route,
    })
  );

  push(
    baseNode({
      id: 'workspace-content',
      kind: 'widget',
      widgetId: 'workspace-content',
      title: 'WORKSPACE CONTENT',
      body: 'Every control, card, and generator in this area is part of your daily operating workflow.',
      benefit: 'This is where production work happens.',
      targetSelector: CONTENT,
      animationType: 'spotlight',
      spotlight: true,
      route,
    })
  );

  for (const step of enrichment?.featureSteps ?? []) {
    push({ ...step, route: step.route ?? route });
  }

  guide.tourSteps.forEach((text, i) => {
    push(
      baseNode({
        id: `feature-tour-${i + 1}`,
        kind: 'widget',
        widgetId: `feature-${i + 1}`,
        title: `FEATURE · STEP ${i + 1}`,
        body: text,
        benefit: 'Practice this on the live workspace after the tour.',
        targetSelector: CONTENT,
        animationType: i % 2 === 0 ? 'pulse' : 'glow',
        spotlight: true,
        route,
        knowledgeLevel: i > 2 ? 'advanced' : 'intermediate',
      })
    );
  });

  const workflowNodes = enrichment?.workflowNodes ?? guide.exampleWorkflows;
  if (workflowNodes.length > 0) {
    push(
      baseNode({
        id: 'workflows',
        kind: 'workflow',
        sectionId: 'workflows',
        title: 'COMMON WORKFLOWS',
        body: 'Follow the pipeline left to right — each step hands off to the next system.',
        benefit: 'Visualize end-to-end production without reading paragraphs.',
        workflowNodes,
        position: 'center',
        animationType: 'transition',
        knowledgeLevel: 'intermediate',
      })
    );
  }

  push(
    baseNode({
      id: 'best-practices',
      kind: 'section',
      sectionId: 'best-practices',
      title: 'BEST PRACTICES',
      body: guide.bestPractices.join(' · '),
      benefit: 'Avoid rework by following operator-tested habits.',
      knowledgeLevel: 'intermediate',
    })
  );

  push(
    baseNode({
      id: 'advanced-tips',
      kind: 'section',
      sectionId: 'advanced-tips',
      title: 'ADVANCED TIPS',
      body: guide.whenToUse.join(' · '),
      benefit: 'Use the module at the right moment in production.',
      knowledgeLevel: 'advanced',
    })
  );

  if (guide.relatedPages.length > 0) {
    push(
      baseNode({
        id: 'related-modules',
        kind: 'section',
        sectionId: 'related',
        title: 'RELATED MODULES',
        body: guide.relatedPages.map((p) => p.label).join(' · '),
        benefit: 'Jump to connected systems when this module hands off.',
        relatedModuleIds: enrichment?.relatedModuleIds,
      })
    );
  }

  push(
    baseNode({
      id: 'troubleshooting',
      kind: 'section',
      sectionId: 'troubleshooting',
      title: 'TROUBLESHOOTING',
      body: guide.commonMistakes.join(' · '),
      benefit: 'Fix the mistakes operators hit most often.',
      knowledgeLevel: 'advanced',
    })
  );

  if (whatsNew) {
    push(
      baseNode({
        id: 'whats-new',
        kind: 'section',
        sectionId: 'whats-new',
        title: `WHAT'S NEW · ${whatsNew.version}`,
        body: `${whatsNew.title}: ${whatsNew.summary}`,
        benefit: 'Stay current when StudioOS ships updates.',
        versionIntroduced: whatsNew.version,
        actionLabel: 'TRY IT',
        actionType: 'try-feature',
      })
    );
  }

  push(
    baseNode({
      id: 'written-documentation',
      kind: 'action',
      title: 'VIEW WRITTEN DOCUMENTATION',
      body: `Open the Owner's Manual chapter for ${guide.title} — ${guide.ownersManualChapter}.`,
      benefit: 'Deep reading when you need the full 300–500 page operating manual.',
      actionLabel: 'OPEN WRITTEN DOC',
      actionType: 'open-written-doc',
      writtenDocChapter: guide.ownersManualChapter,
      position: 'center',
      animationType: 'none',
    })
  );

  push(
    baseNode({
      id: 'finish',
      kind: 'action',
      title: 'MODULE COMPLETE',
      body: `You finished the ${guide.title} interactive walkthrough. Resume anytime via ⓘ or Learn This Workspace.`,
      benefit: 'Progress is saved — pick up where you left off.',
      position: 'center',
      animationType: 'transition',
    })
  );

  return {
    id: guide.moduleId,
    moduleName: guide.title,
    customerName: guide.title,
    description: guide.purpose,
    route,
    estimatedMinutes: estMinutes,
    linearNodeIds,
    nodes,
    ownersManualChapter: guide.ownersManualChapter,
    relatedModuleIds: enrichment?.relatedModuleIds,
    versionIntroduced: enrichment?.versionIntroduced,
    versionUpdated: enrichment?.versionUpdated,
  };
}

export function buildAllManualDefinitions(): ManualModuleDefinitionV2[] {
  return KNOWLEDGE_PAGE_GUIDES.map((guide) =>
    buildDefinition(guide, MODULE_MANUAL_ENRICHMENTS[guide.moduleId])
  );
}

export function getManualDefinitionForModule(moduleId: string): ManualModuleDefinitionV2 | undefined {
  const guide = KNOWLEDGE_PAGE_GUIDES.find((g) => g.moduleId === moduleId);
  if (!guide) return undefined;
  return buildDefinition(guide, MODULE_MANUAL_ENRICHMENTS[moduleId]);
}

export function resolveManualModuleIdForPath(pathname: string): string | undefined {
  const normalized = pathname.split('?')[0];
  const exact = KNOWLEDGE_PAGE_GUIDES.find((g) => g.route.split('?')[0] === normalized);
  if (exact) return exact.moduleId;
  const prefix = KNOWLEDGE_PAGE_GUIDES.filter(
    (g) => normalized === g.route.split('?')[0] || normalized.startsWith(`${g.route.split('?')[0]}/`)
  ).sort((a, b) => b.route.length - a.route.length);
  return prefix[0]?.moduleId;
}
