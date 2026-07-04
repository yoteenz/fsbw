import type { ProvisioningStep } from './types';

/** Immersive company provisioning sequence — shown after Launch Workspace. */
export const WORKSPACE_PROVISIONING_STEPS: ProvisioningStep[] = [
  { id: 'creating-company', label: 'Creating Company', durationMs: 900 },
  { id: 'building-workspace', label: 'Building Workspace', durationMs: 800 },
  { id: 'creating-database', label: 'Creating Database', durationMs: 700 },
  { id: 'creating-storage', label: 'Creating Storage', durationMs: 700 },
  { id: 'building-memory-bible', label: 'Building Memory Bible', durationMs: 900 },
  { id: 'building-creative-dna', label: 'Building Creative DNA', durationMs: 900 },
  { id: 'building-writing-bible', label: 'Building Writing Bible', durationMs: 800 },
  { id: 'building-knowledge-graph', label: 'Building Knowledge Graph', durationMs: 900 },
  { id: 'creating-dashboards', label: 'Creating Dashboards', durationMs: 700 },
  { id: 'installing-modules', label: 'Installing Modules', durationMs: 800 },
  { id: 'creating-automation', label: 'Creating Automation', durationMs: 700 },
  { id: 'creating-documentation', label: 'Creating Documentation', durationMs: 700 },
  { id: 'building-interactive-manual', label: 'Building Interactive Manual', durationMs: 800 },
  { id: 'creating-onboarding', label: 'Creating Onboarding Tutorial', durationMs: 700 },
  { id: 'building-executive-team', label: 'Building AI Executive Team', durationMs: 1000 },
  { id: 'company-ready', label: 'Company Ready', durationMs: 600 },
];

export async function runProvisioningSequence(
  onStep: (step: ProvisioningStep, index: number, total: number) => void
): Promise<void> {
  const total = WORKSPACE_PROVISIONING_STEPS.length;
  for (let i = 0; i < total; i++) {
    const step = WORKSPACE_PROVISIONING_STEPS[i];
    onStep(step, i, total);
    await new Promise((resolve) => setTimeout(resolve, step.durationMs));
  }
}
