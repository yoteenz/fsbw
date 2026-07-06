import type { HeadquartersActivationStep } from './types';

export const DEFAULT_ACTIVATION_STEPS: Omit<HeadquartersActivationStep, 'completed'>[] = [
  {
    id: 'mission-control',
    label: 'Mission Control powers on',
    description: 'Executive priorities · health · timeline · operations initialize.',
    order: 1,
  },
  {
    id: 'departments',
    label: 'Departments illuminate',
    description: 'Headquarters wings activate from your documented services and people.',
    order: 2,
  },
  {
    id: 'digital-staff',
    label: 'Digital Staff begin arriving',
    description: 'Concierges and intelligence employees report to Digital Payroll.',
    order: 3,
  },
  {
    id: 'command-dock',
    label: 'Command Dock initializes',
    description: 'Your executive command console connects to organizational memory.',
    order: 4,
  },
  {
    id: 'registry',
    label: 'Organization Registry records the new organization',
    description: 'Your company joins the permanent Studio OS workspace registry.',
    order: 5,
  },
  {
    id: 'ambient',
    label: 'Ambient lighting activates',
    description: 'Headquarters feels alive — quiet, confident, ready.',
    order: 6,
  },
  {
    id: 'department-status',
    label: 'Department status indicators illuminate',
    description: 'Each wing reports readiness from your Discovery Blueprint.',
    order: 7,
  },
  {
    id: 'executive-systems',
    label: 'Executive systems initialize',
    description: 'Council, intelligence, and concierge layers align to your charter.',
    order: 8,
  },
];

export function buildActivationSteps(completedCount = 0): HeadquartersActivationStep[] {
  return DEFAULT_ACTIVATION_STEPS.map((step, index) => ({
    ...step,
    completed: index < completedCount,
  }));
}

export function computeActivationProgress(steps: HeadquartersActivationStep[]): number {
  if (steps.length === 0) return 0;
  const done = steps.filter((s) => s.completed).length;
  return Math.round((done / steps.length) * 100);
}
