import { WORKFLOW_ANALYTICS_METRICS } from './constants';
import type { WorkflowAnalyticsMetric, WorkflowAnalyticsMetricId, WorkflowOptimizationSuggestion } from './types';

const METRIC_META: Record<
  WorkflowAnalyticsMetricId,
  { label: string; value: string; scorePct: number; trend: WorkflowAnalyticsMetric['trend']; detail: string }
> = {
  'execution-count': {
    label: 'Execution Count',
    value: '847 runs',
    scorePct: 88,
    trend: 'up',
    detail: 'Workflow executions this quarter across all published processes.',
  },
  'completion-rate': {
    label: 'Completion Rate',
    value: '91%',
    scorePct: 91,
    trend: 'stable',
    detail: 'Percentage of workflows reaching End node without failure.',
  },
  'average-duration': {
    label: 'Average Duration',
    value: '4.2 days',
    scorePct: 85,
    trend: 'down',
    detail: 'Mean time from Trigger to End across active workflows.',
  },
  bottlenecks: {
    label: 'Bottlenecks',
    value: '3 detected',
    scorePct: 72,
    trend: 'stable',
    detail: 'Approval and Delay nodes causing queue buildup — permit processing primary.',
  },
  'failure-rate': {
    label: 'Failure Rate',
    value: '4.1%',
    scorePct: 96,
    trend: 'down',
    detail: 'Failed executions requiring manual intervention.',
  },
  'approval-delays': {
    label: 'Approval Delays',
    value: '18 hrs avg',
    scorePct: 68,
    trend: 'up',
    detail: 'Average wait at Approval nodes before executive action.',
  },
  'automation-opportunities': {
    label: 'Automation Opportunities',
    value: '5 identified',
    scorePct: 80,
    trend: 'up',
    detail: 'Manual steps eligible for Automation Registry registration.',
  },
  'ai-usage': {
    label: 'AI Usage',
    value: '234 reasoning steps',
    scorePct: 90,
    trend: 'up',
    detail: 'AI Reasoning and Profession Brain node invocations.',
  },
  'customer-impact': {
    label: 'Customer Impact',
    value: 'High positive',
    scorePct: 87,
    trend: 'stable',
    detail: 'Client onboarding completion correlated with satisfaction scores.',
  },
  'optimization-suggestions': {
    label: 'Optimization Suggestions',
    value: '7 active',
    scorePct: 92,
    trend: 'up',
    detail: 'Studio OS continuous improvement recommendations for workflows.',
  },
};

export function buildWorkflowAnalyticsMetrics(): WorkflowAnalyticsMetric[] {
  return WORKFLOW_ANALYTICS_METRICS.map((metricId) => ({
    metricId,
    ...METRIC_META[metricId],
  }));
}

export function computeAnalyticsScorePct(metrics: WorkflowAnalyticsMetric[]): number {
  const avg = metrics.reduce((sum, m) => sum + m.scorePct, 0) / metrics.length;
  return Math.round(avg);
}

export function buildOptimizationSuggestions(): WorkflowOptimizationSuggestion[] {
  return [
    {
      id: 'opt-permit-approval',
      title: 'Reduce permit processing approval delays',
      detail: 'Delegate routine permits to department concierge — executive approval only above threshold.',
      priority: 'high',
      estimatedImpact: '-40% approval delay',
    },
    {
      id: 'opt-onboarding-automation',
      title: 'Automate client onboarding document creation',
      detail: 'Register Document Creation node as Automation Registry action.',
      priority: 'medium',
      estimatedImpact: '+12% completion rate',
    },
    {
      id: 'opt-fuel-tax-confidence',
      title: 'Increase Fuel Tax Processing confidence',
      detail: 'Add Profession Brain review node before filing submission.',
      priority: 'medium',
      estimatedImpact: '+15% confidence score',
    },
    {
      id: 'opt-marketing-council',
      title: 'Batch marketing campaign council reviews',
      detail: 'Weekly Executive Council slot reduces campaign launch bottlenecks.',
      priority: 'low',
      estimatedImpact: '-2 days average duration',
    },
  ];
}

export function detectBottleneckWorkflows(): string[] {
  return ['Permit Processing', 'Marketing Campaigns', 'Invoice Approval'];
}
