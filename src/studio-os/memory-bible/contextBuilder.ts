import { MEMORY_BIBLE_V1_0 } from './seedV1.js';
import type {
  ContextBuilderInput,
  ContextBuilderScopeId,
  ContextPackage,
  ContextPackageSource,
  MemoryBibleSnapshot,
} from './types.js';

const SCOPE_SUMMARIES: Record<ContextBuilderScopeId, { title: string; summary: string; docs: string[] }> = {
  'asset-factory': {
    title: 'Asset Factory',
    summary:
      'Manufacturing pipeline: FAL Master Hero → approval → background removal → smart assets → Supabase registry.',
    docs: [
      'docs/frontal-slayer/asset-factory/README.md',
      'src/components/admin/studio/brand-assets-asset-factory/',
      'api/_lib/productAssetFactory/pipeline.ts',
    ],
  },
  'photography-bible': {
    title: 'Photography Bible',
    summary: 'Locked camera, composition, lighting, bust, exports, and media kit standards.',
    docs: [
      'docs/frontal-slayer/product-photography-bible/README.md',
      'src/studio-os/product-photography/',
    ],
  },
  'creative-dna': {
    title: 'Creative DNA',
    summary: 'Approved prompt, display bust, editorial reference — governs Fal master hero generation.',
    docs: [
      'docs/frontal-slayer/photography-creative-dna/README.md',
      'api/_lib/productPhotographyGeneration/',
    ],
  },
  'tutorial-os': {
    title: 'Onboarding Tutorial',
    summary: 'Customer Mansion Tour — separate from admin Interactive Manual.',
    docs: ['docs/frontal-slayer/tutorial-os/README.md', 'src/tutorial-os/'],
  },
  'knowledge-graph': {
    title: 'Knowledge Graph',
    summary: 'Cross-module nodes, workflows, and Interactive Manual walkthrough links.',
    docs: ['docs/studio-os/interactive-manual.md', 'src/studio-interactive-manual/'],
  },
  'memory-bible': {
    title: 'Memory Bible',
    summary: 'Curated institutional knowledge — naming, decisions, philosophies, founder context.',
    docs: ['docs/studio-os/memory-bible.md', 'src/studio-os/memory-bible/'],
  },
  'mission-control': {
    title: 'Mission Control',
    summary: 'Executive HQ — missions, departments, approvals, live activity.',
    docs: ['src/components/admin/studio/mission-control/'],
  },
  'production-builder': {
    title: 'Production Builder',
    summary: 'Visual production assembly — scenes, prompts, outputs, Director Mode handoff.',
    docs: ['src/utils/adminStudioProductionBuilderDemo.ts'],
  },
  'campaign-orchestrator': {
    title: 'Campaign Orchestrator',
    summary: 'One business objective → launch plan with tasks, timeline, and approval gates.',
    docs: ['src/components/admin/studio/campaign-orchestrator/'],
  },
  'build-a-wig': {
    title: 'Build-A-Wig',
    summary: 'Customizer, live NOIR previews, visual snapshot naming, premium gates.',
    docs: ['docs/frontal-slayer/build-a-wig-visual-snapshot/README.md', 'src/pages/build-a-wig/'],
  },
  'email-design': {
    title: 'Email Design',
    summary: 'Luxury component library, Signature Collection modules, Resend transactional system.',
    docs: ['docs/EMAIL_SYSTEM.md', 'api/_lib/email/'],
  },
};

function bulletList(items: string[]): string {
  return items.map((i) => `- ${i}`).join('\n');
}

function collectSources(input: ContextBuilderInput, snapshot: MemoryBibleSnapshot): ContextPackageSource[] {
  const sources: ContextPackageSource[] = [];
  if (input.includeMemoryBible) {
    sources.push({ id: 'src-memory-bible', label: 'Memory Bible v1.0', kind: 'memory-bible' });
  }
  if (input.includeWritingRules) {
    sources.push({ id: 'writing-rules', label: 'Writing Rules', kind: 'writing-bible', detail: snapshot.writingRules.title });
  }
  if (input.includeKnowledgeGraph) {
    sources.push({ id: 'kg', label: 'Knowledge Graph', kind: 'knowledge-graph' });
  }
  if (input.includeDecisions) {
    sources.push({ id: 'decisions', label: 'Decision Log', kind: 'decision-log' });
  }
  if (input.includeArchitecture) {
    sources.push({
      id: 'eng-phil',
      label: 'Engineering Philosophy',
      kind: 'memory-bible',
      detail: snapshot.engineeringPhilosophy.title,
    });
  }
  if (input.includeWorkspaceStandards) {
    sources.push({
      id: 'ws-memory',
      label: `Workspace Memory · ${input.workspaceId}`,
      kind: 'workspace-config',
    });
  }
  if (input.includePromptStandards) {
    sources.push({
      id: 'cursor-std',
      label: 'Cursor Prompt Standards',
      kind: 'memory-bible',
    });
  }
  if (input.includeBrandRules) {
    sources.push({ id: 'brand', label: 'Brand Philosophy + Naming Bible', kind: 'brand-rules' });
  }
  for (const scope of input.scopes) {
    const s = SCOPE_SUMMARIES[scope];
    sources.push({ id: `scope-${scope}`, label: s.title, kind: 'docs', detail: s.summary });
  }
  sources.push({ id: 'motherboard', label: 'motherboard/CORE.md + MEMORY.md', kind: 'docs' });
  return sources;
}

