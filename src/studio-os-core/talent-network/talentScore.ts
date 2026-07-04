import type { TalentPerformanceMetrics, TalentScoreBreakdown } from './types';

export function calculateTalentScore(metrics: TalentPerformanceMetrics, availabilityScore = 85): TalentScoreBreakdown {
  const viewerRetention = Math.min(100, Math.round(metrics.retention * 100));
  const engagement = Math.min(100, Math.round(metrics.engagement * 100));
  const revenueGeneration = Math.min(100, Math.round(Math.log10(Math.max(metrics.revenue, 1) + 1) * 25));
  const audienceTrust = Math.min(100, Math.round(metrics.brandSafety * 100));
  const consistency = Math.min(100, Math.round(metrics.sentiment * 100));
  const brandFit = Math.min(100, Math.round((metrics.conversion * 100 + engagement) / 2));
  const growth = Math.min(100, Math.round(Math.log10(Math.max(metrics.followers, 1) + 1) * 20));
  const professionalism = Math.min(100, Math.round((audienceTrust + consistency) / 2));

  const overall = Math.round(
    (viewerRetention * 0.15 +
      audienceTrust * 0.12 +
      engagement * 0.12 +
      brandFit * 0.1 +
      consistency * 0.1 +
      revenueGeneration * 0.15 +
      professionalism * 0.08 +
      availabilityScore * 0.08 +
      growth * 0.1) *
      10
  ) / 10;

  return {
    overall,
    viewerRetention,
    audienceTrust,
    engagement,
    brandFit,
    consistency,
    revenueGeneration,
    professionalism,
    availability: availabilityScore,
    growth,
  };
}
