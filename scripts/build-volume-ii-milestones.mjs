#!/usr/bin/env node
/**
 * One-shot helper: migrates Volume II milestones from volume-ii-iv.yaml
 * into milestones/volume-ii.yaml with chapterId, relatedSystems, implementationNotes.
 * Preserves canonical IDs, dependsOn, enables, implementationStatus, moduleId.
 */
import fs from 'fs';
import path from 'path';
import { load, dump } from 'js-yaml';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
const SRC = path.join(ROOT, 'docs/studio-os/master-spec/milestones/volume-ii-iv.yaml');
const OUT = path.join(ROOT, 'docs/studio-os/master-spec/milestones/volume-ii.yaml');

const CHAPTER_BY_ID = {
  M90: 'chapter-ii-1',
  'M90.5': 'chapter-ii-1',
  M91: 'chapter-ii-1',
  M95: 'chapter-ii-1',
  M92: 'chapter-ii-2',
  'M92.5': 'chapter-ii-2',
  M93: 'chapter-ii-2',
  M96: 'chapter-ii-3',
  M101: 'chapter-ii-3',
  M105: 'chapter-ii-3',
  M106: 'chapter-ii-3',
  M120: 'chapter-ii-3',
  M121: 'chapter-ii-3',
  M116: 'chapter-ii-3',
  M97: 'chapter-ii-4',
  M99: 'chapter-ii-4',
  M100: 'chapter-ii-4',
  M118: 'chapter-ii-4',
  M102: 'chapter-ii-5',
  M103: 'chapter-ii-5',
  M104: 'chapter-ii-5',
  M107: 'chapter-ii-6',
  M108: 'chapter-ii-6',
  M109: 'chapter-ii-6',
  M110: 'chapter-ii-6',
  M111: 'chapter-ii-6',
  M112: 'chapter-ii-6',
  M113: 'chapter-ii-6',
  M114: 'chapter-ii-6',
  M115: 'chapter-ii-6',
  M117: 'chapter-ii-7',
  M119: 'chapter-ii-7',
  M122: 'chapter-ii-8',
  M123: 'chapter-ii-8',
  M124: 'chapter-ii-8',
  M125: 'chapter-ii-9',
  M126: 'chapter-ii-9',
  'M126.5': 'chapter-ii-9',
  M127: 'chapter-ii-9',
};

