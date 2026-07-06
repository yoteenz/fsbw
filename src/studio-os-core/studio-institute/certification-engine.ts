import type { OrganizationProfessionBrainProfile } from '../profession-brain/types';
import type { InstituteCertification } from './types';

const CERT_LABELS: Record<string, string> = {
  'fuel-tax': 'Fuel Tax Certified',
  permit: 'Permit Specialist Certified',
  bookkeeping: 'Bookkeeping Certified',
  dispatch: 'Dispatch Certified',
  marketing: 'Marketing Certified',
  'hair-color': 'Hair Color Certified',
  painting: 'Operations Certified',
  inventory: 'Inventory Certified',
};

export function generateCertificationsFromProfile(
  profile: OrganizationProfessionBrainProfile
): InstituteCertification[] {
  return profile.brains.map((brain) => ({
    id: `cert-${brain.id}`,
    brainId: brain.id,
    name: CERT_LABELS[brain.definitionId] ?? `${brain.label} Certified`,
    category: brain.label,
    requirement: `Master ${brain.knowledgeEntries.length} knowledge areas · complete scenario training · demonstrate judgment.`,
    progressPct: Math.min(100, brain.maturityPct),
    status: brain.maturityPct >= 80 ? 'earned' : brain.maturityPct >= 40 ? 'in-progress' : 'available',
    holdersCount: brain.maturityPct >= 60 ? 2 : 0,
    pendingEmployees: brain.maturityPct < 80 ? 3 : 0,
  }));
}
