import type { ApprovalChainRecord, ApprovalChainStep } from './types';

function chainRecord(
  partial: Pick<ApprovalChainRecord, 'chainId' | 'action' | 'requester' | 'currentStep' | 'status'> &
    Partial<ApprovalChainRecord>
): ApprovalChainRecord {
  return {
    steps: partial.steps ?? [],
    createdAt: partial.createdAt ?? new Date().toISOString(),
    traceable: true,
    ...partial,
  };
}

/** Seed approval chains — delegated authority with full traceability. */
export function buildSeedApprovalChains(): ApprovalChainRecord[] {
  const now = Date.now();
  return [
    chainRecord({
      chainId: 'chain-001',
      action: 'Publish marketing campaign Q3',
      requester: 'Marketing Associate',
      currentStep: 'manager',
      status: 'pending',
      steps: [
        { step: 'employee', actor: 'Marketing Associate', actedAt: new Date(now - 86400000).toISOString(), decision: 'submitted' },
        { step: 'manager' },
        { step: 'executive' },
        { step: 'founder' },
      ],
      createdAt: new Date(now - 86400000).toISOString(),
    }),
    chainRecord({
      chainId: 'chain-002',
      action: 'Approve invoice #4821',
      requester: 'Finance Analyst',
      currentStep: 'founder',
      status: 'escalated',
      steps: [
        { step: 'employee', actor: 'Finance Analyst', actedAt: new Date(now - 172800000).toISOString(), decision: 'submitted' },
        { step: 'manager', actor: 'Finance Manager', actedAt: new Date(now - 86400000).toISOString(), decision: 'approved' },
        { step: 'executive', actor: 'CFO', actedAt: new Date(now - 43200000).toISOString(), decision: 'escalated — threshold exceeded' },
        { step: 'founder' },
      ],
      createdAt: new Date(now - 172800000).toISOString(),
    }),
    chainRecord({
      chainId: 'chain-003',
      action: 'Install Operations Pack v2',
      requester: 'Operations Lead',
      currentStep: 'founder',
      status: 'approved',
      steps: [
        { step: 'employee', actor: 'Operations Lead', actedAt: new Date(now - 259200000).toISOString(), decision: 'submitted' },
        { step: 'manager', actor: 'Operations Director', actedAt: new Date(now - 216000000).toISOString(), decision: 'approved' },
        { step: 'executive', actor: 'COO', actedAt: new Date(now - 172800000).toISOString(), decision: 'approved' },
        { step: 'founder', actor: 'Founder', actedAt: new Date(now - 86400000).toISOString(), decision: 'approved' },
      ],
      createdAt: new Date(now - 259200000).toISOString(),
    }),
  ];
}

export function createApprovalChain(action: string, requester: string): ApprovalChainRecord {
  const steps: ApprovalChainStep[] = ['employee', 'manager', 'executive', 'founder'];
  return chainRecord({
    chainId: `chain-${Date.now()}`,
    action,
    requester,
    currentStep: 'manager',
    status: 'pending',
    steps: [
      { step: 'employee', actor: requester, actedAt: new Date().toISOString(), decision: 'submitted' },
      ...steps.slice(1).map((step) => ({ step })),
    ],
  });
}

export function advanceApprovalChain(chain: ApprovalChainRecord, actor: string, decision: 'approved' | 'rejected' | 'escalated'): ApprovalChainRecord {
  const stepOrder: ApprovalChainStep[] = ['employee', 'manager', 'executive', 'founder'];
  const currentIdx = stepOrder.indexOf(chain.currentStep);
  const nextStep = stepOrder[currentIdx + 1];

  const updatedSteps = chain.steps.map((s) =>
    s.step === chain.currentStep ? { ...s, actor, actedAt: new Date().toISOString(), decision } : s
  );

  if (decision === 'rejected') {
    return { ...chain, status: 'rejected', steps: updatedSteps };
  }
  if (!nextStep || chain.currentStep === 'founder') {
    return { ...chain, status: 'approved', currentStep: 'founder', steps: updatedSteps };
  }

  return {
    ...chain,
    currentStep: nextStep,
    status: decision === 'escalated' ? 'escalated' : 'pending',
    steps: updatedSteps,
  };
}
