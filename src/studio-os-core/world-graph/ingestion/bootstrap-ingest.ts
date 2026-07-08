import { eraForEngineSlug } from '../era-evaluation';
import { worldEdgeId, worldNodeId } from '../id';
import { lifecyclePlane } from '../lifecycle';
import type { WorldEdge, WorldNode } from '../types';

function now(): string {
  return new Date().toISOString();
}

const SCENE_ASSEMBLY_LAW_SLUG = 'scene-assembly-immutability-law';

/** Core engines and pipelines as civilization infrastructure nodes */
export function ingestEngineNodes(): { nodes: WorldNode[]; edges: WorldEdge[] } {
  const nodes: WorldNode[] = [];
  const edges: WorldEdge[] = [];
  const ts = now();

  const engines: Array<{
    slug: string;
    name: string;
    summary: string;
    lifecycle: 'live' | 'implemented' | 'prototype' | 'architecture';
    codePaths: string[];
    docPaths?: string[];
    integratesWith?: string[];
    governedBy?: string[];
  }> = [
    {
      slug: 'world-graph',
      name: 'World Graph™',
      summary:
        'Canonical civilization graph — single source of truth. Knowledge Graph is first subsystem.',
      lifecycle: 'implemented',
      codePaths: ['src/studio-os-core/world-graph/'],
      docPaths: ['docs/studio-os/world-graph/STUDIO_WORLD_GRAPH_ARCHITECTURE.md'],
      governedBy: ['world-graph-is-truth'],
    },
    {
      slug: 'scene-stack',
      name: 'Scene Stack™',
      summary: 'Non-destructive layered environment assembly. Scene Graph™ is technical model.',
      lifecycle: 'live',
      codePaths: ['src/studio-os-core/scene-stack/'],
      docPaths: ['docs/studio-os/scene-stack/scene-stack.md'],
      integratesWith: ['world-graph', 'creative-direction-studio', 'studio-archives'],
      governedBy: [SCENE_ASSEMBLY_LAW_SLUG],
    },
    {
      slug: 'studio-world-atlas',
      name: 'Studio World Atlas™',
      summary: 'Spatial projection of the World Graph™ — locations, pathways, fog of discovery.',
      lifecycle: 'live',
      codePaths: ['src/studio-os-core/studio-world-atlas/'],
      integratesWith: ['world-graph', 'studio-command-center'],
    },
    {
      slug: 'architecture-auditor',
      name: 'Architecture Auditor™',
      summary: 'Enforces physical-place law; validates code ↔ canon alignment.',
      lifecycle: 'live',
      codePaths: ['src/studio-os-core/architecture-auditor/'],
      integratesWith: ['world-graph', 'scene-stack'],
    },
    {
      slug: 'experience-intelligence-engine',
      name: 'Experience Intelligence Engine™',
      summary: 'Creative Director quality bar for immersive experiences.',
      lifecycle: 'live',
      codePaths: ['src/studio-os-core/experience-intelligence-engine/'],
      integratesWith: ['architecture-auditor', 'world-graph'],
    },
    {
      slug: 'profession-brain',
      name: 'Profession Brain™',
      summary: 'Institutional domain expertise — organizational intelligence substrate.',
      lifecycle: 'live',
      codePaths: ['src/studio-os-core/profession-brain/'],
      integratesWith: ['company-genome', 'knowledge-library'],
    },
    {
      slug: 'profession-simulation-engine',
      name: 'Profession Simulation Engine™',
      summary:
        'ARTICLE-E01 runtime layer for practicing professional decisions, roles, clients, teams, and consequences inside simulated work.',
      lifecycle: 'architecture',
      codePaths: ['src/studio-os-core/career-worlds/'],
      docPaths: ['docs/studio-os/career-worlds/ARTICLE_E02_CAREER_WORLDS.md'],
      integratesWith: ['career-worlds', 'profession-brain', 'world-graph'],
    },
    {
      slug: 'career-worlds',
      name: 'Career Worlds™',
      summary:
        'ARTICLE-E02 persistent professional-life worlds that replace Academies with living professions, identity, economies, events, companies, mentors, clients, and endgame mastery.',
      lifecycle: 'architecture',
      codePaths: ['src/studio-os-core/career-worlds/'],
      docPaths: ['docs/studio-os/career-worlds/ARTICLE_E02_CAREER_WORLDS.md'],
      integratesWith: ['profession-simulation-engine', 'profession-brain', 'world-graph', 'studio-world-atlas'],
    },
    {
      slug: 'company-genome',
      name: 'Company Genome™',
      summary: 'Living company identity — traits, voice, visual DNA.',
      lifecycle: 'live',
      codePaths: ['src/studio-os-core/project-genome/', 'src/studio-os-core/studio-builder/genome-context.ts'],
      integratesWith: ['scene-stack', 'creative-direction-studio'],
    },
    {
      slug: 'knowledge-registry',
      name: 'Knowledge Registry™',
      summary: 'Registry projection UI over Master Spec and knowledge objects.',
      lifecycle: 'live',
      codePaths: ['src/studio-os-core/knowledge-registry/'],
      integratesWith: ['world-graph'],
    },
    {
      slug: 'asset-registry',
      name: 'Asset Registry™',
      summary:
        'Permanent home for every organizational asset — metadata, versioning, usage, relationships, and discovery.',
      lifecycle: 'live',
      codePaths: ['src/studio-os-core/asset-registry/'],
      docPaths: ['docs/studio-os/asset-registry.md'],
      integratesWith: ['world-graph', 'studio-world-atlas'],
    },
    {
      slug: 'studio-foundry',
      name: 'Studio Foundry™',
      summary:
        'ARTICLE-A02 universal manufacturing system that resolves assets by ID, calls recipes when missing/regenerated, registers versions, and returns registry-ready assets.',
      lifecycle: 'implemented',
      codePaths: ['src/studio-os-core/studio-foundry/'],
      docPaths: ['docs/studio-os/engine/asset-compiler/ARTICLE_A02_STUDIO_FOUNDRY.md'],
      integratesWith: ['asset-registry', 'asset-compiler', 'world-graph', 'studio-world-atlas'],
    },
    {
      slug: 'asset-compiler',
      name: 'Asset Compiler™',
      summary:
        'ARTICLE-A01 internal compilation layer used by Studio Foundry™ to turn Generation Recipes™ into FAL requests, metadata, versions, and Asset Registry entries.',
      lifecycle: 'implemented',
      codePaths: ['src/studio-os-core/asset-compiler/'],
      docPaths: ['docs/studio-os/engine/asset-compiler/ARTICLE_A01_ASSET_COMPILER.md'],
      integratesWith: ['studio-foundry', 'asset-registry', 'scene-stack', 'studio-world-atlas'],
    },
    {
      slug: 'production-orchestrator',
      name: 'Studio Production Orchestrator™',
      summary:
        'AI production handoff board — Founder Intent™ through architecture, Composer implementation, assets, motion, review, and Knowledge Core updates.',
      lifecycle: 'live',
      codePaths: ['src/studio-os-core/production-orchestrator/'],
      docPaths: ['docs/studio-os/engine/production-orchestrator/README.md'],
      integratesWith: ['model-orchestrator', 'workflow-engine', 'knowledge-registry', 'decision-audit'],
    },
    {
      slug: 'production-completion-system',
      name: 'Production Completion System™',
      summary:
        'ARTICLE-K24 Definition of Done™ — adaptive Production Completion Checklist™ and Quality Gates™ enforced on every Production Package™.',
      lifecycle: 'implemented',
      codePaths: ['src/studio-os-core/production-completion-system/'],
      docPaths: ['docs/studio-os/engine/production-completion/ARTICLE_K24_PRODUCTION_COMPLETION_SYSTEM.md'],
      integratesWith: ['production-orchestrator', 'experience-intelligence-engine', 'world-graph', 'knowledge-core'],
    },
    {
      slug: 'knowledge-retention-engine',
      name: 'Knowledge Retention Engine™',
      summary:
        'ARTICLE-E03 long-term mastery engine — preserves professional memories through retention profiles, adaptive refreshers, Orb mentorship, and living industry updates.',
      lifecycle: 'implemented',
      codePaths: ['src/studio-os-core/knowledge-retention-engine/'],
      docPaths: ['docs/studio-os/engine/knowledge-retention/ARTICLE_E03_KNOWLEDGE_RETENTION_ENGINE.md'],
      integratesWith: [
        'profession-brain',
        'studio-institute',
        'knowledge-confidence',
        'simulation-engine',
        'studio-world-atlas',
        'orb-recommendations',
      ],
    },
    {
      slug: 'orb-archivist',
      name: 'Orb Archivist™',
      summary: 'Relationship-first explorer of the World Graph™ — institutional memory interface.',
      lifecycle: 'architecture',
      codePaths: ['src/studio-os-core/world-graph/query.ts'],
      integratesWith: ['world-graph', 'knowledge-library', 'studio-world-atlas'],
    },
  ];

  for (const eng of engines) {
    const lifecycle =
      eng.lifecycle === 'architecture'
        ? ('architecture' as const)
        : eng.lifecycle === 'live'
          ? ('live' as const)
          : ('implemented' as const);

    const id = worldNodeId('engine', eng.slug);
    nodes.push({
      id,
      slug: eng.slug,
      displayName: eng.name,
      nodeType: 'engine',
      lifecycle,
      plane: lifecyclePlane(lifecycle),
      version: '1.0.0',
      summary: eng.summary,
      implementationStatus:
        eng.lifecycle === 'live' ? 'live' : eng.lifecycle === 'prototype' ? 'prototype' : 'live',
      codePaths: eng.codePaths,
      docPaths: eng.docPaths,
      provenance: { source: 'bootstrap', sourceRef: eng.slug, ingestedAt: ts },
      tags: ['engine', 'studio-world'],
      metadata: { studioWorldEra: eraForEngineSlug(eng.slug) },
    });

    const eraId = worldNodeId('era', eraForEngineSlug(eng.slug));
    edges.push({
      id: worldEdgeId('references', id, eraId),
      type: 'references',
      from: id,
      to: eraId,
      label: 'primary-era',
      provenance: { source: 'bootstrap', sourceRef: eng.slug, ingestedAt: ts },
    });

    for (const target of eng.integratesWith ?? []) {
      const targetId = target.includes('-genome')
        ? worldNodeId('company-genome', target)
        : target === 'knowledge-library'
          ? worldNodeId('publication', 'knowledge-library')
          : target === 'creative-direction-studio'
            ? worldNodeId('flagship', 'creative-direction-studio')
            : target === 'studio-archives'
              ? worldNodeId('flagship', 'studio-archives')
              : target === 'studio-command-center'
                ? worldNodeId('flagship', 'studio-command-center')
                : worldNodeId('engine', target);

      edges.push({
        id: worldEdgeId('integrates-with', id, targetId),
        type: 'integrates-with',
        from: id,
        to: targetId,
        provenance: { source: 'bootstrap', sourceRef: eng.slug, ingestedAt: ts },
      });
    }

    for (const lawSlug of eng.governedBy ?? []) {
      const lawId = worldNodeId('constitutional-law', lawSlug);
      edges.push({
        id: worldEdgeId('governed-by', id, lawId),
        type: 'governed-by',
        from: id,
        to: lawId,
        provenance: { source: 'bootstrap', sourceRef: eng.slug, ingestedAt: ts },
      });
    }
  }

  // World Graph integrates with all flagships (civilization nervous system)
  const worldGraphId = worldNodeId('engine', 'world-graph');
  for (const slug of [
    'studio-command-center',
    'creative-direction-studio',
    'studio-warehouse',
    'studio-archives',
    'marketplace',
    'headquarters',
    'expedition-hub',
  ]) {
    const flagshipId = worldNodeId('flagship', slug);
    edges.push({
      id: worldEdgeId('integrates-with', worldGraphId, flagshipId),
      type: 'integrates-with',
      from: worldGraphId,
      to: flagshipId,
      label: 'civilization substrate',
      provenance: { source: 'bootstrap', ingestedAt: ts },
    });
  }

  return { nodes, edges };
}