const META = {
  M90: {
    relatedSystems: ['profession-brain', 'organization-genome', 'organization-inauguration'],
    implementationNotes: 'Day-one discovery — seeds Profession Brain™ and downstream knowledge systems.',
  },
  'M90.5': {
    relatedSystems: ['business-discovery-blueprint', 'mission-control', 'profession-brain'],
    implementationNotes: 'Activates organization after Blueprint — Charter and HQ setup.',
  },
  M91: {
    relatedSystems: ['studio-institute', 'knowledge-commerce', 'memory-engine', 'studio-intelligence-architecture'],
    implementationNotes: 'Central institutional intelligence — every concierge and automation consumes Profession Brain™.',
  },
  M92: {
    relatedSystems: ['profession-brain', 'knowledge-commerce', 'expert-marketplace'],
    implementationNotes: 'External discovery layer for expertise and expert experiences.',
  },
  'M92.5': {
    relatedSystems: ['expert-marketplace', 'studio-institute', 'knowledge-hub'],
    implementationNotes: 'Monetizes expertise — products, subscriptions, courses, licensing.',
  },
  M93: {
    relatedSystems: ['profession-brain', 'knowledge-commerce', 'knowledge-registry'],
    implementationNotes: 'Teaching engine — Academy lessons auto-sync from Knowledge Registry™.',
  },
  M95: {
    relatedSystems: ['business-discovery-blueprint', 'profession-brain', 'organization-operating-manual'],
    implementationNotes: 'Organizational DNA — tone, values, culture inherited by every module.',
  },
  M96: {
    relatedSystems: ['legacy-vault', 'studio-intelligence-architecture', 'wisdom-capture'],
    implementationNotes: 'Organizational memory backbone — lessons, outcomes, decisions.',
  },
  M97: {
    relatedSystems: ['organization-pulse', 'company-maturity-engine', 'executive-council'],
    implementationNotes: 'Executive health score across departments.',
  },
  M99: {
    relatedSystems: ['studio-intelligence', 'command-dock', 'organization-operating-manual'],
    implementationNotes: 'Digital executives — multi-perspective strategic recommendations.',
  },
  M100: {
    relatedSystems: ['company-health-index', 'founder-cognitive-load', 'ambient-awareness'],
    implementationNotes: 'Real-time organizational well-being beyond financial metrics.',
  },
  M101: {
    relatedSystems: ['memory-engine', 'shadow-mode', 'wisdom-capture'],
    implementationNotes: 'Captures small lessons before they disappear.',
  },
  M102: {
    relatedSystems: ['anticipation-engine', 'shadow-mode', 'command-dock'],
    implementationNotes: 'Concierges observe before recommending or automating.',
  },
  M103: {
    relatedSystems: ['business-simulation-lab', 'shadow-mode', 'predictive-organization'],
    implementationNotes: 'Simulation clone of the organization for safe testing.',
  },
  M104: {
    relatedSystems: ['organization-digital-twin', 'business-simulation-lab'],
    implementationNotes: 'Strategic what-if testing before real-world changes.',
  },
  M105: {
    relatedSystems: ['profession-brain', 'knowledge-registry', 'documentation-governance'],
    implementationNotes: 'Measures completeness and currency of organizational knowledge.',
  },
  M106: {
    relatedSystems: ['executive-timeline', 'memory-engine', 'legacy-network'],
    implementationNotes: 'Permanent archive — milestones, founder letters, organizational history.',
  },
  M107: {
    relatedSystems: ['organization-pulse', 'anticipation-engine', 'command-dock'],
    implementationNotes: 'Contextual awareness of projects, priorities, and workloads.',
  },
  M108: {
    relatedSystems: ['ambient-awareness', 'founder-cognitive-load', 'autonomous-preparation'],
    implementationNotes: 'Predicts needs and prepares work before users ask.',
  },
  M109: {
    relatedSystems: ['anticipation-engine', 'presence-engine', 'founder-operating-system'],
    implementationNotes: 'Protects founder attention and reduces overload.',
  },
  M110: {
    relatedSystems: ['founder-cognitive-load', 'cross-organization-intelligence'],
    implementationNotes: 'Calm, responsive executive presence layer.',
  },
  M111: {
    relatedSystems: ['relationship-memory', 'legacy-network', 'profession-brain'],
    implementationNotes: 'Permission-based opportunity discovery across organizations.',
  },
  M112: {
    relatedSystems: ['cross-organization-intelligence', 'predictive-organization', 'identity-graph'],
    implementationNotes: 'Learns how people and organizations prefer to work together.',
  },
  M113: {
    relatedSystems: ['relationship-memory', 'autonomous-preparation', 'organization-pulse'],
    implementationNotes: 'Forecasts risks, opportunities, bottlenecks, and future needs.',
  },
  M114: {
    relatedSystems: ['predictive-organization', 'organizational-consciousness', 'command-dock'],
    implementationNotes: 'Prepares drafts, agendas, assets, and workflows for approval.',
  },
  M115: {
    relatedSystems: ['memory-engine', 'predictive-organization', 'studio-intelligence-architecture'],
    implementationNotes: 'Unified intelligence connecting awareness, memory, prediction, and action.',
  },
  M116: {
    relatedSystems: ['legacy-vault', 'executive-timeline', 'mission-control'],
    implementationNotes: 'Interactive organizational history — engineering and executive surfaces.',
  },
  M117: {
    relatedSystems: ['organizational-consciousness', 'innovation-lab', 'studio-intelligence-architecture'],
    implementationNotes: 'Monitors external trends, regulations, competitors, and technologies.',
  },
  M118: {
    relatedSystems: ['founder-cognitive-load', 'executive-council', 'innovation-lab'],
    implementationNotes: 'Founder focus, coaching, leadership, and executive health support.',
  },
  M119: {
    relatedSystems: ['founder-operating-system', 'world-knowledge-engine', 'business-simulation-lab'],
    implementationNotes: 'Ideas, prototypes, partnerships, and opportunity pipeline.',
  },
  M120: {
    relatedSystems: ['profession-brain', 'documentation-sync', 'knowledge-registry'],
    implementationNotes: 'Living handbook generated from organizational systems and knowledge.',
  },
  M121: {
    relatedSystems: ['legacy-vault', 'knowledge-commerce', 'expert-marketplace'],
    implementationNotes: 'Permission-based global ecosystem for shared frameworks and knowledge.',
  },
  M122: {
    relatedSystems: ['profession-brain', 'memory-engine', 'model-orchestrator', 'studio-intelligence'],
    implementationNotes: 'Knowledge Fabric™ — organization owns knowledge; models reason. Volume I M87.5 consumes this layer.',
  },
  M123: {
    relatedSystems: ['studio-intelligence-architecture', 'studio-foundation-models', 'prompt-registry'],
    implementationNotes: 'Provider-agnostic AI routing, failover, and model independence.',
  },
  M124: {
    relatedSystems: ['model-orchestrator', 'profession-brain', 'studio-intelligence-architecture'],
    implementationNotes: 'Long-term Studio-owned Profession Models™ roadmap.',
  },
  M125: {
    relatedSystems: ['knowledge-registry', 'documentation-governance', 'studio-institute'],
    implementationNotes: 'Living documentation sync — manual, walkthrough, search, Academy consumers.',
  },
  M126: {
    relatedSystems: ['manifest-reconciliation', 'manifest-authoring', 'system-registry', 'documentation-sync'],
    implementationNotes: 'Studio OS Knowledge Registry™ — Master Spec single source of truth. Sprint 1–2 foundation.',
  },
  'M126.5': {
    relatedSystems: ['knowledge-registry', 'documentation-sync', 'engineering-excellence-dashboard'],
    implementationNotes: 'Continuous documentation audits, coverage, and pre-deploy validation.',
  },
  M127: {
    relatedSystems: ['knowledge-registry', 'documentation-governance', 'component-registry'],
    implementationNotes: 'Master directory of every platform object — consumes Knowledge Registry entries.',
  },
};

