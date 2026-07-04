/**
 * Memory Bible — demo data, search, and section metadata (Milestone 25).
 */

import { MEMORY_BIBLE_V1_0, type MemoryBibleSectionId, type MemoryBibleSnapshot } from '../studio-os/memory-bible';

export const MEMORY_BIBLE_SUBTITLE =
  'CURATED INSTITUTIONAL KNOWLEDGE · FOUNDER CONTEXT · NAMING · DECISIONS · AI CONTEXT PACKAGES';

export const MEMORY_BIBLE_SECTIONS: Array<{ id: MemoryBibleSectionId | 'context-builder' | 'export-history' | 'version-history'; label: string }> = [
  { id: 'founder-profile', label: 'FOUNDER PROFILE' },
  { id: 'communication-style', label: 'COMMUNICATION STYLE' },
  { id: 'writing-rules', label: 'WRITING RULES' },
  { id: 'cursor-prompt-standards', label: 'CURSOR PROMPTS' },
  { id: 'design-philosophy', label: 'DESIGN PHILOSOPHY' },
  { id: 'engineering-philosophy', label: 'ENGINEERING PHILOSOPHY' },
  { id: 'brand-philosophy', label: 'BRAND PHILOSOPHY' },
  { id: 'naming-bible', label: 'NAMING BIBLE' },
  { id: 'decision-log', label: 'DECISION LOG' },
  { id: 'ai-preferences', label: 'AI PREFERENCES' },
  { id: 'workspace-memory', label: 'WORKSPACE MEMORY' },
  { id: 'context-builder', label: 'AI CONTEXT BUILDER' },
  { id: 'export-history', label: 'EXPORT HISTORY' },
  { id: 'version-history', label: 'VERSION HISTORY' },
];

export function getDefaultMemoryBibleSnapshot(): MemoryBibleSnapshot {
  return MEMORY_BIBLE_V1_0;
}

export function searchMemoryBible(query: string, snapshot: MemoryBibleSnapshot = MEMORY_BIBLE_V1_0): string[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  const hits: string[] = [];
  const push = (label: string, text: string) => {
    if (text.toLowerCase().includes(q)) hits.push(label);
  };
  push('Founder Profile', JSON.stringify(snapshot.founderProfile));
  push('Communication Style', snapshot.communicationStyle.rules.join(' '));
  push('Writing Rules', snapshot.writingRules.rules.join(' '));
  push('Cursor Prompts', snapshot.cursorPromptStandards.rules.join(' '));
  push('Design Philosophy', snapshot.designPhilosophy.rules.join(' '));
  push('Engineering Philosophy', snapshot.engineeringPhilosophy.rules.join(' '));
  for (const n of snapshot.namingBible) {
    push(`Naming · ${n.officialName}`, `${n.officialName} ${n.deprecatedNames.join(' ')} ${n.usageNotes}`);
  }
  for (const d of snapshot.decisionLog) {
    push(`Decision · ${d.title}`, `${d.decision} ${d.reason}`);
  }
  return [...new Set(hits)].slice(0, 12);
}

export const CONTEXT_BUILDER_TARGETS = [
  { id: 'cursor', label: 'CURSOR' },
  { id: 'chatgpt', label: 'CHATGPT' },
  { id: 'openart', label: 'OPENART' },
  { id: 'fal', label: 'FAL' },
  { id: 'future-ai-agent', label: 'FUTURE AI AGENT' },
  { id: 'contractor', label: 'CONTRACTOR' },
  { id: 'designer', label: 'DESIGNER' },
  { id: 'developer', label: 'DEVELOPER' },
  { id: 'internal-team', label: 'INTERNAL TEAM' },
] as const;

export const CONTEXT_BUILDER_TASK_TYPES = [
  { id: 'development-milestone', label: 'DEVELOPMENT MILESTONE' },
  { id: 'design-milestone', label: 'DESIGN MILESTONE' },
  { id: 'copywriting', label: 'COPYWRITING' },
  { id: 'photography-generation', label: 'PHOTOGRAPHY GENERATION' },
  { id: 'architecture-review', label: 'ARCHITECTURE REVIEW' },
  { id: 'onboarding-handoff', label: 'ONBOARDING HANDOFF' },
] as const;

export const CONTEXT_BUILDER_SCOPES = [
  { id: 'asset-factory', label: 'ASSET FACTORY' },
  { id: 'photography-bible', label: 'PHOTOGRAPHY BIBLE' },
  { id: 'creative-dna', label: 'CREATIVE DNA' },
  { id: 'tutorial-os', label: 'ONBOARDING TUTORIAL' },
  { id: 'knowledge-graph', label: 'KNOWLEDGE GRAPH' },
  { id: 'memory-bible', label: 'MEMORY BIBLE' },
  { id: 'mission-control', label: 'MISSION CONTROL' },
  { id: 'production-builder', label: 'PRODUCTION BUILDER' },
  { id: 'campaign-orchestrator', label: 'CAMPAIGN ORCHESTRATOR' },
  { id: 'build-a-wig', label: 'BUILD-A-WIG' },
  { id: 'email-design', label: 'EMAIL DESIGN' },
] as const;

export const CONTEXT_BUILDER_WORKSPACES = [
  { id: 'global', label: 'STUDIO OS (GLOBAL)' },
  { id: 'frontal-slayer', label: 'FRONTAL SLAYER' },
] as const;
