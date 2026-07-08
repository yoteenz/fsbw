/**
 * The Cartographers Guild™ — civilization dedicated to exploration.
 * Curiosity itself becomes a profession.
 */

import type { PublicCartographersGuildSnapshot } from '../types';

export type CartographersGuildStatus = 'forming' | 'active' | 'expanding' | 'legendary';

export function evaluateCartographersGuild(input: {
  collaborationCapital: number;
  knowledgeCapital: number;
  innovationCapital: number;
  investigationActiveCount: number;
  legendCount: number;
}): PublicCartographersGuildSnapshot {
  let status: CartographersGuildStatus = 'forming';
  let journalEntries = 0;
  let activeExpeditions = 0;

  if (input.collaborationCapital >= 35 && input.knowledgeCapital >= 30) {
    status = 'active';
    journalEntries = Math.round(input.knowledgeCapital / 8);
    activeExpeditions = input.investigationActiveCount;
  }
  if (input.collaborationCapital >= 50 && input.investigationActiveCount >= 2) {
    status = 'expanding';
    journalEntries += Math.round(input.collaborationCapital / 6);
    activeExpeditions = input.investigationActiveCount + 1;
  }
  if (input.legendCount >= 8 && input.innovationCapital >= 45) {
    status = 'legendary';
  }

  const purposes = [
    'Investigate rumors',
    'Document discoveries',
    'Recover forgotten Blueprints',
    'Map unexplored Atlas regions',
    'Record civilization history',
    'Maintain exploration journals',
  ];

  return {
    status,
    publicLabel: 'The Cartographers Guild™',
    publicPurpose: 'Curiosity itself becomes a profession — not building products, but expanding knowledge.',
    guildPurposes: purposes,
    journalEntryCount: journalEntries,
    activeExpeditionCount: activeExpeditions,
    forming: status === 'forming',
  };
}