function computeEnables(milestones) {
  const byId = new Map(milestones.map((m) => [m.canonicalId, m]));
  for (const m of milestones) {
    const enables = [];
    for (const other of milestones) {
      if ((other.dependsOn ?? []).includes(m.canonicalId)) enables.push(other.canonicalId);
    }
    m.enables = enables;
  }
  return milestones;
}

const src = load(fs.readFileSync(SRC, 'utf8'));
const volII = (src.milestones ?? []).filter((m) => m.volumeId === 'volume-ii');
if (volII.length < 35) {
  console.error(`Expected ≥35 Volume II milestones, found ${volII.length}`);
  process.exit(1);
}

const enriched = computeEnables(
  volII.map((m) => {
    const meta = META[m.canonicalId] ?? {};
    return {
      ...m,
      chapterId: CHAPTER_BY_ID[m.canonicalId],
      relatedSystems: meta.relatedSystems ?? [],
      implementationNotes: meta.implementationNotes ?? `${m.name} — registered in Volume II Knowledge Infrastructure™.`,
    };
  })
);

const missingChapter = enriched.filter((m) => !m.chapterId);
if (missingChapter.length) {
  console.error('Missing chapter mapping:', missingChapter.map((m) => m.canonicalId));
  process.exit(1);
}

const out = {
  version: '1.0.0',
  volumeId: 'volume-ii',
  milestones: enriched,
};

fs.writeFileSync(OUT, dump(out, { lineWidth: 100, noRefs: true }));
console.log(`Wrote ${enriched.length} Volume II milestones → ${OUT}`);
