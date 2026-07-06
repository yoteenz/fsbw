import { FAILOVER_STEP_LABELS, FAILOVER_STEPS } from './constants';
import type { FailoverPlanStep, OrchestratorProvider } from './types';

export function buildFailoverPlan(activeProvider: OrchestratorProvider): FailoverPlanStep[] {
  const backup =
    activeProvider === 'openai'
      ? 'anthropic'
      : activeProvider === 'anthropic'
        ? 'google'
        : activeProvider === 'google'
          ? 'xai'
          : 'openai';

  return FAILOVER_STEPS.map((step, index) => {
    let status: FailoverPlanStep['status'] = index === 0 ? 'active' : 'ready';
    if (index > 3) status = 'standby';

    let detail = '';
    switch (step) {
      case 'retry':
        detail = 'Automatic retry with exponential backoff — transient failures recovered';
        break;
      case 'switch-provider':
        detail = `Failover to alternate cloud provider when ${activeProvider} unavailable`;
        break;
      case 'backup-model':
        detail = `Secondary model tier engaged — backup: ${backup}`;
        break;
      case 'local-model':
        detail = 'Local enterprise model handles request when cloud unreachable';
        break;
      case 'graceful-degrade':
        detail = 'Reduced capability mode — org knowledge still accessible · no collapse';
        break;
      case 'explain-when-needed':
        detail = 'Founder informed only when degradation affects outcome quality';
        break;
      default:
        detail = FAILOVER_STEP_LABELS[step];
    }

    return { step, label: FAILOVER_STEP_LABELS[step], status, detail };
  });
}

export function computeFailoverHealth(steps: FailoverPlanStep[]): number {
  const ready = steps.filter((s) => s.status === 'ready' || s.status === 'active').length;
  return Math.min(99, Math.round((ready / steps.length) * 100));
}

export function summarizeFailover(steps: FailoverPlanStep[]): string {
  const health = computeFailoverHealth(steps);
  return `Failover pipeline — ${health}% ready · retry → switch provider → backup → local → graceful degrade. Studio OS never collapses because one provider fails.`;
}