export function ingestGenomeNodes(): { nodes: WorldNode[]; edges: WorldEdge[] } {
  const nodes: WorldNode[] = [];
  const edges: WorldEdge[] = [];
  const ts = now();

  const genomes = [
    { type: 'company-genome' as const, slug: 'company-genome', name: 'Company Genome™' },
    { type: 'founder-genome' as const, slug: 'founder-genome', name: 'Founder Genome™' },
    { type: 'industry-genome' as const, slug: 'industry-genome', name: 'Industry Genome™' },
  ];

  for (const g of genomes) {
    const id = worldNodeId(g.type, g.slug);
    nodes.push({
      id,
      slug: g.slug,
      displayName: g.name,
      nodeType: g.type,
      lifecycle: g.type === 'industry-genome' ? 'architecture' : 'live',
      plane: lifecyclePlane(g.type === 'industry-genome' ? 'architecture' : 'live'),
      version: '1.0.0',
      summary: `${g.name} — civilization identity substrate`,
      provenance: { source: 'bootstrap', sourceRef: g.slug, ingestedAt: ts },
      tags: ['genome'],
    });

    edges.push({
      id: worldEdgeId('integrates-with', worldNodeId('engine', 'world-graph'), id),
      type: 'integrates-with',
      from: worldNodeId('engine', 'world-graph'),
      to: id,
      provenance: { source: 'bootstrap', sourceRef: g.slug, ingestedAt: ts },
    });
  }

  return { nodes, edges };
}

