/**
 * Community Mythology™ — founders speculate, discuss, investigate, collaborate.
 * Discoveries emerge naturally from civilization growth — not artificial puzzles.
 */

import type { PublicCommunityMythologySnapshot } from '../types';

export type CommunityMythologyThread = {
  id: string;
  publicTopic: string;
  publicFraming: string;
  speculationLevel: 'emerging' | 'active' | 'heated';
};

export const COMMUNITY_MYTHOLOGY_THREADS: CommunityMythologyThread[] = [
  {
    id: 'cm-mysterious-district',
    publicTopic: 'The Mysterious District',
    publicFraming: 'Founders debate cartographic folios describing a district no expedition has verified.',
    speculationLevel: 'active',
  },
  {
    id: 'cm-unfinished-blueprint',
    publicTopic: 'The Unfinished Blueprint',
    publicFraming: 'Blueprint Archive forks converge on the same missing procedural step — coincidence or design?',
    speculationLevel: 'emerging',
  },
  {
    id: 'cm-forgotten-civilization',
    publicTopic: 'The Forgotten Civilization',
    publicFraming: 'World Graph references a profession network that predates every headquarters.',
    speculationLevel: 'active',
  },
  {
    id: 'cm-orb-message',
    publicTopic: 'The Orb Message',
    publicFraming: 'Orb spoke a line no founder prompted. The community is decoding it without official guidance.',
    speculationLevel: 'heated',
  },
  {
    id: 'cm-sealed-vault',
    publicTopic: 'The Sealed Vault',
    publicFraming: 'Prototype Vault resonance at hours when no founder is present — mechanical or intentional?',
    speculationLevel: 'emerging',
  },
];

export function evaluateCommunityMythology(input: {
  collaborationCapital: number;
  investigationActiveCount: number;
  rumorActive: boolean;
}): PublicCommunityMythologySnapshot {
  const threads = COMMUNITY_MYTHOLOGY_THREADS.map((thread) => {
    let level = thread.speculationLevel;
    if (input.collaborationCapital >= 45 && thread.id === 'cm-forgotten-civilization') {
      level = 'heated';
    }
    if (input.rumorActive && thread.id === 'cm-orb-message') {
      level = 'heated';
    }
    if (input.investigationActiveCount >= 2 && thread.id === 'cm-mysterious-district') {
      level = 'active';
    }
    return { ...thread, speculationLevel: level };
  });

  const active = threads.filter((t) => t.speculationLevel === 'active' || t.speculationLevel === 'heated');
  const primary = active.sort((a, b) => {
    const rank = { heated: 2, active: 1, emerging: 0 };
    return rank[b.speculationLevel] - rank[a.speculationLevel];
  })[0] ?? threads[0]!;

  return {
    activeThreadCount: active.length,
    primaryThread: {
      publicTopic: primary.publicTopic,
      publicFraming: primary.publicFraming,
      speculationLevel: primary.speculationLevel,
    },
    ambientLine:
      active.length > 0
        ? 'Founders speculate together — the best communities participate in uncovering the world, not consuming it.'
        : 'Community mythology awaits — civilization growth will give founders something to debate.',
    naturalEmergence: true,
  };
}
