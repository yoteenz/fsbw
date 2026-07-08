import type { ExpeditionReward, InnovationExpedition } from './types';

export function unlockExpeditionRewards(
  expedition: InnovationExpedition,
  completedAt: string
): ExpeditionReward[] {
  return expedition.rewards.map((r) => ({
    ...r,
    unlocked: true,
    unlockedAt: completedAt,
  }));
}

export function summarizeRewards(rewards: ExpeditionReward[]): string {
  const unlocked = rewards.filter((r) => r.unlocked).length;
  return `${unlocked} rewards unlocked · Knowledge™ · Blueprints™ · Certificates™`;
}

export function computeExpeditionScore(
  completedCount: number,
  missionCount: number,
  rewardCount: number,
  communityCount: number
): number {
  return Math.min(99, 20 + completedCount * 15 + missionCount * 3 + rewardCount * 5 + communityCount * 2);
}
