import { INTELLIGENCE_LAYER_STEP_LABELS, INTELLIGENCE_LAYER_STEPS } from './constants';
import type { ContextBundleItem, IntelligencePipelineStep } from './types';

export function buildIntelligencePipeline(
  contextBundle: ContextBundleItem[],
  architectureScore: number
): IntelligencePipelineStep[] {
  const contextReady = contextBundle.filter((b) => b.included).length;
  const completeThrough = Math.min(
    INTELLIGENCE_LAYER_STEPS.length,
    Math.max(4, Math.floor((architectureScore / 100) * INTELLIGENCE_LAYER_STEPS.length))
  );

  return INTELLIGENCE_LAYER_STEPS.map((step, index) => {
    const label = INTELLIGENCE_LAYER_STEP_LABELS[step];
    let detail = '';
    let status: IntelligencePipelineStep['status'] = 'pending';

    if (index < completeThrough - 1) {
      status = 'complete';
    } else if (index === completeThrough - 1) {
      status = 'active';
    }

    switch (step) {
      case 'retrieve-context':
        detail = `${contextReady} trusted context sources retrieved from Studio OS`;
        break;
      case 'rank-relevance':
        detail = 'Relevance ranked — organizational knowledge prioritized over model priors';
        break;
      case 'check-trust':
        detail = 'Knowledge Confidence™ + Professional Trust Framework™ gates applied';
        break;
      case 'apply-professional-scope':
        detail = 'Regulated scope enforced — cannot/cannot/review-required boundaries active';
        break;
      case 'consult-organization-memory':
        detail = 'Memory Engine™ consulted — have we done this before?';
        break;
      case 'prepare-prompts':
        detail = 'Prompt assembled from org context — model receives trusted bundle only';
        break;
      case 'receive-model-outputs':
        detail = 'Model output received via gateway — no direct vendor calls from features';
        break;
      case 'validate-outputs':
        detail = 'Output validated against genome · brain · trust scope before delivery';
        break;
      case 'store-learning':
        detail = 'Approved learning stored — Wisdom Capture™ pathway ready';
        break;
      case 'update-memory':
        detail = 'Memory Engine™ update queued when outcomes confirmed';
        break;
      case 'route-decisions':
        detail = 'Executive Council™ routing available for strategic decisions';
        break;
      default:
        detail = label;
    }

    return { step, label, status, detail };
  });
}

export function computePipelineHealth(steps: IntelligencePipelineStep[]): number {
  const complete = steps.filter((s) => s.status === 'complete').length;
  const active = steps.filter((s) => s.status === 'active').length;
  return Math.min(99, Math.round(((complete + active * 0.5) / steps.length) * 100));
}

export function summarizeIntelligenceLayer(steps: IntelligencePipelineStep[]): string {
  const health = computePipelineHealth(steps);
  const active = steps.find((s) => s.status === 'active');
  return `Studio Intelligence Layer — ${health}% pipeline health · ${steps.filter((s) => s.status === 'complete').length}/${steps.length} steps complete${active ? ` · active: ${active.label}` : ''}. All AI requests pass through Studio Intelligence™ — no feature calls third-party AI directly.`;
}
