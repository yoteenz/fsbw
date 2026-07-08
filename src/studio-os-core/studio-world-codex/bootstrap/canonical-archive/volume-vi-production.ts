import type { CanonicalArticleSeed } from '../article-builder';

export const VOLUME_VI_PRODUCTION_ARTICLES: CanonicalArticleSeed[] = [
  {
    articleId: 'ARTICLE-K24',
    title: 'Production Completion System™',
    volume: 'volume-vi-production-standards',
    category: 'Completion Governance',
    summary:
      'Production Completion defines when work is truly done — architecture checkpoint, Codex verification, QA, and post-launch Codex update.',
    philosophy: 'Shipping without updating institutional memory is incomplete work.',
    relatedSystems: ['Production Orchestrator™', 'Codex™', 'QA Headquarters™'],
    relatedArticles: ['ARTICLE-C01', 'ARTICLE-P03', 'ARTICLE-P05'],
    tags: ['production', 'completion', 'governance'],
    docPaths: ['docs/studio-os/engine/production-completion/ARTICLE_K24_PRODUCTION_COMPLETION_SYSTEM.md'],
  },
  {
    articleId: 'ARTICLE-P01',
    title: 'Architecture → GPT · Implementation → Composer™',
    volume: 'volume-vi-production-standards',
    category: 'Agent Workflow',
    summary:
      'Architecture sprints use high-reasoning models for constitutional and platform decisions. Implementation sprints use Composer for focused code delivery.',
    philosophy: 'Separate thinking from building — Codex captures thinking before code exists.',
    guidingPrinciples: [
      'Architecture prompts produce Codex Articles and ADRs.',
      'Implementation prompts reference approved Codex truth.',
      'One deploy per completed task on master.',
    ],
    relatedArticles: ['ARTICLE-C01', 'ARTICLE-P04'],
    tags: ['production', 'agents', 'workflow', 'gpt', 'composer'],
  },
  {
    articleId: 'ARTICLE-P02',
    title: 'Foundry Asset Generation Pipeline™',
    volume: 'volume-vi-production-standards',
    category: 'Asset Production',
    summary:
      'Visual assets flow: intent → Generation Recipe → Asset Compiler → Foundry register → Hero Object / scene consumption.',
    philosophy: 'No loose files. Every visual object has registry identity and lineage.',
    relatedSystems: ['Studio Foundry™', 'Asset Compiler™', 'Render Queue™'],
    relatedArticles: ['ARTICLE-A01', 'ARTICLE-A02', 'ARTICLE-D09'],
    tags: ['production', 'foundry', 'assets'],
    docPaths: ['docs/studio-os/engine/asset-compiler/STUDIO_FOUNDRY_IMPLEMENTATION.md'],
  },
  {
    articleId: 'ARTICLE-P03',
    title: 'Production Board & Definition of Done™',
    volume: 'volume-vi-production-standards',
    category: 'Quality Gates',
    summary:
      'Production Board tracks vertical slices through golden build standards. Definition of Done includes build pass, graph compile, and Codex update.',
    philosophy: 'Done means canon-ready — not merely merged.',
    relatedSystems: ['Production Studio™', 'Production Orchestrator™', 'Golden Build Pipeline™'],
    relatedArticles: ['ARTICLE-K24', 'ARTICLE-P04'],
    tags: ['production', 'definition-of-done', 'production-board'],
    docPaths: ['docs/studio-os/scene-stack/golden-build-pipeline.md'],
  },
  {
    articleId: 'ARTICLE-P04',
    title: 'QA & Architectural Review™',
    volume: 'volume-vi-production-standards',
    category: 'Quality Gates',
    summary:
      'QA Simulation Engine™, Regression Engine™, and Architecture Auditor validate releases against canon — not just functional tests.',
    philosophy: 'Quality includes architectural fidelity — rooms must still feel like the world.',
    relatedSystems: ['QA Simulation Engine™', 'Architecture Auditor™', 'Regression Engine™'],
    relatedArticles: ['ARTICLE-P03', 'ARTICLE-K21'],
    tags: ['production', 'qa', 'architectural-review'],
    docPaths: ['docs/studio-os/qa-simulation-engine.md'],
  },
  {
    articleId: 'ARTICLE-P05',
    title: 'Knowledge & Codex Updates Post-Launch™',
    volume: 'volume-vi-production-standards',
    category: 'Memory Maintenance',
    summary:
      'Post-Launch Review updates Codex Articles, Knowledge Core entries, ADRs, and World Graph — closing the Codex Update™ loop.',
    philosophy: 'Production teaches the civilization. Launch is not the end of documentation — it is a Codex revision event.',
    relatedSystems: ['Codex™', 'Knowledge Core™', 'Memory System™'],
    relatedArticles: ['ARTICLE-C01', 'ARTICLE-K22', 'ARTICLE-K23'],
    tags: ['production', 'codex-update', 'post-launch'],
  },
];
