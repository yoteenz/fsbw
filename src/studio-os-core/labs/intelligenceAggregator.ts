/**
 * Intelligence aggregation — hooks, captions, series, pillars from experiments.
 */

import type {
  CaptionIntelRecord,
  Experiment,
  HookRecord,
  PillarIntelRecord,
  SeriesIntelRecord,
} from './types';

function hookId(template: string): string {
  return `hook-${template.slice(0, 20).replace(/\W/g, '').toLowerCase()}`;
}

export function aggregateHookLibrary(workspaceId: string, experiments: Experiment[]): HookRecord[] {
  const byTemplate = new Map<string, Experiment[]>();
  for (const e of experiments.filter((x) => x.workspaceId === workspaceId)) {
    const key = e.variables.hook.slice(0, 80);
    if (!key) continue;
    if (!byTemplate.has(key)) byTemplate.set(key, []);
    byTemplate.get(key)!.push(e);
  }

  return [...byTemplate.entries()].map(([template, exps]) => {
    const n = exps.length;
    const avgRetention = exps.reduce((s, e) => s + e.metrics.completionRate, 0) / n;
    const avgWatch = exps.reduce((s, e) => s + e.metrics.averageViewDurationSec, 0) / n;
    const avgRev = exps.reduce((s, e) => s + e.metrics.revenue, 0) / n;
    const bestNiche = exps.sort((a, b) => b.metrics.completionRate - a.metrics.completionRate)[0]?.variables.pillar ?? 'other';
    const bestPlatform = exps.sort((a, b) => b.metrics.engagementRate - a.metrics.engagementRate)[0]?.variables.publishingPlatform ?? 'tiktok';
    const successScore = Math.round((avgRetention * 40 + avgWatch * 0.5 + avgRev * 0.1) * 10) / 10;
    return {
      id: hookId(template),
      workspaceId,
      template,
      timesUsed: n,
      averageRetention: avgRetention,
      averageWatchTimeSec: avgWatch,
      averageRevenue: avgRev,
      bestNiche,
      bestPlatform,
      successScore,
      experimentIds: exps.map((e) => e.id),
    };
  });
}

export function aggregateSeriesIntel(workspaceId: string, experiments: Experiment[]): SeriesIntelRecord[] {
  const bySeries = new Map<string, Experiment[]>();
  for (const e of experiments.filter((x) => x.workspaceId === workspaceId && x.variables.series)) {
    const s = e.variables.series;
    if (!bySeries.has(s)) bySeries.set(s, []);
    bySeries.get(s)!.push(e);
  }

  return [...bySeries.entries()].map(([seriesName, exps]) => {
    const revenue = exps.reduce((s, e) => s + e.metrics.revenue, 0);
    const loyalty = exps.reduce((s, e) => s + e.metrics.returnViewers, 0) / exps.length;
    const growth = exps.length >= 2 ? 12 : 5;
    return {
      id: `series-${seriesName.replace(/\W/g, '-').toLowerCase()}`,
      workspaceId,
      seriesName,
      growthTrend: growth,
      audienceLoyalty: loyalty,
      revenue,
      bestPostingSchedule: 'TUE/THU 18:00',
      recommendedFrequency: '2× per week',
      experimentCount: exps.length,
    };
  });
}

export function aggregatePillarIntel(workspaceId: string, experiments: Experiment[]): PillarIntelRecord[] {
  const byPillar = new Map<string, Experiment[]>();
  for (const e of experiments.filter((x) => x.workspaceId === workspaceId)) {
    const p = e.variables.pillar;
    if (!byPillar.has(p)) byPillar.set(p, []);
    byPillar.get(p)!.push(e);
  }

  return [...byPillar.entries()].map(([pillar, exps]) => {
    const totalRevenue = exps.reduce((s, e) => s + e.metrics.revenue, 0);
    const engagement = exps.reduce((s, e) => s + e.metrics.engagementRate, 0) / exps.length;
    const productionCost = exps.length * 45;
    const roi = productionCost > 0 ? ((totalRevenue - productionCost) / productionCost) * 100 : 0;
    return {
      id: `pillar-${pillar}`,
      workspaceId,
      pillar: pillar as PillarIntelRecord['pillar'],
      totalRevenue,
      growth: exps.length * 3,
      engagement,
      lifetimeValue: totalRevenue * 1.2,
      productionCost,
      roi,
      experimentCount: exps.length,
    };
  });
}

export function aggregateCaptionIntel(workspaceId: string, experiments: Experiment[]): CaptionIntelRecord[] {
  return experiments
    .filter((e) => e.workspaceId === workspaceId && e.variables.caption)
    .map((e) => ({
      id: `cap-${e.id}`,
      workspaceId,
      captionLength: e.variables.caption.length,
      emojiUsage: /[\u{1F300}-\u{1FAFF}]/u.test(e.variables.caption),
      questionUsage: e.variables.caption.includes('?'),
      ctaPlacement: e.variables.cta ? 'end' : 'none',
      hashtags: e.variables.hashtags,
      lineSpacing: e.variables.caption.includes('\n\n') ? 'double' : 'single',
      engagementRate: e.metrics.engagementRate,
      experimentIds: [e.id],
    }));
}