export function buildContextPackage(input: ContextBuilderInput, snapshot: MemoryBibleSnapshot = MEMORY_BIBLE_V1_0): ContextPackage {
  const ws =
    snapshot.workspaceMemory.find((w) => w.workspaceId === input.workspaceId) ??
    snapshot.workspaceMemory.find((w) => w.workspaceId === 'global')!;
  const scopedDecisions = snapshot.decisionLog.filter(
    (d) => d.workspace === 'global' || d.workspace === input.workspaceId
  );
  const namingCore = snapshot.namingBible.filter((n) =>
    ['name-studio-os', 'name-frontal-slayer', 'name-creative-dna', 'name-asset-factory'].includes(n.id)
  );

  const sections: string[] = [];
  sections.push(`# Context Package · ${input.target.toUpperCase()} · ${input.taskType}`);
  sections.push(`Workspace: ${ws.workspaceLabel}`);
  sections.push('');

  if (input.includeMemoryBible) {
    sections.push('## Memory Bible (institutional knowledge)');
    sections.push(`Version: ${snapshot.version}`);
    sections.push(`Founder priorities: ${snapshot.founderProfile.currentPriorityProjects.join('; ')}`);
    sections.push('');
  }

  if (input.includeBrandRules) {
    sections.push('## Official naming');
    for (const n of namingCore) {
      sections.push(`- **${n.officialName}**${n.deprecatedNames.length ? ` (not: ${n.deprecatedNames.join(', ')})` : ''}`);
    }
    sections.push('');
    sections.push('## Design philosophy');
    sections.push(bulletList(snapshot.designPhilosophy.rules.slice(0, 8)));
    sections.push('');
  }

  if (input.includeWritingRules) {
    sections.push('## Writing & communication');
    sections.push(bulletList([...snapshot.communicationStyle.rules.slice(0, 8), ...snapshot.writingRules.rules.slice(0, 4)]));
    sections.push('');
  }

  if (input.includePromptStandards && input.target === 'cursor') {
    sections.push('## Cursor prompt standards');
    sections.push(bulletList(snapshot.cursorPromptStandards.rules));
    sections.push('');
  }

  if (input.includeArchitecture) {
    sections.push('## Engineering philosophy');
    sections.push(bulletList(snapshot.engineeringPhilosophy.rules));
    sections.push('');
  }

  if (input.includeWorkspaceStandards) {
    sections.push(`## Workspace memory · ${ws.workspaceLabel}`);
    sections.push(ws.summary);
    sections.push(bulletList(ws.pillars));
    sections.push('');
  }

  if (input.includeFeatureSummary && input.scopes.length) {
    sections.push('## Scoped modules');
    for (const scope of input.scopes) {
      const s = SCOPE_SUMMARIES[scope];
      sections.push(`### ${s.title}`);
      sections.push(s.summary);
    }
    sections.push('');
  }

  if (input.includeDecisions) {
    sections.push('## Related decisions');
    for (const d of scopedDecisions.slice(0, 5)) {
      sections.push(`- **${d.title}** (${d.date}): ${d.decision}`);
    }
    sections.push('');
  }

  if (input.includeKnowledgeGraph) {
    sections.push('## Knowledge Graph');
    sections.push('Use Interactive Manual ⓘ panels & Knowledge Hub for live walkthroughs on scoped modules.');
    sections.push('');
  }

  if (input.includeConstraints) {
    sections.push('## Do not break');
    sections.push(bulletList(snapshot.aiPreferences.doNotRules));
    sections.push('');
  }

  const fullStructuredContext = sections.join('\n');

  const cursorPromptParts: string[] = [
    `Task: ${input.taskType.replace(/-/g, ' ')}`,
    `Workspace: ${ws.workspaceLabel}`,
    `Target: ${input.target}`,
    '',
    'Intent:',
    input.scopes.length
      ? `Implement or extend: ${input.scopes.map((s) => SCOPE_SUMMARIES[s].title).join(', ')}.`
      : 'Follow Memory Bible standards for this milestone.',
    '',
    'Constraints:',
    ...snapshot.aiPreferences.doNotRules.map((r) => `- ${r}`),
    '',
    'Expected outcome:',
    input.target === 'cursor'
      ? 'Focused diff on master, one deploy, motherboard MEMORY appended before commit.'
      : 'Output matches official naming, workspace voice, and scoped module standards.',
    '',
    'Reference context:',
    fullStructuredContext,
  ];

  const copyPastePrompt = cursorPromptParts.join('\n');

  const relevantFiles = input.scopes.flatMap((s) => SCOPE_SUMMARIES[s].docs);
  relevantFiles.push('motherboard/CORE.md', 'motherboard/MEMORY.md', 'motherboard/CODEBASE.md');

  const sources = collectSources(input, snapshot);

  const shortSummary = `${input.target} · ${input.taskType} · ${ws.workspaceLabel} · scopes: ${
    input.scopes.length ? input.scopes.join(', ') : 'general'
  }`;

  const packageId = `ctx-${Date.now()}`;

  return {
    id: packageId,
    createdAt: new Date().toISOString(),
    input,
    shortSummary,
    fullStructuredContext,
    copyPastePrompt,
    relevantFilesDocs: [...new Set(relevantFiles)],
    relatedDecisions: scopedDecisions.map((d) => d.title),
    relatedWorkflows: input.scopes.map((s) => SCOPE_SUMMARIES[s].title),
    doNotBreakRules: snapshot.aiPreferences.doNotRules,
    expectedOutput:
      input.target === 'cursor'
        ? 'Implementation complete with build passing, no route breaks, one commit on master.'
        : 'Deliverable aligned with Memory Bible naming, voice, and scoped module standards.',
    compressedVersion: `${shortSummary}\n\nKey rules: ${snapshot.aiPreferences.doNotRules.slice(0, 3).join(' · ')}`,
    sources,
  };
}
