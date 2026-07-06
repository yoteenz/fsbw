import type { ExperienceGovernanceFinding, ExperienceImprovementRecommendation } from './types';

export function runExperienceGovernanceAudit(): ExperienceGovernanceFinding[] {
  return [
    {
      id: 'gov-tasteful',
      severity: 'critical',
      message: 'All experience adjustments must remain tasteful and professional — never overwhelming.',
      recommendation: 'Review mode presets before enabling celebration or launch effects.',
    },
    {
      id: 'gov-subtle-transitions',
      severity: 'warning',
      message: 'Experience transitions must be subtle — never distracting from work.',
      recommendation: 'Use instant or fade transitions only — no theatrical animations.',
    },
    {
      id: 'gov-context-respect',
      severity: 'info',
      message: 'Context signals from Pulse, Cognitive Load, and Calendar drive automatic adaptation.',
      recommendation: 'Life & Culture Preferences gate atmosphere — never assume without consent.',
    },
    {
      id: 'gov-infrastructure-complete',
      severity: 'info',
      message: 'M141 completes Studio OS Infrastructure Chapter — platform ready for scale.',
      recommendation: 'Infrastructure sync chain fully operational from Documentation Governance through Experience Engine.',
    },
  ];
}

export function buildExperienceRecommendations(activeMode: string): ExperienceImprovementRecommendation[] {
  const recommendations: ExperienceImprovementRecommendation[] = [
    {
      id: 'rec-focus',
      title: 'Enable Focus Mode during deep work blocks',
      detail: 'Founder Cognitive Load elevated — Focus Mode reduces distractions automatically.',
      priority: 'high',
    },
    {
      id: 'rec-presentation',
      title: 'Presentation Mode ready for 2:00 PM review',
      detail: 'Calendar signal active — switch 5 minutes before meeting.',
      priority: 'medium',
    },
    {
      id: 'rec-celebration',
      title: 'Celebrate Infrastructure Chapter completion',
      detail: 'Milestone detected — tasteful Celebration Mode available.',
      priority: 'medium',
    },
    {
      id: 'rec-night',
      title: 'Night Mode available after 8 PM',
      detail: 'Time-of-day signal will suggest reduced eye strain atmosphere.',
      priority: 'low',
    },
  ];
  return recommendations.filter((r) => activeMode !== 'focus-mode' || r.id !== 'rec-focus');
}

export function computeAdaptabilityPct(modeCount: number, contextPct: number): number {
  return Math.min(99, Math.round((modeCount * 3 + contextPct) / 2));
}
