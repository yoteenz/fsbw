/**
 * Legends™ — public-safe compute.
 * Creates imagination before implementation. Never confirms or denies.
 */

import {
  LEGENDS_DESIGN_PRINCIPLE,
  LEGENDS_LAYER_FRAMING,
  LEGENDS_PHILOSOPHY,
  LEGENDS_PROMISE,
  LEGENDS_VERSION,
  RUMOR_STANCE,
} from './constants';
import { LEGEND_REGISTRY, countLegendsByOutcome, selectPublicLegendWhisper } from './legend-registry';
import { buildPublicRumor } from './rumor-system';
import { buildPublicLostKnowledge, lostKnowledgeAmbientLine } from './lost-knowledge';
import {
  archiveAmbientLine,
  buildPublicArchiveOfQuestions,
  primaryArchiveQuestion,
} from './archive-of-questions';
import { evaluateCartographersGuild } from './cartographers-guild';
import { evaluateCommunityMythology } from './community-mythology';
import type { PublicLegendsSnapshot } from '../types';

export function computePublicLegends(input: {
  warehouseAssetCount: number;
  knowledgeCapital: number;
  collaborationCapital: number;
  innovationCapital: number;
  civilizationHealth: number;
  mysteryCount: number;
  investigationActiveCount: number;
}): PublicLegendsSnapshot {
  const seed =
    input.warehouseAssetCount +
    Math.round(input.knowledgeCapital) +
    Math.round(input.collaborationCapital) +
    input.mysteryCount;

  const rumor = buildPublicRumor({
    seed,
    investigationActive: input.investigationActiveCount > 0,
    collaborationCapital: input.collaborationCapital,
    knowledgeCapital: input.knowledgeCapital,
  });

  const lostKnowledge = buildPublicLostKnowledge({
    knowledgeCapital: input.knowledgeCapital,
    civilizationHealth: input.civilizationHealth,
  });

  const archiveQuestions = buildPublicArchiveOfQuestions({
    knowledgeCapital: input.knowledgeCapital,
    mysteryCount: input.mysteryCount,
  });

  const cartographersGuild = evaluateCartographersGuild({
    collaborationCapital: input.collaborationCapital,
    knowledgeCapital: input.knowledgeCapital,
    innovationCapital: input.innovationCapital,
    investigationActiveCount: input.investigationActiveCount,
    legendCount: LEGEND_REGISTRY.length,
  });

  const communityMythology = evaluateCommunityMythology({
    collaborationCapital: input.collaborationCapital,
    investigationActiveCount: input.investigationActiveCount,
    rumorActive: true,
  });

  const outcomeCounts = countLegendsByOutcome();

  return {
    legendsVersion: LEGENDS_VERSION,
    computedAt: new Date().toISOString(),
    philosophy: LEGENDS_PHILOSOPHY,
    layerFraming: LEGENDS_LAYER_FRAMING,
    promise: LEGENDS_PROMISE,
    designPrinciple: LEGENDS_DESIGN_PRINCIPLE,
    rumorStance: RUMOR_STANCE,
    legendCount: LEGEND_REGISTRY.length,
    possiblePackCount: outcomeCounts['possible-pack'],
    unresolvedLegendCount: outcomeCounts.unresolved,
    neverMaterializeCount: outcomeCounts['never-materialize'],
    publicWhisper: selectPublicLegendWhisper(seed),
    rumor,
    orbRumorLine: rumor.observation,
    lostKnowledge,
    lostKnowledgeAmbientLine: lostKnowledgeAmbientLine(lostKnowledge),
    archiveQuestions,
    primaryQuestion: primaryArchiveQuestion(archiveQuestions),
    archiveAmbientLine: archiveAmbientLine(archiveQuestions.length),
    cartographersGuild,
    communityMythology,
  };
}
