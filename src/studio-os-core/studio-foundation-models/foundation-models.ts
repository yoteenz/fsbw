import { FOUNDATION_MODEL_CAPABILITY_LABELS, FOUNDATION_MODEL_CAPABILITIES } from './constants';
import type { FoundationCapabilityStatus } from './types';

export function buildFoundationCapabilities(
  architectureScore: number,
  brainVitality: number
): FoundationCapabilityStatus[] {
  const base = Math.round((architectureScore + brainVitality) / 2);

  return FOUNDATION_MODEL_CAPABILITIES.map((capability, index) => {
    const readinessPct = Math.min(99, base + index * 2 - 4);
    const studioOwned = readinessPct >= 70 && index >= 4;

    let detail = `${FOUNDATION_MODEL_CAPABILITY_LABELS[capability]} — structured for Studio Foundation Models™ training pipeline.`;
    switch (capability) {
      case 'organizational-memory':
        detail = 'Memory Engine + Knowledge Fabric™ feed organizational memory into Studio models.';
        break;
      case 'business-workflows':
        detail = 'Workflow patterns from Profession Brain™ and Operating Manuals become model reasoning primitives.';
        break;
      case 'legacy':
        detail = 'Legacy Vault™ entries preserve expertise Studio Models™ must never lose.';
        break;
      default:
        break;
    }

    return {
      capability,
      label: FOUNDATION_MODEL_CAPABILITY_LABELS[capability],
      readinessPct,
      detail,
      studioOwned,
    };
  });
}

export function summarizeFoundationCapabilities(capabilities: FoundationCapabilityStatus[]): string {
  const avg = Math.round(
    capabilities.reduce((s, c) => s + c.readinessPct, 0) / Math.max(1, capabilities.length)
  );
  const studioOwned = capabilities.filter((c) => c.studioOwned).length;
  return `${capabilities.length} Foundation Model capabilities mapped (${avg}% avg readiness). ${studioOwned} approaching Studio-owned reasoning layers.`;
}