/** Publications are projections — not canonical truth */
export function ingestPublicationNodes(): { nodes: WorldNode[]; edges: WorldEdge[] } {
  const nodes: WorldNode[] = [];
  const edges: WorldEdge[] = [];
  const ts = now();

  const publications = [
    {
      slug: 'studio-world-bible',
      name: 'Studio World Bible™',
      summary: 'Curated publication generated from World Graph™ — never canonical source.',
    },
    {
      slug: 'knowledge-library',
      name: 'Knowledge Library™',
      summary: 'Immersive Archives projection for exploring graph relationships.',
    },
  ];

  for (const pub of publications) {
    const id = worldNodeId('publication', pub.slug);
    nodes.push({
      id,
      slug: pub.slug,
      displayName: pub.name,
      nodeType: 'publication',
      lifecycle: pub.slug === 'studio-world-bible' ? 'architecture' : 'implemented',
      plane: lifecyclePlane('architecture'),
      version: '0.1.0',
      summary: pub.summary,
      provenance: { source: 'bootstrap', sourceRef: pub.slug, ingestedAt: ts },
      tags: ['publication', 'projection'],
    });

    edges.push({
      id: worldEdgeId('generated-from', id, worldNodeId('engine', 'world-graph')),
      type: 'generated-from',
      from: id,
      to: worldNodeId('engine', 'world-graph'),
      label: 'projection of',
      provenance: { source: 'bootstrap', sourceRef: pub.slug, ingestedAt: ts },
    });

    if (pub.slug === 'knowledge-library') {
      edges.push({
        id: worldEdgeId('located-in', id, worldNodeId('flagship', 'studio-archives')),
        type: 'located-in',
        from: id,
        to: worldNodeId('flagship', 'studio-archives'),
        provenance: { source: 'bootstrap', sourceRef: pub.slug, ingestedAt: ts },
      });
    }
  }

  return { nodes, edges };
}
