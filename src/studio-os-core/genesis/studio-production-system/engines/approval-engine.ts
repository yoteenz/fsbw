import type { XpsApprovalRecord } from '../types';
import { XPS_APPROVAL_GATE_IDS, type XpsApprovalGateId } from '../constants';

const GATE_LABELS: Record<XpsApprovalGateId, string> = {
  'narrative-blueprint': 'Narrative Blueprint™ approved',
  'strategic-fit': 'Creative Executive™ strategic fit',
  'production-package': 'Production Package™ assembled',
  casting: 'Casting plan approved',
  'production-design': 'Production design approved',
  'camera-sound-post': 'Camera / sound / post plan approved',
  'asset-generation': 'Asset generation authorized',
  'editorial-lock': 'Editorial lock approved',
  'qc-pass': 'Quality Control pass',
  distribution: 'Distribution package approved',
  publish: 'Publish approval',
};

export function buildDefaultApprovalGates(blueprintApproved: boolean): XpsApprovalRecord[] {
  return XPS_APPROVAL_GATE_IDS.map((gateId) => ({
    gateId,
    label: GATE_LABELS[gateId],
    status: gateId === 'narrative-blueprint' && blueprintApproved ? 'approved' : 'pending',
    required: true,
  }));
}

export function evaluateApprovalGate(
  approvals: XpsApprovalRecord[],
  gateId: XpsApprovalGateId
): { allowed: boolean; reason: string } {
  const gate = approvals.find((a) => a.gateId === gateId);
  if (!gate) return { allowed: false, reason: `Missing approval gate: ${gateId}` };
  if (gate.status === 'approved') return { allowed: true, reason: `${gate.label} — approved.` };
  if (gate.status === 'rejected') return { allowed: false, reason: `${gate.label} — rejected.` };
  return { allowed: false, reason: `${gate.label} — pending founder approval.` };
}

export function canGenerateAssets(approvals: XpsApprovalRecord[]): { allowed: boolean; reason: string } {
  const required: XpsApprovalGateId[] = [
    'narrative-blueprint',
    'strategic-fit',
    'production-package',
    'casting',
    'production-design',
    'asset-generation',
  ];
  for (const gateId of required) {
    const result = evaluateApprovalGate(approvals, gateId);
    if (!result.allowed) return result;
  }
  return { allowed: true, reason: 'Production gates open — departments may generate approved assets.' };
}

export function approveGate(
  approvals: XpsApprovalRecord[],
  gateId: XpsApprovalGateId,
  note?: string
): XpsApprovalRecord[] {
  return approvals.map((a) =>
    a.gateId === gateId
      ? { ...a, status: 'approved' as const, note, decidedAt: new Date().toISOString() }
      : a
  );
}

export function submitPackageForApproval(approvals: XpsApprovalRecord[]): XpsApprovalRecord[] {
  return approveGate(approvals, 'production-package', 'Production Package submitted for founder review.');
}

export function authorizeAssetGeneration(approvals: XpsApprovalRecord[]): XpsApprovalRecord[] {
  return approveGate(approvals, 'asset-generation', 'Founder authorized department asset generation.');
}
