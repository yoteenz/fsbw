import {
  CREATIVE_DISTRIBUTION_CHANNELS,
  QUALITY_GATE_CHECKS,
} from '../../../utils/adminStudioCreativeDirectorDemo';
import type { CreativeDirectorSession, DistributionRecommendation, QualityGateResult } from './types';
import { evaluateBrandAlignment } from './brandValidation';

export function evaluateQualityGate(session: CreativeDirectorSession): QualityGateResult {
  const brand = evaluateBrandAlignment(session);
  const activeDist = Object.values(session.distribution).filter(Boolean).length;

  const checks = QUALITY_GATE_CHECKS.map((check) => {
    switch (check.id) {
      case 'topic':
        return { id: check.id, label: check.label, passed: session.topic.trim().length > 5 };
      case 'audience':
        return { id: check.id, label: check.label, passed: session.targetAudience.trim().length > 0 };
      case 'show':
        return { id: check.id, label: check.label, passed: Boolean(session.selectedShowId) };
      case 'cta':
        return { id: check.id, label: check.label, passed: Boolean(session.primaryCtaId) };
      case 'products':
        return { id: check.id, label: check.label, passed: session.featuredProductIds.length > 0 };
      case 'rewards':
        return { id: check.id, label: check.label, passed: Boolean(session.rewardId) };
      case 'prompt':
        return { id: check.id, label: check.label, passed: Boolean(session.promptFrameworkId) };
      case 'distribution':
        return { id: check.id, label: check.label, passed: activeDist >= 2, detail: `${activeDist} ACTIVE` };
      case 'brand':
        return {
          id: check.id,
          label: check.label,
          passed: brand.passesThreshold,
          detail: `${brand.overallScore}%`,
        };
      case 'approval':
        return {
          id: check.id,
          label: check.label,
          passed: session.approvalStatus === 'approved' || session.approvalStatus === 'draft',
          detail: session.approvalStatus.toUpperCase(),
        };
    }
  });

  const allPassed = checks.every((c) => c.passed);
  const canGenerate = checks.filter((c) => c.id !== 'approval').every((c) => c.passed);

  return { checks, allPassed, canGenerate };
}

export function buildDistributionRecommendations(session: CreativeDirectorSession): DistributionRecommendation[] {
  const purpose = session.contentPurpose;
  return CREATIVE_DISTRIBUTION_CHANNELS.map((ch) => {
    let recommended = ch.defaultEnabled;
    if (purpose === 'seasonal' && ch.id === 'pinterest') recommended = true;
    if (purpose === 'community' && ch.id === 'instagram') recommended = true;
    if (purpose === 'product-launch' && (ch.id === 'email' || ch.id === 'lounge-tv')) recommended = true;

    return {
      channelId: ch.id,
      label: ch.label,
      activation: ch.activation,
      recommended,
      enabled: session.distribution[ch.id] ?? ch.defaultEnabled,
      engagementEstimate: ch.demoEngagement,
    };
  });
}
